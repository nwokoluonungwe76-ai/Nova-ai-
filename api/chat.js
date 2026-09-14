export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, previousInteractionId } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    const body = {
      model: "gemini-3.8-flash",
      input: message
    };

    // Continue the previous conversation when Nova has one
    if (
      previousInteractionId &&
      typeof previousInteractionId === "string"
    ) {
      body.previous_interaction_id = previousInteractionId;
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", data);

      return res.status(500).json({
        error: "Gemini API error"
      });
    }

    const reply =
      data.output_text ||
      data.steps
        ?.filter(step => step.type === "model_output")
        .flatMap(step => step.content || [])
        .filter(content => content.type === "text")
        .map(content => content.text)
        .join("\n") ||
      "I couldn't generate a response.";

    return res.status(200).json({
      reply,
      interactionId: data.id
    });

  } catch (error) {
    console.error("Nova server error:", error);

    return res.status(500).json({
      error: "Nova could not get an AI response."
    });
  }
      }
