import { loadCV } from "../src/lib/cv-helper";
import {
  prepareDarkModeElement,
  getDarkPdfBackgroundColor,
  isDarkModePdfSupported,
  DARK_PDF_BG_COLOR,
  DARK_PDF_STYLE_ID,
} from "../src/lib/pdfDarkMode";
import {
  pagesToPdfBlob,
  exportToDarkPdf,
  type ExportPdfOptions,
} from "../src/lib/pdfExport";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion failed: ${message}`);
    process.exit(1);
  }
}

console.log("=== RUNNING DARK MODE PDF EXPORT TEST SUITE (FEAT-026) ===");

// -------------------------------------------------------------
// Test 1: Dark Mode Background Color Constant
// -------------------------------------------------------------
console.log("\n[Test 1] Dark Mode Background Color Constants...");
assert(DARK_PDF_BG_COLOR === "#0f172a", "Dark background must be #0f172a (Deep Slate 900)");
assert(getDarkPdfBackgroundColor() === "#0f172a", "getDarkPdfBackgroundColor() must return #0f172a");
console.log("✓ Background color constants verified (#0f172a)");

// -------------------------------------------------------------
// Test 2: Runtime Environment Support Check
// -------------------------------------------------------------
console.log("\n[Test 2] Runtime Environment Support...");
assert(isDarkModePdfSupported() === false, "In pure Node.js CLI environment without window, should report false");

// Mock window and document for simulated DOM testing
const mockStyles: any[] = [];
const mockElement = {
  classList: {
    classes: new Set<string>(),
    add: function (cls: string) {
      this.classes.add(cls);
    },
    remove: function (cls: string) {
      this.classes.delete(cls);
    },
    contains: function (cls: string) {
      return this.classes.has(cls);
    },
  },
};

(global as any).document = {
  getElementById: (id: string) => mockStyles.find((s) => s.id === id) || null,
  createElement: (tag: string) => ({
    tagName: tag.toUpperCase(),
    id: "",
    textContent: "",
    parentNode: null,
    remove: function () {
      const idx = mockStyles.indexOf(this);
      if (idx >= 0) mockStyles.splice(idx, 1);
    },
  }),
  head: {
    appendChild: (el: any) => {
      el.parentNode = (global as any).document.head;
      mockStyles.push(el);
      return el;
    },
  },
};
(global as any).window = {};

assert(isDarkModePdfSupported() === true, "When window and document are mocked, should report true");
console.log("✓ Runtime environment support check verified");

// -------------------------------------------------------------
// Test 3: DOM Dark Mode Preparation & Cleanup Lifecycle
// -------------------------------------------------------------
console.log("\n[Test 3] DOM Dark Mode Preparation & Cleanup Lifecycle...");
const restore = prepareDarkModeElement(mockElement as any);

assert(mockElement.classList.contains("papyrus-dark-pdf"), "Element must receive .papyrus-dark-pdf class");
const injectedStyle = (global as any).document.getElementById(DARK_PDF_STYLE_ID);
assert(injectedStyle !== null, "Injected dark mode stylesheet must be found in head");
assert(injectedStyle.textContent.includes("invert(0.93)"), "Stylesheet must include high-contrast color inversion");
assert(injectedStyle.textContent.includes(DARK_PDF_BG_COLOR), "Stylesheet must include #0f172a background");
assert(injectedStyle.textContent.includes("data-qr-code"), "Stylesheet must preserve natural hues for QR codes and images");

// Test cleanup
restore();
assert(!mockElement.classList.contains("papyrus-dark-pdf"), "Element must lose .papyrus-dark-pdf class on restore");
console.log("✓ DOM preparation and cleanup lifecycle verified");

// -------------------------------------------------------------
// Test 4: PDF Metadata Generation with Dark Mode Tags
// -------------------------------------------------------------
console.log("\n[Test 4] PDF Metadata with Dark Mode Options...");
const lateralisCv = loadCV("lateralis");

// Mock HTMLCanvasElement for Node.js
function createMockCanvas(): any {
  return {
    width: 794 * 2,
    height: 1123 * 2,
    toDataURL: (_format: string) =>
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=",
  };
}

async function testPdfMetadata() {
  const canvas1 = createMockCanvas();

  // Test Standard Light Mode PDF Blob
  const lightBlob = await pagesToPdfBlob([canvas1], [], {
    cv: lateralisCv,
    lang: "en",
    colorMode: "light",
  });
  assert(lightBlob.size > 0, "Light mode PDF blob must be non-empty");

  // Test Creative Portfolio Dark Mode PDF Blob
  const darkBlob = await pagesToPdfBlob([canvas1], [], {
    cv: lateralisCv,
    lang: "en",
    colorMode: "dark",
  });
  assert(darkBlob.size > 0, "Dark mode PDF blob must be non-empty");

  const darkBuffer = Buffer.from(await darkBlob.arrayBuffer());
  const darkPdfText = darkBuffer.toString("latin1");

  assert(
    darkPdfText.includes("Dark Mode") || darkPdfText.includes("Creative Portfolio"),
    "PDF internal metadata must declare Dark Mode / Creative Portfolio properties"
  );
  console.log("✓ Dark mode PDF metadata and blob generation verified (size: " + darkBlob.size + " bytes)");
}

// -------------------------------------------------------------
// Test 5: Convenience Helper exportToDarkPdf Type & Parameter Contract
// -------------------------------------------------------------
console.log("\n[Test 5] Helper exportToDarkPdf Function Signature...");
assert(typeof exportToDarkPdf === "function", "exportToDarkPdf must be exported as a function");
console.log("✓ exportToDarkPdf helper verified");

testPdfMetadata().then(() => {
  console.log("\n🎉 ALL DARK MODE PDF EXPORT TESTS PASSED (100% SUCCESS)!\n");
});
