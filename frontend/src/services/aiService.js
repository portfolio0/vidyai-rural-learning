import api from "./api";

export const aiService = {
  generateQuiz: (data) => api.post("/ai/quiz-generate", data),
  summarize: (data) => api.post("/ai/summarize", data),
  weakTopics: (id) => api.get(`/ai/weak-topics/${id}`),
  careerGuide: (data) => api.post("/ai/career-guide", data),
};

// Streaming chat (SSE) — handles 500 errors before streaming
export const streamChat = async (data, onChunk, onDone, onError) => {
  const stored = localStorage.getItem("vidyai-auth");
  const token = stored ? JSON.parse(stored)?.state?.token : null;

  let res;
  try {
    res = await fetch(`${import.meta.env.VITE_API_URL || "/api"}/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
  } catch (networkErr) {
    throw new Error(
      "Cannot reach server. Is the backend running on port 5000?",
    );
  }

  // Check for HTTP error before streaming
  if (!res.ok) {
    let errMsg = `Server error ${res.status}`;
    try {
      const errBody = await res.json();
      errMsg = errBody.error || errMsg;
    } catch {
      /* ignore */
    }
    throw new Error(errMsg);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      onDone?.();
      break;
    }

    const lines = decoder
      .decode(value, { stream: true })
      .split("\n")
      .filter((l) => l.startsWith("data: "));

    for (const line of lines) {
      const payload = line.slice(6).trim();
      if (payload === "[DONE]") {
        onDone?.();
        return;
      }
      try {
        const parsed = JSON.parse(payload);
        if (parsed.error) throw new Error(parsed.error);
        if (parsed.text) onChunk?.(parsed.text);
      } catch (parseErr) {
        if (parseErr.message !== "Unexpected token") throw parseErr;
      }
    }
  }
};
