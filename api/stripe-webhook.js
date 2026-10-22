const Stripe = require('stripe');
const { signedToken, HOURS } = require('./_lib/token');
const { sendMail } = require('./_lib/mail');

function readRaw(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

const sendDownloadEmail = (to, link) => sendMail(
  to,
  'Your Hider download',
  'Thank you for buying Hider.\n\nDownload it here (link valid for ' + HOURS + ' hours from purchase):\n' + link + '\n\nIf the link expires or anything goes wrong, reply to this email.\n\n— Echograph'
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
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
        const link = 'https://' + req.headers.host + '/api/download?t=' + signedToken(s.id, s.created);
        await sendDownloadEmail(s.customer_details.email, link);
      } catch (err) {
        console.error('delivery failed for', s.id, err.message);
        return res.status(500).send('delivery failed');
      }
    }
  }
  res.status(200).json({ received: true });
};

module.exports.config = { api: { bodyParser: false } };
