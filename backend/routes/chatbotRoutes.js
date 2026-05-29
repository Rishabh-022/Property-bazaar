const express = require('express');
const router = express.Router();
const nlp = require('compromise');

// Knowledge base: list of possible intents and their replies
const knowledge = [
  {
    patterns: ['register', 'sign up', 'create account', 'registration'],
    reply: 'To register, click "Register" on the top right. Fill in your name, email, phone, and password. It’s free!'
  },
  {
    patterns: ['list property', 'sell', 'post property', 'sell property', 'how to list'],
    reply: 'After logging in, click "Sell Property" in the navbar. Fill in property details, upload images, and submit. Your listing will be reviewed by our team.'
  },
  {
    patterns: ['documents', 'verify', 'aadhaar', 'registration number', 'khata', 'khasra', 'pan', 'what documents'],
    reply: 'We verify Aadhaar, Property Registration Number, Khata Number, Khasra Number, and PAN (if provided). All documents are securely stored.'
  },
  {
    patterns: ['chat with seller', 'contact seller', 'message seller', 'talk to seller'],
    reply: 'On any property detail page, click "Chat with Seller" to start a real‑time conversation with the property owner.'
  },
  {
    patterns: ['approval time', 'how long', 'review time', 'pending', 'verification time'],
    reply: 'Our admin team usually reviews properties within 24‑48 hours. You will receive an email notification once approved.'
  },
  {
    patterns: ['support', 'contact', 'help', 'phone', 'email'],
    reply: 'For other queries, please email us at support@propertybazzar.com or call +91 1800-123-4567.'
  }
];

// @desc    Answer a user query
// @route   POST /api/chatbot
// @access  Public (or Private if you prefer)
router.post('/', (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.json({ reply: 'Please ask a question.' });
  }

  const userQuery = query.toLowerCase().trim();
  const doc = nlp(userQuery);

  // Attempt to match any intent
  for (let item of knowledge) {
    for (let pattern of item.patterns) {
      if (doc.has(pattern)) {
        return res.json({ reply: item.reply });
      }
    }
  }

  // Fallback
  res.json({ reply: 'I’m not sure about that. Please email support@propertybazzar.com or call +91 1800-123-4567 for help.' });
});

module.exports = router;