# PAPYRUS — Architectura Vitae

> Dynamic, Multilingual Resume & Curriculum Vitae Engine with Real-Time Quality Auditing, LaTeX/JSON Support, Interactive Live Preview, and AI Agent Automation.

---

## ✨ Key Features

1. **Multilingual by Design (N Languages)**:
   - Built-in support for English (default) and Portuguese, with seamless dynamic addition of any language.
   - Real-time language switcher with smart translation fallbacks.

2. **Split-Pane Interactive Builder**:
   - Left Pane: Modular, collapsible form sections with drag-and-drop icon pickers (30+ platforms and contacts).
   - Right Pane: Synchronized live A4 preview with zoom controls (40% to 140%), spacing density presets (Compact, Balanced, Spacious), and page boundary guide.
   - Section reordering and granular item visibility toggles.
   - **Persistent LocalStorage Cache**: All changes and uploads are instantly cached in your browser so your work is never lost between sessions.

3. **Curated Clean Layout Templates**:
   - **`Lateralis`**: Modern split-column layout with customizable accent palette, portrait and timeline.
   - **`Classic`**: Minimalist engineering layout matching standard TeX conventions, 100% ATS-friendly.
   - **`Matrix`**: Structured multi-column executive layout with CEFR language competence grid.

4. **TeX (`.tex`) & JSON Engine**:
   - Bi-directional TeX export and import with special character escaping.
   - Agnostic drag-and-drop upload zone on the onboarding setup page.
   - Downloadable starter boilerplates: `template.json` and `template.tex`.

5. **Real-Time Quality Audit & Linter**:
   - Dynamic 0–100% resume score based on completeness, quantifiable achievements, translation coverage, and ATS formatting guidelines.

6. **Precision PDF Export Engine**:
   - Standard A4 locked dimensions (794px × 1123px at 96 DPI).
   - Smart page break algorithm preventing sliced text lines.
   - Embedded interactive clickable hyperlinks for all emails, phone numbers, and web platforms.

7. **Theme Customization**:
   - Global App Mode: Light (☀️), Dark (🌙), and System (💻) with zero flash on load.
   - Customizable palette accent colors and typography.

---

## 🤖 Antigravity AI Agent Skill (`cv-agent`)

PAPYRUS comes equipped with a dedicated **AI Agent Skill** located at [`.agents/skills/cv-agent/SKILL.md`](./.agents/skills/cv-agent/SKILL.md). This allows AI agents (such as Antigravity, Claude, or custom LLMs) to programmatically audit, translate, mutate, and export resumes directly via CLI or TypeScript API without needing a browser.

### 📌 When to Use the Skill
- **Automated Resume Tailoring**: Tailor your resume content and bullet points to match a specific job description.
- **Multilingual Localization**: Automatically translate all resume sections into a target language while preserving formatting.
- **TeX Generation**: Compile your resume into clean, ATS-compliant LaTeX (`.tex`) files for submission.
- **Quality Assurance**: Run the dynamic linter to get an objective score (0–100%) and actionable recommendations.

### 🛠️ Skill CLI Commands (`npm run cv -- <command>`)

```bash
# 1. Inspect Resume Summary
npm run cv -- summary lateralis --lang=en
npm run cv -- summary my-cv.json --lang=pt

# 2. Run Real-Time Quality Linter Audit
npm run cv -- lint lateralis --lang=en

# 3. Check for Missing Translations
npm run cv -- missing lateralis --target=pt

# 4. Export CV to Compilable TeX (.tex)
npm run cv -- latex-export classic --out=resume.tex --lang=en

# 5. Import CV from Existing TeX Document
npm run cv -- latex-import resume.tex --out=imported-cv.json

# 6. Programmatically Add Job Experience
npm run cv -- add-exp lateralis \
  --role-en="Senior Frontend Engineer" \
  --role-pt="Engenheiro Frontend Sénior" \
  --company="Acme Corp" \
  --start="2024-01" \
  --current \
  --bullets-en="Built high-performance UI systems with React 19|Reduced bundle size by 35%" \
  --bullets-pt="Desenvolvimento de sistemas UI de alto desempenho com React 19|Redução do bundle em 35%" \
  --out=updated.json

# 7. Add a Skill to a Category
npm run cv -- add-skill lateralis \
  --cat-en="Technical Skills" \
  --cat-pt="Competências Técnicas" \
  --skill="Next.js" \
  --out=updated.json

# 8. Export Clean JSON Backup
npm run cv -- export lateralis --out=backup.json
```

### 💻 Programmatic TypeScript API (`src/lib/cv-helper.ts`)

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
  findMissingTranslations,
} from "@/lib/cv-helper";

// Load from preset or file
const cv = loadCV("classic");

// Run quality linter audit
const report = lintCV(cv, "en");
console.log(`Quality Score: ${report.score}% (${report.passedChecks}/${report.totalChecks} checks passed)`);

// Export to TeX
exportCVToLatex(cv, "en", "resume.tex");

// Save updated document
saveCV(cv, "my-updated-cv.json");
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed

### Development Server
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm run start
```

---

## 📄 License
MIT © Papyrus
