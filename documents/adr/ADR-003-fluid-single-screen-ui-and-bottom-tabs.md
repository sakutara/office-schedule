# ADR-003: Giao diện Tối giản 1 Màn hình (`100dvh`), Thanh Progress 3 Màu & Điều hướng Swipe Bottom Tab

* **Trạng thái:** Đã chấp thuận (Accepted)
* **Ngày tạo:** 2026-10-21
* **Liên quan đến:** [BR-MASTER](../BR-MASTER.md), [SA-MASTER](../SA-MASTER.md), [SA-EPIC-02](../epics/epic-02-attendance-and-progress-bar/SA-EPIC-02.md), [SA-EPIC-03](../epics/epic-03-calendar-and-scenario-planning/SA-EPIC-03.md)

## 1. Bối cảnh (Context)
Giao diện ứng dụng cần:
1. Thanh progress luôn nằm trên cùng của app với 3 màu (xanh lá: đã lên VP, xanh lá nhạt: sẽ lên VP theo kịch bản, vàng: tổng số ngày cần lên), có bản đầy đủ (hiển thị cả 3 thông số) và bản rút gọn ở Tab xem lịch (không hiển thị số).
2. Tuân thủ chuẩn UI/UX tối giản: fluid responsive tới `1280px`, ưu tiên gọn trong 1 màn hình `100dvh`, tắt zoom, khóa bôi đen chữ (`user-select: none`), thanh tab ngang ở đáy app hỗ trợ quẹt ngang (swipe) trên vùng trống, và hỗ trợ song ngữ Việt/Anh (`vi`/`en`).

## 2. Quyết định (Decision)
1. **Cấu trúc Khung Ứng Dụng (`App.tsx`)**:
   * Đặt `TopProgressBar` cố định ngay dưới thanh tiêu đề mỏng ở đỉnh ứng dụng. Khi `activeTab === 'calendar'`, truyền `compact={true}` để ẩn toàn bộ con số và thu gọn chiều cao thanh progress.
   * Khu vực nội dung chính (`main`) nhận sự kiện `onTouchStart`/`onTouchEnd` và `onPointerDown`/`onPointerUp`, sử dụng `isBlankSwipeTarget` và `resolveNextTabIndex` để chuyển đổi mượt mà giữa 3 tab (`main`, `calendar`, `settings`).
2. **Dropdown chọn trạng thái ngày trên Lịch (`CalendarTab.tsx`)**:
   * Khi nhấn vào một ngày trên lịch, nếu ngày đó là ngày nghỉ cuối tuần hoặc ngày lễ Việt Nam thì khóa không cho đổi. Nếu là ngày làm việc, hiển thị popover/dropdown ngay trên giao diện để chọn giữa 3 trạng thái: **Làm việc (Xanh)**, **Lên VP (Cam)**, **Nghỉ phép (Xám)**. Nếu ngày được chọn làm **Lên VP** nằm ở tương lai (`date > today`), hệ thống tự động tính ngày đó vào **số ngày sẽ lên VP theo kịch bản** (màu xanh lá nhạt trên thanh progress).

## 3. Lý do lựa chọn (Rationale)
* Giữ trải nghiệm người dùng tự nhiên, gọn trong một màn hình điện thoại không cần cuộn trang, đồng thời kết nối trực tiếp thao tác chọn ngày tương lai trên lịch với tính năng Kịch bản (Scenario).

## 4. Hệ quả (Consequences)
* **Tích cực:** Giao diện đồng nhất, trực quan, dễ thao tác bằng một tay trên thiết bị di động và kiểm thử tự động dễ dàng qua `aria-label` và `data-testid`.
* **Đánh đổi & Giải pháp giảm thiểu:** Không có.
