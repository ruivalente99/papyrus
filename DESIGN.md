# PAPYRUS — Design System & Engineering Guidelines

Welcome to the **PAPYRUS** design and engineering manual. This specification establishes all design tokens, spacing scales, typography hierarchies, layout conventions, mobile ergonomics, canvas rendering mechanics, and accessibility standards implemented across the application.

---

## 🏛️ 1. Core Architectural & Design Principles

1. **Brand Identity & Lowercase Styling**:
   - The brand name is strictly formatted as lowercase **`papyrus`**, accompanied by the dynamic `NanoBananaLogo` or themed editorial emblem.
2. **Editorial Polish & "TypeUI Charm" Philosophy**:
   - Clean, light, warm editorial aesthetic inspired by fine typography and macOS/iOS native utility applications.
   - Warm neutral stone backgrounds (`--page`, `--card`), tactile golden amber brand accents (`--brand`), crisp borders, and subtle monospace micro-labeling.
3. **Offline-First & Privacy Preserving**:
   - Zero external cloud dependencies for core document editing. All resume profile data is cached securely in browser `localStorage`.
   - Local PDF vector rendering, client-side 128-bit standard encryption (ISO 32000-1), and local ATS keyword analysis.
4. **Apple / iOS Native Ergonomics**:
   - Full safe-area inset compliance (`pt-safe`, `pb-safe`) for iPhone Dynamic Island and home indicator bars.
   - Locked horizontal boundaries (`overflow-x: hidden; overscroll-behavior-x: none`) preventing horizontal ghost bouncing.
   - Native ghost drag prevention (`user-drag: none; -webkit-user-drag: none`) on interactive links, images, and buttons.
5. **Cognitive Load Reduction & Progressive Disclosure**:
   - Minimalist top bar: Primary actions remain immediate (Profiles, Templates, Language, Export), while secondary utilities (Job Matcher, CV Comparator, Revision History, LaTeX, PDF Security, User Guide) are cleanly consolidated into a single **Tools (`🛠️ Ferramentas`)** menu.
   - Instant tooltips (`CanvasTooltip`) and an interactive **Canvas Legend (`[?]`)** clarify controls without persistent screen clutter.
6. **Decoupled Dual-i18n Architecture**:
   - Application Interface Language (`uiLang`) and Document CV Language (`cvLang`) are completely decoupled.
   - Managed through a unified, accessible popover (`LanguageSwitcher` with `variant="unified"`), preventing duplicate buttons in headers.

---

## 🎨 2. Design Tokens & System Variables

### Color Foundations (CSS Variables)

| Token | Light Mode (`:root`) | Dark Mode (`.dark`) | Semantic Usage |
| :--- | :--- | :--- | :--- |
| `--page` | `#f7f7f5` | `#0c0a09` | Root page background, canvas backdrop |
| `--card` | `#ffffff` | `#161b22` | Form cards, modal dialogs, sheet surfaces |
| `--card-soft` | `#fbfaf9` | `#1c2128` | Nested form cards, inner items, table rows |
| `--control-fill` | `#f5f4f1` | `#21262d` | Text inputs, selects, inactive pill tracks |
| `--band` | `#f1f2ea` | `#1f242c` | Top header backdrop, accent strips, table headers |
| `--heading` | `#1c1917` | `#f0f3f6` | High-contrast headers, active section labels |
| `--body` | `#57534e` | `#c9d1d9` | Primary body copy, input values, descriptions |
| `--body-subtle` | `#79716b` | `#8b949e` | Secondary captions, timestamps, placeholder text |
| `--brand` | `#b45309` (Amber) | `#f59e0b` (Amber) | Primary action buttons, active pill tabs, active rings |
| `--brand-light` | `#d97706` | `#fbbf24` | Hover states, gradient mid-tones |
| `--brand-soft` | `#fef3c7` | `#451a03` | Active item badges, focused input backgrounds |
| `--border` | `#e7e6e5` | `#30363d` | Main container borders, separators, modal edges |
| `--border-subtle` | `#ebebe7` | `#363d47` | Nested card dividers, subtle borders |
| `--success` | `#1ebd66` | `#2ea043` | 100% ATS badges, verification indicators |
| `--warning` | `#f59e0b` | `#d29922` | Passive verb alerts, missing translation warnings |
| `--danger` | `#ef4444` | `#f85149` | Destructive delete actions, critical ATS flags |

### Document Accent Color Presets

Users can choose from curated, ATS-safe accent palettes applied to resume rules, icons, headings, and timeline nodes:
- **Teal (`lateralis`)**: `#005555` — Architectural, modern, balanced.
- **Royal Blue (`classic`)**: `#004f90` — Authoritative, standard engineering ATS palette.
- **Navy Blue (`matrix`)**: `#1e3a8a` — Executive, structured, formal corporate.
- **Emerald**: `#047857` — Vibrant, sustainable, contemporary tech.
- **Amber / Bronze**: `#b45309` — Warm editorial, design, humanistic.
- **Rose / Burgundy**: `#9f1239` — Bold creative, legal, academic leadership.
- **Slate / Charcoal**: `#334155` — Monochrome, minimalist, distraction-free.

---

## 🔤 3. Typography System

PAPYRUS pairs an ultra-clean Sans-Serif system interface with an editorial typography engine featuring **12 ATS-optimized font families**.

### System Font Stacks
- **Sans Interface**: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` with OpenType features `cv02, cv03, cv04, cv11`.
- **Monospace Micro**: `JetBrains Mono, SFMono-Regular, ui-monospace, Menlo, monospace`.

### Curated Document Font Families (FEAT-018)

| Category | Font Family | ATS Rating | Character & Ideal Use Case |
| :--- | :--- | :--- | :--- |
| **Sans-Serif** | **Inter** | `Optimal (100%)` | Default modern tech standard, crisp legibility at small sizes. |
| **Sans-Serif** | **Roboto** | `Optimal (100%)` | Universal Google standard, clean neutral geometry. |
| **Sans-Serif** | **Outfit** | `Standard (95%)` | Geometric contemporary heading style for startups & creative tech. |
| **Sans-Serif** | **Plus Jakarta Sans** | `Standard (95%)` | Warm modern European typography, balanced proportions. |
| **Sans-Serif** | **Raleway** | `Standard (92%)` | Elegant thin-line modernism for boutique and architectural resumes. |
| **Serif** | **EB Garamond** | `Optimal (100%)` | Classical literary book printing, academic and legal prestige. |
| **Serif** | **Merriweather** | `Optimal (100%)` | High x-height serif engineered specifically for screen and print clarity. |
| **Serif** | **Lora** | `Standard (96%)` | Editorial contemporary calligraphy with modern curves. |
| **Serif** | **Source Serif 4** | `Optimal (100%)` | Adobe's executive workhorse serif for high-density documentation. |
| **Monospace** | **JetBrains Mono** | `Standard (94%)` | Engineering and developer portfolios with clear symbol ligatures. |
| **Monospace** | **Fira Code** | `Standard (94%)` | Code-centric resume layout for backend and systems programmers. |
| **Monospace** | **Roboto Mono** | `Optimal (98%)` | Standard monospace ATS parser compliance. |

### Type Scale Hierarchy

| Role | Tailwind Classes | Size / Line Height | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Brand Mark** | `font-mono text-sm font-bold` | 14px / 20px | `tracking-tight lowercase` | `papyrus` logo mark |
| **Section Title** | `text-sm font-bold` | 14px / 20px | `tracking-tight` | Builder section headers, modal titles |
| **Card Header** | `text-xs font-bold` | 12px / 16px | `normal` | Experience roles, education degrees |
| **Body & Labels** | `text-xs font-medium` | 12px / 16px | `normal` | Form input labels, descriptions |
| **Eyebrow / Badge** | `text-[10px] sm:text-[11px] font-mono font-bold` | 10px / 14px | `uppercase tracking-wider` | Section badges, language indicators |
| **Micro Tag / Hint** | `text-[9px] sm:text-[10px] font-medium` | 9px–10px | `normal` | Canvas shortcuts, helper annotations |

---

## 📐 4. Spacing, Margins & Modular Grid

PAPYRUS enforces a strict **4px modular grid** across all components:

### Padding & Layout Scales
- **App Header (`BuilderHeader`)**:
  - Vertical: `py-2` (8px) to `py-2.5` (10px)
  - Horizontal: `px-3` (12px) on mobile, `sm:px-4` (16px) on desktop
  - Overflow Rule: **Strictly `overflow-visible`** on all breakpoints to prevent clipping dropdown menus.
- **Builder Form Pane (`builder-form-pane`)**:
  - Container: `p-3` (12px) on mobile, `sm:p-5` (20px) on desktop
  - Internal max width: `max-w-2xl` (672px)
  - Spacing between section cards: `space-y-3.5` (14px)
- **Section Cards (`SectionCard`)**:
  - Outer card padding: `p-4 sm:p-5`
  - Internal card items: `space-y-3`
  - Border radius: `rounded-2xl` (16px)
- **Live Preview Canvas (`CVPreviewContainer`)**:
  - Viewport container: `p-2` (8px) on mobile, `sm:p-5` (20px) on desktop
  - Floating toolbar dock clearance: **`bottom-20 sm:bottom-4`** (guarantees no collision with mobile bottom navigation).

---

## 📱 5. Mobile Ergonomics & Responsive Rules

Mobile viewport support requires meticulous layout isolation:

1. **Header Dropdown Visibility**:
   - The top navigation `<header>` MUST NOT use `overflow-hidden`. It is configured with `overflow-visible`.
   - Popovers and dropdown menus (Presets, Languages, Tools, Export) must specify responsive constraints:
     `max-w-[calc(100vw-1.5rem)]` with `left-0 sm:left-auto right-0 sm:right-auto`.
2. **Dedicated Docked Bottom Navigation**:
   - Replaces floating pills with a docked, native bar:
     `<nav className="fixed md:hidden bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-md border-t border-stone-200 dark:border-[#30363d] px-4 py-2 flex items-center justify-around pb-safe">`
   - Touch targets are minimum 44px–48px for effortless thumb switching between "Editor" and "Preview".
3. **Integrated Section Pill Bar**:
   - Located at the top of the form pane: `sticky top-0 z-20 py-1.5 px-2 bg-stone-50/95 dark:bg-[#161b22]/95 backdrop-blur-md border border-stone-200/80 rounded-2xl`.
   - Never use negative horizontal margins (`-mx-3`) that bleed past card boundaries.
   - Supports touch scrolling, mouse wheel scrolling (`onWheel`), and mouse dragging with cursor indicators.
   - Includes a unified **Expand All / Collapse All** button (`ChevronsUpDown`).
4. **Viewport Height Calculation**:
   - Desktop Pane: `h-[calc(100vh-53px)]`
   - Mobile Pane: `h-[calc(100dvh-53px-56px)]`
   - Accounts for both the 53px header and the 56px bottom navigation dock.

---

## ✉️ 6. Cover Letter Typographic & Layout Standard

The Cover Letter engine ([`CoverLetterPreview.tsx`](file:///Volumes/valentium/git/cvana/src/components/preview/CoverLetterPreview.tsx)) generates executive letters matching active CV styling:

1. **Natural Top-to-Bottom Flow**:
   - The root A4 container enforces `justify-start min-h-[1115px]` (never `justify-between`).
   - Prevents artificial 400px gaps that push the signature to the bottom of the page on short or standard letters.
2. **Typographic Rhythm & Left Alignment**:
   - Body paragraphs use `text-left text-stone-700 dark:text-stone-300 leading-relaxed`.
   - **Never use `text-justify`**: Fully justified text on responsive or multi-column containers causes awkward word-spacing rivers and poor readability.
3. **Sender & Recipient Metadata Hierarchy**:
   - Coordinated sender header adopting active CV typography, full name, headline, contact info, and vector QR code.
   - Recipient address block and formatted date with localized formats (e.g. `September 9, 2026` in EN, `9 de setembro de 2026` in PT).
4. **Signature Block**:
   - Follows naturally after the sign-off closing phrase (`space-y-1.5 pt-2`).

---

## 📄 7. A4 Precision Canvas & Print Engine

PAPYRUS CVs are compiled directly to standard international A4 dimensions:

1. **Strict Physical Dimensions**:
   - Calibrated at standard 96 DPI: **`794px × 1123px`** (`210mm × 297mm`).
2. **Dynamic Auto-Fit Engine on Resolution Change**:
   - Listens to both `window.resize` and `orientationchange`.
   - When triggered, resets canvas pan to `{ x: 0, y: 0 }`, sets `isAutoFit(true)`, and automatically recalculates the optimal zoom scale:
     `scale = Math.min(1.2, Math.max(0.32, (containerWidth - margin) / 794));`
3. **Smart Page Break Engine (`calculateSmartPageBreaks`)**:
   - Child elements tagged with `data-page-break-avoid="true"` are guarded against splitting across page boundaries.
   - Manual page breaks set with `pageBreakBefore: true` render a visual pill badge `\pagebreak` in the editor and force clean document splits.
4. **CSS Print Mode Emulation (`.print-emulation`)**:
   - High-fidelity print view rendering individual paper sheets with drop shadows, page gap dividers, and bilingual page badges (`Folha 1 / 2` / `Sheet 1 / 2`).
5. **Interactive Hyperlink Coordinate Projection**:
   - Scans DOM `<a>` elements, translates their on-screen bounding boxes into physical millimeters ($x, y, w, h$), and embeds clickable PDF link annotations via `jsPDF.link()`.
6. **Canvas Tooltips & Quick Legend (`[?]`)**:
   - Instant floating tooltips on every toolbar button indicating action title and keyboard shortcut (e.g. `Fit to Window (Shift+1)`, `Rotate 90° (R)`).
   - Dedicated `[?]` Legend button opening a popover guide with mouse, trackpad, and keyboard shortcuts.

---

## 🔘 8. Border Radius & Elevation Tokens

| Token | Class | Pixel Value | Application |
| :--- | :--- | :--- | :--- |
| **Pill (Full)** | `rounded-full` | `9999px` | Buttons, segmented pill tracks, badges, search bars |
| **Modal / Dialog** | `rounded-3xl` | `24px` | Modal dialogs, setup cards, image crop dialog |
| **Card (Container)** | `rounded-2xl` | `16px` | Section cards, option tiles, preview card frames |
| **Form Input** | `rounded-xl` | `12px` | All text inputs, selects, textareas, icon tiles |
| **Micro Element** | `rounded-lg` | `8px` | Small action buttons, code badges |

### Elevation & Shadows
- `shadow-2xs`: Subtle default pill elevation (`0 1px 2px rgba(0,0,0,0.03)`).
- `shadow-xs`: Active segmented pill tab elevation (`0 1px 3px rgba(0,0,0,0.06)`).
- `shadow-md`: Floating toolbars, banners, and toast notifications.
- `shadow-2xl`: Modal sheets and desktop A4 printable sheet.

---

## ♿ 9. Accessibility (A11y) & PDF/UA Standard

1. **WCAG 2.1 AA Compliance**:
   - Color contrast ratio >= 4.5:1 on all interactive text against light and dark backgrounds.
   - Focus indicators: High-visibility focus rings (`focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2`).
2. **Form Accessibility**:
   - 100% of input elements have an explicit `<label htmlFor="id">` matching the input's `id`.
   - Icon-only buttons must provide explicit `aria-label` and `title` attributes.
3. **Keyboard Navigation & Global Shortcuts**:
   - `Cmd/Ctrl + K`: Open Smart Command Palette.
   - `Shift + 1`: Reset zoom and auto-fit preview to window.
   - `Shift + 0`: Reset zoom to 100% actual size.
   - `R`: Rotate canvas 90 degrees.
   - `Esc`: Close any open modal, dropdown, or popover.
4. **PDF/UA (ISO 14289-1) Document Compliance**:
   - Standard PDF tag tree injection with Document Title, Dublin Core metadata, `/MarkInfo << /Marked true >>`, and BCP-47 language tags (`en-US` / `pt-PT`).
   - Vector QR codes tagged with `data-preserve-color="true"` to prevent inverted color corruption in dark mode exports.

---

## 🛠️ 10. Engineering Best Practices & Conventions

1. **Frequent Atomic Conventional Commits**:
   - Make atomic git commits at every convenient iteration (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`).
   - Never leave uncommitted code changes across working session turns.
2. **Mandatory Quality Gate Verification**:
   - Always run `npm run lint` and `npm run build` prior to completing any task.
   - Run verification test suites (`npm run test:e2e`, `npm run test:letter`, `npm run test:diff`, etc.) to guarantee 0 regressions.
3. **Zero Hardcoded Strings**:
   - All user-facing strings must reside in bilingual localization dictionaries (`src/locales/en/*.json` and `src/locales/pt/*.json`) accessed via `useTranslation` or `t()`.
4. **State Mutation Discipline**:
   - Maintain immutable state update patterns in `useCV` store. Never mutate CV document objects directly.

---

*Last Updated: September 2026 — PAPYRUS Core Team*
