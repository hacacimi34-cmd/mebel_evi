const express = require('express');
const router  = express.Router();
const Product  = require('../models/Product');
const Category = require('../models/Category');
const t = require('../helpers/translations');

router.get('/', async (req, res) => {
  const lang = req.session.lang || 'az';
  const { category, sort, search, min, max } = req.query;

  let query = {  };
  if (search) {
    query.$or = [
      { 'name.az': { $regex: search, $options: 'i' } },
      { 'name.en': { $regex: search, $options: 'i' } }
    ];
  }
  if (category) query['category.en'] = category;
  if (min || max) {
    query.price = {};
    if (min) query.price.$gte = Number(min);
    if (max) query.price.$lte = Number(max);
  }

  let sortObj = { createdAt: -1 };
  if (sort === 'price-asc')  sortObj = { price: 1 };
  if (sort === 'price-desc') sortObj = { price: -1 };

  const [products, categories] = await Promise.all([
    Product.find(query).sort(sortObj),
    Category.find()
  ]);
  res.render('products', { products, categories, query: req.query, t: t(lang), lang });
});

router.get('/:slug', async (req, res) => {
  const lang = req.session.lang || 'az';
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) return res.redirect('/products');
  const related = await Product.find({
    'category.en': product.category?.en,
    _id: { $ne: product._id }
  }).limit(4);
  res.render('product-detail', { product, related, t: t(lang), lang });
});

module.exports = router;
