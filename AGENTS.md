# PAPYRUS — Architectura Vitae (Agent Reference)

This document serves as the technical guide for AI Agents and LLMs operating on or extending the **PAPYRUS** (Dynamic Multilingual Resume & CV Engine) codebase.

---

## 🏛️ System Architecture

PAPYRUS is an offline-first, multilingual dynamic CV management and builder platform designed with Next.js 15, React 19, TypeScript, and Tailwind CSS. All data models and starter templates are **person-agnostic**, using generic professional mock profiles with bilingual support (English default with Portuguese toggle).

```
                  ┌─────────────────────────────────────────┐
                  │          JSON Seeds / Presets           │
                  │   (lateralis, classic, matrix, empty)   │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │       Core Data Store & i18n Hook       │
                  │         (useCV.ts, useProfiles.ts)      │
                  └─────────┬───────────────────┬───────────┘
                            │                   │
              ┌─────────────▼─────────┐       ┌─▼─────────────────────┐
              │   Builder Form Pane   │       │  Live A4 Preview Pane │
              │     (Left Column)     │       │     (Right Column)    │
              │  - PersonalInfoForm   │       │  - LateralisTemplate  │
              │  - ExperienceForm     │       │  - ClassicTemplate    │
              │  - EducationForm      │       │  - MatrixTemplate     │
              │  - SkillsForm         │       │  - CoverLetterPreview │
              │  - LanguagesForm      │       │                       │
              │  - CoverLetterForm    │       │  - PDF Hyperlink &    │
              │  - Section Navigation │       │    Smart Break Engine │
              │  - Tools & Linter     │       │  - TeX / Diff / Canvas│
              └───────────────────────┘       └───────────────────────┘
```

---

## 📐 Data Schema (`src/types/cv.ts` & `src/types/coverLetter.ts`)

Every text field in the CV is stored as a multilingual map `MultiLangString`:
```typescript
export interface MultiLangString {
  en?: string;
  pt?: string;
  [lang: string]: string | undefined;
}
```

### Key Models:
- **`CVDocument`**: Top-level document containing metadata, defaultLanguage, currentLanguage, availableLanguages (`{ code, label }`), template (`lateralis` | `classic` | `matrix`), theme, personalInfo, ordered sections, and typography settings.
- **`PersonalInfo`**: Full name, headline (multilingual), email, phone, location (multilingual), website, photo URL, photoShape (`circle` | `rounded` | `square`), showPhoto, social links, summary (multilingual), and optional vector QR code configuration.
- **`ExperienceItem`**: Role (multilingual), company, location (multilingual), startDate, endDate, isCurrent, highlights (multilingual array of bullet points), url, visible flag.
- **`EducationItem`**: Degree (multilingual), institution, location (multilingual), startDate, endDate, isCurrent, qeq level, details (multilingual), url, visible flag.
- **`SkillsSection`**: Grouped into categories (`SkillCategory`), each with a multilingual category name and an array of skill tags.
- **`LanguageItem`**: Language name (multilingual), descriptive proficiency level (multilingual), and official CEFR code (`C2 (Native)`, `C1`, `B2`, `B1`, `A2`, `A1`).
- **`CoverLetterDocument`**: Coordinated executive letter document with bilingual recipient details, salutation, body paragraphs, and sign-off block.
- **`CVProfileMeta`**: Multi-profile storage item tracking profile id, title, timestamps, template, and document linkage.

---

## 📦 Preset Starter Templates (`src/data/seeds/`)

1. **`lateralis`** (`template-sidebar.ts`): Modern split-column layout with customizable accent palette, portrait & timeline.
2. **`classic`** (`template-tech-latex.ts`): Minimalist engineering layout matching standard TeX conventions, optimized for ATS parsers.
3. **`matrix`** (`template-executive.ts`): Structured multi-column executive layout with CEFR language competence grid.
4. **`empty`** (`empty.ts`): Clean blank canvas starting point.

---

## 🤖 LLM & CLI Automation Helpers

An AI agent can inspect, validate, edit, translate, and convert CVs to/from TeX and JSON without opening a browser.

### Programmatic API (`src/lib/cv-helper.ts` & `src/lib/latexEngine.ts`)
```typescript
import {
  loadCV,
  saveCV,
  summarizeCV,
  lintCV,
  addExperience,
  addSkill,
  exportCVToLatex,
  importCVFromLatex,
  findMissingTranslations
} from "@/lib/cv-helper";

// Load CV Preset
const cv = loadCV("lateralis"); // or loadCV("path/to/cv.json")

// Export to TeX (.tex)
exportCVToLatex(cv, "en", "resume.tex");

// Import from TeX
const parsedCV = importCVFromLatex("resume.tex");

// Run Linter
const report = lintCV(cv, "en");
console.log(`Quality score: ${report.score}%`);

// Add new job experience
addExperience(cv, {
  role: { en: "Senior Frontend Engineer", pt: "Engenheiro Frontend Sénior" },
  company: "Acme Corp",
  startDate: "2024-01",
  isCurrent: true,
  highlights: {
    en: ["Developed reactive user interfaces using React and TypeScript."],
    pt: ["Desenvolvimento de interfaces reativas com React e TypeScript."]
  }
});

// Save updated CV
saveCV(cv, "my-updated-cv.json");
```

### CLI Commands (`npm run cv -- <command>`)
```bash
# Get summary in English or Portuguese
npm run cv -- summary lateralis --lang=en
npm run cv -- summary classic --lang=pt

# Export to compilable TeX (.tex)
npm run cv -- latex-export classic --out=resume.tex --lang=en

# Import from existing TeX file
npm run cv -- latex-import resume.tex --out=imported-cv.json

# Run real-time quality linter
npm run cv -- lint lateralis --lang=en

# Semantic CV Diff between two versions
npm run cv -- diff sourceA.json sourceB.json --lang=en

# Find missing translations for target language
npm run cv -- missing lateralis --target=pt

# Add a skill to category
npm run cv -- add-skill lateralis --cat-en="Technical Skills" --cat-pt="Competências Técnicas" --skill="GraphQL" --out=updated.json

# Export JSON Resume or Europass XML
npm run cv -- jsonresume-export lateralis --out=resume.json
npm run cv -- europass-export lateralis --out=europass.xml

# PDF Security & Encryption CLI
npm run cv -- encrypt-pdf resume.pdf --password="SecretPassword" --out=secure.pdf

# Export JSON backup
npm run cv -- export lateralis --out=backup.json
```

---

## 🖨️ PDF & Page Break Engine (`src/lib/pdfExport.ts`)

- **Exact A4 Dimensions**: Strictly locked to standard A4 at 96 DPI: **`794px × 1123px`** (`210mm × 297mm`).
- **Interactive Hyperlinks**: Scans all `<a>` tags in the DOM, translates positions into millimeter page coordinates, and embeds native PDF link annotations using `jsPDF.link(x, y, w, h, { url })`.
- **Smart Page Break Detection**: Evaluates child bounding boxes (`data-page-break-avoid="true"`) to break cleanly between blocks instead of slicing through text.
- **Forced Page Breaks**: Honors `pageBreakBefore: true` on marked sections and syncs bidirectionally with LaTeX `\newpage`.
- **Multi-Page Application Packages**: Generates cohesive PDF packages combining the Cover Letter (Page 1) and CV (Pages 2+) with mapped page offset links.
- **Dynamic Auto-Fit Engine**: Automatically recalibrates zoom scale on window resize and mobile orientation change without horizontal scrollbars.
- **Density Controls**: Supports `compact`, `normal`, and `spacious` font and spacing presets.

---

## 🔄 Development Workflow & Iterative Commits

- **Frequent Iterative Commits**: Make atomic git commits at every convenient iteration (e.g. after completing a refactor step, fixing an accessibility issue, adding new translation catalogs, or validating a feature). Never leave accumulated work uncommitted across session turns.
- **Commit Format**: Conventional commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`).
- **Verification Before Commit**: Always run `npm run lint`, `npm run build` and `npm run test:e2e` (plus relevant specialized test suites like `npm run test:letter`) to ensure 0 TypeScript or runtime regressions.

