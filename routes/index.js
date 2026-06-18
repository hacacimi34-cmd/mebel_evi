const express = require('express');
const router = express.Router();
const Product  = require('../models/Product');
const Category = require('../models/Category');
const t = require('../helpers/translations');

router.get('/', async (req, res) => {
  const lang = req.session.lang || 'az';
  const [featured, categories, newProducts] = await Promise.all([
    Product.find({ featured: true, inStock: true }).limit(8),
    Category.find().limit(8),
    Product.find({ inStock: true }).sort({ createdAt: -1 }).limit(8)
  ]);
  res.render('index', { featured, categories, newProducts, t: t(lang), lang });
});

router.get('/about', (req, res) => {
  const lang = req.session.lang || 'az';
  res.render('about', { t: t(lang), lang });
});

router.get('/contact', (req, res) => {
  const lang = req.session.lang || 'az';
  res.render('contact', { t: t(lang), lang });
});

module.exports = router;
