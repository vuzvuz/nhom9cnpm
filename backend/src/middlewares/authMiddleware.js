function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Chưa đăng nhập hoặc phiên đã hết hạn" });
  }
  next();
}

module.exports = { requireAuth };
