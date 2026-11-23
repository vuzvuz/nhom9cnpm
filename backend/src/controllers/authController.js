const authService = require("../services/authService");
const asyncHandler = require("../utils/asyncHandler");

exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body ?? {};
  const user = await authService.login(username, password);
  req.session.user = user;
  res.status(200).json({ username: user.username, name: user.name });
});

exports.session = (req, res) => {
  const user = req.session && req.session.user;
  if (!user) {
    return res.status(401).json({ message: "Chưa đăng nhập hoặc phiên đã hết hạn" });
  }
  res.status(200).json({ username: user.username, name: user.name });
};

exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie("connect.sid");
    res.status(204).end();
  });
};

exports.changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.session.user.id, req.body);
  res.status(204).end();
});
