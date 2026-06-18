const express = require('express');
const router  = express.Router();
const Product = require('../models/Product');
const t = require('../helpers/translations');

router.get('/', (req, res) => {
  const lang  = req.session.lang || 'az';
  const cart  = req.session.cart || [];
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  res.render('cart', { cart, total, t: t(lang), lang });
});

router.post('/add', async (req, res) => {
  const { productId, qty = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.json({ success: false });

  const lang = req.session.lang || 'az';
  if (!req.session.cart) req.session.cart = [];

  const existing = req.session.cart.find(i => i.productId === productId);
  if (existing) {
    existing.qty += parseInt(qty);
  } else {
    req.session.cart.push({
      productId,
      name:  product.name[lang] || product.name.az,
      price: product.discountPrice || product.price,
      image: product.mainImage || '',
      qty:   parseInt(qty)
    });
  }
  const cartCount = req.session.cart.reduce((a, b) => a + b.qty, 0);
  res.json({ success: true, cartCount });
});

router.post('/update', (req, res) => {
  const { productId, qty } = req.body;
  if (!req.session.cart) return res.redirect('/cart');
  const item = req.session.cart.find(i => i.productId === productId);
  if (item) {
    if (parseInt(qty) <= 0) req.session.cart = req.session.cart.filter(i => i.productId !== productId);
    else item.qty = parseInt(qty);
  }
  res.redirect('/cart');
});

router.post('/remove', (req, res) => {
  const { productId } = req.body;
  req.session.cart = (req.session.cart || []).filter(i => i.productId !== productId);
  res.redirect('/cart');
});

module.exports = router;
