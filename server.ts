import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Parse JSON request bodies
app.use(express.json({ limit: '20mb' }));

// Lazy initializer for GoogleGenAI SDK to prevent startup crashes if key is omitted
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured. Please add it via the Settings > Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Main conversation completion endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, mode, temperature, voiceRate } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid 'messages' format. Expected array of message objects." });
    }

    const client = getAiClient();
    
    // Choose model
    // As per guidelines, gemini-3.5-flash is ideal for standard/basic tasks
    const modelName = "gemini-3.5-flash";

    // Map roles to Google GenAI format (user and model)
    const contents = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.text || msg.content || "" }]
    }));

    // Choose system instructions based on Adin AI mode
    let systemInstruction = "You are Adin AI, an elite, highly premium generative AI assistant. Solve the user's queries with intellectual elegance, premium prose, clear markdown formatting, and insightful guidance. Keep answers extremely polished and polite. Avoid computer-jargon/infra details like process ports, etc.";
    let enableSearch = false;

    if (mode === "search") {
      systemInstruction = "You are Adin's Search Intelligence Oracle. You are equipped with Google Search grounding. Ground your response using state-of-the-art live internet research. Summarize your findings in standard, neat markdown. Provide explicit in-line references/citations to grounding metadata sources when answering.";
      enableSearch = true;
    } else if (mode === "math") {
      systemInstruction = "You are Adin's Premium Mathematical Mind, an elite mathematician. Solve the user's math problem by detailing every single step clearly, formatting numeric results, highlighting key formulas, explaining theories, and breaking down the mathematical logic rigorously. Use elegant markdown to display formulas.";
    } else if (mode === "code") {
      systemInstruction = "You are Adin's Master Coding Oracle. Provide highly premium, robust, clean, well-commented code in the user's requested language. Structure explanations neatly, point out edge cases, detail complexity analysis (Time & Space), and offer optimized approaches. Ensure code blocks are correctly labeled for markdown rendering.";
    } else if (mode === "document") {
      systemInstruction = "You are Adin's Executive Document Intelligence Analyst. Analyze the text provided by the user. First, generate a highly scannable, premium brief summarizing the key takeaways. Then, create a detailed structured breakdown of key topics, analyses, and metrics mentioned. Keep explanations clean and executive-level.";
    }

    // Configure tools
    const config: any = {
      systemInstruction,
      temperature: typeof temperature === 'number' ? temperature : 0.7,
    };

    if (enableSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    // Call Gemini
    const response = await client.models.generateContent({
      model: modelName,
      contents,
      config,
    });

    const textResult = response.text || "No response text generated.";
    
    // Extract grounding metadata if present (Google Search urls)
    let citations: any[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && Array.isArray(chunks)) {
      citations = chunks
        .filter((chunk: any) => chunk.web && chunk.web.uri)
        .map((chunk: any) => ({
          title: chunk.web.title || "Web Source",
          url: chunk.web.uri
        }));
    }

    res.json({
      text: textResult,
      citations,
    });

  } catch (err: any) {
    console.error("Gemini API Chat Error:", err);
    res.status(500).json({ 
      error: err.message || "An unexpected error occurred during Adin's reasoning process." 
    });
  }
});

// Text to Speech (TTS) endpoint
app.post("/api/tts", async (req, res) => {
  try {
    const { text, voice } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing required 'text' parameter." });
    }

    const client = getAiClient();
    
    // Shorten text if it's too long for TTS limit, taking the first 400 characters for high quality narration
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

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("Could not synthesize voice stream. No audio parts returned from the narration model.");
    }

    res.json({
      audio: base64Audio,
      mimeType: "audio/pcm;rate=24000"
    });

  } catch (err: any) {
    console.error("Gemini API TTS Error:", err);
    res.status(500).json({ error: err.message || "Narrator failed to synthesize text speech." });
  }
});

// Set up static files and Vite middleware
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware mounted successfully.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Static production build assets serving mounted.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Adin Server listening at http://localhost:${PORT}`);
  });
}

setupVite();
