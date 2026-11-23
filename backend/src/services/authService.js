const bcrypt = require("bcryptjs");
const pool = require("../config/database");
const AppError = require("../utils/AppError");

async function login(username, password) {
  const [rows] = await pool.query(
    "SELECT id, username, name, password_hash FROM accounts WHERE username = ?",
    [String(username ?? "").trim()]
  );
  const account = rows[0];
  const ok = account && (await bcrypt.compare(String(password ?? ""), account.password_hash));
  if (!ok) throw new AppError(401, "Tên đăng nhập hoặc mật khẩu không đúng");
  return { id: account.id, username: account.username, name: account.name };
}

async function changePassword(accountId, body) {
  const { currentPassword, newPassword, confirmPassword } = body ?? {};
  const fields = {};

  if (!currentPassword) fields.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
  if (!newPassword || String(newPassword).length < 8) {
    fields.newPassword = "Mật khẩu mới phải có ít nhất 8 ký tự";
  }
  if (newPassword !== confirmPassword) {
    fields.confirmPassword = "Mật khẩu xác nhận không khớp";
  }
  if (Object.keys(fields).length) {
    throw new AppError(422, "Dữ liệu không hợp lệ", fields);
  }

  const [rows] = await pool.query("SELECT password_hash FROM accounts WHERE id = ?", [accountId]);
  if (!rows.length) throw new AppError(401, "Phiên đăng nhập không hợp lệ");

  const ok = await bcrypt.compare(String(currentPassword), rows[0].password_hash);
  if (!ok) {
    throw new AppError(422, "Mật khẩu hiện tại không đúng", {
      currentPassword: "Mật khẩu hiện tại không đúng",
    });
  }

  const hash = await bcrypt.hash(String(newPassword), 10);
  await pool.query("UPDATE accounts SET password_hash = ? WHERE id = ?", [hash, accountId]);
}

module.exports = { login, changePassword };
