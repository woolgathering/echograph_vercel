const crypto = require('crypto');

const HOURS = 48;

const sign = (sessionId, exp) => crypto.createHmac('sha256', process.env.DOWNLOAD_SIGNING_SECRET).update(sessionId + '.' + exp).digest('hex');

// Expiry is anchored to the purchase time so re-requesting a link never extends it.
function signedToken(sessionId, createdSec) {
  const exp = createdSec + HOURS * 3600;
  return sessionId + '.' + exp + '.' + sign(sessionId, exp);
}

function valid(token) {
  const [sid, exp, sig] = String(token || '').split('.');
  if (!sid || !exp || !sig || Number(exp) < Date.now() / 1000) return false;
  const want = sign(sid, exp);
  return sig.length === want.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want));
}

module.exports = { HOURS, signedToken, valid };
