#!/usr/bin/env tsx

/**
 * PAPYRUS — i18n Translation & UI Label Audit Utility
 *
 * Scans all TypeScript / TSX source files using TypeScript AST, verifies every
 * translation key call (t, tr, translate) against all registered locales (EN & PT),
 * checks 100% key symmetry between dictionaries, and detects raw translation keys in JSX.
 *
 * Usage:
 *   npx tsx scripts/audit-i18n.ts [--json]
 *   npm run test:i18n-audit
 *   npm run cv -- audit-i18n
 */

import fs from "fs";
import path from "path";
import ts from "typescript";
import { dictionaries, translate } from "../src/locales";

export interface KeyOccurrence {
  file: string;
  line: number;
  col: number;
  key: string;
}

export interface DiscrepancyReport {
  timestamp: string;
  totalSourceCalls: number;
  uniqueSourceKeys: number;
  dictionaryStats: Record<string, { totalLeaves: number }>;
  missingInEn: KeyOccurrence[];
  missingInPt: KeyOccurrence[];
  symmetryIssues: {
    inEnNotPt: string[];
    inPtNotEn: string[];
  };
  rawKeysInJsx: { file: string; line: number; text: string }[];
  isValid: boolean;
}

function getAllFiles(dir: string, exts: string[]): string[] {
  let files: string[] = [];
  try {
    for (const item of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (item === "node_modules" || item === ".next" || item === "dist") continue;
        files = files.concat(getAllFiles(fullPath, exts));
      } else if (exts.some((ext) => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch (err) {
    console.error("Directory scan error:", err);
  }
  return files;
}

function getLeafKeys(obj: any, prefix = ""): Record<string, string> {
  const keys: Record<string, string> = {};
  if (!obj || typeof obj !== "object") return keys;

  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(keys, getLeafKeys(v, full));
    } else {
      keys[full] = typeof v === "string" ? v : String(v);
    }
  }
  return keys;
}

export function runI18nAudit(options: { rootDir?: string } = {}): DiscrepancyReport {
  const rootDir = options.rootDir || path.resolve(__dirname, "..");
  const srcDir = path.join(rootDir, "src");
  const sourceFiles = getAllFiles(srcDir, [".ts", ".tsx"]);

  const occurrences: KeyOccurrence[] = [];
  const rawKeysInJsx: { file: string; line: number; text: string }[] = [];

  for (const file of sourceFiles) {
    const relPath = path.relative(rootDir, file);
    const code = fs.readFileSync(file, "utf8");
    const sf = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true);

    // 1. Detect raw translation keys rendered in JSX (e.g. >builder.something<)
    const rawKeyRegex = />\s*((?:builder|common|preview|a11y)\.[a-zA-Z0-9_.-]+)\s*</g;
    let rawMatch;
    while ((rawMatch = rawKeyRegex.exec(code)) !== null) {
      const line = code.substring(0, rawMatch.index).split("\n").length;
      rawKeysInJsx.push({ file: relPath, line, text: rawMatch[1] });
    }

    // 2. AST traversal for t(...), tr(...), translate(...) calls
    function visit(node: ts.Node) {
      if (ts.isCallExpression(node)) {
        const expr = node.expression;
        let isI18nCall = false;

        if (ts.isIdentifier(expr)) {
          if (expr.text === "t" || expr.text === "tr" || expr.text === "translate") {
            isI18nCall = true;
          }
        } else if (ts.isPropertyAccessExpression(expr)) {
          // Check for methods like i18n.t or tr.translate, but explicitly avoid ctx.translate (Canvas 2D)
          const objName = ts.isIdentifier(expr.expression) ? expr.expression.text : "";
          const methodName = expr.name.text;
          if (
            (methodName === "t" || methodName === "tr" || methodName === "translate") &&
            !["ctx", "context", "c"].includes(objName)
          ) {
            isI18nCall = true;
          }
        }

        if (isI18nCall && node.arguments.length > 0) {
          const arg0 = node.arguments[0];
          const pos = sf.getLineAndCharacterOfPosition(arg0.getStart());

          if (ts.isStringLiteral(arg0)) {
            occurrences.push({
              file: relPath,
              line: pos.line + 1,
              col: pos.character + 1,
              key: arg0.text,
            });
          }
        }
      }
      ts.forEachChild(node, visit);
    }

    visit(sf);
  }

  // Check missing keys in EN and PT
  const missingInEn: KeyOccurrence[] = [];
  const missingInPt: KeyOccurrence[] = [];

  for (const occ of occurrences) {
    const enVal = translate(occ.key, "en");
    const ptVal = translate(occ.key, "pt");

    if (enVal === occ.key) {
      missingInEn.push(occ);
    }
    if (ptVal === occ.key) {
      missingInPt.push(occ);
    }
  }

  // Check dictionary symmetry
  const enLeaves = getLeafKeys(dictionaries.en);
  const ptLeaves = getLeafKeys(dictionaries.pt);

  const enKeySet = new Set(Object.keys(enLeaves));
  const ptKeySet = new Set(Object.keys(ptLeaves));

  const inEnNotPt = Array.from(enKeySet).filter((k) => !ptKeySet.has(k));
  const inPtNotEn = Array.from(ptKeySet).filter((k) => !enKeySet.has(k));

  const uniqueSourceKeys = new Set(occurrences.map((o) => o.key)).size;

  const isValid =
    missingInEn.length === 0 &&
    missingInPt.length === 0 &&
    inEnNotPt.length === 0 &&
    inPtNotEn.length === 0 &&
    rawKeysInJsx.length === 0;

  return {
    timestamp: new Date().toISOString(),
    totalSourceCalls: occurrences.length,
    uniqueSourceKeys,
    dictionaryStats: {
      en: { totalLeaves: enKeySet.size },
      pt: { totalLeaves: ptKeySet.size },
    },
    missingInEn,
    missingInPt,
    symmetryIssues: {
      inEnNotPt,
      inPtNotEn,
    },
    rawKeysInJsx,
    isValid,
  };
}

// CLI Execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes("--json");

  const report = runI18nAudit();

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
    process.exit(report.isValid ? 0 : 1);
  }

  console.log("\n=======================================================");
  console.log(" 🌐 PAPYRUS — i18n & UI Label Completeness Audit");
  console.log("=======================================================\n");

  console.log(`📊 Total Translation Calls Scanned: ${report.totalSourceCalls}`);
  console.log(`🔑 Distinct Translation Keys Used:  ${report.uniqueSourceKeys}`);
  console.log(`📖 EN Dictionary Leaves:             ${report.dictionaryStats.en.totalLeaves}`);
  console.log(`📖 PT Dictionary Leaves:             ${report.dictionaryStats.pt.totalLeaves}\n`);

  let hasErrors = false;

  // 1. Missing in EN
  if (report.missingInEn.length > 0) {
    hasErrors = true;
    console.log(`❌ MISSING IN EN (${report.missingInEn.length} occurrences):`);
    report.missingInEn.forEach((m) => {
      console.log(`   - [${m.file}:${m.line}] key: "${m.key}"`);
    });
    console.log();
  } else {
    console.log(`✅ All source keys resolve in English (100% pass)`);
  }

  // 2. Missing in PT
  if (report.missingInPt.length > 0) {
    hasErrors = true;
    console.log(`❌ MISSING IN PT (${report.missingInPt.length} occurrences):`);
    report.missingInPt.forEach((m) => {
      console.log(`   - [${m.file}:${m.line}] key: "${m.key}"`);
    });
    console.log();
  } else {
    console.log(`✅ All source keys resolve in Portuguese (100% pass)`);
  }

  // 3. Symmetry Check
  if (report.symmetryIssues.inEnNotPt.length > 0 || report.symmetryIssues.inPtNotEn.length > 0) {
    hasErrors = true;
    console.log(`❌ LOCALE SYMMETRY DISCREPANCIES:`);
    if (report.symmetryIssues.inEnNotPt.length > 0) {
      console.log(`   Present in EN but missing in PT (${report.symmetryIssues.inEnNotPt.length}):`);
      report.symmetryIssues.inEnNotPt.forEach((k) => console.log(`     + ${k}`));
    }
    if (report.symmetryIssues.inPtNotEn.length > 0) {
      console.log(`   Present in PT but missing in EN (${report.symmetryIssues.inPtNotEn.length}):`);
      report.symmetryIssues.inPtNotEn.forEach((k) => console.log(`     + ${k}`));
    }
    console.log();
  } else {
    console.log(`✅ Perfect 100% symmetrical parity between EN and PT locales`);
  }

  // 4. Raw keys in JSX
  if (report.rawKeysInJsx.length > 0) {
    hasErrors = true;
    console.log(`❌ RAW TRANSLATION KEYS DETECTED IN JSX:`);
    report.rawKeysInJsx.forEach((r) => {
      console.log(`   - [${r.file}:${r.line}] "${r.text}"`);
    });
    console.log();
  } else {
    console.log(`✅ No unrendered raw translation keys in JSX`);
  }

  console.log("\n-------------------------------------------------------");
  if (hasErrors) {
    console.log("❌ AUDIT FAILED: Missing labels or parity issues detected.\n");
    process.exit(1);
  } else {
    console.log("🎉 AUDIT PASSED: 100% i18n coverage & parity verified!\n");
    process.exit(0);
  }
}
