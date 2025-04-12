require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

// Firebase Admin setup
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  addDoc,
  serverTimestamp
} = require('firebase-admin/firestore');

// ✅ Load AssemblyAI route (placeholder version)
const assemblyRoutes = require('./src/routes/assembly');

initializeApp({
  credential: applicationDefault(),
});
const db = getFirestore();

const app = express();

// ✅ Allow these origins during dev and GitHub Pages
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:63356',
  'http://localhost:58605',
  'https://lucasdoarruda.github.io'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true,
}));

app.use(express.json());

// ✅ Mount AssemblyAI route
app.use('/api', assemblyRoutes);

// ✅ OpenAI chat config
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ POST /chat - OpenAI response
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
    res.json({ reply });
  } catch (err) {
    console.error('Error with OpenAI API:', err);
    res.status(500).json({ error: 'Something went wrong with OpenAI API' });
  }
});

// ✅ POST /add-connection
app.post('/add-connection', async (req, res) => {
  try {
    const { clientId, therapistId } = req.body;

    const connectionId = `${clientId}_${therapistId}`;
    await setDoc(doc(db, 'connections', connectionId), {
      clientId,
      therapistId,
      status: 'pending',
    });

    res.status(200).json({ message: 'Connection request sent.' });
  } catch (err) {
    console.error('Error adding connection:', err);
    res.status(500).json({ error: 'Could not add connection' });
  }
});

// ✅ GET /get-connections/:userId
app.get('/get-connections/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const clientQuery = query(collection(db, 'connections'), where('clientId', '==', userId));
    const therapistQuery = query(collection(db, 'connections'), where('therapistId', '==', userId));

    const [clientSnap, therapistSnap] = await Promise.all([
      getDocs(clientQuery),
      getDocs(therapistQuery),
    ]);

    const connections = [
      ...clientSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      ...therapistSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    ];

    res.status(200).json({ connections });
  } catch (err) {
    console.error('Error getting connections:', err);
    res.status(500).json({ error: 'Could not fetch connections' });
  }
});

// ✅ POST /send-message
app.post('/send-message', async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;

    const threadId = [senderId, receiverId].sort().join('_');
    const messageRef = collection(db, 'messages', threadId, 'messages');

    await addDoc(messageRef, {
      senderId,
      receiverId,
      message,
      timestamp: serverTimestamp()
    });

    res.status(200).json({ message: 'Message sent.' });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Could not send message' });
  }
});

// ✅ Health check
app.get('/', (req, res) => {
  res.send('👋 Speech AI backend is live and ready!');
});

// ✅ Start server on port 5001 or from .env
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
