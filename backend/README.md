# BlueMoon Backend (Sprint 1)

Backend Node.js + Express + MySQL cho hệ thống quản lý chung cư BlueMoon: hộ gia đình, nhân khẩu và đăng nhập.

## Yêu cầu

- Node.js 18 trở lên
- MySQL 8 (đang chạy ở `localhost:3306`)
- Git Bash hoặc terminal tương đương

## Cấu trúc thư mục

```
backend/
├── database/
│   ├── schema.sql          # Tạo database và các bảng
│   └── createAccount.js    # Script tạo tài khoản đăng nhập
├── src/
│   ├── config/             # Kết nối MySQL
│   ├── controllers/        # Nhận request, trả response
│   ├── services/           # Xử lý nghiệp vụ, validate, truy vấn DB
│   ├── routes/             # Khai báo API
│   ├── middlewares/        # Kiểm tra đăng nhập
│   ├── utils/              # AppError, asyncHandler
│   ├── app.js              # Cấu hình Express, session, routes
│   └── server.js           # Điểm khởi chạy
├── .env                    # Cấu hình cá nhân (KHÔNG commit)
└── package.json
```

## Cài đặt và chạy

### 1. Cài thư viện

```bash
cd backend
npm install
```

### 2. Tạo database

Mở MySQL Workbench, mở file `database/schema.sql` và bấm Execute (biểu tượng tia sét).
Hoặc dùng dòng lệnh:

```bash
mysql -u root -p < database/schema.sql
```

Kiểm tra:

```sql
USE bluemoon_sprint1;
SHOW TABLES;
```

Phải thấy 3 bảng: `accounts`, `households`, `residents`. Bảng `sessions` sẽ tự được tạo khi server chạy lần đầu.

### 3. Tạo file `.env`

Tạo `backend/.env` với nội dung:

```
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=mat_khau_mysql_cua_ban
DB_NAME=bluemoon_sprint1

SESSION_SECRET=mot_chuoi_ngau_nhien_dai
```

Lưu ý:

- Mỗi người dùng mật khẩu MySQL của máy mình.
- Nếu mật khẩu có ký tự `#`, `$` hoặc `\`, bọc trong nháy: `DB_PASSWORD="abc#123"`.
- Không commit file `.env`.

### 4. Tạo tài khoản đăng nhập

Mật khẩu phải được băm bằng bcrypt nên không thêm bằng SQL trực tiếp được. Chạy trong thư mục `backend`:

```bash
node database/createAccount.js admin 'BlueMoon123!' "Quản trị viên"
```

Dùng nháy đơn quanh mật khẩu để Git Bash không hiểu dấu `!` là lệnh. Mỗi người có database local riêng nên ai cũng cần chạy lệnh này một lần.

### 5. Chạy server

```bash
npm run dev
```

Kết quả đúng:

```
MySQL connected successfully!
Server running at http://localhost:5000
```

Kiểm tra nhanh: mở `http://localhost:5000/api/health`.

## Danh sách API

| Method | Đường dẫn | Mô tả | Thành công | Đăng nhập |
|---|---|---|---|---|
| GET | `/api/health` | Kiểm tra server | 200 | Không |
| POST | `/api/auth/login` | Đăng nhập (`username`, `password`) | 200 | Không |
| GET | `/api/auth/session` | Lấy phiên hiện tại | 200 / 401 | Không |
| POST | `/api/auth/logout` | Đăng xuất | 204 | Không |
| POST | `/api/auth/change-password` | Đổi mật khẩu | 204 | Có |
| GET | `/api/households` | Danh sách hộ, hỗ trợ `?q=` | 200 | Có |
| POST | `/api/households` | Thêm hộ | 201 | Có |
| GET | `/api/residents` | Danh sách nhân khẩu, hỗ trợ `?householdId=` | 200 | Có |
| POST | `/api/residents` | Thêm nhân khẩu | 201 | Có |
| PUT | `/api/residents/:id` | Sửa nhân khẩu | 200 | Có |

### Mã lỗi

| Mã | Ý nghĩa |
|---|---|
| 401 | Chưa đăng nhập, phiên hết hạn hoặc sai thông tin đăng nhập |
| 404 | Không tìm thấy hồ sơ |
| 409 | Số căn hộ đã tồn tại |
| 422 | Dữ liệu không hợp lệ |

Định dạng lỗi: `{ "message": "...", "fields": { "tenTruong": "..." } }`

### Quy tắc dữ liệu chính

- `apartmentNumber`: bỏ khoảng trắng đầu/cuối, chuyển chữ hoa, không trùng.
- `area`: số lớn hơn 0.
- `birthDate`: định dạng `YYYY-MM-DD`, không sau hôm nay.
- `nationalId`: đúng 12 chữ số; người dưới 14 tuổi phải để chuỗi rỗng.
- `relationship`: một trong `Chủ hộ`, `Vợ/chồng`, `Con`, `Cha/mẹ`, `Khác`.

## Kết nối từ Frontend

- Backend: `http://localhost:5000`, Frontend: `http://localhost:5173` (CORS đã cấu hình cho địa chỉ này).
- Mọi `fetch` phải có `credentials: "include"`, nếu không cookie phiên không được gửi và API trả 401.

## Test bằng curl

Đăng nhập và lưu cookie:

```bash
curl -c cookies.txt -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"BlueMoon123!"}'
```

Gọi API cần đăng nhập:

```bash
curl -b cookies.txt http://localhost:5000/api/households
```

**Tiếng Việt có dấu:** Git Bash trên Windows gửi sai mã hóa khi gõ trực tiếp trong lệnh curl (dấu bị đổi thành `?`). Hãy lưu body vào file JSON UTF-8 rồi gửi:

```bash
curl -b cookies.txt -X POST http://localhost:5000/api/households \
  -H "Content-Type: application/json; charset=utf-8" \
  --data-binary @h.json
```

Đây là lỗi của terminal, frontend dùng `fetch` thì không bị. Không commit `cookies.txt` và các file JSON test.

## Xử lý lỗi thường gặp

| Lỗi | Nguyên nhân và cách xử lý |
|---|---|
| `Access denied for user 'root'` | Sai `DB_PASSWORD`. Mật khẩu có `#` phải bọc nháy trong `.env`. |
| `Unknown database 'bluemoon_sprint1'` | Chưa chạy `schema.sql`. |
| `ECONNREFUSED` | MySQL chưa bật. |
| `injected env (0)` | `.env` trống hoặc chưa lưu. |
| `pool.query is not a function` | `src/config/database.js` trống, chưa lưu hoặc thiếu `module.exports = pool;`. |
| `Missing script: "dev"` | Chưa có mục `scripts` trong `package.json`. |
| `Duplicate entry 'admin'` | Tài khoản đã tồn tại, không cần tạo lại. |
| API trả 401 dù đã đăng nhập | Thiếu `-b cookies.txt` (curl) hoặc `credentials: "include"` (fetch). |

## Ghi chú

- `npm audit` có thể báo cảnh báo trong `nodemon` và `express-mysql-session`. Với môi trường phát triển local có thể bỏ qua, không chạy `npm audit fix --force`.
- Không bao giờ commit `.env` và `node_modules`.
