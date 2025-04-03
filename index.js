require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();

// ✅ CORS settings for local + deployed frontend
app.use(cors({
  origin: [
    'http://localhost:58605',                          // Local Vite dev server
    'https://lucasdoarruda.github.io',                // GitHub Pages
  ],
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
        {
          role: 'system',
          content: 'You are a speech coach helping improve pronunciation.',
        },
        {
          role: 'user',
          content: message,
        },
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

// ✅ Use dynamic port (important for Render!)
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.send('👋 Speech AI backend is live and ready!');
});
