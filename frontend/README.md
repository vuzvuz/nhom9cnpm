# BlueMoon Frontend · Sprint 1

Cổng quản trị chung cư BlueMoon viết bằng React, Vite, React Router, Lucide React và CSS thuần.

## Chạy trên PowerShell

Yêu cầu Node.js 20.19+ trong nhánh 20 hoặc Node.js 22.12 trở lên. Từ thư mục gốc repository, chạy:

```powershell
Set-Location frontend
npm.cmd ci
npm.cmd run dev
```

Mở địa chỉ Vite in ra, thường là `http://localhost:5173`. Dùng `npm.cmd run build` để tạo bản production và `npm.cmd run preview` để xem bản build. Khi phục vụ bản build trên hosting tĩnh, cấu hình chuyển các đường dẫn ứng dụng về `index.html` để tải lại trang con được.

## Dùng thử

- Tài khoản demo là `admin`, mật khẩu ban đầu là `BlueMoon123!`.
- Đăng nhập để xem tổng quan, tìm kiếm và thêm hộ gia đình, lọc và chỉnh sửa danh sách nhân khẩu, hoặc đổi mật khẩu.
- Hộ gia đình và nhân khẩu tạo trong quá trình demo được lưu trong `localStorage` của trình duyệt. Các hồ sơ mặc định là dữ liệu giả.
- Phiên đăng nhập dùng `sessionStorage`. Mật khẩu mới chỉ nằm trong bộ nhớ JavaScript của trang, có hiệu lực khi đăng xuất rồi đăng nhập lại trong cùng lượt chạy, và trở về giá trị mặc định khi tải lại trang.
- Để khôi phục dữ liệu mẫu, xóa khóa `bluemoon-sprint1-data-v1` trong Local Storage của địa chỉ đang demo và tải lại trang.

## Cấu trúc

| Đường dẫn | Nội dung |
| --- | --- |
| `src/pages/` | Năm trang Sprint 1 |
| `src/components/` | Bố cục, bảng, trường nhập, modal và phản hồi |
| `src/hooks/` | Trạng thái tải dữ liệu và xử lý biểu mẫu |
| `src/data/` | Dữ liệu mẫu |
| `src/services/` | API mô phỏng và quy tắc kiểm tra đầu vào |
| `src/styles/` | CSS cơ sở và bố cục responsive |
| `src/utils/` | Định dạng và chuẩn hóa tìm kiếm |

Xem [mô hình dữ liệu và hợp đồng API đề xuất](docs/data-contract.md) để tích hợp backend.
