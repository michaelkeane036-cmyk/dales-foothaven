const Stripe = require('stripe');

const catalog = {
  1: { name: 'PHANTOM STEP', amount: 8900 },
  2: { name: 'URBAN CLOUD', amount: 8900 },
  3: { name: 'NEON STRIKER', amount: 8900 },
  4: { name: 'SHADOW RUN', amount: 11000 },
  5: { name: 'BOLT FORCE', amount: 9900 },
  6: { name: 'DRIFT LOW', amount: 7900 },
  7: { name: 'APEX FORCE', amount: 11900 },
  m1: { name: 'SHADOW RUN', amount: 11000 },
  m2: { name: 'APEX FORCE', amount: 11900 },
  m3: { name: 'COURT LOW', amount: 9500 },
  m4: { name: 'METRO SANDAL', amount: 8800 },
  m5: { name: 'URBAN LEATHER', amount: 10200 },
  w1: { name: 'URBAN CLOUD', amount: 8900 },
  w2: { name: 'BOLT FORCE', amount: 9900 },
  w3: { name: 'VELVET HEEL', amount: 11800 },
  w4: { name: 'MUSE PUMP', amount: 9200 },
  w5: { name: 'AURA SANDAL', amount: 8400 },
  k1: { name: 'MINI SPRINT', amount: 6900 },
  k2: { name: 'JUNIOR BOLT', amount: 7400 },
  k3: { name: 'PLAYGROUND LOW', amount: 5900 },
  k4: { name: 'LITTLE TREK', amount: 6400 },
  k5: { name: 'RECESS SLIDE', amount: 5200 },
  b1: { name: 'TINY CLOUD', amount: 4500 },
  b2: { name: 'BABY DRIFT', amount: 4900 },
  b3: { name: 'FIRST STEPS', amount: 4200 },
  b4: { name: 'CRIB RUNNER', amount: 3900 },
  b5: { name: 'SOFT SOLE SANDAL', amount: 3600 }
};

function httpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function getSiteUrl() {
  const port = process.env.PORT || 4242;

  if (process.env.SITE_URL) {
    return process.env.SITE_URL.replace(/\/$/, '');
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return `http://localhost:${port}`;
}

async function verifyTurnstile(token, ip) {
  if (!process.env.TURNSTILE_SECRET_KEY) {
    throw httpError('TURNSTILE_SECRET_KEY is not configured.', 500);
  }

  const form = new URLSearchParams();
  form.append('secret', process.env.TURNSTILE_SECRET_KEY);
  form.append('response', token || '');
  if (ip) form.append('remoteip', ip);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form
  });
  const result = await response.json();
  return result.success === true;
}

function buildLineItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw httpError('Your cart is empty.', 400);
  }

  return items.map(item => {
    const product = catalog[item.id];
    const quantity = Number.parseInt(item.qty, 10);

    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw httpError('Your cart contains an invalid item.', 400);
    }

    return {
      quantity,
      price_data: {
        currency: 'usd',
        unit_amount: product.amount,
        product_data: { name: product.name }
      }
    };
  });
}

async function createCheckoutSession(payload, ip) {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw httpError('STRIPE_SECRET_KEY is not configured.', 500);
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const human = await verifyTurnstile(payload.turnstileToken, ip);

  if (!human) {
    throw httpError('Security check failed. Please try again.', 403);
  }

  return stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: buildLineItems(payload.items),
    success_url: `${getSiteUrl()}/success.html`,
    cancel_url: `${getSiteUrl()}/index.html`
  });
}

module.exports = {
  buildLineItems,
  catalog,
  createCheckoutSession,
  getSiteUrl,
  verifyTurnstile
};
