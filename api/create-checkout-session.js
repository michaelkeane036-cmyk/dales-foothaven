const { createCheckoutSession } = require('../lib/checkout');

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.trim()) return JSON.parse(req.body);

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return value ? value.split(',')[0].trim() : req.socket?.remoteAddress;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const body = await readJsonBody(req);
    const session = await createCheckoutSession(body, getClientIp(req));
    return res.status(200).json({ url: session.url });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      error: error.message || 'Unable to start checkout.'
    });
  }
};
