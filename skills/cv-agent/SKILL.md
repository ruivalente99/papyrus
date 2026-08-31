---
name: cv-agent
description: >-
  Manage, edit, translate, validate, import, and export dynamic multilingual resumes (CVs) in the PAPYRUS project.
  Supports JSON backup, TeX export/import (.tex), and quality linter audits.
---

# PAPYRUS Resume Agent Skill

This skill allows an AI agent to programmatically inspect, modify, translate, validate, and export multilingual CVs in the **PAPYRUS** project with TeX and JSON support.

## When to Use This Skill
- User asks to add, remove, or modify job experiences, education, skills, or personal info in their CV.
- User wants to translate their resume into another language (e.g. from English to Portuguese, Spanish, etc.).
- User wants to export or import their CV to/from **TeX (`.tex`)** or **JSON**.
- User asks to check or improve their CV's quality score and ATS compatibility.

---

## 🛠️ CLI Quick Reference

All commands can be executed in the `/Volumes/valentium/git/cvana` workspace:

### 1. View Summary
```bash
npm run cv -- summary [preset_or_file] [--lang=en|pt]
```
*Available Presets:* `lateralis`, `classic`, `matrix`, `empty`.

### 2. Export to TeX (.tex)
```bash
npm run cv -- latex-export classic --out=resume.tex --lang=en
```

### 3. Import from TeX (.tex)
```bash
npm run cv -- latex-import resume.tex --out=imported-cv.json
```

### 4. Run Quality Linter
```bash
npm run cv -- lint [preset_or_file] [--lang=en|pt]
```
Returns a JSON object with `score` (0-100), `passedChecks`, and detailed list of issues with severity levels (`error`, `warning`, `info`).

### 5. Check Missing Translations
```bash
npm run cv -- missing [preset_or_file] --target=<lang>
```
Scans all fields and lists paths where the target language translation is empty or missing.

### 6. Add Job Experience
```bash
npm run cv -- add-exp [preset_or_file] \
  --role-en="Senior Software Engineer" \
  --role-pt="Engenheiro de Software Sénior" \
  --company="Acme Corp" \
  --start="2024-01" \
  --current \
  --bullets-en="Project leadership|Performance optimization" \
  --bullets-pt="Liderança de projeto|Otimização de performance" \
  --out=updated.json
```

### 7. Add Skill Tag
```bash
npm run cv -- add-skill [preset_or_file] \
  --cat-en="Technical Skills" \
  --cat-pt="Competências Técnicas" \
  --skill="Next.js" \
  --out=updated.json
```

### 8. Export to JSON Backup File
```bash
npm run cv -- export [preset_or_file] --out=backup.json
```

---

## 💻 Programmatic Node/TypeScript Usage

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

// 1. Load document
const cv = loadCV("lateralis");

// 2. Export to TeX
exportCVToLatex(cv, "en", "resume.tex");

// 3. Import from TeX
const parsed = importCVFromLatex("resume.tex");

// 4. Validate
const report = lintCV(cv, "en");

// 5. Mutate fields directly
cv.personalInfo.headline.en = "Senior Fullstack Engineer";
cv.personalInfo.summary.en = "Experienced architect in modern React and cloud architectures.";

// 6. Save
saveCV(cv, "my-cv.json");
```
