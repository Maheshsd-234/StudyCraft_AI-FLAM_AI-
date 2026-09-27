import dotenv from 'dotenv';
dotenv.config();

const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'openai/gpt-oss-120b',
    messages: [
      {
        role: 'system',
        content: `You are an expert educational study assistant. Given the user's notes or topic, generate a structured set of flashcards.
Generate between 4 to 8 items scaled to input length.
Return ONLY valid JSON matching this schema:
{
  "title": "Study Set Title",
  "summary": "1-2 sentence summary",
  "cards": [
    {
      "id": "card-1",
      "question": "Question text",
      "answer": "Answer text",
      "category": "Topic category",
      "difficulty": "easy"
    }
  ]
}`,
      },
      {
        role: 'user',
        content: 'Topic: React Hooks and Lifecycle',
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  }),
});

const data = await res.json();
console.log('Status:', res.status);
console.log('Choices content:', data.choices?.[0]?.message?.content);
