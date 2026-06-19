require('dotenv').config();
const mongoose = require('mongoose');
const https    = require('https');
const http     = require('http');
const fs       = require('fs');
const path     = require('path');
const Product  = require('./models/Product');
const Category = require('./models/Category');

const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads', 'products');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Real Unsplash şəkilləri - furniture
const IMAGES = {
  sofa:       'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
  sofa2:      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80',
  bed:        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80',
  bed2:       'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80',
  dining:     'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
  dining2:    'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&q=80',
  chair:      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80',
  chair2:     'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80',
  wardrobe:   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  wardrobe2:  'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&q=80',
  bookshelf:  'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&q=80',
  desk:       'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
  desk2:      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80',
  diningset:  'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=800&q=80',
  diningset2: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  // Category images
  cat_living:  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
  cat_bedroom: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&q=80',
  cat_kitchen: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
  cat_office:  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80',
  cat_outdoor: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80',
  cat_kids:    'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400&q=80',
};

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const dest = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(dest)) { resolve('/uploads/products/' + filename); return; }
    const file = fs.createWriteStream(dest);
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close(); fs.unlinkSync(dest);
        return downloadImage(res.headers.location, filename).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve('/uploads/products/' + filename); });
    }).on('error', err => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function downloadAll() {
  console.log('📥 Şəkillər yüklənir...');
  const result = {};
  for (const [key, url] of Object.entries(IMAGES)) {
    try {
      process.stdout.write(`  ⬇ ${key}... `);
      result[key] = await downloadImage(url, key + '.jpg');
      console.log('✓');
    } catch (e) {
      result[key] = '';
      console.log('✗ (keçildi)');
    }
  }
  return result;
}

async function seed() {
  // BURA DƏYİŞDİ: Birbaşa şifrəli əsl linki bura qoyduq ki, başqa yerə qoşulmasın!
  const liveDB = 'mongodb+srv://hacacimi34_db_user:tFuhqsuEMXXWBti0@cluster0.16wbenj.mongodb.net/bellissa_mebel?retryWrites=true&w=majority&appName=Cluster0';
  
  console.log('🌐 Canlı bazaya qoşulmağa cəhd edilir...');
  await mongoose.connect(liveDB);
  console.log('✅ Canlı MongoDB-yə uğurla bağlandı\n');

  const imgs = await downloadAll();
  console.log('');

  // Mövcud datanı sil
  await Product.deleteMany({});
  await Category.deleteMany({});

  // Kateqoriyalar
  const cats = await Category.insertMany([
    { name: { az: 'Qonaq Otağı', en: 'Living Room' }, slug: 'living-room', icon: 'fa-couch',    image: imgs.cat_living  },
    { name: { az: 'Yataq Otağı', en: 'Bedroom' },     slug: 'bedroom',     icon: 'fa-bed',      image: imgs.cat_bedroom },
    { name: { az: 'Mətbəx',      en: 'Kitchen' },     slug: 'kitchen',     icon: 'fa-utensils', image: imgs.cat_kitchen },
    { name: { az: 'Ofis',        en: 'Office' },       slug: 'office',      icon: 'fa-laptop',   image: imgs.cat_office  },
    { name: { az: 'Açıq Hava',   en: 'Outdoor' },     slug: 'outdoor',     icon: 'fa-tree',     image: imgs.cat_outdoor },
    { name: { az: 'Uşaq Otağı',  en: 'Kids Room' },   slug: 'kids-room',   icon: 'fa-child',    image: imgs.cat_kids    },
  ]);
  console.log('✅ 6 kateqoriya əlavə edildi');

  // Məhsullar
  await Product.insertMany([
    {
      name: { az: 'Milano Divan', en: 'Milano Sofa' },
      description: { az: 'Lüks Milano divanı - rahat oturma yeri. Premium məxmər parça, möhkəm taxta çərçivə. Ailə toplanmaları üçün ideal seçim.', en: 'Luxury Milano sofa - comfortable seating. Premium velvet fabric, solid wood frame. Ideal for family gatherings.' },
      price: 1299, discountPrice: 999,
      category: { az: 'Qonaq Otağı', en: 'Living Room' },
      material: { az: 'Məxmər parça + palıd ağacı', en: 'Velvet fabric + oak wood' },
      dimensions: '220 x 95 x 80 sm',
      images: [imgs.sofa, imgs.sofa2], mainImage: imgs.sofa,
      featured: true, inStock: true, slug: 'milano-divan'
    },
    {
      name: { az: 'Royal Çarpayı', en: 'Royal Bed' },
      description: { az: 'Royal çarpayısı - krallıq yuxusu üçün. Möhkəm quruluş, estetik dizayn. 2 il zəmanət.', en: 'Royal bed - for a kingly sleep. Strong structure, aesthetic design. 2-year warranty.' },
      price: 1599, discountPrice: 1299,
      category: { az: 'Yataq Otağı', en: 'Bedroom' },
      material: { az: 'Palıd ağacı + parça', en: 'Oak wood + fabric' },
      dimensions: '200 x 180 x 120 sm',
      images: [imgs.bed, imgs.bed2], mainImage: imgs.bed,
      featured: true, inStock: true, slug: 'royal-carpayisi'
    },
    {
      name: { az: 'Monaco Yemək Stolu', en: 'Monaco Dining Table' },
      description: { az: 'Monaco yemək masası - müasir ailə üçün mükəmməl seçim. Möhkəm palıd, uzunömürlü.', en: 'Monaco dining table - perfect for the modern family. Solid oak, long-lasting.' },
      price: 799, discountPrice: null,
      category: { az: 'Mətbəx', en: 'Kitchen' },
      material: { az: 'Möhkəm palıd ağacı', en: 'Solid oak wood' },
      dimensions: '160 x 90 x 76 sm',
      images: [imgs.dining, imgs.dining2], mainImage: imgs.dining,
      featured: true, inStock: true, slug: 'monaco-stol'
    },
    {
      name: { az: 'Venezia Kreslo', en: 'Venezia Armchair' },
      description: { az: 'Venezia kreslosu - oxumaq və istirahət üçün ideal. Rahat, estetik.', en: 'Venezia armchair - ideal for reading and relaxation. Comfortable and stylish.' },
      price: 649, discountPrice: 499,
      category: { az: 'Qonaq Otağı', en: 'Living Room' },
      material: { az: 'İtalyan dərisi + ağac ayaq', en: 'Italian leather + wood legs' },
      dimensions: '85 x 80 x 95 sm',
      images: [imgs.chair, imgs.chair2], mainImage: imgs.chair,
      featured: false, inStock: true, slug: 'venezia-kreslo'
    },
    {
      name: { az: 'Barcelona Şkaf', en: 'Barcelona Wardrobe' },
      description: { az: 'Barcelona 3 qapılı şkaf - geniş saxlama yeri. Müasir sürüşən qapı dizaynı.', en: 'Barcelona 3-door wardrobe - spacious storage. Modern sliding door design.' },
      price: 1099, discountPrice: null,
      category: { az: 'Yataq Otağı', en: 'Bedroom' },
      material: { az: 'MDF + şüşə', en: 'MDF + glass' },
      dimensions: '180 x 60 x 220 sm',
      images: [imgs.wardrobe, imgs.wardrobe2], mainImage: imgs.wardrobe,
      featured: false, inStock: true, slug: 'barcelona-skaf'
    },
    {
      name: { az: 'Roma Kitabxana', en: 'Roma Bookshelf' },
      description: { az: 'Roma kitabxanası - 5 rəf, geniş saxlama. Kitablar, dekor əşyaları üçün ideal.', en: 'Roma bookshelf - 5 shelves, ample storage. Ideal for books and decorative items.' },
      price: 549, discountPrice: null,
      category: { az: 'Qonaq Otağı', en: 'Living Room' },
      material: { az: 'Palıd ağacı', en: 'Oak wood' },
      dimensions: '120 x 35 x 200 sm',
      images: [imgs.bookshelf], mainImage: imgs.bookshelf,
      featured: false, inStock: true, slug: 'roma-kitabxana'
    },
    {
      name: { az: 'Florens Ofis Stolu', en: 'Florens Office Desk' },
      description: { az: 'Florens ofis stolu - geniş iş səthi, kabel idarəetmə sistemi. Produktivlik üçün mükəmməl.', en: 'Florens office desk - wide work surface, cable management system. Perfect for productivity.' },
      price: 699, discountPrice: 599,
      category: { az: 'Ofis', en: 'Office' },
      material: { az: 'MDF + metal ayaq', en: 'MDF + metal legs' },
      dimensions: '160 x 75 x 75 sm',
      images: [imgs.desk, imgs.desk2], mainImage: imgs.desk,
      featured: true, inStock: true, slug: 'florens-ofis-stolu'
    },
    {
      name: { az: 'Torino Yemək Dəsti', en: 'Torino Dining Set' },
      description: { az: 'Torino 6 nəfərlik yemək dəsti - stol + 6 stul. Ailə toplanmaları üçün ideal seçim.', en: 'Torino 6-person dining set - table + 6 chairs. Ideal choice for family gatherings.' },
      price: 1899, discountPrice: 1599,
      category: { az: 'Mətbəx', en: 'Kitchen' },
      material: { az: 'Tam ağac + dəri oturacaq', en: 'Solid wood + leather seat' },
      dimensions: 'Stol: 180x90, Stul: 45x50 sm',
      images: [imgs.diningset, imgs.diningset2], mainImage: imgs.diningset,
      featured: true, inStock: true, slug: 'torino-yemek-desti'
    },
  ]);
  console.log('✅ 8 məhsul əlavə edildi');
  console.log('\n🎉 Seed tamamlandı!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error('❌', err.message); process.exit(1); });
