const { list } = require('@vercel/blob');

const PREFIX = 'hider/';

async function listHiderAssets() {
  const { blobs } = await list({ prefix: PREFIX });
  return blobs.map((b) => ({ name: b.pathname.slice(PREFIX.length), pathname: b.pathname, size: b.size }));
}

module.exports = { listHiderAssets };
