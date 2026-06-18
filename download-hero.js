const https = require('https');
const fs    = require('fs');
const path  = require('path');

const dir = path.join(__dirname, 'public', 'img');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const images = [
  { name: 'hero1.jpg', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=85' },
  { name: 'hero2.jpg', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&q=85' },
  { name: 'hero3.jpg', url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&q=85' },
  { name: 'hero4.jpg', url: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1600&q=85' },
  { name: 'hero5.jpg', url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600&q=85' },
];

function download(url, filename) {
  return new Promise((resolve, reject) => {
    const dest = path.join(dir, filename);
    if (fs.existsSync(dest)) { console.log(`  ✓ ${filename} (mövcuddur)`); resolve(); return; }
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close(); fs.unlinkSync(dest);
        return download(res.headers.location, filename).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); console.log(`  ✓ ${filename}`); resolve(); });
    }).on('error', err => { fs.unlink(dest, () => {}); reject(err); });
  });
}

(async () => {
  console.log('📥 Hero şəkilləri yüklənir...');
  for (const img of images) {
    process.stdout.write(`  ⬇ ${img.name}... `);
    await download(img.url, img.name);
  }
  console.log('✅ Hazır!');
})();
