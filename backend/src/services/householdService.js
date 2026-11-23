const crypto = require("crypto");
const pool = require("../config/database");
const AppError = require("../utils/AppError");

const SELECT = `
  SELECT id, apartment_number AS apartmentNumber, area, head_name AS headName
  FROM households
`;

function validate(body) {
  body = body ?? {};
  const fields = {};
  const apartmentNumber = String(body.apartmentNumber ?? "").trim().toUpperCase();
  const headName = String(body.headName ?? "").trim();
  const area = Number(body.area);

  if (!apartmentNumber) fields.apartmentNumber = "Số căn hộ là bắt buộc";
  if (body.area === "" || body.area == null || !Number.isFinite(area) || area <= 0) {
    fields.area = "Diện tích phải là số lớn hơn 0";
  }
  if (!headName) fields.headName = "Họ tên chủ hộ là bắt buộc";

  if (Object.keys(fields).length) {
    throw new AppError(422, "Dữ liệu không hợp lệ", fields);
  }
  return { apartmentNumber, area, headName };
}

async function list(q) {
  const keyword = String(q ?? "").trim();
  if (!keyword) {
    const [rows] = await pool.query(`${SELECT} ORDER BY created_at DESC`);
    return rows;
  }
  const like = `%${keyword}%`;
  const [rows] = await pool.query(
    `${SELECT} WHERE apartment_number LIKE ? OR head_name LIKE ? ORDER BY created_at DESC`,
    [like, like]
  );
  return rows;
}

async function create(body) {
  const data = validate(body);
  const id = crypto.randomUUID();
  try {
    await pool.query(
      "INSERT INTO households (id, apartment_number, area, head_name) VALUES (?, ?, ?, ?)",
      [id, data.apartmentNumber, data.area, data.headName]
    );
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      throw new AppError(409, "Số căn hộ đã tồn tại", {
        apartmentNumber: "Số căn hộ đã tồn tại",
      });
    }
    throw err;
  }
  const [rows] = await pool.query(`${SELECT} WHERE id = ?`, [id]);
  return rows[0];
}

module.exports = { list, create };
