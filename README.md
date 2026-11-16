# CHEGOLAND Agri-Empire LTD Dairy Farm and Shop

Full-stack dairy farm storefront and farm operations dashboard built for Kenya using React, TypeScript, Vite, Tailwind CSS, Express, JSON file persistence, and the Gemini API (`@google/genai`).

## Features

- **Public Storefront**: Pasture-to-table Home page, searchable & filterable Farm Shop (`Milk`, `Fermented`, `Cultured & Fats`, `Eggs`), stock-guarded Cart & Checkout, Order Confirmation, Live Order Tracker (`/track`), About Us, and Contact form.
- **Bilingual Toggle (EN / SW)**: Instant English and Kiswahili switching across navigation, hero, shop, cart, checkout, and the AI assistant.
- **M-Pesa STK Push Simulation + Cash on Delivery**: Realistic checkout flow with Kenyan phone number validation (`07...`, `01...`, `+254...`), waiting screen, and failure recovery.
- **Admin Dashboard (`/admin`)**: Password-protected console with:
  - **Overview**: Today's milk collected (L), today's sales (KES), pending orders, 30-day Production vs Sales chart, and **Gemini AI Farm Insights**.
  - **Cows**: Add, edit, and delete herd profiles.
  - **Milk Records**: Log morning & evening yield per cow with history filtering.
  - **Products**: Add, edit, delete, and live-adjust stock and KES prices.
  - **Orders**: Filter by status, update fulfillment stage, and print formatted **Delivery Notes**.
  - **Messages**: Read and manage customer inquiries.
- **Ask Chegoland AI Assistant**: Floating chat widget grounded in live product stock, prices in KES, nutrition notes, and Kaplong, Sotik, Bomet, Kericho & Nairobi delivery details.

---

## Local Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Copy `.env.example` to `.env` and fill in your secrets:
   ```bash
   cp .env.example .env
   ```

3. **Start the full-stack development server** (Express API + Vite HMR/middleware on port `3000`):
   ```bash
   npm run dev
   ```
   On first startup, the server automatically seeds `data/chegoland-db.json` with sample products, cows, 30 days of milk records, orders, and contact messages.

---

## Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | HTTP port for Express & Vite server | `3000` |
| `GEMINI_API_KEY` | Server-side Google Gemini API key for Ask Chegoland & Farm Insights | Required for AI features |
| `ADMIN_PASSWORD` | Password required to sign into `/admin` | `chegoland2026` |
| `APP_URL` | Public base URL of the deployed app | — |
| `MPESA_ENV` | `sandbox` or `production` for Daraja API | `sandbox` |
| `MPESA_CONSUMER_KEY` | Safaricom Daraja Consumer Key | — |
| `MPESA_CONSUMER_SECRET` | Safaricom Daraja Consumer Secret | — |
| `MPESA_SHORTCODE` | Safaricom Paybill / Till Shortcode | `174379` |
| `MPESA_PASSKEY` | Safaricom Lipa na M-Pesa Online Passkey | — |
| `MPESA_CALLBACK_URL` | Public HTTPS callback URL (`https://<domain>/api/payments/mpesa/callback`) | — |

---

## Swapping in Live Safaricom M-Pesa Daraja API

The payment service is isolated in `server/mpesa.ts` with clean contracts:

1. **Generate Daraja OAuth Token**: Add a helper in `server/mpesa.ts` calling:
   `GET https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials`
   with Basic Auth `base64(MPESA_CONSUMER_KEY:MPESA_CONSUMER_SECRET)`.
2. **Replace `initiateStkPush()`**:
   POST to `/mpesa/stkpush/v1/processrequest` with:
   - `BusinessShortCode`: `process.env.MPESA_SHORTCODE`
   - `Password`: `base64(Shortcode + Passkey + Timestamp)`
   - `TransactionType`: `"CustomerPayBillOnline"`
   - `Amount`: `req.amountKes`
   - `PartyA` / `PhoneNumber`: `normalizeKenyanMsisdn(req.phone)` (`2547...`)
   - `CallBackURL`: `process.env.MPESA_CALLBACK_URL`
   - `AccountReference`: `req.orderNumber`
3. **Add Callback Webhook**:
   Add `POST /api/payments/mpesa/callback` in `server.ts` to read `Body.stkCallback.ResultCode` (`0` = success, extract `MpesaReceiptNumber` from `CallbackMetadata.Item`), mark the matching order `paymentStatus = 'Paid'`, and persist via `saveDatabase()`. If `ResultCode !== 0`, mark `Failed` and restore stock.

---

## Production Build & Deployment

1. **Type-check & build the frontend bundle**:
   ```bash
   npm run lint
   npm run build
   ```
2. **Start in production mode**:
   ```bash
   NODE_ENV=production npm start
   ```
   `server.ts` serves the compiled `dist/` bundle alongside `/api/*` endpoints on port `3000` (or `process.env.PORT`). Ensure `data/` is mounted on a persistent volume if deploying to containers (e.g., Cloud Run with Cloud Storage fuse, Fly.io volume, or Railway/Render persistent disk).
