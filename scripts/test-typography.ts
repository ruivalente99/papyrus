import { FONT_CATALOG, getFontDefinition, getFontFamilyCss, getLatexFontPackage } from "../src/lib/typography";
import { exportToLatex, importFromLatex } from "../src/lib/latexEngine";
import { creativeSidebarSeed } from "../src/data/seeds/template-sidebar";
import type { CVDocument } from "../src/types/cv";

function runTests() {
  console.log("=== Running Editorial Typography Tests (FEAT-018) ===\n");

  // Test 1: Catalog completeness
  console.log("Test 1: Font catalog has 12 curated fonts");
  if (FONT_CATALOG.length !== 12) {
    throw new Error(`Expected 12 fonts, found ${FONT_CATALOG.length}`);
  }
  const categories = new Set(FONT_CATALOG.map((f) => f.category));
  if (!categories.has("sans") || !categories.has("serif") || !categories.has("mono")) {
    throw new Error("Missing required font categories (sans, serif, mono)");
  }
  console.log("  ✓ 12 fonts categorized into Sans-Serif, Serif, and Monospace.\n");

  // Test 2: Validation of properties
  console.log("Test 2: Integrity of font properties");
  for (const font of FONT_CATALOG) {
    if (!font.id || !font.name || !font.stack || !font.latexPackage || !font.sampleText) {
      throw new Error(`Incomplete font definition for ${font.id}`);
    }
    if (!font.description.en || !font.description.pt) {
      throw new Error(`Missing bilingual description for ${font.id}`);
    }
    if (font.atsRating !== "optimal" && font.atsRating !== "standard") {
      throw new Error(`Invalid atsRating for ${font.id}: ${font.atsRating}`);
    }
  }
  console.log("  ✓ All 12 fonts pass property, bilingual description, and ATS rating checks.\n");

  // Test 3: getFontDefinition fallback
  console.log("Test 3: getFontDefinition fallback handling");
  const interDef = getFontDefinition("inter");
  if (interDef.id !== "inter") throw new Error("Failed to get inter font");
  const fallbackDef = getFontDefinition("non-existent-font" as any);
  if (fallbackDef.id !== "inter") throw new Error("Fallback should default to inter");
  const emptyDef = getFontDefinition(undefined);
  if (emptyDef.id !== "inter") throw new Error("Undefined should default to inter");
  console.log("  ✓ getFontDefinition gracefully falls back to Inter.\n");

  // Test 4: CSS Stack and LaTeX package functions
  console.log("Test 4: CSS stacks and LaTeX packages");
  for (const font of FONT_CATALOG) {
    const css = getFontFamilyCss(font.id);
    if (!css.includes(font.name) && !css.includes(font.stack.split(",")[0].replace(/['"]/g, ""))) {
      throw new Error(`CSS stack mismatch for ${font.id}: ${css}`);
    }
    const pkg = getLatexFontPackage(font.id);
    if (!pkg.startsWith("\\usepackage")) {
      throw new Error(`Invalid LaTeX package snippet for ${font.id}: ${pkg}`);
    }
  }
  console.log("  ✓ All CSS stacks and LaTeX packages verified.\n");

  // Test 5: LaTeX export and import round-trip
  console.log("Test 5: LaTeX export contains font package and import parses font");
  const testFonts = ["inter", "eb-garamond", "jetbrains-mono", "roboto", "merriweather", "fira-code"] as const;

  for (const fontId of testFonts) {
    const testDoc: CVDocument = {
      ...creativeSidebarSeed,
      theme: {
        ...creativeSidebarSeed.theme,
        fontFamily: fontId,
      },
    };

    const tex = exportToLatex(testDoc, "en");
    const pkg = getLatexFontPackage(fontId);
    if (!tex.includes(pkg)) {
      throw new Error(`LaTeX export missing package for font ${fontId}`);
    }

    const imported = importFromLatex(tex);
    if (imported.theme?.fontFamily !== fontId) {
      throw new Error(`Expected imported fontFamily to be ${fontId}, got ${imported.theme?.fontFamily}`);
    }
  }
  console.log("  ✓ LaTeX export and import accurately preserve font family across rounds.\n");

  console.log("🎉 ALL EDITORIAL TYPOGRAPHY TESTS PASSED (5/5)!\n");
}

try {
  runTests();
} catch (err: any) {
  console.error("❌ Test failure:", err.message);
  process.exit(1);
}
