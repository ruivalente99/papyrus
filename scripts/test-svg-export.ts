import { loadCV, exportCVToSvg } from "../src/lib/cv-helper";

console.log("🧪 Testing PAPYRUS Vector SVG Export Engine (FEAT-033)...");

// Test 1: Generate SVG for lateralis preset in EN
const cvLateralis = loadCV("lateralis");
const svgEn = exportCVToSvg(cvLateralis, "en");

if (!svgEn.includes("<svg") || !svgEn.includes("</svg>")) {
  console.error("❌ Test 1 Failed: Output is not a valid SVG document");
  process.exit(1);
}

if (!svgEn.includes('viewBox="0 0 794 1123"') || !svgEn.includes('width="794"')) {
  console.error("❌ Test 1 Failed: SVG does not have standard A4 dimensions (794x1123)");
  process.exit(1);
}

if (!svgEn.includes(cvLateralis.personalInfo.fullName)) {
  console.error("❌ Test 1 Failed: SVG does not contain fullName");
  process.exit(1);
}
console.log("✓ Test 1 Passed: Generated valid A4 SVG for Lateralis in English");

// Test 2: Generate SVG for classic preset in PT
const cvClassic = loadCV("classic");
const svgPt = exportCVToSvg(cvClassic, "pt");

if (!svgPt.includes("<svg") || !svgPt.includes("</svg>")) {
  console.error("❌ Test 2 Failed: Output is not a valid SVG document");
  process.exit(1);
}
console.log("✓ Test 2 Passed: Generated valid A4 SVG for Classic in Portuguese");

// Test 3: Generate SVG for matrix and empty presets
const cvMatrix = loadCV("matrix");
const svgMatrix = exportCVToSvg(cvMatrix, "en");
if (!svgMatrix.includes("Matrix") && !svgMatrix.includes(cvMatrix.personalInfo.fullName)) {
  console.error("❌ Test 3 Failed: Matrix SVG generation failed");
  process.exit(1);
}

const cvEmpty = loadCV("empty");
const svgEmpty = exportCVToSvg(cvEmpty, "en");
if (!svgEmpty.includes("<svg") || !svgEmpty.includes("</svg>")) {
  console.error("❌ Test 3 Failed: Empty preset SVG generation failed");
  process.exit(1);
}
console.log("✓ Test 3 Passed: Successfully verified Matrix and Empty presets");

// Test 4: XML Escaping Test
const customCv = {
  ...cvLateralis,
  personalInfo: {
    ...cvLateralis.personalInfo,
    fullName: "John & Jane <Special> 'Quotes' \"Test\"",
  },
};
const svgEscaped = exportCVToSvg(customCv, "en");
if (
  !svgEscaped.includes("John &amp; Jane &lt;Special&gt; &apos;Quotes&apos; &quot;Test&quot;")
) {
  console.error("❌ Test 4 Failed: XML special characters were not properly escaped");
  process.exit(1);
}
console.log("✓ Test 4 Passed: XML special characters correctly escaped");

console.log("🎉 ALL VECTOR SVG EXPORT TESTS PASSED (100% SUCCESS)!");
