require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();

// ✅ Allow common dev ports and GitHub Pages dynamically
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:63356',
  'http://localhost:58605',
  'https://lucasdoarruda.github.io'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true,
}));

app.use(express.json());

// ✅ OpenAI config
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ POST /chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a speech coach helping improve pronunciation.' },
        { role: 'user', content: message },
      ],
    });

    const reply = chatCompletion.choices[0].message.content;
    console.log('AI reply:', reply);

    res.json({ reply });
  } catch (err) {
    console.error('Error with OpenAI API:', err);
    res.status(500).json({ error: 'Something went wrong with OpenAI API' });
  }
});

// ✅ Health check
app.get('/', (req, res) => {
  res.send('👋 Speech AI backend is live and ready!');
});

// ✅ Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
