require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();

// Allow CORS for the specific frontend URL
app.use(cors({
  origin: 'http://localhost:58605',  // Update this to match the frontend port
  credentials: true,
}));

app.use(express.json());

// Set up OpenAI API with the API key from your .env file
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    // Request AI completion from OpenAI
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

    // Get the AI's reply
    const reply = chatCompletion.choices[0].message.content;

    console.log('AI reply:', reply);  // Log AI reply

    // Send the AI reply back as a JSON response
    res.json({ reply });
  } catch (err) {
    console.error('Error with OpenAI API:', err);
    res.status(500).json({ error: 'Something went wrong with OpenAI API' });
  }
});

// Start the server on port 5001
app.listen(5001, () => {
  console.log('✅ Server running on http://localhost:5001');
});
