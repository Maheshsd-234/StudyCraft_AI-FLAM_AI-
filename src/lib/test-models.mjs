import dotenv from 'dotenv';
dotenv.config();

const modelsToTest = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b',
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
];

for (const model of modelsToTest) {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'user', content: 'Return JSON: {"status": "ok"}' },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    const data = await res.json();
    if (res.ok) {
      console.log(`✅ Model "${model}" WORKS! Response:`, data.choices?.[0]?.message?.content);
    } else {
      console.log(`❌ Model "${model}" failed:`, data.error?.message || res.status);
    }
  } catch (err) {
    console.log(`❌ Model "${model}" network error:`, err.message);
  }
}
