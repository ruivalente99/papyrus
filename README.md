# PAPYRUS — Architectura Vitae

> Dynamic, Multilingual Resume & Curriculum Vitae Engine with Real-Time Quality Auditing, LaTeX/JSON Support, Interactive Live Preview, Cover Letter Engine, and AI Agent Automation.

Powered by **`@ruivalente99/bibliotheca`** design tokens and editor core.

---

## Key Capabilities

1. **Multilingual by Design (Decoupled i18n)**:
   - Full decoupling between Application Interface Language (`uiLang`) and Document CV Language (`cvLang`).
   - Symmetrical English and Portuguese catalogs with unified, accessible language switcher and search.

2. **Split-Pane Interactive Builder**:
   - Left Pane: Modular, collapsible form sections, integrated section navigation pill bar with mouse/touch dragging, and global expand/collapse controls.
   - Right Pane: Synchronized live A4 preview with zoom controls (40% to 140%), dynamic auto-fit on window resize and orientation change, instant tooltips, and canvas cheat-sheet legend (`[?]`).
   - Clean top bar with consolidated secondary tools menu (**Tools / Ferramentas**).

3. **Cover Letter Generator & Unified Application Package**:
   - Coordinated executive cover letter matching active CV typography, font size, and accent color.
   - Natural top-to-bottom layout flow and clean left-aligned typography.
   - Unified multi-page application package combining Cover Letter (Page 1) and CV (Pages 2+) into a single PDF with mapped clickable hyperlink annotations.

4. **Curated Clean Layout Templates**:
   - **`Lateralis`**: Modern split-column layout with customizable accent palette, portrait and timeline.
   - **`Classic`**: Minimalist engineering layout matching standard TeX conventions, 100% ATS-friendly.
   - **`Matrix`**: Structured multi-column executive layout with CEFR language competence grid.
   - **`Blank Canvas`**: Clean starting slate for custom profiles.

5. **Editorial Typography Selector (12 ATS Fonts)**:
   - Curated collection of 12 ATS-optimized font families:
     - Sans: Inter, Roboto, Outfit, Plus Jakarta Sans, Raleway.
     - Serif: Merriweather, EB Garamond, Lora, Source Serif 4.
     - Mono: JetBrains Mono, Fira Code, Roboto Mono.
   - Bi-directional LaTeX font package synchronization.

6. **Visual CV Comparator & Semantic Diff Engine**:
   - Synchronized side-by-side dual canvas comparison with scroll locking.
   - LCS semantic diff tree for bullet points and fields with selective 1-click merging ("Apply to Active CV").
   - Comparative ATS and quality metrics matrix.

7. **ATS Job Vacancy Keyword Matcher & XYZ Bullet Polisher**:
   - 100% client-side, offline ATS keyword extraction comparing job listings against active CV content.
   - Real-time bullet polishing powered by Google's XYZ formula (*Accomplished [X], measured by [Y], by doing [Z]*).

8. **Multi-Profile Management & Storage**:
   - Switch between multiple CV variations (e.g. Frontend Engineer, Technical Lead, Consultant).
   - Fast profile duplication, renaming, deletion safeguards, and full bundle backup/restore.

9. **Precision PDF Export Engine with Security & Accessibility**:
   - Standard A4 locked dimensions (794px x 1123px at 96 DPI).
   - Smart page break algorithm (`data-page-break-avoid`) and visual manual split (`\pagebreak`).
   - Zero-dependency 128-bit PDF Standard Encryption (ISO 32000-1) with user/owner passwords and permission bitmasks.
   - PDF/UA (ISO 14289-1) and WCAG 2.1 AA accessibility tagging.
   - Creative Dark Mode PDF export option.

10. **TeX (.tex), JSON Resume & Europass XML Interoperability**:
    - Bi-directional TeX export and import with character escaping.
    - Full support for JSON Resume (`jsonresume.org`) v1.0.0 and European Union Europass XML schemas.

11. **Mobile Ergonomics**:
    - Docked bottom navigation bar on mobile devices (`[Editar]` | `[Pre-visualizacao]`).
    - Unclipped responsive menus and dropdowns.
    - Zero horizontal ghost scrolling and ghost dragging prevention.

---

## AI Agent Automation Skill (`cv-agent`)

PAPYRUS includes an automated agent skill at [`.agents/skills/cv-agent/SKILL.md`](./.agents/skills/cv-agent/SKILL.md). This allows AI agents to programmatically audit, translate, mutate, and export resumes via CLI or TypeScript API without opening a browser.

### Skill CLI Commands (`npm run cv -- <command>`)

```bash
# 1. Inspect Resume Summary
npm run cv -- summary lateralis --lang=en
npm run cv -- summary my-cv.json --lang=pt

# 2. Run Real-Time Quality Linter Audit
npm run cv -- lint lateralis --lang=en

# 3. Check for Missing Translations
npm run cv -- missing lateralis --target=pt

# 4. Semantic CV Diff between two documents
npm run cv -- diff sourceA.json sourceB.json --lang=en

# 5. Export CV to Compilable TeX (.tex)
npm run cv -- latex-export classic --out=resume.tex --lang=en

# 6. Import CV from Existing TeX Document
npm run cv -- latex-import resume.tex --out=imported-cv.json

# 7. Export JSON Resume or Europass XML
npm run cv -- jsonresume-export lateralis --out=resume.json
npm run cv -- europass-export lateralis --out=europass.xml

# 8. Encrypt PDF with Password
npm run cv -- encrypt-pdf document.pdf --password="SecretPassword" --out=secure.pdf

# 9. Export Clean JSON Backup
npm run cv -- export lateralis --out=backup.json
```

---

## Quality Gates & Verification

```bash
# Run all verification suites
npm run test:e2e

# Run Cover Letter tests
npm run test:letter && npm run test:letter-pagination

# Run CV Diff & Page Break tests
npm run test:diff && npm run test:breaks

# Run full ESLint audit
npm run lint

# Production compilation
npm run build
```

---

## The Four Canonical Documentation Pillars

- [AGENTS.md](./AGENTS.md): Operational manual for agents and developers.
- [DESIGN.md](./DESIGN.md): Design system tokens, typography scales, mobile ergonomics, and accessibility.
- [ARCHITECTURE.md](./ARCHITECTURE.md): System architecture, data flow, and Bibliotheca integration.
- [SOUL.md](./SOUL.md): Philosophical manifesto on user sovereignty, career dignity, and technical sobriety.

---

*PAPYRUS — Architectura Vitae*
