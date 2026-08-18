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
- `support.js` — shared site script

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

## TODO before launch

- Add real images to the Work page entries.
- Wire up a booking calendar (Calendly/Cal.com) to replace placeholder links in Contact/Services/Work.
- Once Hider ships: add the real checkout link (Gumroad/Lemon Squeezy) and swap the "in final testing" section on Products for the purchase button.
- Copy pass on About (grammar fixes flagged).
