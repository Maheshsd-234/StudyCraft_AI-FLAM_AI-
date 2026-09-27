const CANDIDATE_MODELS = [
  process.env.GROQ_MODEL,
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b',
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
].filter(Boolean);

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
 * Vercel Serverless Function Handler
 * Route: /api/generate
 */
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Safe body resolution (supports object, string, or stream chunks)
  let body = req.body;
  if (!body) {
    try {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const raw = Buffer.concat(chunks).toString();
      if (raw) {
        body = JSON.parse(raw);
      }
    } catch {
      body = {};
    }
  } else if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const notes = body?.notes || body?.prompt;
  const mode = body?.mode || 'flashcards';

  if (!notes || typeof notes !== 'string' || !notes.trim()) {
    return res.status(400).json({ error: 'Missing or empty notes' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return res.status(500).json({
      error: 'GROQ_API_KEY is not configured on Vercel. Please check your Vercel Project Settings -> Environment Variables.',
    });
  }

  const systemInstruction = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.flashcards;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 15000);

  let lastError = null;

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

        if (errMsg.includes('does not exist') || errMsg.includes('do not have access') || groqResponse.status === 404) {
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

      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json({
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

  return res.status(500).json({ error: 'Failed to contact Groq API on Vercel.' });
}
