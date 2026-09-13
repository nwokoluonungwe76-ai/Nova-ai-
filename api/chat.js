export default async function handler(req, res) {
if (req.method !== "POST") {
return res.status(405).json({ error: "Method not allowed" });
}

try {
const { message } = req.body || {};

if (!message || typeof message !== "string") {  
  return res.status(400).json({ error: "Message is required" });  
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
      input: message  
    })  
  }  
);  

const data = await response.json();  

if (!response.ok) {  
  console.error(data);  
  return res.status(500).json({  
    error: "Gemini API error"  
  });  
}  

const reply =  
  data.steps  
    ?.filter(step => step.type === "model_output")  
    .flatMap(step => step.content || [])  
    .filter(content => content.type === "text")  
    .map(content => content.text)  
    .join("\n") ||  
  data.output_text ||  
  "I couldn't generate a response.";  

return res.status(200).json({  
  reply: reply  
});

} catch (error) {
console.error(error);

return res.status(500).json({  
  error: "Nova could not get an AI response."  
});

}
  }
