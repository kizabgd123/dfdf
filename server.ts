import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser with higher limit for audio payloads
  app.use(express.json({ limit: "50mb" }));

  // Helper to initialize Gemini client lazily
  function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY je potreban za AI funkcije.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // Health check route
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "Speech-to-Text Dictation Service" });
  });

  // AI Text Enhancement route
  app.post("/api/ai-enhance", async (req, res) => {
    try {
      const { text, action, targetLanguage, customPrompt } = req.body;

      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Tekst je obavezan." });
      }

      const ai = getGeminiClient();

      let systemInstruction = "Jesi profesionalni AI asistent za obradu transkripata govora i diktata. Tvoj zadatak je da vratiš čist, lepo formatiran i koristan tekst na osnovu korisničkog diktata. Zadrži suštinu originalnog govora.";
      let prompt = "";

      switch (action) {
        case "cleanup":
          prompt = `Očisti i uredi sledeći izdiktirani tekst. Ukloni poštapalice (kao što su "znači", "ovaj", "um", "eee", "pa", "razumeš"), ispravi gramatičke greške, dodaj odgovarajuće znake interpunkcije (tačke, zareze, velike početna slova) i podeli tekst u prirodne pasuse. Vrati SAMO uređeni tekst bez dodatnih objašnjenja ili uvodnih rečenica.\n\nOriginalni tekst:\n"${text}"`;
          break;
        case "summarize":
          prompt = `Analiziraj i sažmi sledeći diktat u kratak i jasan rezime:\n1. Kratak rezime glavne misli (2-3 rečenice)\n2. Ključne tačke i zaključci u obliku alineja (bullet points)\n3. Zadaci / Akcije (ako postoje u tekstu)\n\nTekst:\n"${text}"`;
          break;
        case "structure":
          prompt = `Pretvori ovaj spontani govor/diktat u lepo strukturisanu belešku ili dokument sa prikladnim naslovima, podnaslovima, tačkama i preglednim pasusima:\n\nTekst:\n"${text}"`;
          break;
        case "translate":
          const lang = targetLanguage || "Engleski";
          prompt = `Prevedi sledeći tekst na jezik: ${lang}. Vrati precizan i prirodan prevod bez dodatnih komentara:\n\nTekst:\n"${text}"`;
          break;
        case "custom":
          prompt = `${customPrompt || "Poboljšaj tekst"}:\n\nTekst:\n"${text}"`;
          break;
        default:
          prompt = `Lepo formatiraj i očisti sledeći tekst govora:\n\n"${text}"`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      const resultText = response.text || "Nije bilo moguće generisati odgovor.";
      res.json({ result: resultText });
    } catch (error: any) {
      console.error("AI Enhance error:", error);
      res.status(500).json({ error: error?.message || "Greška pri obradi AI zahteva." });
    }
  });

  // Audio Transcribe fallback API route using Gemini Multimodal
  app.post("/api/transcribe-audio", async (req, res) => {
    try {
      const { audioBase64, mimeType, language } = req.body;

      if (!audioBase64) {
        return res.status(400).json({ error: "Audio podaci nisu poslati." });
      }

      const ai = getGeminiClient();

      const langHint = language ? `Jezik govora u snimku je pretežno: ${language}.` : "Prepoznaj jezik automatski (npr. Srpski / Hrvatski / Bosanski ili Engleski).";

      const promptText = `Transkribuj ovaj zvučni snimak tačno od reči do reči. ${langHint} Ukloni pozadinsku buku, dodaj tačnu interpunkciju (tačke, zareze, velika slova). Vrati SAMO transkribovani tekst.`;

      const audioPart = {
        inlineData: {
          mimeType: mimeType || "audio/webm",
          data: audioBase64,
        },
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: { parts: [audioPart, { text: promptText }] },
        config: {
          temperature: 0.1,
        },
      });

      const transcript = response.text || "";
      res.json({ transcript: transcript.trim() });
    } catch (error: any) {
      console.error("Audio Transcribe error:", error);
      res.status(500).json({ error: error?.message || "Greška pri transkripciji zvučnog snimka." });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server pokrenut na http://0.0.0.0:${PORT}`);
  });
}

startServer();
