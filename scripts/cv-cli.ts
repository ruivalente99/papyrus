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
  validateCVSchema,
  compareCVs,
} from "../src/lib/cv-helper";
import type { SupportedLanguage } from "../src/types/cv";

const args = process.argv.slice(2);
const command = args[0] || "help";

function printUsage() {
  console.log(`
PAPYRUS CLI — Dynamic Multilingual Resume & CV Engine
Automated Agent & Developer CLI Tools

Usage:
  npm run cv -- <command> [options]
  npx tsx scripts/cv-cli.ts <command> [options]

Commands:
  validate [preset/file] [--json]
    Run comprehensive schema validation and print structured diagnostic logs for LLMs.

  summary [preset/file] [--lang=en|pt]
    Print human-readable summary of the CV with links and dates.

  lint [preset/file] [--lang=en|pt]
    Run real-time quality linter and return score + list of ATS issues.

  missing [preset/file] --target=<lang>
    Find fields that are not yet translated into target language.

  latex-export [preset/file] [--out=path.tex] [--lang=en|pt]
    Export CV to a compilable LaTeX (.tex) document with hyperref links.

  latex-import <path.tex> [--out=path.json]
    Parse and import a LaTeX CV into a valid PAPYRUS JSON document.

  add-skill [preset/file] --cat-en="..." --cat-pt="..." --skill="..." [--out=path.json]
    Add a skill tag to a category.

  add-exp [preset/file] --role-en="..." --company="..." --start="YYYY-MM" [--current] [--bullets-en="b1|b2"] [--out=path.json]
    Add a work experience item.

  export [preset/file] --out=path.json
    Export clean JSON backup of the CV.

  diff <preset/fileA> <preset/fileB> [--lang=en|pt] [--json]
    Semantically compare two CV versions, highlighting field, bullet, and ATS differentials.

Presets:
  lateralis | classic | matrix | empty

Examples:
  npm run cv -- validate classic --json
  npm run cv -- diff lateralis classic --lang=en
  npm run cv -- summary lateralis --lang=en
  npm run cv -- latex-export classic --out=resume.tex --lang=en
  npm run cv -- lint matrix --lang=en
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
  const targetSource = args[1] && !args[1].startsWith("--") ? args[1] : "classic";
  const lang = ((flags.lang as string) || "en") as SupportedLanguage;

  switch (command) {
    case "validate": {
      const cv = loadCV(targetSource);
      const report = validateCVSchema(cv);

      if (flags.json) {
        console.log(JSON.stringify(report, null, 2));
      } else {
        console.log(`\n=== PAPYRUS SCHEMA VALIDATION REPORT ===`);
        console.log(`Status: ${report.valid ? "✅ VALID" : "❌ INVALID"}`);
        console.log(`Errors: ${report.errorCount} | Warnings: ${report.warningCount}`);
        console.log(`Summary: ${report.summary}\n`);

        if (report.errors.length > 0) {
          console.log(`Diagnostics & Actionable Suggestions for LLMs:\n`);
          report.errors.forEach((err, idx) => {
            const icon = err.severity === "error" ? "❌ [ERROR]" : "⚠️  [WARN]";
            console.log(`${idx + 1}. ${icon} ${err.rule} @ '${err.path}'`);
            console.log(`   Message: ${err.message}`);
            console.log(`   Received: ${JSON.stringify(err.receivedValue)}`);
            console.log(`   💡 Fix Suggestion: ${err.suggestion}\n`);
          });
        }
      }

      if (!report.valid) {
        process.exitCode = 1;
      }
      break;
    }

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
      const targetLang = (flags.target as string) || "pt";
      const missing = findMissingTranslations(cv, targetLang);
      console.log(JSON.stringify({ targetLang, count: missing.length, missing }, null, 2));
      break;
    }

    case "latex-export": {
      const cv = loadCV(targetSource);
      const outPath = (flags.out as string) || `${(cv.personalInfo.fullName || "resume").toLowerCase().replace(/\s+/g, "_")}_cv.tex`;
      const tex = exportCVToLatex(cv, lang, outPath);
      console.log(`✅ Successfully exported LaTeX document to: ${outPath}`);
      break;
    }

    case "latex-import": {
      const texPath = args[1];
      if (!texPath || texPath.startsWith("--")) {
        console.error("❌ Error: Please provide path to .tex file (e.g. npm run cv -- latex-import resume.tex)");
        process.exit(1);
      }
      const parsed = importCVFromLatex(texPath);
      const outPath = (flags.out as string) || "imported-cv.json";
      saveCV(parsed as any, outPath);
      console.log(`✅ Successfully parsed LaTeX and saved JSON CV to: ${outPath}`);
      break;
    }

    case "export": {
      const cv = loadCV(targetSource);
      const outPath = (flags.out as string) || "cv-export.json";
      saveCV(cv, outPath);
      console.log(`✅ Successfully exported CV to: ${outPath}`);
      break;
    }

    case "add-skill": {
      let cv = loadCV(targetSource);
      const catPt = (flags["cat-pt"] as string) || "Competências Técnicas";
      const catEn = (flags["cat-en"] as string) || "Technical Skills";
      const skill = flags.skill as string;
      if (!skill) {
        console.error("❌ Error: --skill parameter is required (e.g. --skill=\"TypeScript\").");
        process.exit(1);
      }
      cv = addSkill(cv, { pt: catPt, en: catEn }, skill);
      const outPath = (flags.out as string) || "cv-updated.json";
      saveCV(cv, outPath);
      console.log(`✅ Added skill "${skill}" to category "${catEn}". Saved to ${outPath}`);
      break;
    }

    case "add-exp": {
      let cv = loadCV(targetSource);
      const rolePt = (flags["role-pt"] as string) || (flags["role-en"] as string);
      const roleEn = (flags["role-en"] as string) || (flags["role-pt"] as string);
      const company = flags.company as string;
      const start = flags.start as string;
      const end = (flags.end as string) || "";
      const isCurrent = Boolean(flags.current);
      const bulletsPt = ((flags["bullets-pt"] as string) || "").split("|").filter(Boolean);
      const bulletsEn = ((flags["bullets-en"] as string) || "").split("|").filter(Boolean);

      if (!roleEn || !company || !start) {
        console.error("❌ Error: --role-en, --company, and --start are required.");
        process.exit(1);
      }

      cv = addExperience(cv, {
        role: { en: roleEn, pt: rolePt || roleEn },
        company,
        startDate: start,
        endDate: end,
        isCurrent,
        highlights: { en: bulletsEn.length ? bulletsEn : bulletsPt, pt: bulletsPt.length ? bulletsPt : bulletsEn },
      });

      const outPath = (flags.out as string) || "cv-updated.json";
      saveCV(cv, outPath);
      console.log(`✅ Added experience "${roleEn} @ ${company}". Saved to ${outPath}`);
      break;
    }

    case "diff": {
      const sourceA = args[1] && !args[1].startsWith("--") ? args[1] : "classic";
      const sourceB = args[2] && !args[2].startsWith("--") ? args[2] : "lateralis";

      const cvA = loadCV(sourceA);
      const cvB = loadCV(sourceB);
      const result = compareCVs(cvA, cvB, lang);

      if (flags.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`\n======================================================`);
        console.log(`  PAPYRUS CV COMPARATOR & SEMANTIC DIFF`);
        console.log(`  Version A: ${sourceA}  vs  Version B: ${sourceB}`);
        console.log(`  Language: ${lang.toUpperCase()}`);
        console.log(`======================================================\n`);

        console.log(`📊 ATS & QUALITY COMPARISON:`);
        result.atsMetrics.forEach((m) => {
          const status = m.improved === true ? "📈 IMPROVED" : m.improved === false ? "📉 REGRESSED" : "➖ EQUAL";
          console.log(`  • ${m.name.padEnd(30)} [A: ${String(m.valueA).padEnd(6)}] -> [B: ${String(m.valueB).padEnd(6)}] (Diff: ${String(m.diff).padEnd(6)}) ${status}`);
        });

        console.log(`\n👤 PERSONAL INFO CHANGES:`);
        const changedFields = result.personalInfoDiff.filter((d) => d.status !== "unchanged");
        if (changedFields.length === 0) {
          console.log(`  (No personal info differences)`);
        } else {
          changedFields.forEach((d) => {
            const badge = d.status === "added" ? "[+ ADDED]" : d.status === "removed" ? "[- REMOVED]" : "[~ MODIFIED]";
            console.log(`  ${badge} ${d.label}: "${d.valueA || ""}" -> "${d.valueB || ""}"`);
          });
        }

        console.log(`\n📑 SECTIONS & CONTENT DIFF:`);
        result.sectionsDiff.forEach((sec) => {
          if (sec.status === "unchanged") return;
          console.log(`\n  📂 [Section: ${sec.titleA || sec.titleB || sec.type}] (${sec.status.toUpperCase()})`);
          sec.itemsDiff.forEach((it) => {
            if (it.status === "unchanged") return;
            const badge = it.status === "added" ? "[+]" : it.status === "removed" ? "[-]" : "[~]";
            console.log(`    ${badge} ${it.title}${it.subtitle ? ` (${it.subtitle})` : ""}`);

            if (it.fieldChanges && it.fieldChanges.length > 0) {
              it.fieldChanges.forEach((fc) => {
                console.log(`        • ${fc.label}: "${fc.valueA}" -> "${fc.valueB}"`);
              });
            }

            if (it.bulletsDiff && it.bulletsDiff.length > 0) {
              it.bulletsDiff.forEach((bd) => {
                if (bd.type === "add") console.log(`        + ${bd.text}`);
                else if (bd.type === "remove") console.log(`        - ${bd.text}`);
              });
            }
          });
        });

        console.log(`\n------------------------------------------------------`);
        console.log(`📈 SUMMARY: ${result.summary.totalChanges} total changes (${result.summary.additions} added, ${result.summary.deletions} removed, ${result.summary.modifications} modified)`);
        console.log(`------------------------------------------------------\n`);
      }
      break;
    }

    case "help":
    default:
      printUsage();
      break;
  }
}

main().catch((err) => {
  console.error("❌ CLI Error:", err.message);
  process.exit(1);
});
