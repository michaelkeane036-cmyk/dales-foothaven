require('dotenv').config();

const path = require('path');
const express = require('express');
const { createCheckoutSession, getSiteUrl } = require('./lib/checkout');

const app = express();
const PORT = process.env.PORT || 4242;

function sendProjectFile(file) {
  return (req, res) => res.sendFile(path.join(__dirname, file));
}

app.use(express.json());

app.get('/', sendProjectFile('index.html'));
app.get('/index.html', sendProjectFile('index.html'));
app.get('/style.css', sendProjectFile('style.css'));
app.get('/script.js', sendProjectFile('script.js'));
app.get('/success.html', sendProjectFile('success.html'));

app.get(['/SLYMFIT', '/SLYMFIT/', '/SLYMFIT/index.html', '/SLYMFIT/INDEX.HTML'], (req, res) => {
  res.redirect('/index.html');
});

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const session = await createCheckoutSession(req.body, req.ip);
    res.json({ url: session.url });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      error: error.message || 'Unable to start checkout.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`SLYMFIT store running at ${getSiteUrl()}`);
});
