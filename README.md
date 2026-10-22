# Echograph Website

Static site for Echograph audio consultancy. Plain HTML/CSS/JS — no build step, no framework.

## Structure

- `index.html` — Home
- `about.html` — About
- `services.html` — Services
- `work.html` — Work
- `products.html` — Products (Hider plugin)
- `contact.html` — Contact
- `assets/` — images and favicon (compressed for web)

Every page is plain, dependency-free HTML/CSS — no JS runtime required to render content.

## Local preview

Open `index.html` directly in a browser, or serve the folder:

```
npx serve .
```

## Deploying to Vercel

1. Push this folder to a GitHub repo.
2. In Vercel, "Add New Project" → import the repo.
3. Framework preset: **Other** (static). No build command, output directory is the repo root.
4. Deploy.

## Hider checkout (Stripe Managed Payments)

Serverless functions in `api/` (Vercel). See `CLAUDE.md` for the flow and env vars. Installers live in a private Vercel Blob store; the paid download link is valid 48h from purchase.

## TODO before launch

- Add real images to the Work page entries.
- Wire up a booking calendar (Calendly/Cal.com) to replace placeholder links in Contact/Services/Work.
- Copy pass on About (grammar fixes flagged).
