# ADR-002: Thiết kế Hồ sơ Loại Nhân Viên 5 Thông Tin, Lịch 7 Ngày & Máy Trạng Thái Cảnh Báo KPI

* **Trạng thái:** Đã chấp thuận (Accepted)
* **Ngày tạo:** 2026-10-21
* **Liên quan đến:** [BR-MASTER](../BR-MASTER.md), [SA-MASTER](../SA-MASTER.md), [SA-EPIC-01](../epics/epic-01-employee-profiles-and-schedule/SA-EPIC-01.md), [SA-EPIC-02](../epics/epic-02-attendance-and-progress-bar/SA-EPIC-02.md)

## 1. Bối cảnh (Context)
Hệ thống cần quản lý "Loại nhân viên" dạng hồ sơ với 2 hồ sơ mặc định ("Nhân viên NAB" - tháng - 36% và "Quản lý NAB" - tháng - 55%), cho phép tạo mới với 5 thông tin, chỉnh cấu hình 7 ngày trong tuần (xám: nghỉ, vàng: làm, xanh lá: lên VP) và điều khiển màu sắc/nội dung nút "Lên văn phòng" ở Tab chính theo mức độ khẩn cấp của KPI.

## 2. Quyết định (Decision)
1. **Mô hình `EmployeeProfile` (5 thuộc tính)**:
   * `name`: Tên nhu cầu (`string`)
   * `calculationMethod`: Phương pháp tính (`'monthly' | 'weekly'`)
   * `minRequirementPercent`: Yêu cầu tối thiểu (`number`, từ 0 đến 100)
   * `weeklySchedule`: Cấu hình 7 ngày (`Record<DayOfWeekIndex, WeekdaySettingState>` với `'off' | 'work' | 'office'`, mặc định T2–T6 là `'work'`, T7–CN là `'off'`)
   * `note`: Ghi chú / mô tả quy tắc (`string`)
2. **Công thức tính số ngày cần lên VP (`requiredDays`)**:
   * Số ngày làm việc thực tế cần tính KPI = `max(0, workingDaysInMonth - leaveDaysCount)` (các ngày nghỉ phép hợp lệ nằm trong ngày làm việc sẽ được trừ khỏi mẫu số ngày làm việc của tháng).
   * Với phương pháp `'monthly'`: `Math.ceil(effectiveWorkingDays * (minRequirementPercent / 100))`.
   * Với phương pháp `'weekly'`: Tính tỷ lệ theo tuần quy đổi ra số ngày làm việc thực tế trong tháng `Math.ceil((effectiveWorkingDays / workingDaysPerWeek) * Math.ceil(workingDaysPerWeek * (minRequirementPercent / 100)))` (hoặc tương đương theo tuần).
3. **Máy trạng thái nút "Lên văn phòng" (`MainButtonAlertState`)**:
   * Gọi `remainingRequired = max(0, requiredDays - attendedDays)` và `remainingWorkDays` là số ngày làm việc còn lại trong tháng (từ hôm nay đến cuối tháng chưa được đánh dấu lên VP hoặc nghỉ phép).
   * Nếu `remainingRequired > remainingWorkDays` $\rightarrow$ **`danger` (Màu đỏ)**: Báo động không đủ ngày làm việc còn lại để đạt KPI.
   * Ngược lại, nếu `remainingRequired > 0 && remainingRequired === remainingWorkDays` $\rightarrow$ **`warning` (Màu cam)**: Cảnh báo phải lên VP toàn bộ số ngày làm việc còn lại.
   * Ngược lại, nếu hôm nay có cấu hình thứ trong tuần là `'office'` (ngày ưu tiên) $\rightarrow$ **`priority` (Màu xanh lá sẫm)**: Nội dung khuyến khích lên VP.
   * Ngược lại $\rightarrow$ **`normal` (Màu xanh lá)**: Trạng thái bình thường.

## 3. Lý do lựa chọn (Rationale)
* Đảm bảo tính nhất quán toán học giữa cấu hình 7 ngày, lịch nghỉ lễ, ngày nghỉ phép cá nhân, thanh tiến độ trên cùng và trạng thái cảnh báo của nút chính.

## 4. Hệ quả (Consequences)
* **Tích cực:** Mọi logic tính toán nằm trong các hàm thuần tại `src/domains/office/officeEngine.ts`, dễ dàng kiểm thử mọi trường hợp biên.
* **Đánh đổi & Giải pháp giảm thiểu:** Không có.
