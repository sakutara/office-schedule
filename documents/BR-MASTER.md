# Master Business Requirements (BR-MASTER)
**Dự án / Project:** Office Tracker — Ứng dụng Quản lý Lên Văn Phòng Cá Nhân  
**Phiên bản / Version:** 1.0.0  
**Trạng thái / Status:** Đã triển khai (Implemented)  
**Cập nhật lần cuối / Last Updated:** 2026-10-21  

---

## 1. Tầm nhìn & Mục tiêu Sản phẩm (Product Vision)
**Office Tracker** là ứng dụng **Bilingual (VI/EN) Offline-First PWA SPA** giúp nhân viên và quản lý (đặc biệt là mô hình Hybrid Working như NAB) theo dõi tiến độ lên văn phòng cá nhân, quản lý ngày nghỉ phép, lập kịch bản lên văn phòng trong tương lai và tự động tính toán số ngày làm việc/chỉ tiêu tối thiểu mỗi tháng có trừ các ngày nghỉ lễ Việt Nam. Giao diện tuân thủ triết lý **Minimalist Icon-Driven Single-Screen Mobile-First UI** (`100dvh`, fluid tới `1280px`).

---

## 2. Quy trình Phát triển & Quản trị Chất lượng (SDD + TDD Governance)
Dự án tuân thủ nghiêm ngặt quy trình **Epic $\rightarrow$ BR (Business Requirement) $\rightarrow$ SA (Solution Architect + ADR) $\rightarrow$ Test $\rightarrow$ Code**:
1. **Tài liệu Trung tâm (`documents/`):**
   * `documents/BR-MASTER.md`: Phản ánh toàn bộ yêu cầu nghiệp vụ và trạng thái hiện hành của hệ thống.
   * `documents/SA-MASTER.md`: Phản ánh kiến trúc kỹ thuật tổng thể hiện hành của hệ thống.
   * `documents/adr/ADR-xxx-*.md`: Lưu vết mọi quyết định và thay đổi ở cấp độ Solution Architecture.
   * `documents/skills/sdd-tdd-pwa-webapp/`: Bản sao của skill SDD+TDD dùng để xây dựng và vận hành dự án.
2. **Phát triển theo Epic:**
   * Mỗi Epic có đúng 1 file `BR-EPIC-xx.md` và 1 file `SA-EPIC-xx.md` riêng biệt trong `documents/epics/epic-xx-*/`, chỉ mô tả phạm vi của Epic đó.
3. **Song ngữ Anh/Việt (Bilingual EN/VI) & Giao diện Tối giản:**
   * Hỗ trợ chuyển đổi tức thì giữa Tiếng Việt (`vi`) và Tiếng Anh (`en`) cả khi offline.
   * Fluid responsive ưu tiên mobile (thu gọn trong 1 màn hình `100dvh` nếu khả thi) và scale lên đến `1280px` trên desktop; dùng icon hỗ trợ trực quan; tắt zoom; thanh horizontal tab ở đáy app hỗ trợ swipe qua lại trên vùng trống; khóa bôi đen chữ (`user-select: none`) trừ ô nhập liệu/CTA.
4. **Cam kết Chất lượng Kiểm thử (Test Coverage Gate $\ge 90\%$) & Build Tự động (`docs/`):**
   * Code coverage tự động bắt buộc đạt **$\ge 90\%$** (Lines, Statements, Functions, Branches).
   * Tích hợp Git hook `after-merge` (`post-merge`) tự động chạy `npm run build` xuất bản build production vào thư mục `docs/` ngay sau khi merge vào nhánh `main`.

---

## 3. Các Trụ cột Tính năng Cốt lõi (Core Functional Pillars)

### 3.1 Trụ cột 1: Hồ sơ "Loại nhân viên" (5 thông tin) & Cấu hình 7 Ngày trong Tuần (EPIC-01)
* Quản lý danh sách hồ sơ **Loại nhân viên** trong phần Cài đặt (`Settings`).
* Mặc định tích hợp sẵn 2 hồ sơ:
  1. **"Nhân viên NAB"**: tính theo tháng (`monthly`), yêu cầu tối thiểu `36%`, mặc định Thứ 2–Thứ 6 làm việc, Thứ 7–CN nghỉ.
  2. **"Quản lý NAB"**: tính theo tháng (`monthly`), yêu cầu tối thiểu `55%`, mặc định Thứ 2–Thứ 6 làm việc, Thứ 7–CN nghỉ.
* Cho phép tạo mới hồ sơ với đủ **5 thông tin**: (1) Tên nhu cầu, (2) Phương pháp tính (Theo tuần / Theo tháng), (3) Yêu cầu tối thiểu (`x%`), (4) Cấu hình 7 ngày trong tuần, (5) Ghi chú / Mô tả quy tắc.
* **Tính năng chỉnh ngày (7 ngày trong Cài đặt)**: Hiển thị 7 ngày (T2–CN), nhấn vào ngày để đổi màu và trạng thái xoay vòng:
  * **Màu xám (`off`)**: Ngày nghỉ
  * **Màu vàng (`work`)**: Ngày làm việc
  * **Màu xanh lá (`office`)**: Ngày ưu tiên lên văn phòng
* **Đo và lưu đệm số ngày làm việc trong tháng & Ngày lễ Việt Nam**:
  * Khi đến tháng hiện tại hoặc chọn tháng trên lịch, hệ thống tính số ngày làm việc trong tháng = (số ngày trong tháng thuộc ngày làm việc của hồ sơ) trừ đi (ngày nghỉ lễ của Việt Nam rơi vào ngày làm việc) thông qua truy vấn thông tin nghỉ lễ (API kèm dữ liệu lịch lễ Dương/Âm lịch Việt Nam tích hợp sẵn để chạy offline).
  * Giá trị chỉ đo **1 lần và lưu lại cho tháng đó**, tự động đo lại khi: (a) giá trị bị mất, (b) thông tin ngày làm việc trong tuần thay đổi, hoặc (c) thông tin quá cũ (lần đo cuối cách hiện tại hơn 30 ngày).

### 3.2 Trụ cột 2: Thanh Progress Đầu Trang & Tab Chính Đánh dấu Lên VP / Nghỉ phép (EPIC-02)
* **Thanh Progress luôn nằm trên cùng của app**:
  * **Màu xanh lá**: Số ngày đã lên văn phòng (`attendedDays`).
  * **Màu xanh lá nhạt**: Số ngày sẽ lên văn phòng theo kịch bản (`scenarioDays`).
  * **Màu vàng**: Tổng số ngày cần lên văn phòng (`requiredDays`).
  * Hỗ trợ 2 chế độ: **Bản đầy đủ** (hiển thị cả 3 thông số, dùng ở Tab chính & Cài đặt) và **Bản rút gọn** (không hiển thị số, dùng ở Tab xem lịch).
* **Tab chính (Check-in & Cảnh báo thông minh)**:
  * Nút **"Lên văn phòng"** lớn ở trung tâm đổi màu và thông điệp theo ngữ cảnh:
    * **Màu xanh lá (Bình thường)**: Trạng thái tiêu chuẩn.
    * **Màu xanh lá sẫm (Ngày ưu tiên)**: Khi hôm nay là ngày ưu tiên lên VP trong cấu hình tuần, hiển thị nội dung khuyến khích.
    * **Màu cam cảnh báo (Cảnh cáo)**: Khi số ngày cần lên VP còn thiếu **bằng** số ngày làm việc còn lại trong tháng (`remainingRequired === remainingWorkDays`).
    * **Màu đỏ báo động**: Khi số ngày cần lên VP còn thiếu **nhiều hơn** số ngày làm việc còn lại trong tháng (`remainingRequired > remainingWorkDays`).
  * Nút **"Nghỉ phép"** màu trắng nhỏ hơn nằm ngay bên dưới để đánh dấu ngày nghỉ phép.

### 3.3 Trụ cột 3: Tab Xem Lịch Tháng, Chỉnh Trạng Thái Ngày & Kịch Bản Tương Lai (EPIC-03)
* **Tab xem lịch**:
  * Thanh progress ở đầu trang tự động chuyển sang **dạng thu gọn** (không hiển thị số).
  * Hiển thị lưới lịch tháng trực quan với màu sắc theo tình trạng ngày:
    * **Màu xám**: Ngày nghỉ cuối tuần / Nghỉ lễ VN / Nghỉ phép (`off` / `holiday` / `leave`).
    * **Màu xanh (Blue/Sky)**: Ngày làm việc (`work`).
    * **Màu cam**: Ngày lên văn phòng (`office` — bao gồm cả ngày đã lên VP và ngày chọn lên VP trong tương lai theo kịch bản).
  * **Dropdown chỉnh trạng thái ngày**: Nhấn vào một ngày trên lịch sẽ mở dropdown cho phép đổi qua lại giữa **Làm việc / Lên VP / Nghỉ phép**. Không cho phép đổi trạng thái của ngày nghỉ cuối tuần hoặc ngày nghỉ lễ Việt Nam.
  * **Tính năng kịch bản**: Cho phép chọn ngày lên VP trong tương lai (trực tiếp trên lịch hoặc qua bộ chọn kịch bản nhanh), tự động cập nhật phần màu xanh lá nhạt trên thanh progress.

---

## 4. Yêu cầu Phi chức năng (Non-Functional Requirements)

| Mã NFR | Hạng mục | Yêu cầu chi tiết |
| :--- | :--- | :--- |
| **NFR-01** | **Kiến trúc PWA & SPA** | Single Page Application có `manifest.webmanifest` và Service Worker, cài đặt được lên thiết bị. |
| **NFR-02** | **Hoạt động Offline 100%** | Sau lần tải đầu tiên, toàn bộ tính năng, lịch lễ Việt Nam và dữ liệu cục bộ hoạt động mượt mà khi ngắt kết nối Internet. |
| **NFR-03** | **Song ngữ Anh/Việt (EN/VI)** | Hỗ trợ đầy đủ Tiếng Việt (`vi`) và Tiếng Anh (`en`) trên toàn bộ giao diện, `aria-label` và luồng người dùng. |
| **NFR-04** | **Fluid Responsive & Single-Screen Minimalist UI** | Mobile-first fluid layout scale đến `1280px` cho desktop; giao diện gọn gàng không giải thích dài dòng; ưu tiên thu gọn trong 1 màn hình điện thoại (`100dvh`). |
| **NFR-05** | **Bottom Horizontal Tabs & Swipe Navigation** | Điều hướng chính dạng horizontal tab đặt dưới đáy app; hỗ trợ quẹt ngang (swipe) vào vùng trống của tab để chuyển qua lại giữa các tab. |
| **NFR-06** | **Khóa Zoom & Khóa Select Chữ** | Tắt hoàn toàn khả năng zoom (`user-scalable=no`); toàn bộ chữ không select được (`user-select: none`) trừ các phần tử CTA/editable (`input`, `textarea`, `[contenteditable]`, `[data-selectable="true"]`). |
| **NFR-07** | **Độ phủ Kiểm thử ($\ge 90\%$)** | Ngưỡng cứng $\ge 90\%$ trên cả 4 chỉ số: Lines, Statements, Functions, Branches. |
| **NFR-08** | **Tự động Build Prod sau Merge (`docs/`)** | Hook `after-merge` (`post-merge`) tự động build bản production vào `docs/` ngay khi merge vào `main`. |

---

## 5. Lộ trình & Trạng thái Các Epic (Epic Status Roadmap)

| Mã Epic | Tên Epic | Mô tả Phạm vi | Tài liệu BR / SA | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **EPIC-01** | Hồ sơ Loại Nhân Viên, Cấu hình 7 Ngày & Bộ tính Ngày làm việc / Nghỉ lễ VN | Quản lý 2 hồ sơ mặc định (Nhân viên NAB 36%, Quản lý NAB 55%), tạo mới hồ sơ 5 thông tin, chỉnh 7 ngày trong tuần, truy vấn & cache 30 ngày lịch nghỉ lễ VN | [BR-EPIC-01](epics/epic-01-employee-profiles-and-schedule/BR-EPIC-01.md) / [SA-EPIC-01](epics/epic-01-employee-profiles-and-schedule/SA-EPIC-01.md) | **Đã triển khai** |
| **EPIC-02** | Thanh Progress 3 Thông số & Tab Chính Đánh dấu Lên VP / Nghỉ phép | Thanh progress đầu trang (đầy đủ/thu gọn, 3 màu), nút Lên VP 4 trạng thái màu (xanh/xanh sẫm/cam/đỏ) và nút Nghỉ phép trắng | [BR-EPIC-02](epics/epic-02-attendance-and-progress-bar/BR-EPIC-02.md) / [SA-EPIC-02](epics/epic-02-attendance-and-progress-bar/SA-EPIC-02.md) | **Đã triển khai** |
| **EPIC-03** | Lịch Tháng Tương Tác, Dropdown Đổi Trạng Thái & Kịch Bản Tương Lai | Xem lịch tháng với mã màu (xám/xanh/cam), khóa ngày nghỉ/lễ, dropdown đổi Làm/Lên VP/Nghỉ phép và lập kịch bản tương lai | [BR-EPIC-03](epics/epic-03-calendar-and-scenario-planning/BR-EPIC-03.md) / [SA-EPIC-03](epics/epic-03-calendar-and-scenario-planning/SA-EPIC-03.md) | **Đã triển khai** |
