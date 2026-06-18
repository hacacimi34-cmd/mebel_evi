const Datastore = require('@seald-io/nedb');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = {
  products:   new Datastore({ filename: path.join(dbDir, 'products.db'),   autoload: true }),
  categories: new Datastore({ filename: path.join(dbDir, 'categories.db'), autoload: true }),
  orders:     new Datastore({ filename: path.join(dbDir, 'orders.db'),     autoload: true }),
  admins:     new Datastore({ filename: path.join(dbDir, 'admins.db'),     autoload: true }),
};

module.exports = db;
