const Stripe = require('stripe');
const crypto = require('crypto');

const DAYS = 7;

function readRaw(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function signedToken(sessionId) {
  const exp = Math.floor(Date.now() / 1000) + DAYS * 86400;
  const sig = crypto.createHmac('sha256', process.env.DOWNLOAD_SIGNING_SECRET).update(sessionId + '.' + exp).digest('hex');
  return sessionId + '.' + exp + '.' + sig;
}

async function sendDownloadEmail(to, link, sessionId) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
      'Content-Type': 'application/json',
      'Idempotency-Key': 'hider-' + sessionId,
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Your Hider download',
      text: 'Thank you for buying Hider.\n\nDownload it here (link valid for ' + DAYS + ' days):\n' + link + '\n\nIf the link expires or anything goes wrong, reply to this email.\n\n— Echograph',
    }),
  });
  if (!r.ok) throw new Error('Resend ' + r.status + ': ' + (await r.text()));
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.preview' });
  let event;
  try {
    const raw = await readRaw(req);
    event = stripe.webhooks.constructEvent(raw, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send('Invalid signature');
  }
  if (event.type === 'checkout.session.completed') {
    const s = event.data.object;
    if (s.payment_status === 'paid' && s.customer_details && s.customer_details.email) {
      try {
        const link = 'https://' + req.headers.host + '/api/download?t=' + signedToken(s.id);
        await sendDownloadEmail(s.customer_details.email, link, s.id);
      } catch (err) {
        console.error('delivery failed for', s.id, err.message);
        return res.status(500).send('delivery failed');
      }
    }
  }
  res.status(200).json({ received: true });
};

module.exports.config = { api: { bodyParser: false } };
