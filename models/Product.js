const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    az: { type: String, required: true },
    en: { type: String, required: true }
  },
  description: {
    az: String,
    en: String
  },
  price: { type: Number, required: true },
  discountPrice: { type: Number, default: null },
  category: {
    az: String,
    en: String
  },
  images: [String],
  mainImage: String,
  inStock: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  material: {
    az: String,
    en: String
  },
  dimensions: String,
  slug: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
