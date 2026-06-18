const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');
const t = require('../helpers/translations');

let stripe;
try { stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); } catch(e){}

router.get('/', (req, res) => {
  const lang = req.session.lang || 'az';
  const cart = req.session.cart || [];
  if (cart.length === 0) return res.redirect('/cart');
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  res.render('checkout', { cart, total, stripeKey: process.env.STRIPE_PUBLISHABLE_KEY || '', t: t(lang), lang });
});

router.post('/place-order', async (req, res) => {
  const lang = req.session.lang || 'az';
  const cart = req.session.cart || [];
  if (cart.length === 0) return res.redirect('/cart');
  const { name, email, phone, address, city, paymentMethod, notes } = req.body;
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const order = new Order({
    customer: { name, email, phone, address, city },
    items: cart.map(i => ({ name: i.name, price: i.price, qty: i.qty, image: i.image })),
    total, paymentMethod: paymentMethod || 'cash', notes
  });
  await order.save();
  req.session.cart = [];
  req.flash('success', lang === 'az' ? 'Sifarişiniz qəbul edildi!' : 'Order placed!');
  res.redirect('/checkout/success/' + order.orderNumber);
});

router.post('/create-payment-intent', async (req, res) => {
  if (!stripe) return res.status(400).json({ error: 'Stripe konfiqurasiya edilməyib' });
  const cart  = req.session.cart || [];
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  try {
    const pi = await stripe.paymentIntents.create({ amount: Math.round(total * 100), currency: 'azn', payment_method_types: ['card'] });
    res.json({ clientSecret: pi.client_secret });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.post('/confirm-stripe', async (req, res) => {
  const cart = req.session.cart || [];
  const { name, email, phone, address, city, paymentIntentId, notes } = req.body;
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const order = new Order({
    customer: { name, email, phone, address, city },
    items: cart.map(i => ({ name: i.name, price: i.price, qty: i.qty, image: i.image })),
    total, paymentMethod: 'card', paymentStatus: 'paid', stripePaymentId: paymentIntentId, notes
  });
  await order.save();
  req.session.cart = [];
  res.json({ success: true, orderNumber: order.orderNumber });
});

router.get('/success/:orderNumber', (req, res) => {
  const lang = req.session.lang || 'az';
  res.render('order-success', { orderNumber: req.params.orderNumber, t: t(lang), lang });
});

module.exports = router;
