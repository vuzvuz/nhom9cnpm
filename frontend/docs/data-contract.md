# Mô hình dữ liệu đề xuất · BlueMoon Sprint 1

## Hộ gia đình

| Trường | Kiểu | Quy tắc |
| --- | --- | --- |
| `id` | string | ID ổn định do server cấp |
| `apartmentNumber` | string | Bắt buộc, bỏ khoảng trắng đầu/cuối, chuẩn hóa chữ hoa và duy nhất |
| `area` | number | Diện tích theo m², hữu hạn và lớn hơn 0 |
| `headName` | string | Họ tên chủ hộ, bắt buộc |

## Nhân khẩu

| Trường | Kiểu | Quy tắc |
| --- | --- | --- |
| `id` | string | ID ổn định do server cấp |
| `householdId` | string | Tham chiếu `Household.id` |
| `fullName` | string | Họ và tên, bắt buộc |
| `birthDate` | string | Ngày lịch định dạng `YYYY-MM-DD`, không sau hôm nay |
| `nationalId` | string | Đúng 12 chữ số khi có giá trị. Người dưới 14 tuổi được gửi chuỗi rỗng |
| `relationship` | string | Một trong `Chủ hộ`, `Vợ/chồng`, `Con`, `Cha/mẹ`, `Khác` |

Tuổi tính theo ngày sinh đầy đủ. `headName` trong hộ là trường văn bản và được nhập độc lập với hồ sơ nhân khẩu để phù hợp với form Sprint 1. Một hộ có thể có nhiều nhân khẩu.

## API tham khảo

| Method và đường dẫn | Đầu vào | Kết quả |
| --- | --- | --- |
| `GET /api/households` | Có thể hỗ trợ `q` để tìm theo số căn hộ hoặc chủ hộ | `200 Household[]`, mới nhất trước |
| `POST /api/households` | `apartmentNumber`, `area`, `headName` | `201 Household` |
| `GET /api/residents` | Có thể hỗ trợ `householdId` để lọc | `200 Resident[]` |
| `POST /api/residents` | Các trường nhân khẩu trừ `id` | `201 Resident` |
| `PUT /api/residents/:id` | Các trường nhân khẩu trừ `id` | `200 Resident` |
| `POST /api/auth/login` | `username`, `password` | `200 { username, name }` và tạo phiên |
| `GET /api/auth/session` | Phiên hiện tại | `200 { username, name }` hoặc `401` |
| `POST /api/auth/logout` | Phiên hiện tại | `204`, hủy phiên |
| `POST /api/auth/change-password` | `currentPassword`, `newPassword`, `confirmPassword` | `204` |

Frontend đang tìm kiếm và lọc trên danh sách lấy từ API mô phỏng. Có thể chuyển truy vấn sang server khi triển khai phân trang. Khi chuyển sang API thật, `GET /api/auth/session` có thể được dùng khi khởi tạo ứng dụng và route riêng tư chờ kiểm tra phiên hoàn tất.

Phản hồi lỗi đề xuất dùng `{ message: string, fields?: Record<string, string> }`, với tên trường tương ứng JSON gửi lên. Dùng `422` cho dữ liệu sai, `409` cho số căn hộ trùng, `404` cho hồ sơ không tồn tại và `401` cho thông tin đăng nhập sai hoặc phiên hết hạn. Backend cần kiểm tra tính duy nhất của số căn hộ tại tầng lưu trữ, kiểm tra khóa ngoại và xử lý mật khẩu phía server.
