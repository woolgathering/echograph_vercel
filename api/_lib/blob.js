const { Readable } = require('stream');
const { get } = require('@vercel/blob');

async function sendBlob(res, pathname, name, size) {
  const r = await get(pathname, { access: 'private' });
  if (!r || r.statusCode !== 200) return res.status(502).send('Download unavailable');
  // PDFs open in the browser tab; everything else downloads.
  const pdf = /\.pdf$/i.test(name);
  res.setHeader('Content-Type', pdf ? 'application/pdf' : 'application/octet-stream');
  res.setHeader('Content-Disposition', (pdf ? 'inline' : 'attachment') + '; filename="' + encodeURIComponent(name) + '"');
  if (size) res.setHeader('Content-Length', size);
  Readable.fromWeb(r.stream).pipe(res);
}

module.exports = { sendBlob };
