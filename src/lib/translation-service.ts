export async function translateWithGemini(summary: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("❌ Google Gemini API key not set.");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}
`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Translate the following English text into polite and meaningful Urdu:\n\n"${summary}"`
              }
            ]
          }
        ]
      })
    }
  );

  const data = await res.json();

  if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  } else {
    console.error("❌ Gemini translation failed:", data);
    throw new Error("Gemini translation failed");
  }
}
