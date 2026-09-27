import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for frontend dev server
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '2mb' }));

/**
 * Candidate models supported by Groq with automatic fallback
 */
const CANDIDATE_MODELS = [
  process.env.GROQ_MODEL,
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b',
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
].filter(Boolean);

/**
 * System prompts enforcing strict JSON output and shape adherence
 */
const SYSTEM_PROMPTS = {
  flashcards: `You are an expert educational study assistant. Given the user's notes or topic, generate a structured set of flashcards.
Generate between 6 to 10 items scaled to the depth and length of the provided input.
You must return ONLY valid JSON matching this exact schema:
{
  "title": "Study Set Title",
  "summary": "1-2 sentence concise summary of core concepts",
  "cards": [
    {
      "id": "card-1",
      "question": "Front of card question, prompt, or key concept",
      "answer": "Back of card clear, thorough, and educational explanation",
      "category": "Topic category or subtopic name",
      "difficulty": "easy"
    }
  ]
}
Rules:
- return ONLY valid JSON, no markdown fences, no prose.
- Do not wrap the response in \`\`\`json or \`\`\`.
- Generate 6 to 10 high-quality cards unless the notes are extremely short.
- Ensure "title", "summary", and "cards" are present.
- Each card must have "id", "question", "answer", "category", and "difficulty" (one of "easy", "medium", "hard").`,

  quiz: `You are an expert educational assessment creator. Given the user's notes or topic, generate a comprehensive multiple-choice quiz.
Generate between 5 to 8 items scaled to the depth and length of the provided input.
You must return ONLY valid JSON matching this exact schema:
{
  "title": "Quiz Title",
  "topic": "Topic Name",
  "questions": [
    {
      "id": "q-1",
      "question": "The question or problem statement?",
      "options": [
        { "id": "A", "text": "First option choice" },
        { "id": "B", "text": "Second option choice" },
        { "id": "C", "text": "Third option choice" },
        { "id": "D", "text": "Fourth option choice" }
      ],
      "correctOptionId": "A",
      "explanation": "Detailed educational explanation of why the correct answer is right and why alternatives are incorrect."
    }
  ]
}
Rules:
- return ONLY valid JSON, no markdown fences, no prose.
- Do not wrap the response in \`\`\`json or \`\`\`.
- Generate 5 to 8 questions unless the notes are extremely short.
- Each question must have exactly 4 options with ids "A", "B", "C", and "D".
- "correctOptionId" must match one of the option IDs.
- Ensure "title", "topic", and "questions" are present.`
};

/**
 * POST /api/generate
 * Accepts { notes: string, mode: "flashcards" | "quiz" }
 * Calls Groq's chat completions API with 15-second timeout and returns raw model text.
 */
app.post('/api/generate', async (req, res) => {
  const notes = req.body.notes || req.body.prompt;
  const mode = req.body.mode || 'flashcards';

  if (!notes || typeof notes !== 'string' || !notes.trim()) {
    return res.status(400).json({ error: 'Missing or empty notes' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return res.status(500).json({
      error: 'GROQ_API_KEY is not configured on the server. Please set it in your .env file.',
    });
  }

  const systemInstruction = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.flashcards;

  // 15-second timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 15000);

  let lastError = null;

  // Try candidate models with fallback
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            {
              role: 'system',
              content: systemInstruction,
            },
            {
              role: 'user',
              content: `Notes / Topic to generate ${mode} for:\n\n${notes.trim()}`,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
        signal: controller.signal,
      });

      if (!groqResponse.ok) {
        const errorText = await groqResponse.text();
        let errorJson = null;
        try {
          errorJson = JSON.parse(errorText);
        } catch {
          // ignore
        }

        const errMsg = errorJson?.error?.message || `Status ${groqResponse.status}`;
        lastError = { status: groqResponse.status, message: errMsg, details: errorText };

        // If model doesn't exist or no permission, try next candidate model
        if (errMsg.includes('does not exist') || errMsg.includes('do not have access') || groqResponse.status === 404) {
          console.warn(`Model ${modelName} unavailable on Groq (${errMsg}), trying fallback model...`);
          continue;
        }

        clearTimeout(timeoutId);
        return res.status(groqResponse.status).json({
          error: errMsg,
          details: errorText,
        });
      }

      clearTimeout(timeoutId);
      const data = await groqResponse.json();
      const rawContent = data.choices?.[0]?.message?.content ?? '';

      if (!rawContent || !rawContent.trim()) {
        return res.status(502).json({ error: 'Model returned an empty response' });
      }

      return res.json({
        raw: rawContent,
        rawText: rawContent,
        mode,
        modelUsed: modelName,
      });
    } catch (err) {
      if (err.name === 'AbortError' || controller.signal.aborted) {
        clearTimeout(timeoutId);
        return res.status(504).json({ error: 'timeout' });
      }
      lastError = err;
    }
  }

  clearTimeout(timeoutId);

  if (lastError) {
    return res.status(lastError.status || 500).json({
      error: lastError.message || lastError.toString() || 'All candidate models failed.',
      details: lastError.details || null,
    });
  }

  return res.status(500).json({ error: 'Failed to contact Groq API with configured models.' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== ''),
  });
});

app.listen(PORT, () => {
  console.log(`Groq proxy server running on http://localhost:${PORT}`);
});
