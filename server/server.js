const express = require('express');
const fetch = require('node-fetch');
const { htmlToText } = require('html-to-text');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure API key is set
if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables');
  process.exit(1);
}

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Allow configurable CORS origin
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));

// Helper function to validate URLs
const isValidUrl = (urlString) => {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

// Summarization endpoint
app.post('/api/summarize', async (req, res) => {
  try {
    const { url } = req.body;
    
    // Validate input
    if (!url || !isValidUrl(url)) {
      return res.status(400).json({ error: 'Please provide a valid URL' });
    }

    // Fetch and parse content
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch article');
    
    const html = await response.text();
    const text = htmlToText(html, {
      wordwrap: false,
      selectors: [
        { selector: 'img', format: 'skip' },
        { selector: 'a', options: { ignoreHref: true } }
      ]
    });

    // Generate summary prompt
    const prompt = `Provide a concise 150-200 word summary of this news article focusing on key points, context, and implications. Use neutral tone and simple language. Only include the summary:\n\n${text}`;

    // Call Gemini API
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!geminiResponse.ok) {
      const error = await geminiResponse.json();
      throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
    }

    const geminiData = await geminiResponse.json();
    const summary = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No summary generated';

    res.json({ summary });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: error.message.replace('Gemini API error: ', '') 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 