import {
  exportToJsonResume,
  importFromJsonResume,
  exportToEuropassXml,
  importFromEuropassXml,
  detectResumeFormat,
} from "../src/lib/schemaInterop";
import { creativeSidebarSeed } from "../src/data/seeds/template-sidebar";
import { technicalLatexSeed } from "../src/data/seeds/template-tech-latex";
import { validateCVSchema } from "../src/lib/cv-helper";

function runTests() {
  console.log("=== Running JSON Resume & Europass Interoperability Tests (FEAT-019) ===\n");

  // Test 1: Format Detection
  console.log("Test 1: Format Detection");
  const jsonResumeSnippet = JSON.stringify({
    basics: { name: "Alice", email: "alice@example.com" },
    work: [{ name: "TechCorp", position: "Lead Dev" }],
  });
  const latexSnippet = "\\documentclass{article}\n\\begin{document}\nHello\\end{document}";
  const europassSnippet = '<?xml version="1.0"?><SkillsPassport><LearnerInfo></LearnerInfo></SkillsPassport>';
  const papyrusSnippet = JSON.stringify(creativeSidebarSeed);

  if (detectResumeFormat(jsonResumeSnippet) !== "jsonresume") {
    throw new Error("Failed to detect JSON Resume format");
  }
  if (detectResumeFormat(latexSnippet) !== "latex") {
    throw new Error("Failed to detect LaTeX format");
  }
  if (detectResumeFormat(europassSnippet) !== "europass-xml") {
    throw new Error("Failed to detect Europass XML format");
  }
  if (detectResumeFormat(papyrusSnippet) !== "papyrus") {
    throw new Error("Failed to detect PAPYRUS JSON format");
  }
  console.log("  ✓ Accurately detected JSON Resume, LaTeX, Europass XML, and PAPYRUS JSON formats.\n");

  // Test 2: JSON Resume Export
  console.log("Test 2: Export to JSON Resume");
  const jsonResume = exportToJsonResume(creativeSidebarSeed, "en");
  if (!jsonResume.basics?.name || jsonResume.basics.name !== creativeSidebarSeed.personalInfo.fullName) {
    throw new Error("JSON Resume basics.name mismatch");
  }
  if (!jsonResume.work || jsonResume.work.length === 0) {
    throw new Error("JSON Resume work experience empty");
  }
  if (!jsonResume.education || jsonResume.education.length === 0) {
    throw new Error("JSON Resume education empty");
  }
  if (!jsonResume.skills || jsonResume.skills.length === 0) {
    throw new Error("JSON Resume skills empty");
  }
  console.log(`  ✓ Exported ${jsonResume.work.length} work items and ${jsonResume.skills.length} skill groups to JSON Resume.\n`);

  // Test 3: JSON Resume Import & Schema Validation
  console.log("Test 3: Import from JSON Resume");
  const importedFromJr = importFromJsonResume(jsonResume, "en");
  const jrValidation = validateCVSchema(importedFromJr);
  if (!jrValidation.valid) {
    throw new Error(`Imported JSON Resume failed schema validation: ${JSON.stringify(jrValidation.errors)}`);
  }
  if (importedFromJr.personalInfo.fullName !== creativeSidebarSeed.personalInfo.fullName) {
    throw new Error("Imported candidate name mismatch");
  }
  const expSec = importedFromJr.sections.find((s) => s.type === "experience");
  if (!expSec || (expSec as any).items.length === 0) {
    throw new Error("Missing imported experience items");
  }
  console.log("  ✓ Successfully imported JSON Resume into valid, fully conforming PAPYRUS document.\n");

  // Test 4: Europass XML Export
  console.log("Test 4: Export to Europass XML");
  const europassXml = exportToEuropassXml(technicalLatexSeed, "en");
  if (!europassXml.startsWith("<?xml") || !europassXml.includes("<SkillsPassport")) {
    throw new Error("Invalid Europass XML header");
  }
  if (!europassXml.includes("<WorkExperience>") || !europassXml.includes("<Education>")) {
    throw new Error("Missing core sections in Europass XML");
  }
  if (!europassXml.includes("<Linguistic>") && !europassXml.includes("<Computer>")) {
    throw new Error("Missing skills in Europass XML");
  }
  console.log(`  ✓ Exported Europass XML (${europassXml.length} bytes) with WorkExperience and Education.\n`);

  // Test 5: Europass XML Import & Round-Trip
  console.log("Test 5: Import from Europass XML");
  const importedFromEuropass = importFromEuropassXml(europassXml, "en");
  const euroValidation = validateCVSchema(importedFromEuropass);
  if (!euroValidation.valid) {
    throw new Error(`Imported Europass XML failed schema validation: ${JSON.stringify(euroValidation.errors)}`);
  }
  if (!importedFromEuropass.personalInfo.fullName) {
    throw new Error("Imported candidate name empty");
  }
  const euroExpSec = importedFromEuropass.sections.find((s) => s.type === "experience");
  if (!euroExpSec || (euroExpSec as any).items.length === 0) {
    throw new Error("Missing imported Europass experience items");
  }
  console.log("  ✓ Successfully imported Europass XML with full section structure.\n");

  console.log("🎉 ALL SCHEMA INTEROPERABILITY TESTS PASSED (5/5)!\n");
}

try {
  runTests();
} catch (err: any) {
  console.error("❌ Test failure:", err.message);
  process.exit(1);
}
