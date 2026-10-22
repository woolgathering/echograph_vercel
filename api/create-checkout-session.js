const Stripe = require('stripe');

let cachedPrice;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    if (!cachedPrice) {
      const product = await stripe.products.retrieve(process.env.STRIPE_HIDER_PRODUCT_ID);
      cachedPrice = typeof product.default_price === 'string' ? product.default_price : product.default_price.id;
    }
    const base = 'https://' + req.headers.host;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: cachedPrice, quantity: 1 }],
      integration_identifier: 'echograph-hider-kqzvmtxa',
      managed_payments: { enabled: true },
      success_url: base + '/success.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: base + '/products.html',
    });
    res.writeHead(303, { Location: session.url });
    res.end();
  } catch (err) {
    console.error('create-checkout-session failed:', err.message);
    res.status(500).send('Checkout is temporarily unavailable. Please try again or email hello@echograph.studio.');
  }
};
