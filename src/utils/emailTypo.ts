// src/utils/emailTypo.ts
// Free, zero-friction typo hint: "gmial.com" → "Did you mean gmail.com?" (never blocks signup).

const COMMON_DOMAINS: readonly string[] = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'live.com', 'proton.me', 'protonmail.com',
];

// Real providers that are close to a common domain — never "fix" these
const LEGIT_SIMILAR_DOMAINS: ReadonlySet<string> = new Set(['mail.com', 'gmx.com', 'aol.com', 'yahoo.co', 'ymail.com', 'me.com', 'msn.com']);

const MIN_TYPO_DISTANCE = 1;
const MAX_TYPO_DISTANCE = 2;
const EMAIL_PARTS_COUNT = 2;

const editDistance = (a: string, b: string): number => {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp: number[][] = Array.from({ length: rows }, (_, i) => [i, ...Array(cols - 1).fill(0)]);
  for (let j = 0; j < cols; j++) dp[0][j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[rows - 1][cols - 1];
};

// Returns the corrected full email, or null when nothing looks wrong.
export const suggestEmailFix = (rawEmail: string): string | null => {
  const email = rawEmail.trim().toLowerCase();
  const parts = email.split('@');
  if (parts.length !== EMAIL_PARTS_COUNT) return null;
  const [local, domain] = parts;
  if (!local || !domain) return null;
  if (COMMON_DOMAINS.includes(domain) || LEGIT_SIMILAR_DOMAINS.has(domain)) return null;

  let best: string | null = null;
  let bestDistance = MAX_TYPO_DISTANCE + 1;
  for (const candidate of COMMON_DOMAINS) {
    const distance = editDistance(domain, candidate);
    if (distance >= MIN_TYPO_DISTANCE && distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best ? `${local}@${best}` : null;
};
