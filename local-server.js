const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 4242;

function sendProjectFile(file) {
  return (_req, res) => res.sendFile(path.join(__dirname, file));
}

function getSiteUrl() {
  return process.env.SITE_URL || `http://localhost:${PORT}`;
}

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/', sendProjectFile('index.html'));
app.get('/index.html', sendProjectFile('index.html'));
app.get('/style.css', sendProjectFile('style.css'));
app.get('/script.js', sendProjectFile('script.js'));
app.get('/success.html', sendProjectFile('success.html'));

app.listen(PORT, () => {
  console.log(`Dale's Foothaven store running at ${getSiteUrl()}`);
});
