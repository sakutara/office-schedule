# Business Requirement — EPIC-03: Lịch Tháng Tương Tác, Dropdown Đổi Trạng Thái & Kịch Bản Tương Lai

* **Mã Epic:** EPIC-03
* **Tên Epic:** Lịch Tháng Tương Tác, Dropdown Đổi Trạng Thái & Kịch Bản Tương Lai
* **Trạng thái:** Đã triển khai (Implemented)
* **Liên kết Tài liệu Chung:** [BR-MASTER](../../BR-MASTER.md) | [SA-MASTER](../../SA-MASTER.md)

---

## 1. Mục tiêu Nghiệp vụ (Business Objective)
Cung cấp Tab xem lịch tháng với thanh progress thu gọn, hiển thị trực quan trạng thái từng ngày bằng màu sắc chuẩn (Xám / Xanh / Cam), cho phép nhấn vào ngày làm việc để mở dropdown đổi trạng thái (Làm / Lên VP / Nghỉ phép), khóa chỉnh sửa ngày nghỉ/nghỉ lễ và hỗ trợ lập kịch bản chọn ngày lên văn phòng trong tương lai.

---

## 2. Danh sách Yêu cầu Nghiệp vụ Chi tiết (Functional Requirements & Acceptance Criteria)

### FR-03.1: Giao Diện Tab Xem Lịch & Mã Màu Trạng Thái Ngày
* **Mô tả:** Khi chuyển sang Tab xem lịch, thanh progress thu gọn lại và bên dưới hiển thị lưới lịch của tháng đang chọn.
* **Tiêu chí Nghiệm thu (Acceptance Criteria):**
  * **AC-1.1:** Thanh progress ở đầu trang hiển thị ở dạng **rút gọn** (không hiển thị con số).
  * **AC-1.2:** Các ngày trong lịch hiển thị đúng mã màu theo tình trạng:
    * **Màu xám:** Ngày nghỉ cuối tuần, ngày nghỉ lễ Việt Nam, hoặc ngày nghỉ phép (`off` / `holiday` / `leave`).
    * **Màu xanh (Blue/Sky):** Ngày làm việc bình thường (`work`).
    * **Màu cam:** Ngày lên văn phòng (`office` — bao gồm cả ngày đã lên VP và ngày kịch bản sẽ lên VP trong tương lai).

### FR-03.2: Dropdown Chọn Lại Thông Tin Ngày & Bảo Vệ Ngày Nghỉ / Nghỉ Lễ
* **Mô tả:** Nhấn vào một ngày trên lịch để mở dropdown đổi trạng thái ngày.
* **Tiêu chí Nghiệm thu (Acceptance Criteria):**
  * **AC-2.1:** Không thể đổi trạng thái của ngày nghỉ trong tuần (`off`) hoặc ngày nghỉ lễ Việt Nam (`holiday`).
  * **AC-2.2:** Với các ngày làm việc hợp lệ, nhấn vào ngày sẽ hiển thị dropdown cho phép đổi qua lại giữa 3 trạng thái: **Làm (`work`)**, **Lên VP (`office`)**, và **Nghỉ phép (`leave`)**.

### FR-03.3: Tính Năng Kịch Bản — Chọn Ngày Lên VP Trong Tương Lai
* **Mô tả:** Người dùng có thể chọn các ngày làm việc trong tương lai (`date > today`) làm ngày dự kiến lên văn phòng.
* **Tiêu chí Nghiệm thu (Acceptance Criteria):**
  * **AC-3.1:** Mọi ngày trong tương lai được chọn là **Lên VP** (hoặc bật qua bộ lập kịch bản tương lai) được tính vào chỉ số **"Số ngày sẽ lên VP (theo kịch bản)"** và hiển thị bằng dải **màu xanh lá nhạt** trên thanh progress.

---

## 3. Phạm vi Loại trừ (Out of Scope for EPIC-03)
* Tạo hồ sơ nhân viên mới (thuộc EPIC-01).

---

## 4. Tiêu chuẩn Chất lượng & Kiểm thử (Quality & Coverage Requirements)
* Toàn bộ mã nguồn thuộc `EPIC-03` phải đạt **$\ge 90\%$ coverage** trên cả 4 chỉ số (`lines`, `statements`, `functions`, `branches`).
