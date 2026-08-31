# PAPYRUS — Architectura Vitae

> Dynamic, Multilingual Resume & Curriculum Vitae Engine with Real-Time Quality Auditing, LaTeX/JSON Support, and Interactive Live Preview.

---

## ✨ Key Features

1. **Multilingual by Design (N Languages)**:
   - Built-in support for English (default) and Portuguese, with seamless dynamic addition of any language.
   - Real-time language switcher with smart translation fallbacks.

2. **Split-Pane Interactive Builder**:
   - Left Pane: Modular, collapsible form sections with drag-and-drop icon pickers (30+ platforms and contacts).
   - Right Pane: Synchronized live A4 preview with zoom controls (40% to 140%), spacing density presets (Compact, Balanced, Spacious), and page boundary guide.
   - Section reordering and granular item visibility toggles.

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

## 🤖 CLI Automation & Agent Reference

For automated CI/CD and LLM scripting, see [`AGENTS.md`](./AGENTS.md).

```bash
# Export CV to compilable TeX
npm run cv -- latex-export classic --out=resume.tex --lang=en

# Import CV from TeX
npm run cv -- latex-import resume.tex --out=imported-cv.json

# Run real-time quality linter audit
npm run cv -- lint lateralis --lang=en
```

---

## 📄 License
MIT © Papyrus
