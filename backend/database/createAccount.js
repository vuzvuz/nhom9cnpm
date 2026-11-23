require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const pool = require("../src/config/database");

async function main() {
  const [username, password, name] = process.argv.slice(2);
  if (!username || !password || !name) {
    console.log('Cách dùng: node database/createAccount.js <username> <password> "<Họ tên>"');
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    "INSERT INTO accounts (id, username, password_hash, name) VALUES (?, ?, ?, ?)",
    [crypto.randomUUID(), username, hash, name]
  );
  console.log(`Đã tạo tài khoản ${username}`);
  await pool.end();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
