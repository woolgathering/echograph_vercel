const Stripe = require('stripe');
const { signedToken, valid } = require('./_lib/token');
const { listHiderAssets } = require('./_lib/assets');

// Returns the signed download buttons for the success page. The caller
// proves access with either a Checkout session_id (just paid) or a token (email link).
module.exports = async (req, res) => {
  const q = new URL(req.url, 'https://' + req.headers.host).searchParams;
  res.setHeader('Cache-Control', 'no-store');
  try {
    let token = q.get('t');
    if (token) {
      if (!valid(token)) return res.status(403).json({ error: 'expired' });
    } else {
      const sid = q.get('session_id');
      if (!/^cs_[A-Za-z0-9_]+$/.test(sid || '')) return res.status(400).json({ error: 'bad session' });
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const s = await stripe.checkout.sessions.retrieve(sid);
      if (s.payment_status !== 'paid' && s.payment_status !== 'no_payment_required') return res.status(402).json({ error: 'not paid' });
      token = signedToken(s.id, s.created);
    }
    const assets = (await listHiderAssets()).map((a) => ({
      name: a.name,
      mb: Number((a.size / 1048576).toFixed(1)),
      url: '/api/download?t=' + encodeURIComponent(token) + '&asset=' + encodeURIComponent(a.name),
    }));
    res.status(200).json({ assets });
  } catch (err) {
    console.error('session-link failed:', err.message);
    res.status(500).json({ error: 'unavailable' });
  }
};
