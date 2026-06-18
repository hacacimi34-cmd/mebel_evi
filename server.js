process.env.MONGODB_URI
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');

const app = express();

// MongoDB
const dbURI = process.env.MONGODB_URI || 'mongodb+srv://hacacimi34_db_user:tFuhqsuEMXXWBti0@cluster0.16wbenj.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(dbURI)
  .then(() => console.log('✅ Bazaya uğurla qoşulduq!'))
  .catch((err) => console.log('❌ Xəta:', err));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'mebelevi_secret_2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));
app.use(flash());

// Global locals
app.use((req, res, next) => {
  res.locals.success  = req.flash('success');
  res.locals.error    = req.flash('error');
  res.locals.lang     = req.session.lang || 'az';
  res.locals.cart     = req.session.cart || [];
  res.locals.cartCount = (req.session.cart || []).reduce((a, b) => a + b.qty, 0);
  res.locals.isAdmin  = req.session.isAdmin || false;
  next();
});

// Language switcher
app.get('/lang/:lang', (req, res) => {
  req.session.lang = req.params.lang;
  res.redirect(req.get('Referrer') || '/');
});

// Routes
app.use('/',          require('./routes/index'));
app.use('/products',  require('./routes/products'));
app.use('/cart',      require('./routes/cart'));
app.use('/checkout',  require('./routes/checkout'));
app.use('/admin',     require('./routes/admin'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`🔐 Admin:  http://localhost:${PORT}/admin`);
});
