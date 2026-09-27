export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== ''),
    platform: 'vercel-serverless',
  });
}
