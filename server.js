const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRIOe0CpFTTxwnZrxIU5p6fCNu9xon-98q1nDM0FimHnQa3l4DXofE3DCW2RMto7bOLOW69ZowIBXFl/pub?output=csv';

app.get('/api/sheet', async (req, res) => {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) {
      return res.status(response.status).json({ error: `Google Sheets returned HTTP ${response.status}` });
    }
    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Cache-Control', 'no-store');
    res.send(await response.text());
  } catch (err) {
    res.status(502).json({ error: `Could not load Google Sheet: ${err.message}` });
  }
});

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
