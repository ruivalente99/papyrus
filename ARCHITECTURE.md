# PAPYRUS — Software Architecture Guide

## 1. Architectural Philosophy & System Boundaries

PAPYRUS is built with Next.js 15, React 19, TypeScript, and Tailwind CSS. It operates as an offline-first client application powered by the foundational design system and editor core of **`@ruivalente99/bibliotheca`**.

### Architectural Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  - Split Layout & Mobile Switcher                           │
│  - Builder Form Pane (PersonalInfo, Experience, Education)  │
│  - Live Preview Canvas (A4 794x1123, Dynamic Auto-Fit)      │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    State & Data Store                       │
│  - useCV Hook (Immutable reactive document state)           │
│  - useProfiles Hook (Multi-profile local storage manager)   │
│  - Decoupled Bilingual i18n (uiLang vs cvLang)              │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Engines & Pipelines                      │
│  - PDF Engine: modern-screenshot, jsPDF, PDF/UA, Security    │
│  - LaTeX Engine: Bi-directional TeX export & import parser  │
│  - ATS Engine: Keyword matcher & real-time linter           │
│  - Diff Engine: LCS array comparison & field delta analysis │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│          Foundational Substrate (@ruivalente99/bibliotheca)  │
│  - /tokens: 7 signature accents, typography, spacing        │
│  - /ui: Buttons, Cards, Modals, Drawers, Tabs, Kbd          │
│  - /editor: SplitEditorLayout, SectionCard, useSectionSync  │
│  - /preview: PreviewViewport, DockableToolbar, GridOverlay  │
│  - /export: Vector PDF, modern-screenshot, JSON I/O, TeX    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Core Subsystems

### 2.1 Multilingual Data Schema (`src/types/cv.ts`)
Every user-facing string is stored as a `MultiLangString`:
```typescript
export interface MultiLangString {
  en?: string;
  pt?: string;
  [lang: string]: string | undefined;
}
```
Application interface language (`uiLang`) and document output language (`cvLang`) are completely decoupled, allowing users to write in English while viewing the UI in Portuguese or vice versa.

### 2.2 Template Architecture (`src/components/preview/templates/`)
1. **`lateralis`**: Contemporary split-column layout with customizable accent banner, portrait, and timeline nodes.
2. **`classic`**: Minimalist engineering layout conforming to academic TeX conventions, optimized for ATS parsers.
3. **`matrix`**: Executive structured layout with CEFR language competence grid.

### 2.3 Verification & Quality Gates
Continuous quality validation is enforced through:
- TypeScript verification: `npm run lint` & `npm run build`.
- Automated test suites: `npm run test:e2e`, `npm run test:letter`, `npm run test:diff`.
- Zero emojis across all source files and commit messages.
