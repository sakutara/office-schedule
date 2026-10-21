# ADR-001: Kiến trúc PWA Offline-First & Cơ chế Truy vấn / Cache 30 Ngày Lịch Nghỉ Lễ Việt Nam

* **Trạng thái:** Đã chấp thuận (Accepted)
* **Ngày tạo:** 2026-10-21
* **Liên quan đến:** [BR-MASTER](../BR-MASTER.md), [SA-MASTER](../SA-MASTER.md), [SA-EPIC-01](../epics/epic-01-employee-profiles-and-schedule/SA-EPIC-01.md)

## 1. Bối cảnh (Context)
Ứng dụng yêu cầu:
1. Chạy hoàn toàn offline như một PWA SPA.
2. Khi chọn tháng (ở tab Xem lịch) hoặc đến tháng hiện tại, tính số ngày làm việc trong tháng dựa trên cấu hình ngày làm việc trong tuần của loại nhân viên trừ đi các ngày nghỉ lễ của Việt Nam bằng cách truy vấn thông tin nghỉ lễ.
3. Giá trị số ngày làm việc của tháng chỉ đo **1 lần** và lưu lại cho tháng đó; chỉ đo lại khi: (a) giá trị bị mất, (b) thông tin ngày làm việc trong tuần thay đổi, hoặc (c) thông tin quá cũ (lần đo cuối hơn 30 ngày).

## 2. Quyết định (Decision)
1. Sử dụng `vite-plugin-pwa` (`injectManifest`) để đóng gói Service Worker precache toàn bộ tài nguyên tĩnh và xuất bản trực tiếp ra thư mục `docs/`.
2. Xây dựng `holidayService.ts` kết hợp truy vấn API ngày lễ công khai (`https://date.nager.at/api/v3/PublicHolidays/{year}/VN`) với cơ sở dữ liệu lịch lễ Việt Nam tích hợp sẵn (`vietnamHolidays.ts` bao gồm Tết Dương lịch, Tết Nguyên Đán, Giỗ Tổ Hùng Vương 10/3 ÂL, 30/4, 1/5, Quốc khánh 2/9) để đảm bảo kết quả chính xác tuyệt đối ngay cả khi người dùng mở app lần đầu ở chế độ offline.
3. Lưu trữ bản ghi `MonthlyMeasurementCache` theo khóa tháng `YYYY-MM` trong `LocalStorage` gồm: `workingDaysCount`, `holidays`, `weeklyScheduleHash` (chuỗi băm cấu hình 7 ngày trong tuần) và `measuredAt` (epoch ms). Hàm `shouldRemeasureMonth` kiểm tra đúng 3 điều kiện: thiếu bản ghi, lệch `weeklyScheduleHash`, hoặc `now - measuredAt > 30 * 86400 * 1000`.

## 3. Lý do lựa chọn (Rationale)
* Đáp ứng chính xác yêu cầu nghiệp vụ về truy vấn ngày lễ và cache 30 ngày.
* Không phụ thuộc cứng vào kết nối mạng nhờ dữ liệu lịch lễ Âm/Dương Việt Nam nội bộ.
* Tách biệt hoàn toàn hàm thuần kiểm tra cache trong `src/domains/office/` và I/O mạng trong `src/services/holidayService.ts`, giúp kiểm thử tự động đạt 100% nhánh.

## 4. Hệ quả (Consequences)
* **Tích cực:** Tốc độ chuyển tháng tức thì (0ms khi dùng cache), hoạt động 100% offline, tự động cập nhật ngay khi người dùng đổi màu ngày làm việc trong Cài đặt.
* **Đánh đổi & Giải pháp giảm thiểu:** Cần cập nhật bảng ngày lễ Âm lịch dự phòng cho nhiều năm (đã tích hợp sẵn 2024–2030 và quy tắc lễ cố định hàng năm).
