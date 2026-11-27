# BlueMoon · Quản lý thu phí Sprint 2

Ba màn hình tiếng Việt dùng chung phiên đăng nhập, sidebar và hộ gia đình của Sprint 1. Mở nhóm **Thu phí** trong sidebar sau khi đăng nhập.

| Story | Đường dẫn | Công việc |
| --- | --- | --- |
| US-04 | `/khoan-thu` | Tìm theo mã hoặc tên, lọc loại, thêm và sửa khoản thu, đặt đơn giá và giới hạn tháng áp dụng |
| US-05 | `/bang-phi` | Chọn kỳ, xem đơn giá bắt buộc, xem trước, lập bảng và đối chiếu tổng tiền theo căn hộ |
| US-06 | `/thu-phi` | Tìm căn hộ hoặc chủ hộ, lọc kỳ và trạng thái, xác nhận thu tiền mặt cho từng dòng phí |

## Chạy và demo

Dùng Node.js 20.19+ thuộc nhánh 20 hoặc 22.12 trở lên. Chạy từ thư mục gốc trên PowerShell.

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev
```

Mở URL Vite in ra, đăng nhập bằng tài khoản demo hiển thị trên màn hình. Lệnh `npm.cmd run build` tạo bản production. Khi triển khai trên hosting tĩnh cần chuyển route con về `index.html`.

1. Mở **Danh mục khoản thu**, tạo **Phí dịch vụ chung cư**, loại **Bắt buộc**, đơn giá **10000**. Có thể đặt tháng bắt đầu là 10/2026.
2. Tạo **Phí quản lý chung cư**, loại **Bắt buộc**, đơn giá **7000**.
3. Tạo **Quỹ vì người nghèo**, loại **Tự nguyện**. Form bỏ trường đơn giá. Có thể nhập khoảng tháng vận động và ghi chú.
4. Mở **Bảng phí tháng**, chọn **10/2026**. Xem trước rồi chọn **Lập bảng phí tháng**. Xem trước chỉ tính toán trên dữ liệu hiện hành.
5. Đối chiếu căn hộ **1002** rộng **80 m²**. Hai khoản lần lượt là **800.000 ₫** và **560.000 ₫**, tổng **1.360.000 ₫**. Mỗi khoản mới có trạng thái **Chưa nộp**.
6. Chọn **Đến thu phí** để mang kỳ thu sang màn hình xác nhận. Tìm **1002**.
7. Nhấn **Xác nhận đã thu** trên dòng phí dịch vụ, đối chiếu căn hộ, khoản thu, số tiền và người thu trong modal rồi xác nhận.
8. Kiểm tra ngày, người thu, phương thức và trạng thái **Đã nộp**. Nút thu lần nữa bị khóa. Bảng tháng hiển thị **Đã nộp một phần** cho căn hộ. Thu nốt phí quản lý để thấy **Đã nộp** sau khi trở lại bảng tháng.

Danh mục mẫu có hai đơn giá chỉ áp dụng tháng 09/2026 và một quỹ thiên tai. Lần mở đầu tiên, mock tạo bảng tháng 9 từ danh sách hộ hiện có, với một dòng đã thu để nhóm xem cả hai trạng thái. Tháng 10 dành cho luồng tự lập bảng. Dữ liệu mẫu Sprint 1 có thêm hộ 1002. Nếu trình duyệt đã lưu danh sách hộ cũ, hãy thêm căn 1002 qua **Hộ gia đình** nếu còn thiếu trước khi lập bảng.

## Dữ liệu trao đổi giữa các màn hình

Bảng sau mô tả trường trong mock và kiểu đề xuất khi tích hợp. Tên cột MySQL của hộ gia đình và tài khoản đối chiếu theo `backend/database/schema.sql` trên nhánh `backend_sprint1`. Những thực thể thu phí dưới đây cần nhóm database thống nhất trước khi tạo migration.

| Thực thể | Trường | Kiểu đề xuất | Bắt buộc và ý nghĩa |
| --- | --- | --- | --- |
| Hộ gia đình | `id`, `apartmentNumber`, `headName`, `area` | CHAR(36), VARCHAR(50), VARCHAR(150), DECIMAL(10,2) | Cả bốn bắt buộc. Mã căn duy nhất, diện tích dương. FE đọc qua `householdApi.list()` |
| Khoản thu | `id`, `name` | string, string | Bắt buộc, mã tự cấp (ví dụ KT004). Tên duy nhất sau khi chuẩn hóa khoảng trắng, chữ hoa/thường và dấu |
| Khoản thu | `type`, `rate` | enum(required, voluntary), integer nullable | Loại bắt buộc. Phí bắt buộc có đơn giá nguyên dương theo VNĐ/m²/tháng. Quỹ tự nguyện có rate bằng null |
| Khoản thu | `start`, `end`, `note` | year-month, year-month, string | Tùy chọn. Tháng đầu/cuối đều được tính. Để trống là mở đầu hoặc mở cuối |
| Bảng tháng | `period` | year-month dạng YYYY-MM | Bắt buộc, duy nhất. Một kỳ có nhiều hộ và nhiều phí áp dụng |
| Đơn giá của kỳ | `fees[].id`, `name`, `rate` | string, string, integer | Bắt buộc. Mã tham chiếu danh mục, tên và đơn giá chụp tại lúc lập bảng |
| Dòng căn hộ | `rows[].householdId`, `apartmentNumber`, `headName`, `area` | string, string, string, decimal | Bắt buộc. Tham chiếu hộ và lưu thông tin tại kỳ thu để tái hiện bảng |
| Chi tiết phải thu | `lines[].feeId`, `amount` | string, integer VNĐ | Bắt buộc. Mỗi bộ (period, householdId, feeId) có đúng một dòng trong bảng đã lập |
| Thanh toán | `receipt` | object nullable | Null khi chưa nộp. Mỗi dòng phí có tối đa một lần xác nhận thu đủ |
| Thanh toán | `date`, `username`, `collector`, `method` | timestamp ISO UTC, string, string, enum | Cả bốn bắt buộc khi đã thu. Ghi tài khoản, tên hiển thị theo phiên và phương thức Tiền mặt |

Căn hộ có nhiều chi tiết phí qua các kỳ. Mỗi chi tiết trỏ đến một khoản thu và một kỳ. Đơn vị và trạng thái được suy ra khi hiển thị. Hệ thống làm tròn từng tích diện tích × đơn giá đến đồng rồi cộng các dòng để số tổng khớp số tiền thực thu. Thay đổi danh mục chỉ ảnh hưởng bảng lập sau. Bảng đã lập khóa toàn kỳ. Quỹ tự nguyện chỉ xuất hiện trong danh mục ở Sprint 2.

## Tích hợp dự kiến

`frontend/src/services/feeApi.js` tập trung đọc danh mục, lập bảng và thu tiền. Các trang gọi service này qua cùng cơ chế tải dữ liệu của Sprint 1. Mock lưu danh mục, bảng và biên nhận trong cơ sở dữ liệu IndexedDB `bluemoon-sprint2-fees-v1`. Xóa riêng cơ sở dữ liệu IndexedDB này trong hồ sơ trình duyệt demo rồi tải lại sẽ khởi tạo lại ví dụ tháng 9. Phiên đăng nhập và nguồn hộ tiếp tục dùng service Sprint 1.

| API đề xuất | Đầu vào | Kết quả |
| --- | --- | --- |
| GET /api/households | Theo contract Sprint 1 | Danh sách hộ, mã căn, chủ hộ, diện tích |
| GET /api/fees | q, type tùy chọn | Danh mục khoản thu |
| POST /api/fees, PATCH /api/fees/{id} | name, type, rate, start, end, note | Khoản thu đã lưu, lỗi theo trường nếu không hợp lệ |
| POST /api/fee-sheets/preview | period | Đơn giá, các dòng phí theo hộ và tổng dự kiến |
| POST /api/fee-sheets | period | 201 và bảng vừa lập, 409 nếu kỳ đã tồn tại |
| GET /api/fee-sheets/{period} | Kỳ thu | Bảng đã lập, đơn giá chụp theo kỳ và trạng thái |
| GET /api/charges | period, q và status | Các dòng khoản phải thu kèm thông tin biên nhận |
| POST /api/charges/{id}/receipt | method | 201 và biên nhận, 409 nếu đã thu |

Các endpoint phí là đề xuất thảo luận. Khi tích hợp, server lấy người thu từ phiên, kiểm tra quyền, tự tính tiền và ghi giao dịch nguyên tử. Nhóm cần chốt cách cấp mã dòng phí và cách ánh xạ tài khoản vào `accounts.id`, quy tắc làm tròn khi có diện tích lẻ, múi giờ nghiệp vụ, cách xử lý thay đổi diện tích hoặc bổ sung hộ sau khi chốt kỳ. Cần thống nhất ràng buộc duy nhất trên (kỳ, hộ, khoản thu) và trên biên nhận của mỗi chi tiết phí. Mock chỉ dùng dữ liệu trình duyệt của người demo.
