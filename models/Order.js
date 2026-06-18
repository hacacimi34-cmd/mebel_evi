const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  customer: {
    name: String,
    email: String,
    phone: String,
    address: String,
    city: String
  },
  items: [{
    name: String,
    price: Number,
    qty: Number,
    image: String
  }],
  total: Number,
  paymentMethod: {
    type: String,
    enum: ['card', 'cash', 'transfer'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['new', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'new'
  },
  stripePaymentId: String,
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

orderSchema.pre('save', async function () {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = 'ME' + String(count + 1).padStart(5, '0');
  }
});

module.exports = mongoose.model('Order', orderSchema);
