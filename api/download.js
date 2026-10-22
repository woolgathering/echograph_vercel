const crypto = require('crypto');

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function valid(token) {
  const [sid, exp, sig] = String(token || '').split('.');
  if (!sid || !exp || !sig || Number(exp) < Date.now() / 1000) return false;
  const want = crypto.createHmac('sha256', process.env.DOWNLOAD_SIGNING_SECRET).update(sid + '.' + exp).digest('hex');
  return sig.length === want.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want));
}

const gh = (url, accept) => fetch(url, {
  redirect: 'manual',
  headers: { Authorization: 'Bearer ' + process.env.GITHUB_TOKEN, Accept: accept, 'User-Agent': 'echograph-site' },
});

module.exports = async (req, res) => {
  const url = new URL(req.url, 'https://' + req.headers.host);
  const token = url.searchParams.get('t');
  if (!valid(token)) return res.status(403).send('This download link is invalid or has expired. Reply to your purchase email and we will send a new one.');
  try {
    const rel = await gh('https://api.github.com/repos/' + process.env.GITHUB_REPO + '/releases/tags/' + process.env.HIDER_RELEASE_TAG, 'application/vnd.github+json');
    const release = await rel.json();
    const assets = release.assets || [];
    const wanted = url.searchParams.get('asset');
    if (wanted) {
      const a = assets.find((x) => x.name === wanted);
      if (!a) return res.status(404).send('Not found');
      const r = await gh(a.url, 'application/octet-stream');
      const loc = r.headers.get('location');
      if (!loc) return res.status(502).send('Download unavailable');
      res.writeHead(302, { Location: loc });
      return res.end();
    }
    const items = assets.map((a) => '<li><a href="?t=' + esc(token) + '&asset=' + encodeURIComponent(a.name) + '">' + esc(a.name) + '</a> <span>' + (a.size / 1048576).toFixed(1) + ' MB</span></li>').join('');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send('<!DOCTYPE html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Download Hider | Echograph</title><body style="margin:0;background:#fbf9f5;color:#2a2623;font-family:system-ui,sans-serif"><div style="max-width:560px;margin:15vh auto;padding:0 24px"><h1 style="font-family:Georgia,serif;font-weight:400">Download Hider</h1><ul style="line-height:2;padding-left:20px">' + items + '</ul></div>');
  } catch (err) {
    console.error('download failed:', err.message);
    res.status(502).send('Download unavailable. Please email hello@echograph.studio.');
  }
};
