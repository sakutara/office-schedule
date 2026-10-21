---
name: sdd-tdd-pwa-webapp
description: >-
  Use this skill when building, designing, or adding features/epics to a
  Bilingual (English/Vietnamese) Offline-First PWA SPA webapp (specifically configured
  for Office Tracker / Quản lý Lên Văn Phòng) following the SDD
  (Specification-Driven Development) and TDD (Test-Driven Development) SDLC workflow:
  Epic -> Business Requirement (BR) -> Solution Architect (SA + ADR) -> Test (>= 90% coverage) -> Code,
  with fluid mobile-first responsive UI (scaling up to 1280px), minimalist icon-driven single-screen layout,
  zoom disabled, bottom horizontal tab bar with swipe-to-switch-tab gestures, non-selectable text
  (except editable/CTA items), all documentation in documents/, full SDD rules in README.md,
  the skill copied into documents/skills/sdd-tdd-pwa-webapp/, and an after-merge (post-merge)
  Git hook that automatically builds production output into docs/ upon merging into main.
---

# Bilingual Offline-First PWA SPA — SDD & TDD SDLC Skill

This skill enforces a rigorous **Specification-Driven Development (SDD)** and **Test-Driven Development (TDD)** Software Development Life Cycle (SDLC) for building and evolving **Bilingual (English / Vietnamese) Offline-First Progressive Web App (PWA) Single Page Applications (SPA)** with a native-like, minimalist mobile-first UI.

---

## 1. Core Architectural, UI/UX & Governance Principles

1. **PWA SPA & 100% Offline-First**:
   - The application MUST be a Single Page Application (SPA) with a valid Web App Manifest (`manifest.webmanifest`) and a Service Worker (`vite-plugin-pwa` with `injectManifest` or `generateSW`) that precaches all static assets (HTML, JS, CSS, fonts, static data).
   - Use hash-based routing (`HashRouter` / `#/...`) and relative `base: './'` so the app runs seamlessly offline and on static hosts (e.g., GitHub Pages serving from `docs/`) without `404` reload errors.
   - Persist all user data, language preferences, state, and large assets locally in the browser (`IndexedDB`, `OPFS - Origin Private File System`, `LocalStorage`, and `Cache Storage`).

2. **Native-Like Minimalist UI/UX & Interaction Rules**:
   - **Fluid Mobile-First Responsive (Up to `1280px` Desktop)**:
     - Design mobile-first using fluid layouts (`w-full max-w-[1280px] mx-auto`) that fit compactly on phones while scaling cleanly up to `1280px` on desktop screens.
   - **Minimalist, Icon-First & Single-Screen Priority (`100dvh`)**:
     - Keep the interface clean and self-explanatory with **no verbose instructional text or filler paragraphs**.
     - **Replace text buttons with icon buttons** (`lucide-react` icons paired with `aria-label` / `title` for accessibility and testability) wherever possible.
     - Prioritize fitting each tab's content within **a single mobile screen height (`h-dvh` / `100dvh`)** without vertical scrolling whenever feasible.
   - **Disable Zooming Completely**:
     - Configure `index.html` viewport meta tag with:
       `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover" />`
     - Apply `touch-action: manipulation;` (or `pan-x pan-y`) in global CSS and prevent gesture/wheel pinch-zoom so the PWA behaves like a locked native app.
   - **Bottom Horizontal Tab Bar & Swipe-Between-Tabs Gesture**:
     - Structure primary navigation as **horizontal tabs** with the **tab index bar docked at the bottom of the app** (`fixed` / flex-bottom dock).
     - Support **horizontal swipe gestures (`left` / `right`) on blank/non-interactive areas of a tab** to switch to the adjacent tab (`next` / `previous`), while ignoring swipe gestures started on interactive controls (`input`, `textarea`, `button`, `[data-no-swipe]`).
   - **Non-Selectable Text by Default**:
     - Apply `user-select: none; -webkit-user-select: none;` globally across the entire app (`html, body, #root`).
     - Only allow text selection (`user-select: text; -webkit-user-select: text;`) on **editable items or explicit copyable CTAs** (`input`, `textarea`, `[contenteditable="true"]`, `[data-selectable="true"]`).

3. **Mandatory Bilingual Support (English `en` & Vietnamese `vi`)**:
   - Every UI screen, `aria-label` / tooltip on icon buttons, compact status badge, notification, and user-facing message MUST support **both English (`en`) and Vietnamese (`vi`)**.
   - Provide a pure i18n domain module (`src/domains/i18n/`) with strongly-typed translation keys and a compact icon/badge language toggle (`EN`/`VI`) in the App Shell persisted offline.
   - Automated tests MUST verify both `en` and `vi` rendering and language switching.

4. **Strict SDLC Order (`Epic -> BR -> SA (+ ADR) -> Test -> Code`)**:
   - Never write production feature code before its Epic scope, Business Requirements (`BR`), Solution Architecture (`SA`), Architecture Decision Records (`ADR` if SA changes), and automated Tests are specified.

5. **Documentation in `documents/` & Production Build in `docs/`**:
   - **`documents/`**: Holds **ALL** SDD project documentation (`BR-MASTER.md`, `SA-MASTER.md`, `adr/`, `epics/`) AND a copy of this skill (`documents/skills/sdd-tdd-pwa-webapp/`).
   - **`docs/`**: Reserved **exclusively** for the compiled production static bundle (`vite build --outDir docs`) so GitHub Pages can serve the production PWA directly from `main` branch `/docs`.
   ```text
   <project-root>/
   ├── README.md                                   # Project overview + FULL SDD/TDD & UI rules for all AI agents
   ├── documents/                                  # All SDD & Architectural Documentation
   │   ├── BR-MASTER.md                            # Master Business Requirements & Epic Status Roadmap
   │   ├── SA-MASTER.md                            # Master Solution Architecture & System Overview
   │   ├── adr/                                    # Architecture Decision Records
   │   │   └── ADR-XXX-<short-slug>.md             # Records every SA-level decision or change
   │   ├── epics/                                  # Epic-scoped specifications
   │   │   └── epic-XX-<short-slug>/
   │   │       ├── BR-EPIC-XX.md                   # ONLY requirements for Epic XX
   │   │       └── SA-EPIC-XX.md                   # ONLY solution architecture for Epic XX
   │   └── skills/
   │       └── sdd-tdd-pwa-webapp/                 # Exact copy of this skill bundled with the app's documents
   ├── docs/                                       # Production PWA build output (auto-built after merge to main)
   ├── .githooks/
   │   └── post-merge                              # Versioned after-merge hook (builds prod to docs/ on main)
   ├── src/
   └── tests/
   ```

6. **Self-Contained Skill Copy & Multi-Agent `README.md` Governance**:
   - **Copy Skill to `documents/`**: Immediately after creating or initializing the app (and whenever the skill is updated), copy the entire skill folder into `documents/skills/sdd-tdd-pwa-webapp/`.
   - **Document SDD & UI Rules in `README.md`**: The root `README.md` MUST contain a dedicated, comprehensive **SDD + TDD Governance & Agent Instructions** section explaining:
     - Every new feature or change MUST follow `Epic -> BR -> SA (+ ADR) -> Test (>= 90% coverage) -> Code`.
     - All UI/UX constraints (fluid responsive up to `1280px`, minimalist icon-only buttons, single-screen mobile layout priority, zoom disabled, bottom horizontal tabs with swipe on blank space, non-selectable text except editable/CTA items, and bilingual `en`/`vi`).
     - Where `documents/BR-MASTER.md`, `documents/SA-MASTER.md`, `documents/epics/epic-XX-*/`, `documents/adr/ADR-XXX-*.md`, and `documents/skills/sdd-tdd-pwa-webapp/` live.
     - That `docs/` is the compiled production output generated by `npm run build` and the `post-merge` (`after-merge`) Git hook on `main`.

7. **Automated `after-merge` (`post-merge`) Hook for Production Build to `docs/`**:
   - Configure `vite.config.ts` with `build: { outDir: 'docs', emptyOutDir: true }` and `base: './'`.
   - Install a Git `post-merge` hook (stored in `.githooks/post-merge` and linked/copied into `.git/hooks/post-merge`, plus configured via `git config core.hooksPath .githooks`) that:
     1. Checks if the current branch after merge is `main`.
     2. Runs `npm run build` to compile the production PWA bundle directly into `docs/`.

8. **Strict Scoping between Master Docs, Epic Docs, and ADRs**:
   - **`documents/BR-MASTER.md` & `documents/SA-MASTER.md`**: Always reflect the **current holistic state** of the entire webapp, including product vision, bilingual requirement (`en`/`vi`), native-like UI/UX constraints, core functional pillars, non-functional requirements, overall architecture diagram, module structure, ADR index, and the status of all Epics (`Planned`, `In Design`, `In Progress`, `Implemented`).
   - **`BR-EPIC-XX.md` & `SA-EPIC-XX.md`**: Each Epic MUST have exactly 1 BR and 1 SA document in `documents/epics/epic-XX-<slug>/` that describe **ONLY** the requirements, acceptance criteria, components, data structures, and test matrix belonging to that specific Epic.
   - **`documents/adr/ADR-XXX-*.md`**: **Every change or new decision at the Solution Architecture (SA) level** MUST be recorded in a numbered ADR file and linked in `documents/SA-MASTER.md` and the corresponding `SA-EPIC-XX.md`.

9. **Hard Test Coverage Gate ($\ge 90\%$)**:
   - Automated tests MUST cover **at least 90%** of the codebase across all 4 metrics: **Lines $\ge 90\%$**, **Statements $\ge 90\%$**, **Functions $\ge 90\%$**, and **Branches $\ge 90\%$**.
   - Keep pure business logic, swipe/tab navigation state helpers, and i18n dictionaries in `src/domains/` (zero hard DOM/browser dependencies) and wrap browser APIs (`IndexedDB`, `OPFS`, `localStorage`, `ServiceWorker`, `Web Speech`, `Notifications`) behind thin, injectable service adapters in `src/services/`.

---

## 2. Step-by-Step Workflow (Per Project / Per Epic)

When asked to initialize a new webapp or implement/modify an Epic, execute the following phases in strict order. Use the templates in [references/templates.md](./references/templates.md).

### Phase 0: Project Initialization (When Creating or Bootstrapping an App)
1. **Create Directory Structure**:
   - Create `documents/`, `documents/adr/`, `documents/epics/`, `documents/skills/`, `.githooks/`, `src/domains/i18n/`, `src/services/`, `src/components/`, `src/pages/`, and `tests/`.
2. **Copy This Skill into `documents/skills/sdd-tdd-pwa-webapp/` & Install Hook**:
   - Run [setup-project-sdd.sh](./scripts/setup-project-sdd.sh) (or `cp -R .agents/skills/sdd-tdd-pwa-webapp documents/skills/`) so the skill is permanently bundled inside `documents/skills/sdd-tdd-pwa-webapp/` and `.githooks/post-merge` is active.
3. **Configure Locked Viewport, Non-Selectable Text & `docs/` Build Output**:
   - Configure `index.html` with `user-scalable=no, maximum-scale=1.0, minimum-scale=1.0` to disable zooming.
   - Configure global CSS (`src/index.css`) with `user-select: none` on the app root and `user-select: text` only on `input, textarea, [contenteditable="true"], [data-selectable="true"]`.
   - Configure `vite.config.ts` with `base: './'` and `build: { outDir: 'docs', emptyOutDir: true }`.
4. **Create Root `README.md` with Full Multi-Agent SDD & UI Instructions**:
   - Populate `README.md` using the template in [references/templates.md](./references/templates.md).

### Phase 1: Business Requirement (`BR`)
1. **If initializing the project**:
   - Create `documents/BR-MASTER.md` defining the product vision, mandatory Bilingual (`en`/`vi`), Offline PWA, and Native-Like UI/UX NFRs (fluid mobile-first up to `1280px`, minimalist icon buttons, single-screen priority, zoom disabled, bottom horizontal tabs with swipe on blank space, non-selectable text), core functional pillars, and the Epic Roadmap table.
2. **For the target Epic (`EPIC-XX`)**:
   - Create or update `documents/epics/epic-XX-<slug>/BR-EPIC-XX.md`.
   - Include ONLY the business objective, user stories (`FR-XX.Y`), numbered testable Acceptance Criteria (`AC-Y.Z`) including bilingual (`en`/`vi`) and minimalist icon/tab/swipe behavior, and the $\ge 90\%$ coverage requirement for `EPIC-XX`.
3. **Sync Master BR**:
   - Update `documents/BR-MASTER.md` so the Epic Roadmap table and core pillars reflect the current status of `EPIC-XX`.

### Phase 2: Solution Architecture (`SA`) & `ADR`
1. **Record Architectural Decisions (`ADR`)**:
   - For any new architecture decision or any change at the SA level, create a new `documents/adr/ADR-XXX-<slug>.md` (or supersede/update the relevant ADR with a clear change log).
2. **Design Epic Solution Architecture (`SA-EPIC-XX`)**:
   - Create or update `documents/epics/epic-XX-<slug>/SA-EPIC-XX.md`.
   - Include ONLY the component Mermaid diagram, TypeScript interfaces/types, bilingual i18n keys added for this Epic, domain algorithms, fluid `<= 1280px` single-screen layout & icon-button specification, and the Test & Coverage Matrix (`>= 90%`) for `EPIC-XX`.
   - Link back to `BR-EPIC-XX.md`, `documents/BR-MASTER.md`, `documents/SA-MASTER.md`, and the applied `ADR-XXX` files.
3. **Sync Master SA**:
   - Create or update `documents/SA-MASTER.md` to reflect the updated system architecture diagram, directory structure (`documents/` for specs, `docs/` for prod build), and ADR Index.

### Phase 3: Test-Driven Development (`Test`)
1. **Configure Hard Coverage Thresholds**:
   - Ensure `vite.config.ts` enforces:
     ```ts
     thresholds: { lines: 90, functions: 90, branches: 90, statements: 90 }
     ```
2. **Write Tests Mapped to `BR-EPIC-XX` & `SA-EPIC-XX`**:
   - **Domain & i18n Unit Tests (`tests/<domain>.test.ts`)**: Test every acceptance criterion, happy path, boundary condition, swipe gesture detector logic, error/fallback branch, and `en`/`vi` translation parity.
   - **Service Adapter Tests (`tests/<service>.test.ts`)**: Test offline persistence, serialization fallbacks, and browser API mocks for `src/services/`.
   - **UI Integration Tests (`tests/<feature>Integration.test.tsx`)**: Use `@testing-library/react` + `user-event` to test bottom tab switching (click & swipe on blank area), icon button actions via `aria-label`, non-selectable vs editable elements, and switching languages (`en` $\leftrightarrow$ `vi`).
3. Run `npm test` to confirm tests execute and accurately validate the specification.

### Phase 4: Implementation & Verification (`Code`)
1. **Implement Pure Domain Logic & Bilingual Dictionaries (`src/domains/`)**:
   - Write clean, strongly-typed TypeScript functions/classes and complete `en`/`vi` dictionary entries with zero direct coupling to browser globals.
2. **Implement Offline Services & PWA Workers (`src/services/`, `src/sw/`)**:
   - Implement offline storage (`IndexedDB` / `OPFS` / `LocalStorage`) and Service Worker precaching / background tasks.
3. **Implement Minimalist Fluid UI Components & Bottom-Tab Shell (`src/components/`, `src/pages/`)**:
   - Build a fluid `max-w-[1280px]` container with `h-dvh overflow-hidden` single-screen priority, icon-only action buttons (`aria-label`), bottom horizontal tab navigation, swipe-on-blank-space handler, and `user-select: none` enforcement.
4. **Run Quality Gates & Update Epic Status**:
   - Run the verification script:
     [verify-sdd-docs.sh](./scripts/verify-sdd-docs.sh)
   - Run typecheck, coverage gate, and production build into `docs/`:
     - `npm run typecheck`
     - `npm run test:coverage` (MUST pass $\ge 90\%$ on lines, statements, functions, and branches)
     - `npm run build` (verifies production build outputs cleanly to `docs/`)
   - Once all gates pass, update the Epic's status to **Implemented (`Đã triển khai`)** in `BR-EPIC-XX.md`, `SA-EPIC-XX.md`, `documents/BR-MASTER.md`, and `documents/SA-MASTER.md`.

---

## 3. Current Application Reference: Office Tracker (`Quản lý Lên Văn Phòng`)

When maintaining or extending this repository (`office-schedule`), agents MUST preserve and align with the implemented domain specifications below:

1. **Implemented Epics (`documents/epics/`)**:
   - **`EPIC-01` (`epic-01-employee-profiles-and-schedule`)**:
     - Manages **"Loại nhân viên" (`EmployeeProfile`)** with 5 fields: `name`, `method` (`weekly` / `monthly`), `minPercent`, `weekdays` (7-day map), and `note`.
     - Provides 2 built-in default profiles: **"Nhân viên NAB"** (`monthly`, `36%`, Mon–Fri `work`, Sat–Sun `off`) and **"Quản lý NAB"** (`monthly`, `55%`, Mon–Fri `work`, Sat–Sun `off`).
     - 7-day editor in `SettingsTab.tsx`: clicking any weekday cycles `off` (Gray) $\rightarrow$ `work` (Yellow) $\rightarrow$ `office` (Green preferred office day).
     - Monthly working-day calculator subtracting Vietnam public holidays (`holidayService.ts` + `vietnamHolidays.ts`), cached per `YYYY-MM` and only re-measured if missing, weekday config signature changed, or cache age $> 30$ days.
   - **`EPIC-02` (`epic-02-attendance-and-progress-bar`)**:
     - Persistent `TopProgressBar.tsx` displaying 3 metrics: Green (`attendedDays`), Light Green (`scenarioDays`), Yellow (`requiredDays`) in **Full mode** (`MainTab`, `SettingsTab`) or **Compact mode** (no numbers on `CalendarTab`).
     - `MainTab.tsx` with a central **"Lên văn phòng"** CTA button featuring 4 dynamic alert states (`normal` green, `preferred` dark green on preferred weekday, `warning` orange when `remainingRequired === remainingWorkDays`, `danger` red when `remainingRequired > remainingWorkDays`) and a smaller white **"Nghỉ phép"** button underneath.
   - **`EPIC-03` (`epic-03-calendar-and-scenario-planning`)**:
     - `CalendarTab.tsx` month grid color-coded by status: Gray (`off` / `holiday` / `leave`), Blue (`work`), Orange (`office` attended or future scenario).
     - Interactive day status dropdown (`work` / `office` / `leave`) for valid working days while locking weekends (`off`) and Vietnam public holidays (`holiday`).
     - Future scenario planning (`date > today` marked as `office`) feeding into `scenarioDays` (light green bar).

2. **Key Modules & ADRs**:
   - **Domain Modules**: `src/domains/office/types.ts`, `src/domains/office/vietnamHolidays.ts`, `src/domains/office/officeEngine.ts`, `src/domains/i18n/index.ts`, `src/domains/navigation/swipeTabLogic.ts`.
   - **Services**: `src/services/holidayService.ts`, `src/services/storageService.ts`.
   - **ADRs (`documents/adr/`)**:
     - `ADR-001-local-first-pwa-and-holiday-cache.md`
     - `ADR-002-employee-profile-and-kpi-engine.md`
     - `ADR-003-fluid-single-screen-ui-and-bottom-tabs.md`
