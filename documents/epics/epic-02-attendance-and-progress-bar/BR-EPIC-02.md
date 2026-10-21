# Business Requirement — EPIC-02: Thanh Progress 3 Thông số & Tab Chính Đánh dấu Lên VP / Nghỉ phép

* **Mã Epic:** EPIC-02
* **Tên Epic:** Thanh Progress 3 Thông số & Tab Chính Đánh dấu Lên VP / Nghỉ phép
* **Trạng thái:** Đã triển khai (Implemented)
* **Liên kết Tài liệu Chung:** [BR-MASTER](../../BR-MASTER.md) | [SA-MASTER](../../SA-MASTER.md)

---

## 1. Mục tiêu Nghiệp vụ (Business Objective)
Hiển thị thanh tiến độ (Progress Bar) luôn cố định ở trên cùng của ứng dụng với 3 màu thông số trực quan (đầy đủ và rút gọn), đồng thời cung cấp Tab chính giúp người dùng đánh dấu nhanh 1 ngày lên văn phòng hoặc 1 ngày nghỉ phép với hệ thống cảnh báo màu sắc theo thời gian thực.

---

## 2. Danh sách Yêu cầu Nghiệp vụ Chi tiết (Functional Requirements & Acceptance Criteria)

### FR-02.1: Thanh Progress Luôn Nằm Trên Cùng Của App
* **Mô tả:** Thanh progress hiển thị tiến độ lên văn phòng của tháng đang xét ở đầu giao diện.
* **Tiêu chí Nghiệm thu (Acceptance Criteria):**
  * **AC-1.1 (3 Dải màu):**
    * **Màu xanh lá:** Hiển thị số ngày đã lên văn phòng (`attendedDays`).
    * **Màu xanh lá nhạt:** Hiển thị số ngày sẽ lên văn phòng theo kịch bản (`scenarioDays`).
    * **Màu vàng:** Hiển thị tổng số ngày cần lên văn phòng (`requiredDays`).
  * **AC-1.2 (2 Chế độ hiển thị):**
    * **Bản đầy đủ (Tab chính & Cài đặt):** Hiển thị rõ cả 3 thông số bằng con số và thanh màu.
    * **Bản rút gọn (Tab xem lịch):** Không hiển thị con số, chỉ hiển thị thanh màu thu gọn.

### FR-02.2: Tab Chính — Nút "Lên văn phòng" 4 Trạng Thái & Nút "Nghỉ phép"
* **Mô tả:** Tab chính cho phép đánh dấu ngày hiện tại là có lên văn phòng hoặc nghỉ phép, đồng thời thể hiện mức độ ưu tiên/cảnh báo trên nút "Lên văn phòng".
* **Tiêu chí Nghiệm thu (Acceptance Criteria):**
  * **AC-2.1 (Nút bình thường - Xanh lá):** Ở trạng thái tiêu chuẩn, nút "Lên văn phòng" có màu xanh lá.
  * **AC-2.2 (Ngày ưu tiên - Xanh lá sẫm):** Nếu hôm nay là ngày ưu tiên lên VP trong cấu hình tuần, nút chuyển sang màu xanh lá sẫm kèm nội dung khuyến khích.
  * **AC-2.3 (Cảnh báo sát nút - Màu cam):** Nếu số ngày cần lên VP còn thiếu bằng đúng số ngày làm việc còn lại trong tháng (`remainingRequired === remainingWorkDays`), nút hiện màu cam cảnh báo kèm nội dung cảnh cáo.
  * **AC-2.4 (Báo động thiếu ngày - Màu đỏ):** Nếu số ngày cần lên VP còn thiếu nhiều hơn số ngày làm việc còn lại trong tháng (`remainingRequired > remainingWorkDays`), nút hiện màu đỏ báo động.
  * **AC-2.5 (Nút Nghỉ phép):** Hiển thị nút "Nghỉ phép" màu trắng nhỏ hơn ở ngay bên dưới nút "Lên văn phòng".

---

## 3. Phạm vi Loại trừ (Out of Scope for EPIC-02)
* Chế độ lưới lịch tháng và dropdown chỉnh từng ngày trên lịch (thuộc EPIC-03).

---

## 4. Tiêu chuẩn Chất lượng & Kiểm thử (Quality & Coverage Requirements)
* Toàn bộ mã nguồn thuộc `EPIC-02` phải đạt **$\ge 90\%$ coverage** trên cả 4 chỉ số (`lines`, `statements`, `functions`, `branches`).
