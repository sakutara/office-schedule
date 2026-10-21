# ADR-004: Nhắc Lên Văn Phòng Hằng Ngày Qua Thông Báo Trình Duyệt (Notification API) Thay Vì Web Push Có Backend

* **Trạng thái:** Đã chấp thuận (Accepted)
* **Ngày tạo:** 2026-10-21
* **Liên quan đến:** [BR-MASTER](../BR-MASTER.md), [SA-MASTER](../SA-MASTER.md), [ADR-001](./ADR-001-local-first-pwa-and-holiday-cache.md), [BR-EPIC-04](../epics/epic-04-vp-reminder-notifications/BR-EPIC-04.md), [SA-EPIC-04](../epics/epic-04-vp-reminder-notifications/SA-EPIC-04.md)

## 1. Bối cảnh (Context)
EPIC-04 yêu cầu nhắc người dùng lúc 7:00 sáng mỗi ngày khi có nghĩa vụ lên văn phòng. Ứng dụng hiện là PWA tĩnh (Offline-First, [ADR-001](./ADR-001-local-first-pwa-and-holiday-cache.md)): toàn bộ dữ liệu nằm trong `localStorage`, không có máy chủ và không có tài khoản người dùng. Web Push thật (gửi khi app đã đóng) cần máy chủ lưu push subscription, khóa VAPID và một tác vụ định kỳ để gửi, tức là phá vỡ mô hình local-first và kéo theo chi phí hạ tầng cùng vấn đề quyền riêng tư dữ liệu.

## 2. Quyết định (Decision)
1. **Không thêm backend.** Thông báo được hiển thị từ chính trình duyệt/PWA thông qua `ServiceWorkerRegistration.showNotification()` (fallback `new Notification()` khi không có service worker).
2. **Lập lịch phía client:** `App.tsx` kiểm tra mỗi 60 giây và khi tab/app trở lại foreground (`visibilitychange`). Khi `now >= 07:00` (giờ địa phương) và chưa có lần đánh giá trong ngày, ứng dụng đánh giá điều kiện nhắc một lần rồi ghi ngày đó vào `localStorage` (`office_tracker_vp_reminder_last_date`). Nhờ đó mỗi ngày chỉ có tối đa một lần đánh giá và một thông báo.
3. **Logic thuần trong domain:** điều kiện nhắc được tính bằng `buildMonthCalendarDays` và `calculateMonthlyProgress` của `officeEngine.ts` (`src/domains/office/vpReminder.ts`), nên luôn khớp với nút trạng thái trên Tab chính.
4. **Quyền thông báo phải đến từ thao tác người dùng:** nút bật nhắc trong Cài đặt gọi `Notification.requestPermission()`. Trạng thái bật/tắt lưu trong `localStorage`; quyền do trình duyệt quản lý.
5. **Không gửi vào cuối tuần, ngày lễ, ngày nghỉ phép hoặc ngày đã xác nhận lên VP.** Mỗi ngày chỉ có một thông báo, nội dung theo lý do ưu tiên: chỉ tiêu có nguy cơ → ngày dự kiến → ngày ưu tiên.

## 3. Phương án đã cân nhắc (Alternatives)
* **Web Push có máy chủ (VAPID + cron):** cho phép nhắc đúng 7:00 kể cả khi app đóng hoàn toàn, nhưng cần hạ tầng, khóa, lưu subscription và quyết định nơi host. Chưa được chọn vì ngoài phạm vi và chưa có quyết định về hạ tầng; có thể bổ sung sau và sẽ thay thế ADR này.
* **Periodic Background Sync / Notification Triggers:** không được hỗ trợ rộng rãi (chủ yếu Chromium), không đáng tin cậy trên iOS, nên bị loại.

## 4. Hệ quả (Consequences)
* **Tích cực:** không cần backend, không gửi dữ liệu nhân sự ra ngoài, giữ nguyên mô hình Offline-First và chi phí bằng 0.
* **Đánh đổi:**
  * Thông báo **chỉ xuất hiện khi app còn đang chạy hoặc còn tồn tại trong nền**. Nếu app đã đóng hoàn toàn lúc 7:00, thông báo sẽ không hiện; khi mở app trong ngày, nếu điều kiện đúng thì thông báo của ngày đó vẫn được gửi một lần.
  * Trên iOS, thông báo chỉ hoạt động khi PWA đã được thêm vào màn hình chính (standalone) và đã cấp quyền.
  * Nếu cần đảm bảo gửi đúng 7:00 khi app đóng, cần một ADR mới về Web Push có backend.
* **Giảm thiểu:** nút Cài đặt hiển thị rõ trạng thái `bị chặn` / `không hỗ trợ` để người dùng biết vì sao không nhận được thông báo.
