# SLYMFIT Store

Static storefront with a small checkout API for Stripe Checkout and Cloudflare Turnstile verification.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` from `.env.example` and add real keys.

3. Start the local server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:4242`.

## Vercel Import

Import this repository from GitHub into Vercel. Use the default project settings.

Add these environment variables in Vercel before testing checkout:

- `STRIPE_SECRET_KEY`
- `TURNSTILE_SECRET_KEY`
- `SITE_URL`

Set `SITE_URL` to the final production URL, for example `https://your-domain.com`.

The frontend files are served as static files and the checkout endpoint runs at:

```text
/api/create-checkout-session
```
