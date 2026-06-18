const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    az: { type: String, required: true },
    en: { type: String, required: true }
  },
  slug: { type: String, unique: true },
  image: String,
  icon: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Category', categorySchema);
