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

import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

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
// ✅ Groq Keys Endpoint
// ============================================================
app.get("/api/ai/groq-keys", (_req, res) => {
  try {
    const keys = {
      EXPERIENCE: process.env.GROQ_API_KEY_EXPERIENCE || "",
      PROJECT: process.env.GROQ_API_KEY_PROJECT || "",
      ACHIEVEMENT: process.env.GROQ_API_KEY_ACHIEVEMENT || "",
      COVER_LETTER: process.env.GROQ_API_KEY_COVER_LETTER || "",
      SUMMARY: process.env.GROQ_API_KEY_SUMMARY || "",
    };

    const configured = Object.entries(keys)
      .filter(([, v]) => v && v.trim().length > 0)
      .map(([k]) => k);

    console.log(
      `🔑 [GET /api/ai/groq-keys] Serving ${configured.length}/5 keys: [${configured.join(", ")}]`
    );

    res.json(keys);
  } catch (err: any) {
    console.error("❌ /api/ai/groq-keys error:", err);
    res.status(500).json({ error: err.message || "Failed to load Groq keys" });
  }
});

// ============================================================
// ✅ NEW: Groq Generate Endpoint — backend proxy
// ============================================================
// POST /api/ai/generate
// Body: { feature, prompt, systemPrompt?, options? }
// Response: { ok: true, text, source, model } | { ok: false, error, details }
//
// Feature priority + cross-feature fallback:
//   EXPERIENCE → PROJECT → ACHIEVEMENT → COVER_LETTER → SUMMARY
//
// Model fallback: openai/gpt-oss-120b → openai/gpt-oss-20b
// ============================================================
app.post("/api/ai/generate", async (req, res) => {
  try {
    const { feature, prompt, systemPrompt, options } = req.body || {};

    if (!feature || typeof feature !== "string") {
      return res.status(400).json({ error: "feature is required" });
    }
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "prompt is required" });
    }

    // Feature → env key mapping
    const KEY_MAP: Record<string, string | undefined> = {
      EXPERIENCE:   process.env.GROQ_API_KEY_EXPERIENCE,
      PROJECT:      process.env.GROQ_API_KEY_PROJECT,
      ACHIEVEMENT:  process.env.GROQ_API_KEY_ACHIEVEMENT,
      COVER_LETTER: process.env.GROQ_API_KEY_COVER_LETTER,
      SUMMARY:      process.env.GROQ_API_KEY_SUMMARY,
    };

    const FALLBACK_ORDER: Record<string, string[]> = {
      EXPERIENCE:   ["EXPERIENCE", "PROJECT", "ACHIEVEMENT", "COVER_LETTER", "SUMMARY"],
      PROJECT:      ["PROJECT", "EXPERIENCE", "ACHIEVEMENT", "COVER_LETTER", "SUMMARY"],
      ACHIEVEMENT:  ["ACHIEVEMENT", "EXPERIENCE", "PROJECT", "COVER_LETTER", "SUMMARY"],
      COVER_LETTER: ["COVER_LETTER", "EXPERIENCE", "PROJECT", "ACHIEVEMENT", "SUMMARY"],
      SUMMARY:      ["SUMMARY", "EXPERIENCE", "PROJECT", "ACHIEVEMENT", "COVER_LETTER"],
    };

    const order = FALLBACK_ORDER[feature] || [feature];
    const MODELS = ["openai/gpt-oss-120b", "openai/gpt-oss-20b"];
    const errors: string[] = [];

    for (const source of order) {
      const apiKey = KEY_MAP[source];
      if (!apiKey || !apiKey.trim()) {
        errors.push(`No key for ${source}`);
        continue;
      }

      for (const model of MODELS) {
        try {
          const body: any = {
            model,
            messages: [
              ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
              { role: "user", content: prompt },
            ],
            temperature: options?.temperature ?? 0.7,
            max_tokens: options?.maxTokens ?? 4000,
            top_p: options?.top_p ?? 0.9,
            include_reasoning: false,
          };

          const groqRes = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey.trim()}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(body),
            }
          );

          if (groqRes.ok) {
            const data = await groqRes.json();
            const content = data?.choices?.[0]?.message?.content?.trim() || "";
            const finishReason = data?.choices?.[0]?.finish_reason;

            if (!content || content.length < 10) {
              errors.push(`${source}/${model}: empty content (finish=${finishReason})`);
              continue;
            }
            if (finishReason === "length") {
              errors.push(`${source}/${model}: hit token limit`);
              continue;
            }

            const words = content.split(/\s+/).filter(Boolean).length;
            console.log(
              `✅ [POST /api/ai/generate] ${feature} → ${source}/${model} — ${words} words`
            );

            return res.status(200).json({
              ok: true,
              text: content,
              source,
              model,
            });
          }

          const txt = await groqRes.text();
          errors.push(
            `${source}/${model}: HTTP ${groqRes.status} ${txt.slice(0, 100)}`
          );
        } catch (err: any) {
          errors.push(`${source}/${model}: ${err?.message || "fetch failed"}`);
        }
      }
    }

    console.error("❌ [POST /api/ai/generate] All keys failed:", errors);
    return res.status(502).json({
      ok: false,
      error: "All Groq keys and models failed",
      details: errors,
    });
  } catch (err: any) {
    console.error("❌ [POST /api/ai/generate] Unexpected error:", err);
    return res.status(500).json({
      ok: false,
      error: err?.message || "Internal server error",
    });
  }
});

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
app.post("/api/chat", async (req, res) => {
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
      error:
        err.message ||
        "An unexpected error occurred during Adin's reasoning process.",
    });
  }
});

// ============================================================
// Text to Speech (TTS) endpoint
// ============================================================
app.post("/api/tts", async (req, res) => {
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
      error: err.message || "Narrator failed to synthesize text speech.",
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
      res.status(500).json({ error: err.message || "Internal server error" });
    }
  );

  // ─────────────────────────────────────────────
  // Start server
  // ─────────────────────────────────────────────
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Adin Server listening at http://localhost:${PORT}`);
    console.log(`   Mode: ${IS_PRODUCTION ? "PRODUCTION" : "DEVELOPMENT"}`);
    console.log(`🔑 Groq keys endpoint: http://localhost:${PORT}/api/ai/groq-keys`);
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