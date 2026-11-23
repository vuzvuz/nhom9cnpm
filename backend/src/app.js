const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

const pool = require("./config/database");
const { requireAuth } = require("./middlewares/authMiddleware");
const authRoutes = require("./routes/authRoutes");
const householdRoutes = require("./routes/householdRoutes");
const residentRoutes = require("./routes/residentRoutes");

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

const sessionStore = new MySQLStore({}, pool); // tự tạo bảng `sessions`

app.use(
  session({
    name: "connect.sid",
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // đổi thành true khi chạy HTTPS
      maxAge: 1000 * 60 * 60 * 8, // 8 giờ
    },
  })
);

app.get("/api/health", (req, res) => {
  res.json({ message: "BlueMoon Backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/households", requireAuth, householdRoutes);
app.use("/api/residents", requireAuth, residentRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Không tìm thấy đường dẫn" });
});

// Xử lý lỗi tập trung: { message, fields? }
app.use((err, req, res, next) => {
  if (err.status) {
    const body = { message: err.message };
    if (err.fields) body.fields = err.fields;
    return res.status(err.status).json(body);
  }
  if (err.type === "entity.parse.failed") {
    return res.status(422).json({ message: "JSON gửi lên không hợp lệ" });
  }
  console.error(err);
  res.status(500).json({ message: "Lỗi máy chủ" });
});

module.exports = app;
