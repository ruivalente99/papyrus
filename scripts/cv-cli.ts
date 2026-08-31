#!/usr/bin/env tsx

import {
  loadCV,
  saveCV,
  summarizeCV,
  lintCV,
  addExperience,
  addSkill,
  findMissingTranslations,
  exportCVToLatex,
  importCVFromLatex,
} from "../src/lib/cv-helper";
import type { SupportedLanguage } from "../src/types/cv";

const args = process.argv.slice(2);
const command = args[0] || "help";

function printUsage() {
  console.log(`
CVANA CLI - Dynamic Multilingual Resume Tool for LLMs and Developers

Usage:
  npx tsx scripts/cv-cli.ts <command> [options]
  npm run cv -- <command> [options]

Commands:
  summary [seed/file] [--lang=pt|en]
    Print human-readable summary of the CV.

  lint [seed/file] [--lang=pt|en]
    Run quality linter and return score + list of issues.

  missing [seed/file] --target=<lang>
    Find fields that are not yet translated into target language.

  latex-export [seed/file] [--out=path.tex] [--lang=pt|en]
    Export CV to a compilable LaTeX (.tex) document.

  latex-import <path.tex> [--out=path.json]
    Parse and import a LaTeX CV into a JSON document.

  add-skill [seed/file] --cat-pt="..." --cat-en="..." --skill="..." [--out=path.json]
    Add a skill to a category.

  add-exp [seed/file] --role-pt="..." --role-en="..." --company="..." --start="..." [--current] [--bullets-pt="b1|b2"] [--out=path.json]
    Add a work experience entry.

  export [seed/file] --out=path.json
    Export CV document to a JSON backup file.

Presets available:
  creative-sidebar | technical-latex | executive-pro | empty

Examples:
  npm run cv -- summary creative-sidebar --lang=pt
  npm run cv -- latex-export technical-latex --out=resume.tex --lang=en
  npm run cv -- latex-import resume.tex --out=imported-cv.json
  npm run cv -- lint executive-pro --lang=pt
`);
}

function parseFlags(rawArgs: string[]): Record<string, string | boolean> {
  const flags: Record<string, string | boolean> = {};
  rawArgs.forEach((arg) => {
    if (arg.startsWith("--")) {
      const parts = arg.slice(2).split("=");
      flags[parts[0]] = parts.length > 1 ? parts[1] : true;
    }
  });
  return flags;
}

async function main() {
  const flags = parseFlags(args);
  const targetSource = args[1] && !args[1].startsWith("--") ? args[1] : "creative-sidebar";
  const lang = ((flags.lang as string) || "pt") as SupportedLanguage;

  switch (command) {
    case "summary": {
      const cv = loadCV(targetSource);
      console.log(summarizeCV(cv, lang));
      break;
    }

    case "lint": {
      const cv = loadCV(targetSource);
      const report = lintCV(cv, lang);
      console.log(JSON.stringify(report, null, 2));
      break;
    }

    case "missing": {
      const cv = loadCV(targetSource);
      const targetLang = (flags.target as string) || "en";
      const missing = findMissingTranslations(cv, targetLang);
      console.log(JSON.stringify({ targetLang, count: missing.length, missing }, null, 2));
      break;
    }

    case "latex-export": {
      const cv = loadCV(targetSource);
      const outPath = (flags.out as string) || `${cv.personalInfo.fullName.toLowerCase().replace(/\s+/g, "_")}_cv.tex`;
      const tex = exportCVToLatex(cv, lang, outPath);
      console.log(`Successfully exported LaTeX document to: ${outPath}`);
      break;
    }

    case "latex-import": {
      const texPath = args[1];
      if (!texPath || texPath.startsWith("--")) {
        console.error("Error: Please provide path to .tex file (e.g. npm run cv -- latex-import my-cv.tex)");
        process.exit(1);
      }
      const parsed = importCVFromLatex(texPath);
      const outPath = (flags.out as string) || "imported-cv.json";
      saveCV(parsed as any, outPath);
      console.log(`Successfully parsed LaTeX and saved JSON CV to: ${outPath}`);
      break;
    }

    case "export": {
      const cv = loadCV(targetSource);
      const outPath = (flags.out as string) || "cv-export.json";
      saveCV(cv, outPath);
      console.log(`Successfully exported CV to: ${outPath}`);
      break;
    }

    case "add-skill": {
      let cv = loadCV(targetSource);
      const catPt = (flags["cat-pt"] as string) || "Competências";
      const catEn = (flags["cat-en"] as string) || "Skills";
      const skill = flags.skill as string;
      if (!skill) {
        console.error("Error: --skill parameter is required.");
        process.exit(1);
      }
      cv = addSkill(cv, { pt: catPt, en: catEn }, skill);
      const outPath = (flags.out as string) || "cv-updated.json";
      saveCV(cv, outPath);
      console.log(`Added skill "${skill}" to category "${catPt}". Saved to ${outPath}`);
      break;
    }

    case "add-exp": {
      let cv = loadCV(targetSource);
      const rolePt = flags["role-pt"] as string;
      const roleEn = flags["role-en"] as string;
      const company = flags.company as string;
      const start = flags.start as string;
      const end = (flags.end as string) || "";
      const isCurrent = Boolean(flags.current);
      const bulletsPt = ((flags["bullets-pt"] as string) || "").split("|").filter(Boolean);
      const bulletsEn = ((flags["bullets-en"] as string) || "").split("|").filter(Boolean);

      if (!rolePt || !company || !start) {
        console.error("Error: --role-pt, --company, and --start are required.");
        process.exit(1);
      }

      cv = addExperience(cv, {
        role: { pt: rolePt, en: roleEn || rolePt },
        company,
        startDate: start,
        endDate: end,
        isCurrent,
        highlights: { pt: bulletsPt, en: bulletsEn.length ? bulletsEn : bulletsPt },
      });

      const outPath = (flags.out as string) || "cv-updated.json";
      saveCV(cv, outPath);
      console.log(`Added experience "${rolePt} @ ${company}". Saved to ${outPath}`);
      break;
    }

    case "help":
    default:
      printUsage();
      break;
  }
}

main().catch((err) => {
  console.error("CLI Error:", err.message);
  process.exit(1);
});
