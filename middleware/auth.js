function isAdmin(req, res, next) {
  if (req.session.isAdmin) return next();
  req.flash('error', 'Bu səhifəyə giriş icazəniz yoxdur');
  res.redirect('/admin/login');
}

module.exports = { isAdmin };
