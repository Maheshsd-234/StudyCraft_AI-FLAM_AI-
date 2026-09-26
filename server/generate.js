import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Initialize Groq client with environment variable
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

/**
 * System prompts enforcing strict JSON response shapes
 */
const SYSTEM_PROMPTS = {
  flashcards: `You are an expert educational study assistant. Given the user's study notes or topic, generate a comprehensive set of flashcards.
Return ONLY valid JSON matching this exact schema:
{
  "title": "Clear concise title of the study set",
  "summary": "1-2 sentence overview of core concepts covered",
  "cards": [
    {
      "id": "card-1",
      "question": "Front of card question, term, or concept challenge",
      "answer": "Back of card clear, accurate, and educational explanation",
      "category": "Subtopic or concept category",
      "difficulty": "easy" | "medium" | "hard"
    }
  ]
}
Generate between 4 to 8 high-quality cards. Do NOT include markdown code fences, prose, or greetings. Output raw JSON only.`,

  quiz: `You are an expert assessment quiz creator. Given the user's study notes or topic, generate a multi-question interactive quiz.
Return ONLY valid JSON matching this exact schema:
{
  "title": "Quiz Title",
  "topic": "Topic Name",
  "questions": [
    {
      "id": "q-1",
      "question": "The question text?",
      "options": [
        { "id": "A", "text": "First option" },
        { "id": "B", "text": "Second option" },
        { "id": "C", "text": "Third option" },
        { "id": "D", "text": "Fourth option" }
      ],
      "correctOptionId": "A",
      "explanation": "Clear explanation of why option A is correct and why other options are incorrect."
    }
  ]
}
Generate between 3 to 6 questions with exactly 4 options each (A, B, C, D). Do NOT include markdown code fences, prose, or greetings. Output raw JSON only.`,
};

// POST /api/generate
app.post('/api/generate', async (req, res) => {
  const { prompt, mode = 'flashcards', options = {} } = req.body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({
      success: false,
      error: 'A non-empty prompt is required.',
    });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return res.status(500).json({
      success: false,
      error: 'GROQ_API_KEY is not configured on the server. Please add your API key to .env file.',
    });
  }

  const systemInstruction = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.flashcards;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemInstruction,
        },
        {
          role: 'user',
          content: `Content / Topic to convert into ${mode}:\n\n${prompt}`,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return res.status(502).json({
        success: false,
        error: 'The AI model returned an empty response.',
      });
    }

    try {
      const parsedData = JSON.parse(content);
      return res.json({
        success: true,
        data: parsedData,
        rawText: content,
      });
    } catch (parseError) {
      // Model returned non-JSON despite instructions
      return res.json({
        success: true,
        data: null,
        rawText: content,
      });
    }
  } catch (error) {
    console.error('Groq API generation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while communicating with the Groq API.',
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GROQ_API_KEY),
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
