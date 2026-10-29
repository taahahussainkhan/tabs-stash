// Serves the ./releases folder over your LAN so you can download the APK
// from your phone's browser (same Wi-Fi). No cable, no extra apps.
// Usage:  node scripts/serve-share.js  [port]
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PORT = Number(process.argv[2] || 8788);
const RELEASES = path.resolve(__dirname, '..', 'releases');

function lanIPs() {
  const out = [];
  for (const [name, addrs] of Object.entries(os.networkInterfaces())) {
    for (const a of addrs || []) {
      if (a.family === 'IPv4' && !a.internal) out.push({ name, address: a.address });
    }
  }
  return out;
}

function apkFiles() {
  if (!fs.existsSync(RELEASES)) return [];
  return fs.readdirSync(RELEASES).filter(f => f.toLowerCase().endsWith('.apk'));
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);

  if (urlPath === '/' || urlPath === '/index.html') {
    const files = apkFiles();
    const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:system-ui;background:#0f1117;color:#e7e9ef;padding:24px}
a{display:block;background:#7c5cff;color:#fff;text-decoration:none;padding:16px;border-radius:12px;margin:10px 0;font-weight:700}
h1{font-size:20px}</style></head><body>
<h1>MediaLog &mdash; tap to download</h1>
${files.map(f => `<a href="/${encodeURIComponent(f)}" download>${f}</a>`).join('\n') || '<p>No APK found in releases/.</p>'}
</body></html>`;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  const file = path.basename(urlPath); // prevent path traversal
  const full = path.join(RELEASES, file);
  if (!fs.existsSync(full)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  const mime = file.toLowerCase().endsWith('.apk')
    ? 'application/vnd.android.package-archive'
    : 'application/octet-stream';
  const stat = fs.statSync(full);
  res.writeHead(200, {
    'Content-Type': mime,
    'Content-Length': stat.size,
    'Content-Disposition': `attachment; filename="${file}"`,
  });
  fs.createReadStream(full).pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
  const ips = lanIPs();
  console.log(`\n📶 MediaLog share server running on port ${PORT}`);
  console.log(`   Serving: ${RELEASES}`);
  console.log(`   APKs:    ${apkFiles().join(', ') || '(none)'}`);
  console.log('\n   Open ONE of these in your phone browser (phone must be on the SAME Wi-Fi):');
  for (const ip of ips) {
    console.log(`     →  http://${ip.address}:${PORT}`);
  }
  console.log('\n   Press Ctrl+C to stop.\n');
});
