# Office Tracker (Quản lý Lên Văn Phòng) — Bilingual (VI/EN) Offline-First PWA SPA

> **IMPORTANT FOR ALL AI AGENTS & DEVELOPERS**: This repository strictly follows **Specification-Driven Development (SDD)** and **Test-Driven Development (TDD)** (`Epic -> BR -> SA (+ ADR) -> Test (>= 90% coverage) -> Code`). Read the governance, UI/UX rules, and project architecture below before making any code or documentation changes.

---

## 1. Tổng quan Dự án & Tính năng Nghiệp vụ (Product Overview & Core Features)

**Office Tracker (Ứng dụng Quản lý Lên Văn Phòng Cá Nhân)** là ứng dụng **Bilingual (VI/EN) Offline-First Progressive Web App (PWA) Single Page Application (SPA)** giúp nhân viên và quản lý theo dõi tiến độ lên văn phòng hàng tháng/tuần, quản lý ngày nghỉ phép, lập kịch bản lên văn phòng trong tương lai và tự động trừ các ngày nghỉ lễ Việt Nam.

### 1.1 Ba Trụ cột Nghiệp vụ Chính (Core Functional Pillars)

1. **Hồ sơ "Loại nhân viên" (5 thông tin), Cấu hình 7 Ngày & Bộ tính Ngày làm việc / Nghỉ lễ VN (`EPIC-01`)**:
   * **2 Hồ sơ mặc định**:
     * **Nhân viên NAB**: Tính theo tháng (`monthly`), yêu cầu tối thiểu **`36%`**, Thứ 2–Thứ 6 làm việc (`work`), Thứ 7–CN nghỉ (`off`).
     * **Quản lý NAB**: Tính theo tháng (`monthly`), yêu cầu tối thiểu **`55%`**, Thứ 2–Thứ 6 làm việc (`work`), Thứ 7–CN nghỉ (`off`).
   * **Tạo hồ sơ tùy chỉnh (đủ 5 thông tin)**: (1) Tên nhu cầu (`name`), (2) Phương pháp tính (`weekly` / `monthly`), (3) Yêu cầu tối thiểu (`minPercent`), (4) Cấu hình 7 ngày trong tuần (`weekdays`), (5) Ghi chú quy tắc (`note`).
   * **Chỉnh 7 ngày trong tuần (Settings)**: Nhấn vào từng thứ (T2–CN) để đổi màu & trạng thái xoay vòng:
     * **Màu xám (`off`)**: Ngày nghỉ
     * **Màu vàng (`work`)**: Ngày làm việc
     * **Màu xanh lá (`office`)**: Ngày ưu tiên lên văn phòng
   * **Đo & Cache 30 ngày số ngày làm việc trong tháng trừ ngày nghỉ lễ Việt Nam**:
     * Truy vấn thông tin nghỉ lễ Việt Nam (`date.nager.at` kết hợp cơ sở dữ liệu lịch lễ Dương/Âm lịch Việt Nam 2024–2030 tích hợp sẵn để hoạt động 100% offline).
     * Chỉ đo **1 lần và lưu cache cho tháng đó**; tự động đo lại khi: (a) dữ liệu cache bị mất, (b) cấu hình 7 ngày làm việc trong tuần thay đổi, hoặc (c) lần đo cuối đã quá **30 ngày**.

2. **Thanh Progress 3 Thông số Đầu Trang & Tab Chính Check-in / Cảnh báo (`EPIC-02`)**:
   * **Thanh Progress luôn cố định ở đầu trang (`TopProgressBar`)**:
     * **Màu xanh lá (`attendedDays`)**: Số ngày đã lên văn phòng thực tế.
     * **Màu xanh lá nhạt (`scenarioDays`)**: Số ngày sẽ lên văn phòng theo kịch bản tương lai.
     * **Màu vàng (`requiredDays`)**: Tổng số ngày cần lên văn phòng tối thiểu trong tháng.
     * **2 Chế độ hiển thị**: **Bản đầy đủ** (hiển thị cả 3 con số tại `Tab chính` & `Cài đặt`) và **Bản rút gọn** (ẩn con số, thu gọn thanh màu khi sang `Tab xem lịch`).
   * **Tab Chính (`MainTab`)**:
     * Nút **"Lên văn phòng"** lớn ở trung tâm tự động chuyển đổi **4 cấp độ màu sắc & thông điệp**:
       1. **Màu xanh lá (`normal`)**: Trạng thái tiêu chuẩn.
       2. **Màu xanh lá sẫm (`preferred`)**: Hôm nay là ngày ưu tiên lên văn phòng trong cấu hình tuần (hiển thị thông điệp khuyến khích).
       3. **Màu cam cảnh báo (`warning`)**: Số ngày cần lên VP còn thiếu **bằng đúng** số ngày làm việc còn lại trong tháng (`remainingRequired === remainingWorkDays`).
       4. **Màu đỏ báo động (`danger`)**: Số ngày cần lên VP còn thiếu **nhiều hơn** số ngày làm việc còn lại trong tháng (`remainingRequired > remainingWorkDays`).
     * Nút **"Nghỉ phép"** màu trắng nhỏ hơn nằm ngay bên dưới nút "Lên văn phòng".

3. **Tab Xem Lịch Tháng, Dropdown Đổi Trạng Thái Ngày & Kịch Bản Tương Lai (`EPIC-03`)**:
   * **Lưới lịch tháng (`CalendarTab`)**:
     * Thanh progress đầu trang tự động thu gọn (không hiện số).
     * Mã màu ngày trực quan: **Màu xám** (Nghỉ cuối tuần / Nghỉ lễ VN / Nghỉ phép), **Màu xanh** (Ngày làm việc `work`), **Màu cam** (Ngày lên văn phòng `office` — gồm cả ngày đã lên và ngày kịch bản tương lai).
   * **Dropdown chỉnh trạng thái ngày**: Nhấn vào một ngày làm việc hợp lệ để mở dropdown chuyển đổi giữa **Làm (`work`) / Lên VP (`office`) / Nghỉ phép (`leave`)**. Khóa không cho phép đổi trạng thái của ngày nghỉ cuối tuần (`off`) hoặc ngày nghỉ lễ Việt Nam (`holiday`).
   * **Tính năng kịch bản tương lai**: Cho phép chọn các ngày làm việc trong tương lai làm ngày dự kiến lên văn phòng (trên lịch hoặc bộ chọn nhanh), tự động cộng vào dải **màu xanh lá nhạt** trên thanh progress.

4. **Nhắc Lên Văn Phòng Hằng Ngày (`EPIC-04`)**:
   * Thông báo trình duyệt **một lần mỗi ngày lúc 7:00 sáng**, chỉ khi hôm nay có thể lên VP (ngày làm việc chưa xác nhận hoặc ngày dự kiến) và có nguy cơ thiếu chỉ tiêu đến cuối tháng, là ngày dự kiến, hoặc là ngày ưu tiên chưa đủ số ngày. Nhiều lý do cùng lúc vẫn chỉ gửi một thông báo.
   * Bật/tắt trong Tab **Cài đặt**. Thông báo chỉ hiện khi app còn đang chạy hoặc còn tồn tại trong nền (xem [ADR-004](./documents/adr/ADR-004-daily-vp-reminder-notifications.md)).

---

## 2. Lộ trình Epics & Hồ sơ Kiến trúc (SDD Documentation Map)

* **Tài liệu Tổng thể (Master Docs)**:
  * [`documents/BR-MASTER.md`](./documents/BR-MASTER.md): Master Business Requirements & Epic Roadmap.
  * [`documents/SA-MASTER.md`](./documents/SA-MASTER.md): Master Solution Architecture, System Mermaid Diagram & Module Map.
* **Danh sách Epics (`documents/epics/`)**:
  * **EPIC-01**: [BR-EPIC-01](./documents/epics/epic-01-employee-profiles-and-schedule/BR-EPIC-01.md) | [SA-EPIC-01](./documents/epics/epic-01-employee-profiles-and-schedule/SA-EPIC-01.md) — *Hồ sơ Loại Nhân Viên, Cấu hình 7 Ngày & Bộ tính Ngày làm việc / Nghỉ lễ VN* (**Đã triển khai**).
  * **EPIC-02**: [BR-EPIC-02](./documents/epics/epic-02-attendance-and-progress-bar/BR-EPIC-02.md) | [SA-EPIC-02](./documents/epics/epic-02-attendance-and-progress-bar/SA-EPIC-02.md) — *Thanh Progress 3 Thông số & Tab Chính Đánh dấu Lên VP / Nghỉ phép* (**Đã triển khai**).
  * **EPIC-03**: [BR-EPIC-03](./documents/epics/epic-03-calendar-and-scenario-planning/BR-EPIC-03.md) | [SA-EPIC-03](./documents/epics/epic-03-calendar-and-scenario-planning/SA-EPIC-03.md) — *Lịch Tháng Tương Tác, Dropdown Đổi Trạng Thái & Kịch Bản Tương Lai* (**Đã triển khai**).
  * **EPIC-04**: [BR-EPIC-04](./documents/epics/epic-04-vp-reminder-notifications/BR-EPIC-04.md) | [SA-EPIC-04](./documents/epics/epic-04-vp-reminder-notifications/SA-EPIC-04.md) — *Nhắc Lên Văn Phòng Hằng Ngày lúc 7:00 qua thông báo trình duyệt* (**Đã triển khai**).
* **Hồ sơ Quyết định Kiến trúc (`documents/adr/`)**:
  * [ADR-001](./documents/adr/ADR-001-local-first-pwa-and-holiday-cache.md): Kiến trúc PWA Offline-First & Cơ chế Truy vấn / Cache 30 Ngày Lịch Nghỉ Lễ Việt Nam.
  * [ADR-002](./documents/adr/ADR-002-employee-profile-and-kpi-engine.md): Thiết kế Hồ sơ Loại Nhân Viên 5 Thông Tin, Lịch 7 Ngày & Máy Trạng Thái Cảnh Báo KPI.
  * [ADR-004](./documents/adr/ADR-004-daily-vp-reminder-notifications.md): Nhắc lên VP hằng ngày bằng Notification API phía client thay vì Web Push có backend.
  * [ADR-003](./documents/adr/ADR-003-fluid-single-screen-ui-and-bottom-tabs.md): Giao diện Tối giản 1 Màn hình (`100dvh`), Thanh Progress 3 Màu & Điều hướng Swipe Bottom Tab.
* **Skill Đóng gói Kèm Dự Án**:
  * [`documents/skills/sdd-tdd-pwa-webapp/SKILL.md`](./documents/skills/sdd-tdd-pwa-webapp/SKILL.md) (bản sao đồng bộ từ [`.agents/skills/sdd-tdd-pwa-webapp/SKILL.md`](./.agents/skills/sdd-tdd-pwa-webapp/SKILL.md)).

---

## 3. SDD & TDD Governance Rules (Quy chuẩn Phát triển SDD & TDD Bắt buộc)

Every new feature, enhancement, or architectural change **MUST** follow this exact lifecycle:

```text
Epic Scope -> Business Requirement (BR) -> Solution Architecture (SA + ADR) -> Automated Tests (>= 90%) -> Code Implementation
```

### 3.1 Directory Separation: `documents/` vs `docs/`
* **`documents/` (SDD Documentation & Bundled Skill)**:
  * `documents/BR-MASTER.md`: Holistic Business Requirements & current status of the entire webapp and all Epics.
  * `documents/SA-MASTER.md`: Holistic Solution Architecture, system diagrams, module map, and ADR index of the entire webapp.
  * `documents/epics/epic-XX-<slug>/BR-EPIC-XX.md`: Business Requirements **strictly scoped ONLY** to `EPIC-XX`.
  * `documents/epics/epic-XX-<slug>/SA-EPIC-XX.md`: Solution Architecture **strictly scoped ONLY** to `EPIC-XX`.
  * `documents/adr/ADR-XXX-<slug>.md`: Architecture Decision Records. **Every SA-level change or architectural decision MUST be recorded in an ADR.**
  * `documents/skills/sdd-tdd-pwa-webapp/`: Bundled copy of the SDD+TDD Webapp Skill used to create and maintain this application.
* **`docs/` (Production Build Output Only)**:
  * Contains the compiled production PWA static bundle generated by `npm run build` (`vite build --outDir docs`).
  * Do **NOT** place markdown specifications inside `docs/`; all specifications belong in `documents/`.

### 3.2 Core Engineering & UI/UX Mandates (Yêu cầu Kỹ thuật & Giao diện Cốt lõi)
1. **PWA SPA & 100% Offline-First**:
   * Works 100% offline after initial load via Service Worker precaching (`src/sw/custom-sw.ts`) and client-side storage (`LocalStorage` via `src/services/storageService.ts`).
   * Uses relative paths (`base: './'`) and hash routing (`#/...`) for static hosting compatibility.
2. **Always Bilingual (Vietnamese `vi` & English `en`)**:
   * Every UI view, `aria-label`, tooltip, message, and feature MUST support both **Vietnamese (`vi`)** and **English (`en`)** via `src/domains/i18n/`.
   * Both languages must be covered by automated tests.
3. **Fluid Mobile-First Responsive (Scaling up to `1280px` Desktop)**:
   * Designed mobile-first with fluid sizing (`w-full max-w-[1280px] mx-auto`), adapting smoothly from compact phone screens up to `1280px` desktop viewports.
4. **Minimalist, Icon-Driven & Single-Screen Priority (`100dvh`)**:
   * Clean, uncluttered UI with **no verbose explanations**.
   * **Replace text buttons with icon buttons** (`lucide-react` + `aria-label` / `title`) wherever feasible.
   * Prioritize fitting each tab's primary workspace within **1 mobile screen (`100dvh`)** without vertical scrolling when feasible.
5. **Zoom Disabled**:
   * Viewport zooming is disabled (`user-scalable=no, maximum-scale=1.0, minimum-scale=1.0` in `index.html` and `touch-action: manipulation` in CSS).
6. **Bottom Horizontal Tab Bar & Swipe-to-Switch-Tab**:
   * Primary navigation uses **horizontal tabs docked at the bottom of the app** (`Tab chính`, `Xem lịch`, `Cài đặt`).
   * Users can **swipe left/right on blank/non-interactive areas of a tab** (`src/domains/navigation/swipeTabLogic.ts`) to switch to the next/previous tab.
7. **Non-Selectable Text by Default**:
   * All text in the app has `user-select: none` by default, **except** explicit editable or copyable CTA items (`input`, `textarea`, `[contenteditable="true"]`, `[data-selectable="true"]`).
8. **Hard Test Coverage Gate ($\ge 90\%$)**:
   * `npm run test:coverage` enforces **$\ge 90\%$** across **Lines, Statements, Functions, and Branches**.
   * Pure domain logic lives in `src/domains/`; browser side-effects live in `src/services/`.
9. **Automated `after-merge` (`post-merge`) Production Build to `docs/`**:
   * A Git `post-merge` hook (`.githooks/post-merge` -> `.git/hooks/post-merge`) is integrated so that immediately after merging into `main`, `npm run build` runs automatically and outputs the fresh production bundle into `docs/`.

---

## 4. Cấu trúc Thư mục Mã nguồn (Project Structure)

```text
├── README.md                                   # Tổng quan dự án Office Tracker & Quy chuẩn SDD/TDD cho AI Agents
├── index.html                                  # Viewport khóa zoom (user-scalable=no, maximum-scale=1.0)
├── vite.config.ts                              # Cấu hình build.outDir = 'docs', PWA & ngưỡng coverage >= 90%
├── .agents/skills/sdd-tdd-pwa-webapp/          # Skill SDD + TDD PWA Webapp gốc của workspace
├── .githooks/post-merge                        # Hook after-merge tự động build bản production vào docs/ trên nhánh main
├── documents/                                  # Toàn bộ tài liệu SDD (BR-MASTER, SA-MASTER, ADRs, Epics, Skill copy)
│   ├── BR-MASTER.md
│   ├── SA-MASTER.md
│   ├── adr/
│   │   ├── ADR-001-local-first-pwa-and-holiday-cache.md
│   │   ├── ADR-002-employee-profile-and-kpi-engine.md
│   │   ├── ADR-003-fluid-single-screen-ui-and-bottom-tabs.md
│   │   └── ADR-004-daily-vp-reminder-notifications.md
│   ├── epics/
│   │   ├── epic-01-employee-profiles-and-schedule/
│   │   ├── epic-02-attendance-and-progress-bar/
│   │   ├── epic-03-calendar-and-scenario-planning/
│   │   └── epic-04-vp-reminder-notifications/
│   └── skills/sdd-tdd-pwa-webapp/              # Bản sao Skill đóng gói kèm tài liệu dự án
├── docs/                                       # Thư mục chứa bản build production tĩnh (tự động xuất từ npm run build)
├── src/
│   ├── App.tsx                                 # App Shell (max-w-1280px, h-dvh, TopProgressBar, Swipe Viewport, Bottom Tabs)
│   ├── domains/
│   │   ├── i18n/index.ts                       # Từ điển song ngữ VI/EN & hàm dịch nội suy
│   │   ├── navigation/swipeTabLogic.ts         # Thuật toán nhận diện cử chỉ swipe ngang trên vùng trống
│   │   └── office/
│   │       ├── types.ts                        # Kiểu dữ liệu Hồ sơ 5 thông tin, Lịch tuần 7 ngày, Cache tháng, KPI
│   │       ├── vietnamHolidays.ts              # Lịch nghỉ lễ Việt Nam (Dương lịch & Âm lịch 2024–2030) chạy offline
│   │       └── officeEngine.ts                 # Bộ tính ngày làm việc, hiệu lực cache 30 ngày, thanh progress & cảnh báo
│   ├── services/
│   │   ├── holidayService.ts                   # Truy vấn API nghỉ lễ VN + fallback offline + quản lý cache 30 ngày
│   │   └── storageService.ts                   # Lưu trữ bền vững trạng thái ứng dụng vào LocalStorage
│   ├── components/
│   │   └── TopProgressBar.tsx                  # Thanh tiến độ 3 màu cố định đầu trang (chế độ đầy đủ & thu gọn)
│   ├── pages/
│   │   ├── MainTab.tsx                         # Tab chính: Nút Lên VP (4 trạng thái màu), Nút Nghỉ phép & Kịch bản nhanh
│   │   ├── CalendarTab.tsx                     # Tab xem lịch: Lưới lịch tháng mã màu & Dropdown đổi trạng thái ngày
│   │   └── SettingsTab.tsx                     # Tab cài đặt: Chọn/Tạo Loại nhân viên (5 thông tin) & Chỉnh 7 ngày
│   └── sw/custom-sw.ts                         # Service Worker precache toàn bộ tài nguyên offline
└── tests/
    ├── officeEngine.test.ts                    # Unit test toàn bộ logic nghiệp vụ hồ sơ, ngày lễ, progress & cảnh báo
    ├── i18nAndSwipe.test.ts                    # Unit test song ngữ VI/EN & cử chỉ swipe chuyển tab
    ├── services.test.ts                        # Unit test LocalStorage & truy vấn/cache 30 ngày nghỉ lễ VN
    └── appIntegration.test.tsx                 # Integration test toàn diện 3 Tab, Dropdown lịch, Kịch bản & Đa ngôn ngữ
```

---

## 5. Step-by-Step Checklist for AI Agents Adding/Modifying Features

1. **Step 1 — Define/Update Epic BR**:
   * Create or update `documents/epics/epic-XX-<slug>/BR-EPIC-XX.md` (only requirements for `EPIC-XX`, including bilingual `en`/`vi` and minimalist icon/bottom-tab/swipe acceptance criteria).
   * Sync epic status and feature pillars in `documents/BR-MASTER.md`.
2. **Step 2 — Define/Update Epic SA & ADR**:
   * Create a new `documents/adr/ADR-XXX-<slug>.md` for any SA-level change.
   * Create or update `documents/epics/epic-XX-<slug>/SA-EPIC-XX.md` (only architecture & test matrix for `EPIC-XX`).
   * Sync `documents/SA-MASTER.md` (architecture diagram, module map, ADR index).
3. **Step 3 — Write Tests First (TDD)**:
   * Add/update unit tests (`tests/*.test.ts`) and UI integration tests (`tests/*.test.tsx`) covering all acceptance criteria, swipe/tab switching, icon button `aria-label` actions, and both `en`/`vi` languages.
4. **Step 4 — Implement Code & Pass Quality Gates**:
   * Implement code in `src/domains/`, `src/services/`, `src/components/`, `src/pages/`.
   * Run `./documents/skills/sdd-tdd-pwa-webapp/scripts/verify-sdd-docs.sh` (or `npm run typecheck && npm run test:coverage && npm run build`).
   * Mark the Epic as `Implemented (Đã triển khai)` in `BR-EPIC-XX.md`, `SA-EPIC-XX.md`, `documents/BR-MASTER.md`, and `documents/SA-MASTER.md`.

---

## 6. Commands (Các lệnh Phát triển & Kiểm thử)

```bash
npm install                # Installs dependencies & configures .githooks/post-merge
npm run dev                # Start local Vite dev server
npm run typecheck          # Run TypeScript strict type checking
npm run test               # Run Vitest unit & integration tests
npm run test:coverage      # Run tests with >= 90% coverage gate (Lines/Statements/Functions/Branches)
npm run build              # Build production PWA bundle into docs/
```
