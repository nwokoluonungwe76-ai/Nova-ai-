export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          model: "gemini-3.8-flash",
          input: message,
          system_instruction:
            "You are Nova, a friendly and intelligent personal AI assistant. Give natural, clear and helpful answers. Explain difficult things simply. For school questions, teach step by step. Do not claim to be Astro or ChatGPT."
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);

      return res.status(500).json({
        error: "Gemini API error",
        details: data
      });
    }

    const reply = data.output_text;

    if (!reply) {
      console.error("No output_text:", data);

      return res.status(500).json({
        error: "Gemini returned no text."
      });
    }

    return res.status(200).json({
      reply
    });

  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      error: "Nova could not connect to its AI brain."
    });
  }
        }
