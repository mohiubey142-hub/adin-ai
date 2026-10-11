// src/services/aiQueueService.ts
// ============================================================
// AI QUEUE SERVICE — Frontend-only concurrent request manager
// ============================================================
//
// Purpose:
//   When many users hit AI features at the same time, Groq's
//   free-tier TPM limit (40,000 tokens/minute across 5 keys)
//   gets saturated. Instead of showing 429 errors, we:
//
//     1. Put the request into a queue
//     2. Notify the user: "Please wait ~X seconds"
//     3. Automatically process when a slot frees up
//
// Design:
//   - MAX_CONCURRENT requests run in parallel
//   - Additional requests wait in a FIFO queue
//   - Subscribers get live updates (position, estimated wait)
//   - Every enqueued task returns a Promise (resolved/rejected)
// ============================================================

type QueueSubscriber = (status: QueueStatus) => void;

export interface QueueStatus {
  /** How many tasks are currently running */
  active: number;
  /** How many tasks are waiting in the queue */
  pending: number;
  /** Total tasks (active + pending) */
  total: number;
  /** Average duration per task (ms) */
  avgDurationMs: number;
  /** Estimated wait time for a new task (seconds) */
  estimatedWaitSeconds: number;
  /** Timestamp of last update */
  updatedAt: number;
}

interface QueueTask<T> {
  id: string;
  run: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
  enqueuedAt: number;
}

// ============================================================
// CONFIG
// ============================================================
// ✅ FIXED: `const` → `let` so setMaxConcurrent() can actually
//    change it at runtime (it was throwing a fatal esbuild error
//    under strict mode after the lockfile change).
let MAX_CONCURRENT = 10;
const DEFAULT_TASK_DURATION_MS = 3000; // fallback estimate

// ============================================================
// STATE
// ============================================================
let activeTasks = 0;
const queue: QueueTask<any>[] = [];
const subscribers: Set<QueueSubscriber> = new Set();

// Rolling average for task duration (EMA)
let avgDurationMs = DEFAULT_TASK_DURATION_MS;
const EMA_ALPHA = 0.3;

// ============================================================
// HELPERS
// ============================================================
const makeId = (): string =>
  `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const computeStatus = (): QueueStatus => {
  const pending = queue.length;
  const total = activeTasks + pending;

  // Estimate wait: (pending + 1) / MAX_CONCURRENT * avgDuration
  const waves = Math.ceil((pending + 1) / MAX_CONCURRENT);
  const estimatedWaitSeconds = Math.max(
    0,
    Math.round((waves * avgDurationMs) / 1000)
  );

  return {
    active: activeTasks,
    pending,
    total,
    avgDurationMs: Math.round(avgDurationMs),
    estimatedWaitSeconds,
    updatedAt: Date.now(),
  };
};

const notifySubscribers = (): void => {
  const status = computeStatus();
  subscribers.forEach((cb) => {
    try {
      cb(status);
    } catch (err) {
      console.warn('[aiQueueService] subscriber error:', err);
    }
  });
};

const updateAvgDuration = (durationMs: number): void => {
  avgDurationMs = EMA_ALPHA * durationMs + (1 - EMA_ALPHA) * avgDurationMs;
};

// ============================================================
// CORE: PROCESS QUEUE
// ============================================================
const processQueue = (): void => {
  while (activeTasks < MAX_CONCURRENT && queue.length > 0) {
    const task = queue.shift();
    if (!task) break;

    activeTasks++;
    notifySubscribers();

    const startedAt = Date.now();

    task
      .run()
      .then((result) => {
        updateAvgDuration(Date.now() - startedAt);
        task.resolve(result);
      })
      .catch((error) => {
        updateAvgDuration(Date.now() - startedAt);
        task.reject(error);
      })
      .finally(() => {
        activeTasks--;
        notifySubscribers();
        // Try to run next task immediately
        processQueue();
      });
  }
};

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Enqueue a task. Returns a promise that resolves with the task's
 * result once a slot becomes available and the task completes.
 *
 * If a slot is available immediately, the task runs right away.
 * Otherwise it waits in the queue (FIFO).
 */
export const enqueue = <T>(run: () => Promise<T>): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const task: QueueTask<T> = {
      id: makeId(),
      run,
      resolve,
      reject,
      enqueuedAt: Date.now(),
    };

    queue.push(task);
    notifySubscribers();
    processQueue();
  });
};

/**
 * Subscribe to queue status updates. Returns an unsubscribe fn.
 * The callback fires whenever the queue changes (task added,
 * started, finished) AND immediately on subscribe.
 */
export const onQueueUpdate = (callback: QueueSubscriber): (() => void) => {
  subscribers.add(callback);
  // Fire current status immediately
  try {
    callback(computeStatus());
  } catch (err) {
    console.warn('[aiQueueService] initial subscriber call error:', err);
  }

  return () => {
    subscribers.delete(callback);
  };
};

/**
 * Snapshot of the current queue status.
 */
export const getQueueStatus = (): QueueStatus => computeStatus();

/**
 * True if the queue currently has work waiting (pending > 0).
 */
export const isQueueBusy = (): boolean =>
  activeTasks >= MAX_CONCURRENT || queue.length > 0;

/**
 * Change the concurrent limit at runtime (rarely needed).
 * ✅ Works now — MAX_CONCURRENT is declared with `let`, so it can
 *    actually be reassigned.
 */
export const setMaxConcurrent = (n: number): void => {
  if (n >= 1 && n <= 100) {
    MAX_CONCURRENT = n;
  }
};