const express = require('express');
const router  = express.Router();
const Product  = require('../models/Product');
const Order    = require('../models/Order');
const Category = require('../models/Category');
const { isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs   = require('fs');
const path = require('path');

// LOGIN
router.get('/login', (req, res) => {
  if (req.session.isAdmin) return res.redirect('/admin');
  res.render('admin/login', { error: req.flash('error') });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (email === (process.env.ADMIN_EMAIL || 'admin@mebelevi.az') &&
      password === (process.env.ADMIN_PASSWORD || 'admin123')) {
    req.session.isAdmin = true;
    return res.redirect('/admin');
  }
  req.flash('error', 'Email və ya şifrə yanlışdır');
  res.redirect('/admin/login');
});

router.get('/logout', (req, res) => {
  req.session.isAdmin = false;
  res.redirect('/admin/login');
});

// DASHBOARD
router.get('/', isAdmin, async (req, res) => {
  const [totalProducts, totalOrders, revenueResult, allOrders] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    Order.find().sort({ createdAt: -1 }).limit(10)
  ]);
  const newOrders    = await Order.countDocuments({ orderStatus: 'new' });
  const totalRevenue = revenueResult[0]?.total || 0;
  res.render('admin/dashboard', { totalProducts, totalOrders, newOrders, totalRevenue, recentOrders: allOrders });
});

// PRODUCTS
router.get('/products', isAdmin, async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.render('admin/products', { products, success: req.flash('success') });
});

router.get('/products/new', isAdmin, async (req, res) => {
  const categories = await Category.find();
  res.render('admin/product-form', { product: null, categories });
});

router.post('/products', isAdmin, upload.array('images', 10), async (req, res) => {
  const { nameAz, nameEn, descAz, descEn, price, discountPrice,
          catAz, catEn, matAz, matEn, dimensions, featured, inStock } = req.body;
  const images = req.files ? req.files.map(f => '/uploads/products/' + f.filename) : [];
  const slug   = nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
  await Product.create({
    name: { az: nameAz, en: nameEn }, description: { az: descAz, en: descEn },
    price: Number(price), discountPrice: discountPrice ? Number(discountPrice) : null,
    category: { az: catAz, en: catEn }, material: { az: matAz, en: matEn },
    dimensions, images, mainImage: images[0] || '',
    featured: featured === 'on', inStock: inStock === 'on', slug
  });
  req.flash('success', 'Məhsul əlavə edildi');
  res.redirect('/admin/products');
});

router.get('/products/:id/edit', isAdmin, async (req, res) => {
  const product    = await Product.findById(req.params.id);
  const categories = await Category.find();
  res.render('admin/product-form', { product, categories });
});

router.put('/products/:id', isAdmin, upload.array('images', 10), async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.redirect('/admin/products');
  const { nameAz, nameEn, descAz, descEn, price, discountPrice,
          catAz, catEn, matAz, matEn, dimensions, featured, inStock } = req.body;
  const newImages = req.files ? req.files.map(f => '/uploads/products/' + f.filename) : [];
  const allImages = [...(product.images || []), ...newImages];
  Object.assign(product, {
    name: { az: nameAz, en: nameEn }, description: { az: descAz, en: descEn },
    price: Number(price), discountPrice: discountPrice ? Number(discountPrice) : null,
    category: { az: catAz, en: catEn }, material: { az: matAz, en: matEn },
    dimensions, images: allImages, mainImage: allImages[0] || '',
    featured: featured === 'on', inStock: inStock === 'on'
  });
  await product.save();
  req.flash('success', 'Məhsul yeniləndi');
  res.redirect('/admin/products');
});

router.delete('/products/:id', isAdmin, async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (product?.images) {
    product.images.forEach(img => {
      const fp = path.join(__dirname, '../public', img);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    });
  }
  req.flash('success', 'Məhsul silindi');
  res.redirect('/admin/products');
});

// CATEGORIES
router.get('/categories', isAdmin, async (req, res) => {
  const categories = await Category.find();
  res.render('admin/categories', { categories, success: req.flash('success') });
});

router.post('/categories', isAdmin, upload.single('image'), async (req, res) => {
  const { nameAz, nameEn, icon } = req.body;
  const slug  = nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const image = req.file ? '/uploads/products/' + req.file.filename : '';
  await Category.create({ name: { az: nameAz, en: nameEn }, slug, image, icon });
  req.flash('success', 'Kateqoriya əlavə edildi');
  res.redirect('/admin/categories');
});

router.delete('/categories/:id', isAdmin, async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  req.flash('success', 'Kateqoriya silindi');
  res.redirect('/admin/categories');
});

// ORDERS
router.get('/orders', isAdmin, async (req, res) => {
  const { status } = req.query;
  const query  = status ? { orderStatus: status } : {};
  const orders = await Order.find(query).sort({ createdAt: -1 });
  res.render('admin/orders', { orders, currentStatus: status || 'all' });
});

router.get('/orders/:id', isAdmin, async (req, res) => {
  const order = await Order.findById(req.params.id);
  res.render('admin/order-detail', { order, success: req.flash('success') });
});

router.put('/orders/:id/status', isAdmin, async (req, res) => {
  await Order.findByIdAndUpdate(req.params.id, { orderStatus: req.body.status });
  req.flash('success', 'Status yeniləndi');
  res.redirect('/admin/orders/' + req.params.id);
});

module.exports = router;
