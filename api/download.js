const { valid } = require('./_lib/token');
const { listHiderAssets } = require('./_lib/assets');
const { sendBlob } = require('./_lib/blob');

module.exports = async (req, res) => {
  const url = new URL(req.url, 'https://' + req.headers.host);
  const token = url.searchParams.get('t');
  const wanted = url.searchParams.get('asset');
  if (!valid(token)) return res.status(403).send('This download link is invalid or has expired. Reply to your purchase email and we will send a new one.');
  // Old-style links without an asset land on the success page, which shows the buttons.
  if (!wanted) {
    res.writeHead(302, { Location: '/success.html?t=' + encodeURIComponent(token) });
    return res.end();
  }
  try {
    const a = (await listHiderAssets()).find((x) => x.name === wanted);
    if (!a) return res.status(404).send('Not found');
    return sendBlob(res, a.pathname, a.name, a.size);
  } catch (err) {
    console.error('download failed:', err.message);
    res.status(502).send('Download unavailable. Please email hello@echograph.studio.');
  }
};
