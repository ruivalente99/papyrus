# TypeUI · Charm Design System & Marketing Guidelines

> Extracted from `https://charm-typeui-b08baaa4.vercel.app/marketing`

---

## 🎨 1. Core Visual Identity & Philosophy

**Charm** is a light, warm, and friendly design system designed for maximum clarity, approachability, and polish. It pairs soft rounded geometries with crisp borders, warm neutral backgrounds, and vibrant brand accents.

---

## 📐 2. Design Tokens & Variables

### Color Palette
```css
:root {
  /* Text & Content */
  --heading: #1c1917;              /* Deep stone charcoal */
  --body: #57534e;                 /* Mid stone */
  --body-subtle: #79716b;          /* Soft stone gray */
  --fg-disabled: #a8a29e;

  /* Brand Accents (Warm Coral / Vivid Tone) */
  --brand: #e4544b;
  --brand-light: #ec6f66;
  --brand-medium: #d24439;
  --brand-strong: #b8362e;
  --brand-soft: #fbd9d6;
  --brand-softer: #fdedec;
  --fg-brand: #c9443a;
  --fg-brand-strong: #ae382f;

  /* Surfaces & Backgrounds */
  --page: #f7f7f5;                 /* Warm off-white page background */
  --card: #ffffff;
  --card-soft: #fbfaf9;
  --control-fill: #f5f4f1;          /* Subtle input & pill fill */
  --app-surface: #f5f4f1;
  --band: #f1f2ea;                 /* Warm hero & footer band background */
  --white: #ffffff;

  /* Status Colors */
  --success: #1ebd66;
  --success-strong: #179c53;
  --success-soft: #eafbf1;
  --danger: #e5484d;
  --danger-strong: #c73737;
  --danger-soft: #fbebeb;
  --warning: #ffa211;
  --warning-soft: #fff6df;
  --fg-warning: #b36a00;

  /* Borders */
  --border: #e7e6e5;
  --border-subtle: #ebebe7;
  --border-medium: #d6d3d1;
  --border-strong: #a8a29e;
  --border-on-band: #e6e8dd;

  /* Radii */
  --r-xs: 4px;
  --r-sm: 6px;
  --r-md: 8px;
  --r-lg: 12px;
  --r-xl: 24px;
  --r-xxl: 24px;
  --r-full: 9999px;

  /* Elevations & Shadows */
  --elevation-1: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --elevation-2: 0px 0px 0px 1px rgba(0,0,0,0.04), 0px 1px 1px 0.5px rgba(0,0,0,0.04), 0px 3px 3px 1.5px rgba(0,0,0,0.04), 0px 6px 6px -3px rgba(0,0,0,0.04), 0px 12px 12px -6px rgba(0,0,0,0.04), 0px 24px 24px -12px rgba(0,0,0,0.04);
  --elevation-3: 0px 0px 24px rgba(228, 84, 75, 0.25);
  --focus-ring: 0 0 0 4px var(--brand-soft);

  /* Typography */
  --font-sans-stack: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono-stack: "Fragment Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --font-display-stack: "DM Sans", "Circular Std", ui-sans-serif, sans-serif;

  /* Layout */
  --container: 1280px;
  --section-y: 112px;
}
```

---

## 🧱 3. Component Architecture & Patterns

### 1. Pill Buttons (`.btn`)
- **Pill Shape**: Fully rounded (`border-radius: var(--r-full)`).
- **Subtle Gradient & Elevation**: Primary buttons use a subtle vertical gradient (`var(--brand-light)` to `var(--brand)`) with soft hover states.
- **Sizes**:
  - `btn--sm`: `12px 20px`, text `13px`
  - `btn--default`: `14px 26px`, text `14px`
  - `btn--lg`: `17px 24px`, text `16px`

### 2. Rounded Field Shells (`.field-shell`)
- Encapsulated input container with `border-radius: var(--r-full)`, subtle border, leading icon support, and active focus ring (`--focus-ring: 0 0 0 4px var(--brand-soft)`).

### 3. Feature Bento Grids (`.prc__bento` / `.wgrid`)
- Structured multi-column grid layouts with rounded corners (`--r-xl: 24px`), individual cell icons encased in soft tinted circles, and clear hierarchy (`h3` title + descriptive paragraph).

### 4. Segmented Control Tabs (`.segmented` / `.fshow__seg`)
- Pill-shaped background container (`--control-fill`) containing toggle buttons with active pill highlight (`bg-white` + `shadow-xs`).

### 5. Eyebrow Tags
- Monospace uppercase kicker with tracking:
  ```css
  .eyebrow {
    font-family: var(--font-mono-stack);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--fg-brand);
    font-size: 12px;
    font-weight: 500;
  }
  ```

### 6. Stats & Proof Cards
- Large tabular numerals in mono/display stack with high contrast, paired with clear labels, customer quotation blocks, and trust badges.
