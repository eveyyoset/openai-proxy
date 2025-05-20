export default async function handler(req, res) {
  // Handle preflight request (for CORS)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // <-- Allow all origins (or replace * with your Squarespace URL)
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { name, birthdate } = req.body;

  const prompt = `
You are a spiritual guide skilled in Destiny Matrix and numerology. Provide a mystical, uplifting 4–5 sentence destiny reading for:

Name: ${name}
Birthdate: ${birthdate}

Reading:
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 250,
      }),
    });

    const data = await response.json();
    const reading = data.choices?.[0]?.message?.content?.trim();

    // 🐛 Debug log to check what OpenAI returns
    console.log("📖 Your Destiny Reading is:", reading);

    res.setHeader('Access-Control-Allow-Origin', 'https://hawk-red-pwpn.squarespace.com');
    res.status(200).json({ reading });
  } catch (err) {
    console.error("Error fetching from OpenAI:", err);
    res.status(500).json({ error: "Failed to generate reading" });
  }
}
