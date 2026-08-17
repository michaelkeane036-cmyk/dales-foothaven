# Dale's Foothaven Store

Dale's Foothaven is a static storefront for handmade custom slides, couple pairs, and baby sandals. Product pricing is in Nigerian naira and checkout currently opens a prepared WhatsApp order inquiry for `+2349028525881`.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the local server:

   ```bash
   npm run dev
   ```

3. Open `http://localhost:4242`.

## Ordering Flow

Customers add products to the cart and use **Send Order Via WhatsApp**. The message includes item names, quantities, and the naira subtotal so Dale's Foothaven can confirm sizes, availability, and delivery details.

Paystack payment integration is intentionally left for a separate pass.
