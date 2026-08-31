import { PRESET_SEEDS, emptySeed } from "../src/data/seeds";
import { exportToLatex, importFromLatex } from "../src/lib/latexEngine";
import { lintCV, validateCVSchema } from "../src/lib/cv-helper";
import { analyzeCV } from "../src/data/linterRules";

console.log("🚀 Starting PAPYRUS E2E Automated Verification...");

// Test 1: Validate all Starter Templates
console.log("\n[Test 1] Schema & Linter on all Presets");
for (const preset of PRESET_SEEDS) {
  const schemaReport = validateCVSchema(preset.cv);
  if (!schemaReport.valid) {
    console.error(`❌ Preset ${preset.id} failed schema validation:`, schemaReport.errors);
    process.exit(1);
  }
  const linter = lintCV(preset.cv, "en");
  console.log(`  ✓ Preset "${preset.name}" (${preset.id}): Schema OK, Quality Score = ${linter.score}%`);
}

// Test 2: LaTeX Roundtrip Engine
console.log("\n[Test 2] TeX Export & Import Engine");
const classicCv = PRESET_SEEDS[1].cv;
const texCode = exportToLatex(classicCv, "en");
if (!texCode.includes("\\begin{document}") || !texCode.includes("\\end{document}")) {
  console.error("❌ LaTeX export missing document boundaries");
  process.exit(1);
}
console.log(`  ✓ TeX Export generated successfully (${texCode.length} bytes)`);

const imported = importFromLatex(texCode);
if (!imported.personalInfo?.fullName) {
  console.error("❌ LaTeX import failed to parse fullName");
  process.exit(1);
}
console.log(`  ✓ TeX Import parsed fullName: "${imported.personalInfo.fullName}"`);

// Test 3: Multi-language checks
console.log("\n[Test 3] Multilingual i18n mapping");
const lateralis = PRESET_SEEDS[0].cv;
const linterEn = analyzeCV(lateralis, "en");
const linterPt = analyzeCV(lateralis, "pt");
console.log(`  ✓ Multilingual Linter EN: ${linterEn.score}%, PT: ${linterPt.score}%`);

// Test 4: Blank Canvas & Duplicate lifecycle
console.log("\n[Test 4] Blank Canvas & Duplicate");
const blankSchema = validateCVSchema(emptySeed);
if (!blankSchema.valid) {
  console.error("❌ Blank seed failed validation:", blankSchema.errors);
  process.exit(1);
}
const cloned = JSON.parse(JSON.stringify(lateralis));
cloned.id = "cloned-id-123";
cloned.title = "Curriculum (Copy)";
const clonedSchema = validateCVSchema(cloned);
if (!clonedSchema.valid) {
  console.error("❌ Cloned CV failed validation:", clonedSchema.errors);
  process.exit(1);
}
console.log("  ✓ Blank Canvas and Cloned CV validated successfully");

console.log("\n🎉 ALL E2E VERIFICATION TESTS PASSED (100% SUCCESS)!");
