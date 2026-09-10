import { generateQrMatrix, generateQrSvgString, isFinderPattern } from "../src/lib/qrCode";
import { exportToLatex, importFromLatex } from "../src/lib/latexEngine";
import { creativeSidebarSeed } from "../src/data/seeds/template-sidebar";
import type { CVDocument } from "../src/types/cv";

function runTests() {
  console.log("=== Running Header Vector QR Code Tests (FEAT-020) ===\n");

  // Test 1: Matrix generation
  console.log("Test 1: QR Matrix Generation");
  const url = "https://linkedin.com/in/luna-silva";
  const matrix = generateQrMatrix(url, "M");
  if (!matrix || matrix.length < 21) {
    throw new Error(`Invalid matrix dimension: ${matrix.length}`);
  }
  if (matrix.length !== matrix[0].length) {
    throw new Error("Matrix must be square");
  }
  console.log(`  ✓ Generated square QR matrix of size ${matrix.length}x${matrix[0].length}.\n`);

  // Test 2: Finder pattern detection
  console.log("Test 2: Finder Pattern Detection");
  const count = matrix.length;
  if (!isFinderPattern(0, 0, count) || !isFinderPattern(6, 6, count)) {
    throw new Error("Top-left finder pattern not detected");
  }
  if (!isFinderPattern(0, count - 1, count) || !isFinderPattern(6, count - 7, count)) {
    throw new Error("Top-right finder pattern not detected");
  }
  if (!isFinderPattern(count - 1, 0, count) || !isFinderPattern(count - 7, 6, count)) {
    throw new Error("Bottom-left finder pattern not detected");
  }
  if (isFinderPattern(10, 10, count)) {
    throw new Error("Center cell should not be a finder pattern");
  }
  console.log("  ✓ Correctly identified all 3 corner 7x7 finder patterns.\n");

  // Test 3: SVG String Generation across styles
  console.log("Test 3: Vector SVG Generation & Styling");
  const styles = ["classic", "dots", "rounded"] as const;
  for (const st of styles) {
    const svg = generateQrSvgString({
      url,
      size: 100,
      color: "#005555",
      bgColor: "#ffffff",
      style: st,
    });
    if (!svg.startsWith("<svg") || !svg.endsWith("</svg>")) {
      throw new Error(`Invalid SVG generated for style ${st}`);
    }
    if (!svg.includes('fill="#005555"')) {
      throw new Error(`Color not applied in style ${st}`);
    }
    if (st === "dots" && !svg.includes("<circle")) {
      throw new Error("Dots style should contain <circle> elements");
    }
  }
  console.log("  ✓ Generated valid SVG for classic, dots, and rounded styles.\n");

  // Test 4: SVG Center Icon Overlays
  console.log("Test 4: Center Badges (LinkedIn, GitHub, Globe, QR)");
  const icons = ["globe", "linkedin", "github", "qr"] as const;
  for (const ic of icons) {
    const svg = generateQrSvgString({
      url,
      size: 120,
      showIcon: true,
      iconType: ic,
    });
    if (!svg.includes('fill="#ffffff"')) {
      throw new Error(`Missing center badge background <rect> for ${ic}`);
    }
    if (!svg.includes("<g transform=")) {
      throw new Error(`Missing icon group for ${ic}`);
    }
  }
  console.log("  ✓ Generated SVG with embedded vector badges for all platforms.\n");

  // Test 5: LaTeX Export and Import round-trip with \qrcode
  console.log("Test 5: LaTeX Export and Import Integration");
  const testDoc: CVDocument = {
    ...creativeSidebarSeed,
    personalInfo: {
      ...creativeSidebarSeed.personalInfo,
      qrCode: {
        enabled: true,
        url: "https://github.com/ruivalente99",
        label: { pt: "Código QR GitHub", en: "GitHub QR Code" },
        style: "rounded",
        showIcon: true,
        iconType: "github",
      },
    },
  };

  const tex = exportToLatex(testDoc, "en");
  if (!tex.includes("\\usepackage{qrcode}")) {
    throw new Error("LaTeX export missing \\usepackage{qrcode}");
  }
  if (!tex.includes("\\qrcode[height=1.2cm]{https://github.com/ruivalente99}")) {
    throw new Error("LaTeX export missing \\qrcode command");
  }

  const imported = importFromLatex(tex);
  if (!imported.personalInfo?.qrCode?.enabled) {
    throw new Error("Imported CV missing enabled qrCode");
  }
  if (imported.personalInfo.qrCode.url !== "https://github.com/ruivalente99") {
    throw new Error(`Imported QR url mismatch: ${imported.personalInfo.qrCode.url}`);
  }
  console.log("  ✓ Bi-directional LaTeX sync validated with \\usepackage{qrcode}.\n");

  console.log("🎉 ALL HEADER VECTOR QR CODE TESTS PASSED (5/5)!\n");
}

try {
  runTests();
} catch (err: any) {
  console.error("❌ Test failure:", err.message);
  process.exit(1);
}
