// pages/api/translate.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const { word, sourceLang, targetLang } = req.body;

     // Ensure that word, sourceLang, and targetLang are provided
  if (!word || !sourceLang || !targetLang) {
    return res.status(400).json({ error: 'Missing required fields: word, sourceLang, or targetLang' });
  }

  
    try {
      const response = await fetch('https://api-free.deepl.com/v2/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `DeepL-Auth-Key ${process.env.NEXT_PUBLIC_DEEPL_API_KEY}`
        },
        body: new URLSearchParams({
          text: word,
          source_lang: sourceLang.toUpperCase(),  // Use the dynamic source language
          target_lang: targetLang.toUpperCase()   // Use the dynamic target language
        })
      });
  
      if (!response.ok) {
        return res.status(response.status).json({ error: response.statusText });
      }
  
      const data = await response.json();
      return res.status(200).json({ translation: data.translations[0].text });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  