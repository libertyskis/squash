const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

app.post('/api/predict', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  console.log('API key present:', !!apiKey, '| Length:', apiKey ? apiKey.length : 0);
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set on server' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Squash tracker running on port ${PORT}`);
  console.log('ANTHROPIC_API_KEY present:', !!process.env.ANTHROPIC_API_KEY);
});
