const express = require('express');
const router = express.Router();

// Placeholder route for transcription
router.post('/transcribe', (req, res) => {
  res.json({ message: 'AssemblyAI route placeholder working!' });
});

module.exports = router;
