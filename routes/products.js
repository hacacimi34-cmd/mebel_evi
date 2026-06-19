const express = require('express');
const router  = express.Router();
const Product  = require('../models/Product');
const Category = require('../models/Category');
const t = require('../helpers/translations');

router.get('/', async (req, res) => {
  try {
    const lang = req.session.lang || 'az';
    const { category, sort, search, min, max } = req.query;

    let query = {};

    // 1. Axtarış süzgəci
    if (search) {
      query.$or = [
        { 'name.az': { $regex: search, $options: 'i' } },
        { 'name.en': { $regex: search, $options: 'i' } }
      ];
    }

    // 2. Kateqoriya süzgəci (Yalnız kateqoriya seçildikdə işləsin)
    if (category) {
      query['category.en'] = category;
    }

    // 3. Qiymət süzgəci (Boş string gəldikdə bazanı kilidləməsin)
    if (min || max) {
      query.price = {};
      if (min && !isNaN(min)) query.price.$gte = Number(min);
      if (max && !isNaN(max)) query.price.$lte = Number(max);
    }

    // 4. Sıralama
    let sortObj = { createdAt: -1 };
    if (sort === 'price-asc')  sortObj = { price: 1 };
    if (sort === 'price-desc') sortObj = { price: -1 };

    // Bazadan məlumatları çəkirik
    const [products, categories] = await Promise.all([
      Product.find(query).sort(sortObj),
      Category.find()
    ]);

    // Əgər hələ də 0 məhsul deyirsə, Render terminalında ümumi sayı görək
    if (products.length === 0) {
      const totalInDB = await Product.countDocuments({});
      console.log(`⚠️ Filtr daxilində məhsul tapılmadı. Amma bazada ümumi ${totalInDB} məhsul var.`);
    }

    res.render('products', { products, categories, query: req.query, t: t(lang), lang });
  } catch (err) {
    console.error("Məhsul çəkilərkən xəta baş verdi:", err);
    res.status(500).send("Server xətası");
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const lang = req.session.lang || 'az';
    const product = await Product.findOne({ slug: req.params.slug });
    
    if (!product) return res.redirect('/products');

    let relatedQuery = { _id: { $ne: product._id } };
    if (product.category && product.category.en) {
      relatedQuery['category.en'] = product.category.en;
    }

    const related = await Product.find(relatedQuery).limit(4);
    res.render('product-detail', { product, related, t: t(lang), lang });
  } catch (err) {
    console.error("Məhsul detalı xətası:", err);
    res.redirect('/products');
  }
});

module.exports = router;
