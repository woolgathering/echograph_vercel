const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function downloadEmail(link, hours) {
  const text = 'Thank you for buying Hider.\n\nDownload it here (link valid for ' + hours + ' hours from purchase):\n' + link + '\n\nIf the link expires or anything goes wrong, reply to this email.';
  const serif = "'Source Serif 4', Georgia, 'Times New Roman', serif";
  const sans = "'IBM Plex Sans', -apple-system, 'Helvetica Neue', Arial, sans-serif";
  const mono = "'IBM Plex Mono', 'SFMono-Regular', Menlo, Consolas, monospace";
  const html = '<!DOCTYPE html><html><body style="margin:0;padding:0;background:#fbf9f5;">'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbf9f5;"><tr><td align="center" style="padding:56px 24px;">'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">'
    + '<tr><td style="font-family:' + mono + ';font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#a8593c;padding-bottom:20px;">Echograph</td></tr>'
    + '<tr><td style="font-family:' + serif + ';font-weight:400;font-size:32px;line-height:1.25;color:#2a2623;padding-bottom:18px;">Thank you.</td></tr>'
    + '<tr><td style="font-family:' + sans + ';font-size:16px;line-height:1.7;color:#4d4640;padding-bottom:28px;">Your copy of Hider is ready to download. The link below is valid for ' + hours + ' hours from purchase.</td></tr>'
    + '<tr><td style="padding-bottom:32px;"><a href="' + esc(link) + '" style="display:inline-block;padding:12px 22px;background:#a8593c;color:#ffffff;font-family:' + sans + ';font-size:15px;text-decoration:none;border-radius:2px;">Download Hider</a></td></tr>'
    + '<tr><td style="font-family:' + sans + ';font-size:14px;line-height:1.7;color:#6e665e;border-top:1px solid #e6e0d6;padding-top:20px;">If the link expires or anything goes wrong, just reply to this email.</td></tr>'
    + '</table></td></tr></table></body></html>';
  return { text, html };
}

module.exports = { downloadEmail };
