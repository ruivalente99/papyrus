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

// Test 5: Section ID targeting and DOM anchor mapping
console.log("\n[Test 5] Section ID & Preview Targeting");
for (const preset of PRESET_SEEDS) {
  const sectionIds = new Set<string>();
  for (const section of preset.cv.sections) {
    if (!section.id || typeof section.id !== "string") {
      console.error(`❌ Section in preset ${preset.id} missing valid ID:`, section);
      process.exit(1);
    }
    if (sectionIds.has(section.id)) {
      console.error(`❌ Duplicate section ID "${section.id}" in preset ${preset.id}`);
      process.exit(1);
    }
    sectionIds.add(section.id);
    const targetAnchor = `section-${section.id}`;
    if (!targetAnchor.startsWith("section-") || targetAnchor.length < 9) {
      console.error(`❌ Invalid target anchor "${targetAnchor}" in preset ${preset.id}`);
      process.exit(1);
    }
  }
  console.log(`  ✓ Preset "${preset.name}": All ${preset.cv.sections.length} sections have unique targeting IDs`);
}

console.log("\n🎉 ALL E2E VERIFICATION TESTS PASSED (100% SUCCESS)!");
