const crypto = require("crypto");
const pool = require("../config/database");
const AppError = require("../utils/AppError");

const RELATIONSHIPS = ["Chủ hộ", "Vợ/chồng", "Con", "Cha/mẹ", "Khác"];

const SELECT = `
  SELECT id,
         household_id AS householdId,
         full_name AS fullName,
         DATE_FORMAT(birth_date, '%Y-%m-%d') AS birthDate,
         COALESCE(national_id, '') AS nationalId,
         relationship
  FROM residents
`;

const pad = (n) => String(n).padStart(2, "0");

function todayString() {
  const n = new Date();
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
}

function isValidDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

// Tuổi tính theo ngày sinh đầy đủ
function calcAge(s) {
  const [y, m, d] = s.split("-").map(Number);
  const now = new Date();
  let age = now.getFullYear() - y;
  const month = now.getMonth() + 1;
  if (month < m || (month === m && now.getDate() < d)) age--;
  return age;
}

async function validate(body) {
  body = body ?? {};
  const fields = {};
  const householdId = String(body.householdId ?? "").trim();
  const fullName = String(body.fullName ?? "").trim();
  const birthDate = String(body.birthDate ?? "").trim();
  const nationalId = String(body.nationalId ?? "").trim();
  const relationship = body.relationship;

  if (!householdId) {
    fields.householdId = "Hộ gia đình là bắt buộc";
  } else {
    const [rows] = await pool.query("SELECT 1 FROM households WHERE id = ?", [householdId]);
    if (!rows.length) fields.householdId = "Hộ gia đình không tồn tại";
  }

  if (!fullName) fields.fullName = "Họ và tên là bắt buộc";

  if (!isValidDate(birthDate)) {
    fields.birthDate = "Ngày sinh phải đúng định dạng YYYY-MM-DD";
  } else if (birthDate > todayString()) {
    fields.birthDate = "Ngày sinh không được sau hôm nay";
  } else if (calcAge(birthDate) < 14) {
    if (nationalId !== "") fields.nationalId = "Người dưới 14 tuổi không nhập số CCCD";
  } else if (!/^\d{12}$/.test(nationalId)) {
    fields.nationalId = "Số CCCD phải gồm đúng 12 chữ số";
  }

  if (!RELATIONSHIPS.includes(relationship)) {
    fields.relationship = "Quan hệ với chủ hộ không hợp lệ";
  }

  if (Object.keys(fields).length) {
    throw new AppError(422, "Dữ liệu không hợp lệ", fields);
  }
  return { householdId, fullName, birthDate, nationalId, relationship };
}

async function list(householdId) {
  const id = String(householdId ?? "").trim();
  if (!id) {
    const [rows] = await pool.query(`${SELECT} ORDER BY created_at DESC`);
    return rows;
  }
  const [rows] = await pool.query(
    `${SELECT} WHERE household_id = ? ORDER BY created_at DESC`,
    [id]
  );
  return rows;
}

async function create(body) {
  const d = await validate(body);
  const id = crypto.randomUUID();
  await pool.query(
    `INSERT INTO residents (id, household_id, full_name, birth_date, national_id, relationship)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, d.householdId, d.fullName, d.birthDate, d.nationalId, d.relationship]
  );
  const [rows] = await pool.query(`${SELECT} WHERE id = ?`, [id]);
  return rows[0];
}

async function update(id, body) {
  const [exists] = await pool.query("SELECT 1 FROM residents WHERE id = ?", [id]);
  if (!exists.length) throw new AppError(404, "Không tìm thấy nhân khẩu");

  const d = await validate(body);
  await pool.query(
    `UPDATE residents
     SET household_id = ?, full_name = ?, birth_date = ?, national_id = ?, relationship = ?
     WHERE id = ?`,
    [d.householdId, d.fullName, d.birthDate, d.nationalId, d.relationship, id]
  );
  const [rows] = await pool.query(`${SELECT} WHERE id = ?`, [id]);
  return rows[0];
}

module.exports = { list, create, update };
