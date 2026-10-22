const Stripe = require('stripe');
const { signedToken } = require('./_lib/token');

module.exports = async (req, res) => {
  const sid = new URL(req.url, 'https://' + req.headers.host).searchParams.get('session_id');
  if (!/^cs_[A-Za-z0-9_]+$/.test(sid || '')) return res.status(400).json({ error: 'bad session' });
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const s = await stripe.checkout.sessions.retrieve(sid);
    if (s.payment_status !== 'paid') return res.status(402).json({ error: 'not paid' });
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ url: '/api/download?t=' + signedToken(s.id, s.created) });
  } catch (err) {
    console.error('session-link failed:', err.message);
    res.status(500).json({ error: 'unavailable' });
  }
};
