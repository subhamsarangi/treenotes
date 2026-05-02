export function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    req.user = { id: req.session.userId, email: req.session.email };
    return next();
  }
  res.redirect('/login');
}
