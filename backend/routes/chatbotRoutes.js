const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// System prompt that defines the chatbot's personality & knowledge
const systemPrompt = `You are a helpful support assistant for PropertyBazzar, India's most trusted real estate platform.
Your ONLY job is to assist users with questions related to PropertyBazzar, such as:

- Registration
- Listing a property
- Document verification (Aadhaar, Registration, Khata, Khasra, PAN)
- Chatting with sellers
- Approval times
- Contacting support

Here is the important information you can use:

- To register: click "Register" on the top right. It's free.
- To list a property: click "Sell Property" in the navbar, fill in details, upload images, and submit. The listing will be reviewed.
- Documents verified: Aadhaar, Property Registration Number, Khata Number, Khasra Number, and PAN (if provided).
- To chat with a seller: On any property detail page, click "Chat with Seller".
- Approval time: usually 24–48 hours.
- Support email: support@propertybazzar.com
- Support phone: +91 1800-123-4567

IMPORTANT RULES:
- Keep your answers concise, friendly, and in plain English.
- If the user asks something completely unrelated to PropertyBazzar (e.g., "What's the meaning of life?", "Tell me a joke", "What's the weather?"), you MUST NOT answer the question. Instead, respond with: "I'm here to help you with PropertyBazzar. 😊 How can I assist you with our platform today?" and then stop.
- Do NOT engage in philosophical, political, or off‑topic discussions.
- If you don't know the answer to a platform‑related question, say: "I'm not sure about that. Please email support@propertybazzar.com and our team will help you."`;

router.post('/', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.json({ reply: 'Please ask a question.' });

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 300,
    });

    const reply = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't process that.";
    res.json({ reply });
  } catch (error) {
    console.error('Groq API error:', error);
    // Fallback to a friendly message if the API fails
    res.json({ reply: "I'm having trouble connecting right now. Please email support@propertybazzar.com and we'll help you shortly!" });
  }
});

module.exports = router;