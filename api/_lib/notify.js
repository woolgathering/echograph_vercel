const { sendMail } = require('./mail');

const NOTIFY_TO = process.env.NOTIFY_TO || 'hello@echograph.studio';

// Name of the promotion code the buyer used, or '' if none.
async function discountCode(stripe, sessionId) {
  const s = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['total_details.breakdown'] });
  const d = s.total_details && s.total_details.breakdown && s.total_details.breakdown.discounts[0];
  const promo = d && d.discount && d.discount.promotion_code;
  if (!promo) return '';
  return typeof promo === 'string' ? (await stripe.promotionCodes.retrieve(promo)).code : promo.code;
}

// Both steps are best-effort: the buyer already has their download, so a failure here
// must not make the webhook return 500 and trigger a duplicate customer email.
async function recordPurchase(stripe, s) {
  let code = '';
  try { code = await discountCode(stripe, s.id); } catch (err) { console.error('discount lookup failed:', err.message); }
  const row = {
    date: new Date(s.created * 1000).toISOString(),
    email: (s.customer_details && s.customer_details.email) || '',
    amount: (s.amount_total / 100).toFixed(2),
    code,
    session: s.id,
  };
  try {
    await sendMail(
      NOTIFY_TO,
      'Hider sale: $' + row.amount + (code ? ' (' + code + ')' : ''),
      'Email: ' + row.email + '\nAmount: $' + row.amount + '\nCode: ' + (code || 'none') + '\nSession: ' + row.session
    );
  } catch (err) { console.error('sale notification failed:', err.message); }
  if (process.env.SHEET_WEBHOOK_URL) {
    try {
      const r = await fetch(process.env.SHEET_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: process.env.SHEET_WEBHOOK_TOKEN, ...row }),
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
    } catch (err) { console.error('sheet log failed:', err.message); }
  }
}

module.exports = { recordPurchase };
