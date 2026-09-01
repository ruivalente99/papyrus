# PAPYRUS — Design System & Guidelines (TypeUI Charm)

Welcome to the **PAPYRUS** design manual. This specification outlines all design tokens, spacing scales, typography hierarchies, layout conventions, and component standards implemented across the application.

PAPYRUS follows the **TypeUI Charm** design philosophy: a light, warm, friendly interface with soft rounded corners, pill segmented controls, subtle ambient gradients, and crisp monospace details, built with an offline-first, iOS-native aesthetic.

---

## 🏛️ 1. Core Principles

1. **Lowercase Identity**: The product name is strictly formatted as lowercase **`papyrus`** with the dynamic `NanoBananaLogo`.
2. **Apple / iOS Native Minimalism**: Designed to look and feel like an installed iOS/macOS utility app. Clean safe-area margins (`pt-safe`, `pb-safe`), locked horizontal overflow, and zero unwanted ghost dragging (`user-drag: none`).
3. **Minimal Copy & Cognitive Ease**: Interface text is kept to an absolute minimum. Detailed annotations and complex features are tucked into accessible `?` help tooltips (`<HelpTooltip />`).
4. **Pill-Driven Geometry**: Interactive controls, tabs, mode selectors, and tags prioritize full pill geometry (`rounded-full`) with subtle micro-shadows (`shadow-2xs`).
5. **Warm Dynamic Palette**: Subtle ambient radial glows in both light and dark modes provide visual depth without visual clutter (`.charm-bg-dynamic`).

---

## 🎨 2. Design Tokens

### Color Foundations (CSS Variables)

| Token | Light Mode (`:root`) | Dark Mode (`.dark`) | Usage |
| :--- | :--- | :--- | :--- |
| `--page` | `#f7f7f5` | `#0c0a09` | Canvas background, root page body |
| `--card` | `#ffffff` | `#1c1917` | Card surfaces, modal sheets |
| `--card-soft` | `#fbfaf9` | `#171514` | Inner nested items, subtle card fill |
| `--control-fill`| `#f5f4f1` | `#292524` | Input fields, inactive pill track |
| `--band` | `#f1f2ea` | `#1c1917` | Accent strips, table headers |
| `--heading` | `#1c1917` | `#fafaf9` | High-contrast headers, active text |
| `--body` | `#57534e` | `#d6d3d1` | Primary body text, form labels |
| `--body-subtle` | `#79716b` | `#a8a29e` | Secondary captions, timestamps |
| `--brand` | `#b45309` (Amber) | `#f59e0b` (Amber) | Primary accent buttons, active rings |
| `--brand-light` | `#d97706` | `#fbbf24` | Hover states, gradient mid-tones |
| `--brand-soft` | `#fef3c7` | `#451a03` | Active item backdrops, badges |
| `--border` | `#e7e6e5` | `#292524` | Main container borders, separators |
| `--border-subtle`| `#ebebe7` | `#1f1d1b` | Nested borders, card item lines |

### Resume Accent Presets (Document Color Themes)

Users can select one of the following cohesive document accent colors:
- **Teal (Lateralis)**: `#005555`
- **Royal Blue (Classic)**: `#004f90`
- **Navy Blue (Matrix)**: `#1e3a8a`
- **Emerald**: `#047857`
- **Amber / Bronze**: `#b45309`
- **Rose / Burgundy**: `#9f1239`
- **Slate / Charcoal**: `#334155`

---

## 🔤 3. Typography Hierarchy

PAPYRUS pairs a clean modern Sans-Serif body with intentional Monospace micro-labeling:

- **Font Family**:
  - Sans: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` with OpenType font feature settings `"cv02", "cv03", "cv04", "cv11"`.
  - Mono: `ui-monospace, SFMono-Regular, "Roboto Mono", Menlo, monospace`.

### Type Scale

| Role | Tailwind Classes | Size / Line Height | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Brand Mark** | `font-mono text-sm font-bold` | 14px / 20px | `tracking-tight lowercase` | `papyrus` logo text |
| **Section Title** | `text-sm font-bold` | 14px / 20px | `tracking-tight` | Builder section cards, modal titles |
| **Card Header** | `text-xs font-bold` | 12px / 16px | `normal` | Nested item titles (companies, degrees) |
| **Body & Labels** | `text-xs font-medium` | 12px / 16px | `normal` | Form input labels, descriptions |
| **Eyebrow / Category** | `text-[10px] sm:text-[11px] font-mono font-bold` | 10px / 14px | `uppercase tracking-wider` | Section badges, language indicators |
| **Micro Tag** | `text-[9px] sm:text-[10px] font-medium` | 9px–10px | `normal` | Icon tags, helper hints, pill badges |

---

## 📐 4. Spacing, Margins & Paddings

PAPYRUS enforces a strict **4px modular grid**:

### Padding Scale

- **App Header (`BuilderHeader`)**:
  - Vertical: `py-2` (8px) to `py-2.5` (10px)
  - Horizontal: `px-3` (12px) on mobile, `sm:px-4` (16px) on desktop
- **Form Pane (`builder-form-pane`)**:
  - Padding: `p-3` (12px) on mobile, `sm:p-5` (20px) on desktop
  - Internal Max Width: `max-w-2xl` (672px)
- **Preview Canvas (`builder-preview-pane`)**:
  - Viewport Padding: `p-2` (8px) on mobile, `sm:p-5` (20px) on desktop
- **Section Cards (`SectionCard`)**:
  - Outer Padding: `p-4` (16px)
  - Spacing between sections: `space-y-3.5` (14px)
- **Modal Dialogs (`AddSectionModal`, `LinterModal`, `LatexModal`)**:
  - Header: `px-5 py-3.5` (20px / 14px)
  - Body: `p-5` (20px) to `p-6` (24px)
  - Footer Actions: `px-6 py-3.5` (24px / 14px)
- **Pill Buttons (`charm-pill-btn`)**:
  - Primary / Action: `px-3.5 py-1` to `px-4 py-1.5`
  - Compact / Micro: `px-2.5 py-0.5`

### Component Gap Scale

- `gap-1` (4px): Button icons and tight pill rows
- `gap-1.5` (6px): Color selector swatches, segmented buttons
- `gap-2` (8px): Form input pairs, icon picker items
- `gap-2.5` (10px): Section card list items
- `gap-3.5` (14px): Modal grid categories

---

## 🔘 5. Border Radius & Shadows

| Token | Class | Pixel Value | Application |
| :--- | :--- | :--- | :--- |
| **Pill (Full)** | `rounded-full` | `9999px` | Buttons, segmented pill tracks, badges, switcher items, search inputs |
| **Modal / Dialog** | `rounded-3xl` | `24px` | Modals, setup cards, dashboard welcome container |
| **Card (Container)** | `rounded-2xl` | `16px` | Section cards, option tiles, preview card frames |
| **Form Input** | `rounded-xl` | `12px` | All text inputs, selects, textareas, icon tiles |
| **Micro Element** | `rounded-lg` | `8px` | Small action buttons, code snippets |

### Elevation & Shadows

- `shadow-2xs`: Subtle default pill elevation (`box-shadow: 0 1px 2px rgba(0,0,0,0.03)`).
- `shadow-xs`: Active segmented pill tab elevation (`box-shadow: 0 1px 3px rgba(0,0,0,0.06)`).
- `shadow-md`: Floating banners and notification toasts.
- `shadow-2xl`: Modal popups and desktop A4 printable sheet.

---

## 📱 6. Mobile & iOS Native App Standards

1. **Safe-Area Insets**:
   - `pt-safe`: Respects the iOS Dynamic Island / notch.
   - `pb-safe`: Respects the iOS home indicator bar on the floating bottom navigation.
2. **Locked Viewport Boundaries**:
   - `html, body { max-width: 100vw; overflow-x: hidden; overscroll-behavior-x: none; }`
   - Prevents horizontal viewport dragging, bouncing, or sliding away from user touch.
3. **Ghost Drag Prevention**:
   - `*, img, a, button, svg { -webkit-user-drag: none; user-drag: none; }`
   - Prevents browser default image and hyperlink ghost dragging on touch and mouse gestures.
4. **Calculated Heights**:
   - Desktop: `h-[calc(100vh-53px)]`
   - Mobile: `h-[calc(100dvh-53px-56px)]`
   - Keeps both editor and preview bounded exactly between the top header (53px) and bottom tab bar (56px).

---

## 📄 7. A4 Print & Live Preview Standard

- **A4 Physical Dimension**: Strictly calibrated at 96 DPI: **`794px × 1123px`** (`210mm × 297mm`).
- **Dynamic Auto-Fit Engine**:
  - Scales preview based on `ResizeObserver` container width:
    $$\text{scale} = \min\left(1.2, \max\left(0.32, \frac{\text{containerWidth} - \text{margin}}{794}\right)\right)$$
  - On mobile (e.g. 390px), scales smoothly to $\approx 45\%$, centering the A4 page without horizontal scrollbars.
- **Layout-Box Dimension Binding**:
  - The outer wrapper box strictly enforces `width: 794 * zoom` and `height: docHeight * zoom`, preventing phantom whitespace or scroll triggers.
- **Smart Page Break Engine**:
  - Elements with `data-page-break-avoid="true"` are protected from page slicing.
  - Page guide line visualizes the exact 1123px threshold when documents exceed 1 page.

---

## 🧩 8. Component Registry

### 1. `NanoBananaLogo`
- Brand icon dynamically adapting to active theme.
- Features golden amber gradient with theme-aware background box (`bg-amber-500/10 dark:bg-stone-900 border border-amber-300/70 dark:border-stone-750`).
- Rotates slightly on hover with `group-hover:rotate-6`.

### 2. Segmented Pill Control
```tsx
<div className="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-full border border-stone-200 dark:border-stone-700 shadow-2xs">
  <button className="px-3 py-1 text-xs font-bold rounded-full bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs">
    Active Tab
  </button>
  <button className="px-3 py-1 text-xs font-bold rounded-full text-stone-500 dark:text-stone-400 hover:text-stone-900">
    Inactive Tab
  </button>
</div>
```

### 3. Help Tooltip (`HelpTooltip`)
```tsx
<HelpTooltip content="Short descriptive note explaining complex behavior." side="top" />
```

### 4. Primary Action Button
```tsx
<button className="flex items-center gap-1.5 text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white px-3.5 py-1 rounded-full transition-all active:scale-95 shadow-2xs">
  <Plus size={13} />
  <span>Action</span>
</button>
```

---

*Last Updated: September 2026 — PAPYRUS Team*
