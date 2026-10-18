// VidyAI - AI Controller using Groq (FREE tier)
// Get free API key: https://console.groq.com (no credit card needed)
// Add to .env: GROQ_API_KEY=gsk_...

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "qwen/qwen3.8-27b";

const SAFETY_GUARDRAIL = "You MUST ONLY discuss age-appropriate school subjects, mathematics, science, languages, social studies, and general knowledge. NEVER discuss violence, self-harm, adult or explicit content, weapons, illegal acts, or hate speech. If a student asks anything unsafe, inappropriate, or unrelated to learning, politely refuse and guide them back to their lessons.";

const SYSTEM = {
  en: (c) =>
    `You are Vidya, a friendly, encouraging AI tutor for Class ${c} rural Indian school students. ${SAFETY_GUARDRAIL} Use simple English, familiar Indian examples, encouraging emojis. Keep responses simple and under 150 words.`,
  mr: (c) =>
    `तुम्ही विद्या आहात, इयत्ता ${c} च्या ग्रामीण शालेय विद्यार्थ्यांसाठी मार्गदर्शक व सुरक्षित AI शिक्षक. ${SAFETY_GUARDRAIL} सोपी मराठी भाषा, स्थानिक उदाहरणे आणि इमोजी वापरा. उत्तर १५० शब्दांच्या आत ठेवा.`,
  hi: (c) =>
    `आप विद्या हैं, कक्षा ${c} के भारतीय स्कूली छात्रों के लिए मित्रवत और सुरक्षित AI शिक्षक। ${SAFETY_GUARDRAIL} सरल हिंदी भाषा, परिचित भारतीय उदाहरण और इमोजी उपयोग करें। उत्तर 150 शब्दों के भीतर रखें।`,
};

/**
 * Defensive JSON parser that strips markdown code blocks and handles LLM output quirks
 */
function cleanAndParseJSON(rawStr) {
  if (!rawStr || typeof rawStr !== "string") return {};
  try {
    let cleaned = rawStr.trim();
    // Strip markdown code fences like ```json ... ``` or ``` ... ```
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    // Find bounding curly braces or brackets
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn("[JSON Clean Parse Fallback]", err.message);
    return {};
  }
}

async function groqChat(
  messages,
  { stream = false, maxTokens = 300, jsonMode = false } = {},
) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY not configured. Add it to your .env file. Get a free key at https://console.groq.com",
    );
  }

  const models = [
    GROQ_MODEL,
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
  ];

  let lastError = null;
  for (const model of models) {
    try {
      const body = {
        model,
        messages,
        max_tokens: maxTokens,
        stream,
        ...(jsonMode && { response_format: { type: "json_object" } }),
      };

      const res = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`[Groq Model ${model} failed]: ${res.status} - ${errText}`);
        lastError = new Error(`Groq API error ${res.status}: ${errText}`);
        continue;
      }

      return res;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("All AI models failed to respond.");
}

exports.chat = async (req, res) => {
  try {
    const {
      message,
      history = [],
      language = "en",
      studentClass = 5,
    } = req.body;
    if (!message?.trim())
      return res.status(400).json({ error: "message is required" });

    // Validate class
    const parsedClass = parseInt(studentClass, 10);
    const validClass = !isNaN(parsedClass) && parsedClass >= 1 && parsedClass <= 10 ? parsedClass : 5;

    const messages = [
      {
        role: "system",
        content: (SYSTEM[language] || SYSTEM.en)(validClass),
      },
      ...history.slice(-10).map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: message },
    ];

    const groqRes = await groqChat(messages, { stream: true, maxTokens: 300 });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // disable nginx buffering if present

    const reader = groqRes.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
      for (const line of lines) {
        const payload = line.slice(6).trim();
        if (payload === "[DONE]") {
          res.write("data: [DONE]\n\n");
          res.end();
          return;
        }
        try {
          const parsed = JSON.parse(payload);
          const text = parsed.choices?.[0]?.delta?.content || "";
          if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
        } catch {
          /* skip malformed SSE lines */
        }
      }
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error("[AI Chat Error]", err.message);
    if (!res.headersSent) {
      return res.status(500).json({ error: err.message });
    }
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  }
};

exports.generateQuiz = async (req, res) => {
  try {
    const { topic, subject, studentClass = 5, count = 5 } = req.body;
    const prompt = `Generate ${count} MCQs about "${topic}" for Class ${studentClass} ${subject} Indian students.
Return ONLY valid JSON (no markdown): { "questions": [{ "text":"...", "options":["A","B","C","D"], "correctIndex":0, "explanation":"...", "hint":"..." }] }`;

    const groqRes = await groqChat([{ role: "user", content: prompt }], {
      jsonMode: true,
      maxTokens: 1500,
    });
    const data = await groqRes.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    const parsed = cleanAndParseJSON(content);
    res.json({ questions: parsed.questions || [] });
  } catch (err) {
    console.error("[AI Quiz Error]", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.summarizeLesson = async (req, res) => {
  try {
    const { content, language = "en", studentClass = 5 } = req.body;
    const langName =
      { en: "English", mr: "Marathi", hi: "Hindi" }[language] || "English";
    const groqRes = await groqChat(
      [
        {
          role: "user",
          content: `Summarize in 5 key bullet points for Class ${studentClass} in ${langName}. Simple language.\n\n${content.slice(0, 3000)}`,
        },
      ],
      { maxTokens: 400 },
    );
    const data = await groqRes.json();
    res.json({ summary: data.choices?.[0]?.message?.content || "" });
  } catch (err) {
    console.error("[AI Summarize Error]", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.detectWeakTopics = async (req, res) => {
  try {
    const QuizResult = require("../models/QuizResult");
    const results = await QuizResult.find({ studentId: req.params.studentId })
      .populate("quizId", "subject")
      .sort({ completedAt: -1 })
      .limit(50);
    const stats = {};
    for (const r of results) {
      const s = r.quizId?.subject;
      if (!s) continue;
      if (!stats[s]) stats[s] = { correct: 0, total: 0 };
      for (const a of r.answers) {
        stats[s].total++;
        if (a.correct) stats[s].correct++;
      }
    }
    const weak = Object.entries(stats)
      .filter(([, s]) => s.total > 0 && s.correct / s.total < 0.6)
      .map(([subject, s]) => ({
        subject,
        accuracy: Math.round((s.correct / s.total) * 100),
      }));
    res.json({ weakTopics: weak });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.careerGuide = async (req, res) => {
  try {
    const { interests, subjects, studentClass } = req.body;
    const prompt = `Indian Class ${studentClass} student likes: ${interests.join(", ")}. Strong in: ${subjects.join(", ")}.
Suggest 3 careers. Return ONLY JSON (no markdown): { "careers": [{"name":"...","reason":"...","steps":[]}] }`;
    const groqRes = await groqChat([{ role: "user", content: prompt }], {
      jsonMode: true,
      maxTokens: 800,
    });
    const data = await groqRes.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    res.json(cleanAndParseJSON(content));
  } catch (err) {
    console.error("[AI Career Error]", err.message);
    res.status(500).json({ error: err.message });
  }
};

