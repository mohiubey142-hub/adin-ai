// api/chat.js - Vercel Serverless Function for AI Chat
// ✅ Yeh file browser ko AI keys nahi dikhayegi

export default async function handler(req, res) {
  // ✅ Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, webEnabled, userId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages are required' });
    }

    // ✅ Get AI provider from environment variables
    const provider = process.env.AI_PROVIDER || 'groq';
    
    let apiKey, apiUrl, response;

    if (provider === 'openrouter') {
      // ✅ OpenRouter API Call
      const apiKeys = [
        process.env.OPENROUTER_API_KEY_1,
        process.env.OPENROUTER_API_KEY_2,
        process.env.OPENROUTER_API_KEY_3
      ].filter(Boolean);

      if (apiKeys.length === 0) {
        return res.status(500).json({ error: 'No OpenRouter API keys configured' });
      }

      let lastError = null;
      for (const key of apiKeys) {
        try {
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${key}`,
              'HTTP-Referer': process.env.VERCEL_URL || 'https://adin-ai.com',
              'X-Title': 'Adin AI'
            },
            body: JSON.stringify({
              model: 'openai/gpt-4o-mini',
              messages: messages,
              temperature: 0.7,
              max_tokens: 2048,
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenRouter API Error:', errorData);
            lastError = errorData;
            continue;
          }

          const data = await response.json();
          return res.status(200).json(data);

        } catch (err) {
          console.error('OpenRouter API request failed:', err);
          lastError = err;
          continue;
        }
      }

      return res.status(500).json({ 
        error: 'All OpenRouter API keys failed', 
        details: lastError?.message || 'Unknown error'
      });

    } else {
      // ✅ Groq API Call (Default)
      const apiKeys = [
        process.env.GROQ_API_KEY_1,
        process.env.GROQ_API_KEY_2,
        process.env.GROQ_API_KEY_3
      ].filter(Boolean);

      if (apiKeys.length === 0) {
        return res.status(500).json({ error: 'No Groq API keys configured' });
      }

      let lastError = null;
      for (const key of apiKeys) {
        try {
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify({
              model: 'mixtral-8x7b-32768',
              messages: messages,
              temperature: 0.7,
              max_tokens: 2048,
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Groq API Error:', errorData);
            lastError = errorData;
            continue;
          }

          const data = await response.json();
          return res.status(200).json(data);

        } catch (err) {
          console.error('Groq API request failed:', err);
          lastError = err;
          continue;
        }
      }

      return res.status(500).json({ 
        error: 'All Groq API keys failed', 
        details: lastError?.message || 'Unknown error'
      });
    }

  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}