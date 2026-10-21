# Business Requirement — EPIC-01: Hồ sơ Loại Nhân Viên, Cấu hình 7 Ngày & Bộ tính Ngày làm việc / Nghỉ lễ VN

* **Mã Epic:** EPIC-01
* **Tên Epic:** Hồ sơ Loại Nhân Viên, Cấu hình 7 Ngày & Bộ tính Ngày làm việc / Nghỉ lễ VN
* **Trạng thái:** Đã triển khai (Implemented)
* **Liên kết Tài liệu Chung:** [BR-MASTER](../../BR-MASTER.md) | [SA-MASTER](../../SA-MASTER.md)

---

## 1. Mục tiêu Nghiệp vụ (Business Objective)
Cung cấp cơ chế quản lý hồ sơ "Loại nhân viên" (mặc định 2 hồ sơ NAB và cho phép tạo mới với 5 thông tin), giao diện chỉnh cấu hình 7 ngày trong tuần tại phần Cài đặt, cùng bộ tính số ngày làm việc trong tháng có trừ ngày nghỉ lễ Việt Nam với cơ chế lưu đệm (cache) thông minh 30 ngày.

---

## 2. Danh sách Yêu cầu Nghiệp vụ Chi tiết (Functional Requirements & Acceptance Criteria)

### FR-01.1: Quản lý Hồ sơ "Loại nhân viên" (5 thông tin) & 2 Hồ sơ Mặc định
* **Mô tả:** Người dùng có thể xem, chuyển đổi và tạo mới hồ sơ "Loại nhân viên" trong phần Cài đặt (`Settings`).
* **Tiêu chí Nghiệm thu (Acceptance Criteria):**
  * **AC-1.1:** Mặc định hệ thống khởi tạo sẵn 2 hồ sơ:
    1. `"Nhân viên NAB"`: Phương pháp tính theo tháng (`monthly`), yêu cầu tối thiểu `36%`.
    2. `"Quản lý NAB"`: Phương pháp tính theo tháng (`monthly`), yêu cầu tối thiểu `55%`.
  * **AC-1.2:** Mỗi hồ sơ gồm đúng 5 thông tin: (1) Tên nhu cầu, (2) Phương pháp tính (theo tuần / theo tháng), (3) Yêu cầu tối thiểu (`x%`), (4) Cấu hình 7 ngày trong tuần, (5) Ghi chú / mô tả.
  * **AC-1.3:** Cho phép tạo mới hồ sơ tùy chỉnh và chuyển đổi hồ sơ đang kích hoạt ngay trong phần Cài đặt, lưu bền vững vào bộ nhớ cục bộ (Offline Persistence).

### FR-01.2: Tính năng Chỉnh 7 Ngày trong Tuần (Settings)
* **Mô tả:** Hiển thị giao diện 7 ngày trong tuần tại phần Cài đặt; nhấn vào từng ngày để đổi màu và trạng thái.
* **Tiêu chí Nghiệm thu (Acceptance Criteria):**
  * **AC-2.1:** Mặc định Thứ 2 đến Thứ 6 là ngày làm việc (`work` - màu vàng), Thứ 7 và Chủ nhật là ngày nghỉ (`off` - màu xám), không mặc định ngày ưu tiên lên văn phòng.
  * **AC-2.2:** Nhấn vào một ngày sẽ chuyển đổi xoay vòng trạng thái và màu sắc: **Màu xám** (ngày nghỉ - `off`) $\rightarrow$ **Màu vàng** (ngày làm - `work`) $\rightarrow$ **Màu xanh lá** (ngày lên VP ưu tiên - `office`).

### FR-01.3: Đo & Lưu đệm Số Ngày Làm Việc trong Tháng trừ Ngày Nghỉ Lễ Việt Nam
* **Mô tả:** Khi chọn tháng hoặc đến tháng hiện tại, tính số ngày làm việc trong tháng (theo số ngày làm việc trong tuần của loại nhân viên trừ ngày nghỉ lễ của Việt Nam) bằng cách truy vấn thông tin nghỉ lễ và tính số ngày cần lên VP.
* **Tiêu chí Nghiệm thu (Acceptance Criteria):**
  * **AC-3.1:** Truy vấn ngày nghỉ lễ Việt Nam (hỗ trợ API kèm dữ liệu lịch lễ Việt Nam tích hợp sẵn để hoạt động 100% offline) và trừ các ngày lễ rơi vào ngày làm việc trong tuần.
  * **AC-3.2 (Quy tắc Cache 1 lần / 30 ngày):** Giá trị số ngày làm việc chỉ đo 1 lần và lưu lại cho tháng đó. Tự động đo lại khi: (1) giá trị bị mất, (2) cấu hình ngày làm việc trong tuần thay đổi, hoặc (3) lần đo cuối đã quá 30 ngày.
  * **AC-3.3 (Song ngữ & Giao diện tối giản):** Hiển thị đầy đủ bằng Tiếng Việt (`vi`) và Tiếng Anh (`en`), gọn trong khung fluid `<= 1280px`.

---

## 3. Phạm vi Loại trừ (Out of Scope for EPIC-01)
* Giao diện nút check-in "Lên văn phòng" ở Tab chính và lưới lịch tháng ở Tab xem lịch (thuộc EPIC-02 và EPIC-03).

---

## 4. Tiêu chuẩn Chất lượng & Kiểm thử (Quality & Coverage Requirements)
* Toàn bộ mã nguồn thuộc `EPIC-01` phải có Unit Test và Integration Test đạt **$\ge 90\%$ coverage** trên cả 4 chỉ số (`lines`, `statements`, `functions`, `branches`) thông qua `npm run test:coverage`.
