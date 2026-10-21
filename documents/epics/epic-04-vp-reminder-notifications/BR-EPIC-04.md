# Business Requirement — EPIC-04: Nhắc Lên Văn Phòng Hằng Ngày

* **Mã Epic:** EPIC-04
* **Tên Epic:** Nhắc Lên Văn Phòng Hằng Ngày
* **Trạng thái:** Đã triển khai (Implemented)
* **Liên kết Tài liệu Chung:** [BR-MASTER](../../BR-MASTER.md) | [SA-MASTER](../../SA-MASTER.md) | [ADR-004](../../adr/ADR-004-daily-vp-reminder-notifications.md)

---

## 1. Mục tiêu Nghiệp vụ (Business Objective)
Giúp người dùng không quên lên văn phòng đúng kế hoạch và đủ chỉ tiêu tháng bằng một thông báo buổi sáng, chỉ gửi khi hôm nay thực sự có thể lên văn phòng hoặc khi việc bỏ lỡ hôm nay có nguy cơ làm thiếu chỉ tiêu.

---

## 2. Danh sách Yêu cầu Nghiệp vụ Chi tiết (Functional Requirements & Acceptance Criteria)

### FR-04.1: Bật / Tắt Nhắc Lên VP trong Cài đặt
* **Mô tả:** Người dùng bật hoặc tắt nhắc lên VP trong Tab Cài đặt. Việc bật yêu cầu cấp quyền thông báo của trình duyệt.
* **Tiêu chí Nghiệm thu (Acceptance Criteria):**
  * **AC-1.1:** Nút "Bật nhắc lên VP" chỉ xin quyền thông báo khi người dùng bấm (thao tác trực tiếp).
  * **AC-1.2:** Sau khi cấp quyền, nút hiển thị trạng thái "Đang bật"; tắt thì trở lại "Bật nhắc lên VP".
  * **AC-1.3:** Nếu quyền bị chặn, hiển thị thông báo bị chặn trong cài đặt trình duyệt và vô hiệu hóa nút.
  * **AC-1.4:** Nếu thiết bị/trình duyệt không hỗ trợ thông báo, hiển thị thông báo không hỗ trợ và vô hiệu hóa nút.
  * **AC-1.5:** Mọi chuỗi giao diện và nội dung thông báo có đủ tiếng Việt (`vi`) và tiếng Anh (`en`).

### FR-04.2: Thời Điểm & Tần Suất Nhắc
* **Mô tả:** Khi đã bật, ứng dụng đánh giá điều kiện nhắc một lần mỗi ngày lúc 7:00 sáng (giờ địa phương).
* **Tiêu chí Nghiệm thu (Acceptance Criteria):**
  * **AC-2.1:** Trước 7:00 sáng không gửi thông báo nào.
  * **AC-2.2:** Từ 7:00 sáng, mỗi ngày chỉ đánh giá và gửi tối đa **một** thông báo, kể cả khi có nhiều lý do cùng đúng.
  * **AC-2.3:** Nếu mở app sau 7:00 sáng và điều kiện đúng, thông báo của ngày đó vẫn được gửi đúng một lần.
  * **AC-2.4:** Sau khi đã đánh giá trong ngày, không nhắc lại trong cùng ngày dù trạng thái thay đổi sau đó.

### FR-04.3: Điều Kiện Nhắc
* **Mô tả:** Chỉ nhắc khi hôm nay là ngày có thể lên văn phòng (ngày làm việc chưa xác nhận hoặc ngày đã dự kiến lên VP). Có ba lý do hợp lệ:
  1. **Nguy cơ thiếu chỉ tiêu (`quota-at-risk`):** từ hôm nay đến cuối tháng, nếu không lên VP liên tục thì sẽ thiếu chỉ tiêu (số ngày còn thiếu > 0 và ≥ số ngày làm việc còn lại).
  2. **Ngày dự kiến (`planned-today`):** hôm nay đã được đánh dấu dự kiến lên VP.
  3. **Ngày ưu tiên chưa đủ (`priority-quota-open`):** hôm nay là ngày ưu tiên lên VP trong cấu hình tuần và số ngày còn thiếu > 0.
* **Tiêu chí Nghiệm thu (Acceptance Criteria):**
  * **AC-3.1:** Không gửi vào cuối tuần, ngày lễ Việt Nam, ngày nghỉ phép, hoặc ngày đã xác nhận lên VP (kể cả khi điều kiện nguy cơ đúng).
  * **AC-3.2:** Nếu có nhiều lý do cùng đúng, nội dung thông báo chọn theo thứ tự: nguy cơ thiếu chỉ tiêu → ngày dự kiến → ngày ưu tiên.
  * **AC-3.3:** Không có lý do nào đúng thì không gửi thông báo.

---

## 3. Phạm vi Loại trừ (Out of Scope for EPIC-04)
* Gửi thông báo khi app đã đóng hoàn toàn (cần máy chủ Web Push; xem [ADR-004](../../adr/ADR-004-daily-vp-reminder-notifications.md)).
* Nhắc nhiều lần trong ngày, nhắc theo giờ tùy chỉnh, nhắc qua email/SMS.

---

## 4. Tiêu chuẩn Chất lượng & Kiểm thử (Quality & Coverage Requirements)
* Toàn bộ mã nguồn thuộc `EPIC-04` phải đạt **$\ge 90\%$ coverage** trên cả 4 chỉ số (`lines`, `statements`, `functions`, `branches`).
* Các AC phải có test tự động tương ứng (xem [SA-EPIC-04](./SA-EPIC-04.md) mục 3).
