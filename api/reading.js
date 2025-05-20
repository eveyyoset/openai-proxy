export default async function handler(req, res) {
  // Handle preflight CORS requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', 'https://hawk-red-pwpn.squarespace.com'); // Your Squarespace domain
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Reject anything that's not POST
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { name, birthdate } = req.body;

  const prompt = `
You are a spiritual guide skilled in Destiny Matrix and numerology. Provide a mystical, uplifting 5-6 sentence destiny reading that is easy to display in a styled box.

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
        max_tokens: 180, // Shorter reading
        temperature: 0.9, // A little more variation/spirituality
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ OpenAI API Error:", data);
      return res.status(500).json({ error: "OpenAI error", detail: data });
    }

    let reading = data.choices?.[0]?.message?.content?.trim() || "";

    // Optional cleanup of line breaks
    reading = reading.replace(/\n{2,}/g, '\n').replace(/\n/g, ' ');

    console.log("📖 Your Destiny Reading is:", reading);

    res.setHeader('Access-Control-Allow-Origin', 'https://hawk-red-pwpn.squarespace.com');
    return res.status(200).json({ reading });

  } catch (err) {
    console.error("⚠️ Server error:", err);
    return res.status(500).json({ error: "Server error", detail: err.message });
  }
}