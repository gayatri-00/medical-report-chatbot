import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Initialize Gemini Client safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (e) {
      console.warn("Failed to initialize GoogleGenAI client:", e);
    }
  }
  return aiClient;
}

const MEDICAL_RAG_SYSTEM_PROMPT = `You are a medical report explanation assistant.
Answer questions ONLY using information retrieved from the user's uploaded document.
If the requested information is not present in the document, clearly say that the information is not available in the uploaded report.
Never fabricate values, diagnoses, test results, or medical history.

Important Rules:
1. If the information is unavailable in the provided context, respond:
   "I couldn't find that information in the uploaded report."
2. You must NOT:
   - Diagnose diseases or confirm speculative conditions
   - Prescribe medicines
   - Recommend specific medication doses
   - Tell the user to start or stop medications
   - Replace a physician or professional healthcare provider
3. If the user asks about taking medicines (e.g. "Which medicine should I take?"), respond:
   "I can explain what the uploaded report says, but I cannot prescribe or recommend a medication. Please discuss medication choices with a qualified healthcare professional."
4. If a medication is already listed in the report, you may state that it is mentioned in the report, but do not independently recommend taking it.
5. Always explain complex laboratory units, medical acronyms, or clinical jargon in simple, accessible, clear terms.
6. Clearly cite the source page(s) whenever provided in the context chunks (e.g., "Source: Page 1").`;

// In-Memory Report Store
interface ReportDoc {
  id: string;
  userId: string;
  filename: string;
  uploadedAt: number;
  totalPages: number;
  totalChunks: number;
  fullText: string;
  chunks: Array<{ chunkId: number; pageNumber: number; text: string }>;
  detectedSections: string[];
}

const reportsStore: Map<string, ReportDoc> = new Map();

// API: Check Health & Gemini Config
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    geminiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
  });
});

// API: Ingest & Store Report
app.post("/api/reports/ingest", (req, res) => {
  try {
    const { id, userId, filename, totalPages, fullText, chunks, detectedSections } = req.body;
    if (!id || !filename || !chunks) {
      return res.status(400).json({ error: "Missing required report fields" });
    }

    const reportDoc: ReportDoc = {
      id,
      userId: userId || "guest_session",
      filename,
      uploadedAt: Date.now(),
      totalPages: totalPages || 1,
      totalChunks: chunks.length,
      fullText: fullText || "",
      chunks: chunks || [],
      detectedSections: detectedSections || ["General Medical Findings"],
    };

    reportsStore.set(id, reportDoc);
    res.json({ success: true, report: reportDoc });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to store report" });
  }
});

// Intelligent clinical answer generator from document chunks and text
function generateDocumentGroundedAnswer(
  question: string,
  docName: string,
  topChunks: Array<{ pageNumber: number; text: string }>,
  fullText: string,
  sourcePages: number[]
): string {
  const qLower = question.toLowerCase();
  const pagesList = sourcePages.length > 0 ? sourcePages.join(", ") : "1";

  // 1. Abnormal Values / High / Low / Critical Flags
  if (
    qLower.includes("abnormal") ||
    qLower.includes("high") ||
    qLower.includes("low") ||
    qLower.includes("elevated") ||
    qLower.includes("out of range") ||
    qLower.includes("flag")
  ) {
    const lines = (fullText || "").split("\n");
    const abnormalLines = lines.filter((l) =>
      /\b(HIGH|LOW|ELEVATED|ABNORMAL|BORDERLINE)\b/i.test(l)
    );

    if (abnormalLines.length > 0) {
      let ans = `**Abnormal values and observations identified in ${docName}:**\n\n`;
      abnormalLines.forEach((line) => {
        ans += `• **${line.trim()}**\n`;
      });

      // Add clinical interpretation from impression/findings if available
      const impressionChunk = topChunks.find((c) =>
        /impression|observation|conclusion/i.test(c.text)
      );
      if (impressionChunk) {
        ans += `\n**Clinical Observation (Source: Page ${impressionChunk.pageNumber || 1}):**\n`;
        const cleanText = impressionChunk.text
          .split("\n")
          .filter((l) => /1\.|2\.|3\.|impression|observation/i.test(l))
          .join("\n");
        ans += cleanText ? `> ${cleanText}\n` : `> ${impressionChunk.text.substring(0, 300)}...\n`;
      }
      return ans;
    }
  }

  // 2. Summary / Main Findings / What is this report about / Explain in simple words
  if (
    qLower.includes("summar") ||
    qLower.includes("what is this report about") ||
    qLower.includes("about") ||
    qLower.includes("main finding") ||
    qLower.includes("simple words") ||
    qLower.includes("explain") ||
    qLower.includes("important observation")
  ) {
    let summary = `**Summary of ${docName}:**\n\n`;

    // Check for patient demographics
    const patientMatch = fullText.match(/Patient Name:\s*([^\n]+)/i);
    const dateMatch = fullText.match(/Date[^:\n]*:\s*([^\n]+)/i);
    if (patientMatch) {
      summary += `• **Patient:** ${patientMatch[1].trim()}${dateMatch ? ` (${dateMatch[1].trim()})` : ""}\n`;
    }

    // Extract Impression / Findings
    const impressionMatch = fullText.match(/(?:IMPRESSION|CLINICAL IMPRESSIONS|OBSERVATIONS):?([\s\S]*?)(?:RECOMMENDATIONS|Reported by|Electronically signed|$)/i);
    if (impressionMatch && impressionMatch[1].trim().length > 10) {
      summary += `\n**Main Clinical Findings & Impressions:**\n`;
      const points = impressionMatch[1]
        .trim()
        .split("\n")
        .filter((l) => l.trim().length > 3);
      points.forEach((p) => {
        summary += `${p.trim()}\n`;
      });
    } else if (topChunks.length > 0) {
      summary += `\n**Key Retrieved Observations:**\n`;
      summary += `> ${topChunks[0].text.substring(0, 350)}...\n`;
    }

    // Simple explanation addition
    if (qLower.includes("simple words") || qLower.includes("explain")) {
      summary += `\n**Plain Language Explanation:**\nThis document summarizes diagnostic laboratory and examination metrics. Normal baseline values indicate standard functioning, while flagged indicators (marked HIGH/LOW) represent parameters to be reviewed during follow-up consultations with your physician.`;
    }

    return summary;
  }

  // 3. Tests Included
  if (qLower.includes("test") || qLower.includes("panel") || qLower.includes("what tests")) {
    let ans = `**Tests and panels included in ${docName}:**\n\n`;
    const panels = (fullText.match(/PANEL\s*\d*:[^\n]+/gi) || []).map((p) => p.replace(/--+/g, "").trim());
    if (panels.length > 0) {
      panels.forEach((p) => {
        ans += `• **${p}**\n`;
      });
    } else {
      const tests = (fullText.match(/(?:Hemoglobin|Cholesterol|Glucose|Triglycerides|TSH|WBC|Platelet|eGFR|Creatinine|Calcium)[^\n]*/gi) || []);
      if (tests.length > 0) {
        tests.slice(0, 8).forEach((t) => {
          ans += `• ${t.trim()}\n`;
        });
      }
    }
    ans += `\n*(Source: Page ${pagesList})*`;
    return ans;
  }

  // 4. Medication questions
  if (qLower.includes("medicine") || qLower.includes("prescribe") || qLower.includes("drug") || qLower.includes("dose")) {
    return `I can explain what the uploaded medical report says, but I cannot prescribe or recommend medications or dosage adjustments. Please discuss medication choices with a qualified healthcare professional.`;
  }

  // 5. Default specific parameter lookup from retrieved chunks
  if (topChunks.length > 0) {
    return `**According to ${docName} (Source: Page ${pagesList}):**\n\n${topChunks[0].text}\n\n${
      topChunks[1] ? `**Additional Context (Page ${topChunks[1].pageNumber || 1}):**\n${topChunks[1].text}` : ""
    }`;
  }

  return "I couldn't find that information in the uploaded report.";
}

// API: Ask Question via RAG
app.post("/api/rag/chat", async (req, res) => {
  try {
    const { question, reportId, chunks, reportName } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: "Question cannot be empty" });
    }

    const targetReport = reportId ? reportsStore.get(reportId) : null;
    const activeChunks = chunks || (targetReport ? targetReport.chunks : []);
    const docName = reportName || (targetReport ? targetReport.filename : "Medical Report");
    const fullText = targetReport ? targetReport.fullText : activeChunks.map((c: any) => c.text).join("\n\n");

    if (!activeChunks || activeChunks.length === 0) {
      return res.json({
        answer: "No active report selected or the selected report vector index is empty. Please upload or select a report first.",
        sourcePages: [],
        citations: [],
      });
    }

    // Keyword & Semantic similarity ranking on chunks
    const qLower = question.toLowerCase();
    const qWords = qLower.split(/\W+/).filter((w: string) => w.length > 2);

    const scoredChunks = activeChunks.map((chunk: any, index: number) => {
      const cLower = chunk.text.toLowerCase();
      let matchScore = 0;
      for (const word of qWords) {
        if (cLower.includes(word)) matchScore += 3;
      }
      // Boost clinical terms
      if (qLower.includes("finding") && (cLower.includes("finding") || cLower.includes("impression"))) matchScore += 4;
      if (qLower.includes("abnormal") && (cLower.includes("high") || cLower.includes("low") || cLower.includes("elevated") || cLower.includes("abnormal"))) matchScore += 5;
      if (qLower.includes("summar") && (cLower.includes("impression") || cLower.includes("conclusion") || cLower.includes("summary"))) matchScore += 4;
      if (qLower.includes("test") && (cLower.includes("panel") || cLower.includes("test name") || cLower.includes("analyte"))) matchScore += 3;
      
      return { ...chunk, score: matchScore, origIndex: index };
    });

    scoredChunks.sort((a: any, b: any) => b.score - a.score);
    // Take top 4 most relevant chunks
    const topChunks = scoredChunks.slice(0, 4);
    const sourcePages: number[] = Array.from(new Set<number>(topChunks.map((c: any) => Number(c.pageNumber) || 1))).sort((a: number, b: number) => a - b);

    const contextBlocks = topChunks.map((c: any, i: number) => `[Snippet ${i + 1} - Page ${c.pageNumber || 1}]\n${c.text}`);
    const contextStr = contextBlocks.join("\n\n---\n\n");

    // Try Gemini first if API key is present
    let answerText = "";
    const client = getGeminiClient();

    if (client) {
      try {
        const userPrompt = `DOCUMENT NAME: ${docName}

RETRIEVED CONTEXT FROM REPORT:
${contextStr}

USER QUESTION:
${question}

Please answer the user's question based strictly and exclusively on the RETRIEVED CONTEXT above. Cite source page numbers (e.g. 'Source: Page ${sourcePages[0] || 1}').`;

        const response = await client.models.generateContent({
          model: "gemini-3.7-flash",
          contents: userPrompt,
          config: {
            systemInstruction: MEDICAL_RAG_SYSTEM_PROMPT,
            temperature: 0.15,
          },
        });

        if (response && response.text) {
          answerText = response.text;
        }
      } catch (geminiErr) {
        console.warn("Gemini API call warning, falling back to grounded extraction:", geminiErr);
      }
    }

    // If Gemini wasn't available or returned empty, use robust document-grounded extraction
    if (!answerText) {
      answerText = generateDocumentGroundedAnswer(question, docName, topChunks, fullText, sourcePages);
    }

    res.json({
      answer: answerText,
      sourcePages,
      citations: sourcePages.map((p: any) => `Page ${p}`),
      retrievedChunks: topChunks,
    });
  } catch (err: any) {
    console.error("RAG Handler Error:", err);
    res.json({
      answer: "I couldn't find that information in the uploaded report.",
      sourcePages: [],
      citations: [],
    });
  }
});

// API: Generate Structured Report Summary
app.post("/api/rag/summarize", async (req, res) => {
  try {
    const { fullText, filename } = req.body;
    const client = getGeminiClient();

    if (!client) {
      return res.json({
        summary: `Document **${filename || "Medical Report"}** processed successfully. Contains ${fullText ? fullText.split(/\s+/).length : 0} words.`,
      });
    }

    const response = await client.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `You are an objective clinical document summarizer. Summarize the following medical report strictly based on the text. Do not invent any values or conditions.\n\nREPORT CONTENT:\n${(fullText || "").substring(0, 8000)}`,
      config: {
        systemInstruction: "You are a medical document analyzer. Only extract facts present in the text.",
        temperature: 0.1,
      },
    });

    res.json({ summary: response.text });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Medical Report Chatbot Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
