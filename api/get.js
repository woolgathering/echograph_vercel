const { list } = require('@vercel/blob');
const { sendBlob } = require('./_lib/blob');

// Free downloads. The log line is the only tracking: count hits in Vercel's log view.
module.exports = async (req, res) => {
  const f = new URL(req.url, 'https://' + req.headers.host).searchParams.get('f');
  try {
    const { blobs } = await list({ prefix: 'free/' });
    const b = blobs.find((x) => x.pathname === 'free/' + f);
    if (!b) return res.status(404).send('Not found');
    console.log('free-download', f);
    return sendBlob(res, b.pathname, f, b.size);
  } catch (err) {
    console.error('get failed:', err.message);
    res.status(502).send('Download unavailable. Please email hello@echograph.studio.');
  }
};
