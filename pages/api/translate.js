// pages/api/translate.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const { word } = req.body;
  
    try {
      const response = await fetch('https://api-free.deepl.com/v2/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `DeepL-Auth-Key ${process.env.NEXT_PUBLIC_DEEPL_API_KEY}`
        },
        body: new URLSearchParams({
          text: word,
          source_lang: 'EN',
          target_lang: 'ES'
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
  