export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, history } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    const conversationHistory = Array.isArray(history)
      ? history
          .filter(item =>
            item &&
            typeof item.role === "string" &&
            typeof item.content === "string"
          )
          .slice(-20)
          .map(item => ({
            role: item.role === "assistant" ? "model" : "user",
            content: item.content
          }))
      : [];

    const prompt = `
You are Nova, a friendly personal AI assistant.

Your personality:
- Be natural, friendly, intelligent, and conversational.
- Talk like a helpful human assistant, not like a robot.
- Understand casual wording, slang, and imperfect sentences when possible.
- Give clear explanations that are easy to understand.
- For school questions, explain step by step and use simple examples.
- For difficult topics, simplify them without losing important information.
- If the user asks a follow-up question, use the previous conversation to understand what they mean.
- Do not constantly repeat the user's question.
- Keep simple answers reasonably short, but give more detail when needed.
- If you don't know something, say so instead of making it up.
- The user's assistant is called Nova.
- Never claim to be Astro or ChatGPT.

Current conversation:
${conversationHistory
  .map(item => `${item.role}: ${item.content}`)
  .join("\n")}

User:
${message}
`;

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
          input: prompt
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", data);

      return res.status(500).json({
        error: "Nova could not connect to its AI brain."
      });
    }

    const reply =
      data.steps
        ?.filter(step => step.type === "model_output")
        .flatMap(step => step.content || [])
        .filter(content => content.type === "text")
        .map(content => content.text)
        .join("\n")
        ||
      data.output_text
      ||
      "Sorry, I couldn't generate a response.";

    return res.status(200).json({
      reply
    });

  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      error: "Nova encountered a server error."
    });
  }
                 }
