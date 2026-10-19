// ============================================================
// server.ts — Adin AI Backend Server
// ============================================================
// ✅ CJS-safe (esbuild compatible)
// ✅ Auto-detects dev vs production
// ✅ Dev: Vite middleware (HMR, fast refresh)
// ✅ Production: Static files from /dist
// ✅ SPA fallback: all non-API routes → index.html
// ✅ API routes: /api/* (JSON, chat, TTS, groq-keys, generate, health)
// ✅ NEW: /api/ai/generate — backend proxy for all Groq feature calls
// ============================================================

// ✅ FIRST import: loads .env before any handler module reads process.env
import "dotenv/config";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
// ✅ Same hardened handlers that Vercel runs from /api — one implementation for local + production
import syncHandler from "./api/sync";
import generateHandler from "./api/ai/generate";
import groqKeysHandler from "./api/ai/groq-keys";

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────
app.use(express.json({ limit: "20mb" }));

// Trust proxy (Vercel, Cloudflare, etc.)
app.set("trust proxy", 1);

// ─────────────────────────────────────────────
// GoogleGenAI lazy initializer
// ─────────────────────────────────────────────
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY environment variable is not configured. Please add it via the Settings > Secrets panel."
      );
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ============================================================
// ✅ API routes served by the shared handlers (same code as Vercel's /api folder)
// ============================================================
//  /api/sync           → sync proxy (adds the Apps Script secret on the SERVER)
//  /api/ai/generate    → Groq proxy (origin check, rate limit, input caps)
//  /api/ai/groq-keys   → only "configured" flags — real keys are NEVER sent to the browser
const mountHandler =
  (handler: (req: any, res: any) => unknown) => (req: Request, res: Response) => {
    Promise.resolve(handler(req, res)).catch((err) => {
      console.error("🚨 API handler crashed:", err?.name || "error");
      if (!res.headersSent) res.status(500).json({ ok: false, error: "server_error" });
    });
  };

app.all("/api/sync", mountHandler(syncHandler));
app.all("/api/ai/generate", mountHandler(generateHandler));
app.all("/api/ai/groq-keys", mountHandler(groqKeysHandler));

// ============================================================
// Light guard for the Gemini endpoints (/api/chat, /api/tts):
// same-origin only + per-IP rate limit, so nobody else can spend your Gemini quota
// ============================================================
const GUARD_WINDOW_MS = 60_000;
const CHAT_MAX_REQUESTS_PER_WINDOW = 30;
const TTS_MAX_REQUESTS_PER_WINDOW = 30;
const GUARD_MAX_TRACKED_IPS = 5000;
const LOCAL_HOSTNAMES = ["localhost", "127.0.0.1"];
const EXTRA_ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

function isAllowedOrigin(origin: string | undefined, host: string | undefined): boolean {
  if (!origin) return true;
  try {
    const parsed = new URL(origin);
    if (host && parsed.host === host) return true;
    if (EXTRA_ALLOWED_ORIGINS.includes(origin)) return true;
    if (!IS_PRODUCTION && LOCAL_HOSTNAMES.includes(parsed.hostname)) return true;
  } catch {
    return false;
  }
  return false;
}

function createApiGuard(maxRequests: number) {
  const requestLog = new Map<string, number[]>();
  return (req: Request, res: Response, next: NextFunction) => {
    if (!isAllowedOrigin(req.headers.origin as string | undefined, req.headers.host)) {
      return res.status(403).json({ error: "Origin not allowed" });
    }
    const now = Date.now();
    if (requestLog.size > GUARD_MAX_TRACKED_IPS) requestLog.clear();
    const ip = req.ip || req.socket?.remoteAddress || "unknown";
    const recent = (requestLog.get(ip) || []).filter((t) => now - t < GUARD_WINDOW_MS);
    if (recent.length >= maxRequests) {
      requestLog.set(ip, recent);
      return res.status(429).json({ error: "Too many requests. Please wait a moment and try again." });
    }
    recent.push(now);
    requestLog.set(ip, recent);
    next();
  };
}

// ============================================================
// Health check
// ============================================================
app.get("/api/health", (_req, res) => {
  res.json({
    status: "healthy",
    env: IS_PRODUCTION ? "production" : "development",
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// Main conversation completion endpoint
// ============================================================
app.post("/api/chat", createApiGuard(CHAT_MAX_REQUESTS_PER_WINDOW), async (req, res) => {
  try {
    const { messages, mode, temperature } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res
        .status(400)
        .json({ error: "Invalid 'messages' format. Expected array of message objects." });
    }

    const client = getAiClient();
    const modelName = "gemini-3.5-flash";

    const contents = messages.map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.text || msg.content || "" }],
    }));

    let systemInstruction =
      "You are Adin AI, an elite, highly premium generative AI assistant. Solve the user's queries with intellectual elegance, premium prose, clear markdown formatting, and insightful guidance. Keep answers extremely polished and polite. Avoid computer-jargon/infra details like process ports, etc.";
    let enableSearch = false;

    if (mode === "search") {
      systemInstruction =
        "You are Adin's Search Intelligence Oracle. You are equipped with Google Search grounding. Ground your response using state-of-the-art live internet research. Summarize your findings in standard, neat markdown. Provide explicit in-line references/citations to grounding metadata sources when answering.";
      enableSearch = true;
    } else if (mode === "math") {
      systemInstruction =
        "You are Adin's Premium Mathematical Mind, an elite mathematician. Solve the user's math problem by detailing every single step clearly, formatting numeric results, highlighting key formulas, explaining theories, and breaking down the mathematical logic rigorously. Use elegant markdown to display formulas.";
    } else if (mode === "code") {
      systemInstruction =
        "You are Adin's Master Coding Oracle. Provide highly premium, robust, clean, well-commented code in the user's requested language. Structure explanations neatly, point out edge cases, detail complexity analysis (Time & Space), and offer optimized approaches. Ensure code blocks are correctly labeled for markdown rendering.";
    } else if (mode === "document") {
      systemInstruction =
        "You are Adin's Executive Document Intelligence Analyst. Analyze the text provided by the user. First, generate a highly scannable, premium brief summarizing the key takeaways. Then, create a detailed structured breakdown of key topics, analyses, and metrics mentioned. Keep explanations clean and executive-level.";
    }

    const config: any = {
      systemInstruction,
      temperature: typeof temperature === "number" ? temperature : 0.7,
    };

    if (enableSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await client.models.generateContent({
      model: modelName,
      contents,
      config,
    });

    const textResult = response.text || "No response text generated.";

    let citations: any[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && Array.isArray(chunks)) {
      citations = chunks
        .filter((chunk: any) => chunk.web && chunk.web.uri)
        .map((chunk: any) => ({
          title: chunk.web.title || "Web Source",
          url: chunk.web.uri,
        }));
    }

    res.json({
      text: textResult,
      citations,
    });
  } catch (err: any) {
    console.error("Gemini API Chat Error:", err);
    res.status(500).json({
      error: IS_PRODUCTION
        ? "An unexpected error occurred during Adin's reasoning process."
        : err.message || "An unexpected error occurred during Adin's reasoning process.",
    });
  }
});

// ============================================================
// Text to Speech (TTS) endpoint
// ============================================================
app.post("/api/tts", createApiGuard(TTS_MAX_REQUESTS_PER_WINDOW), async (req, res) => {
  try {
    const { text, voice } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing required 'text' parameter." });
    }

    const client = getAiClient();
    const cleanText = text.replace(/[*#`_\-\[\]]/g, "").substring(0, 480);

    const response = await client.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Narrate elegantly: ${cleanText}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || "Kore" },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error(
        "Could not synthesize voice stream. No audio parts returned from the narration model."
      );
    }

    res.json({
      audio: base64Audio,
      mimeType: "audio/pcm;rate=24000",
    });
  } catch (err: any) {
    console.error("Gemini API TTS Error:", err);
    res.status(500).json({
      error: IS_PRODUCTION
        ? "Narrator failed to synthesize text speech."
        : err.message || "Narrator failed to synthesize text speech.",
    });
  }
});

// ============================================================
// ✅ Vite setup — async function (no top-level await)
// ============================================================
async function setupApp() {
  if (IS_PRODUCTION) {
    // ─────────────────────────────────────────────
    // PRODUCTION: serve static files from /dist
    // ─────────────────────────────────────────────
    const distPath = path.join(process.cwd(), "dist");

    app.use(
      express.static(distPath, {
        index: false,
        setHeaders: (res, filePath) => {
          if (filePath.endsWith(".html")) {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          } else if (
            filePath.endsWith(".js") ||
            filePath.endsWith(".css") ||
            filePath.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot)$/)
          ) {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          } else if (
            filePath.endsWith(".xml") ||
            filePath.endsWith(".txt") ||
            filePath.endsWith(".webmanifest")
          ) {
            res.setHeader("Cache-Control", "public, max-age=3600");
          }
        },
      })
    );

    // SEO files explicit routes
    app.get("/sitemap.xml", (_req, res) => {
      res.type("application/xml");
      res.sendFile(path.join(distPath, "sitemap.xml"));
    });

    app.get("/robots.txt", (_req, res) => {
      res.type("text/plain");
      res.sendFile(path.join(distPath, "robots.txt"));
    });

    app.get("/site.webmanifest", (_req, res) => {
      res.type("application/manifest+json");
      res.sendFile(path.join(distPath, "site.webmanifest"));
    });

    app.get("/browserconfig.xml", (_req, res) => {
      res.type("application/xml");
      res.sendFile(path.join(distPath, "browserconfig.xml"));
    });

    // SPA fallback — all non-API routes → index.html
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api/")) {
        return next();
      }
      res.sendFile(path.join(distPath, "index.html"));
    });

    console.log("✅ Static production build assets serving mounted.");
  } else {
    // ─────────────────────────────────────────────
    // DEV: Vite middleware (HMR)
    // ─────────────────────────────────────────────
    const viteModule = await import("vite");
    const vite = await viteModule.createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("✅ Vite dev middleware mounted (HMR enabled).");
  }

  // ─────────────────────────────────────────────
  // Global error handler
  // ─────────────────────────────────────────────
  app.use(
    (
      err: any,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error("🚨 Server error:", err);
      res.status(500).json({ error: IS_PRODUCTION ? "Internal server error" : err.message || "Internal server error" });
    }
  );

  // ─────────────────────────────────────────────
  // Start server
  // ─────────────────────────────────────────────
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Adin Server listening at http://localhost:${PORT}`);
    console.log(`   Mode: ${IS_PRODUCTION ? "PRODUCTION" : "DEVELOPMENT"}`);
    console.log(`🔑 Groq keys endpoint: http://localhost:${PORT}/api/ai/groq-keys`);
    console.log(`🔄 Sync proxy endpoint: http://localhost:${PORT}/api/sync`);
    console.log(`⚡ Groq generate endpoint: http://localhost:${PORT}/api/ai/generate`);
    console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
  });
}

// ─────────────────────────────────────────────
// Start the server
// ─────────────────────────────────────────────
setupApp().catch((err) => {
  console.error("🚨 Failed to start server:", err);
  process.exit(1);
});