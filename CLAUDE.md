# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Marketing site for Echograph (audio consultancy), deployed on Vercel. The pages are static, hand-written HTML/CSS with inline styles and scripts. There is no build step, bundler, linter, or test suite. The only dependency is `stripe`, used by the serverless functions in `api/`.

- Preview: open `index.html` directly, or `npx serve .`. `/api/*` routes only work under `vercel dev` or on a Vercel deployment.
- Deploy: Vercel project with framework preset "Other"; the repo root is the output directory.
- Node is pinned to 20.x in `package.json`.

## Static pages

Top-level `*.html` files (`index`, `about`, `services`, `work`, `products`, `contact`, `success`) are standalone. There is no shared layout or partial, so nav, footer, and styles are duplicated per page. A site-wide change has to be made in each file. Also keep `sitemap.xml` in sync when adding or removing pages. `success.html` is `noindex` and is the Stripe post-checkout landing page.

Do not hand-edit these generated or vendored files:
- `support.js`: its header says it is generated from `dc-runtime/src/*.ts` (not in this repo).
- `image-slot.js`: a copied starter component for `<image-slot>`.
- `.image-slots.state.json`: about 250KB of base64 image data keyed by slot id (e.g. `work-poetica`), used by `image-slot`.

## Hider purchase flow (`api/`)

Hider is the paid product on `products.html`. Vercel functions in `api/` (CommonJS, `stripe` SDK default API version, Stripe Managed Payments). Shared helpers live in `api/_lib/` (underscore-prefixed, so not routed):

1. `create-checkout-session.js`: the Buy form POSTs here. Resolves the price from the product's `default_price` (module-cached), creates a `mode: 'payment'` Session with `managed_payments: { enabled: true }`, 303-redirects to Stripe. Returns to `/success.html?session_id=…`.
2. `success.html` fetches `session-link.js`, which retrieves the Session from Stripe, requires `payment_status === 'paid'`, and returns a signed `/api/download?t=…` link shown immediately.
3. `stripe-webhook.js`: on `checkout.session.completed` emails the same kind of link via Gmail SMTP (`_lib/mail.js`, nodemailer). Needs the raw body, so `config.api.bodyParser = false` must stay. Returns 500 on send failure so Stripe retries.
4. `download.js`: verifies the token, lists private Blob objects under `hider/`, and streams the chosen one (`_lib/blob.js`).
5. `get.js`: free Decoder downloads (`/api/get?f=<file>`), serves `free/` blobs without a token and logs `free-download <file>`; the only tracking.

Tokens (`_lib/token.js`) are `<session_id>.<exp>.<hmac>` with `exp = purchase time + 48h`, so refreshing the success page never extends a link.

Files live in one private Vercel Blob store (`echograph-hider`) under `hider/` (paid) and `free/`. Blob auth is Vercel OIDC + `BLOB_STORE_ID`, which exist only in Production/Preview, so local scripts must use `vercel env pull .env.production.local --environment=production`. Product files are uploaded manually; there is no upload script in the repo.

Env vars (Vercel): `STRIPE_SECRET_KEY`, `STRIPE_HIDER_PRODUCT_ID`, `STRIPE_WEBHOOK_SECRET`, `DOWNLOAD_SIGNING_SECRET`, `SMTP_USER`, `SMTP_PASS` (Google app password), `EMAIL_FROM`, `BLOB_STORE_ID`. Webhook endpoint: `/api/stripe-webhook`.
