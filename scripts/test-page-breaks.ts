import { exportToLatex, importFromLatex } from "../src/lib/latexEngine";
import { technicalLatexSeed } from "../src/data/seeds/template-tech-latex";
import { calculateSmartPageBreaks, A4_W_PX } from "../src/lib/pdfExport";
import type { CVDocument } from "../src/types/cv";

console.log("🧪 Testing PAPYRUS Visual Page Break & Manual Split Engine...");

// Test 1: LaTeX Export with pageBreakBefore
const testDoc: CVDocument = JSON.parse(JSON.stringify(technicalLatexSeed));
const eduSec = testDoc.sections.find((s) => s.type === "education");
if (!eduSec) {
  console.error("❌ Education section not found in technical latex seed");
  process.exit(1);
}
eduSec.pageBreakBefore = true;

const exportedLatex = exportToLatex(testDoc, "en");
console.log("✓ Exported LaTeX with pageBreakBefore");

if (!exportedLatex.includes("\\newpage")) {
  console.error("❌ Expected \\newpage in exported LaTeX, but was not found");
  process.exit(1);
}
console.log("✓ Found \\newpage before Education section in LaTeX output");

// Test 2: LaTeX Import with \newpage
const importedDoc = importFromLatex(exportedLatex);
const importedEdu = importedDoc.sections?.find((s) => s.type === "education");

if (!importedEdu) {
  console.error("❌ Failed to parse Education section from LaTeX");
  process.exit(1);
}

if (!importedEdu.pageBreakBefore) {
  console.error("❌ Expected imported Education section to have pageBreakBefore: true, got:", importedEdu.pageBreakBefore);
  process.exit(1);
}
console.log("✓ Correctly imported pageBreakBefore: true from LaTeX \\newpage");

// Test 3: LaTeX Import with \pagebreak keyword
const latexWithPageBreak = exportedLatex.replace("\\newpage", "\\pagebreak");
const importedDoc2 = importFromLatex(latexWithPageBreak);
const importedEdu2 = importedDoc2.sections?.find((s) => s.type === "education");

if (!importedEdu2?.pageBreakBefore) {
  console.error("❌ Expected \\pagebreak to be recognized as pageBreakBefore: true");
  process.exit(1);
}
console.log("✓ Correctly imported pageBreakBefore: true from LaTeX \\pagebreak");

// Test 4: calculateSmartPageBreaks with mock DOM elements
class MockElement {
  public tagName: string;
  private attributes: Record<string, string> = {};
  private rect: { top: number; bottom: number; height: number };

  constructor(tagName: string, rect: { top: number; bottom: number; height: number }, attrs: Record<string, string> = {}) {
    this.tagName = tagName;
    this.rect = rect;
    this.attributes = attrs;
  }

  getAttribute(name: string): string | null {
    return this.attributes[name] ?? null;
  }

  hasAttribute(name: string): boolean {
    return name in this.attributes;
  }

  getBoundingClientRect() {
    return {
      top: this.rect.top,
      bottom: this.rect.bottom,
      height: this.rect.height,
      left: 0,
      right: A4_W_PX,
      width: A4_W_PX,
      x: 0,
      y: this.rect.top,
      toJSON: () => ({}),
    };
  }
}

class MockContainer {
  public children: MockElement[] = [];
  public offsetHeight: number;

  constructor(offsetHeight: number) {
    this.offsetHeight = offsetHeight;
  }

  getBoundingClientRect() {
    return {
      top: 0,
      bottom: this.offsetHeight,
      height: this.offsetHeight,
      left: 0,
      right: A4_W_PX,
      width: A4_W_PX,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    };
  }

  querySelectorAll(selector: string): MockElement[] {
    if (selector.includes("[data-page-break-before]")) {
      return this.children.filter((c) => c.getAttribute("data-page-break-before") === "true");
    }
    if (selector.includes("[data-page-break-avoid]")) {
      return this.children.filter((c) => c.hasAttribute("data-page-break-avoid"));
    }
    return this.children;
  }
}

const mockContainer = new MockContainer(1800);
// Section 1: 0 to 600px
mockContainer.children.push(new MockElement("DIV", { top: 0, bottom: 600, height: 600 }));
// Section 2: 600 to 1200px, with forced break before it at 600px!
mockContainer.children.push(
  new MockElement("DIV", { top: 600, bottom: 1200, height: 600 }, { "data-page-break-before": "true" })
);
// Section 3: 1200 to 1800px
mockContainer.children.push(new MockElement("DIV", { top: 1200, bottom: 1800, height: 600 }));

const cuts = calculateSmartPageBreaks(mockContainer as unknown as HTMLElement, 1800, 1123);
console.log("✓ Calculated smart page breaks with forced split:", cuts);

if (!cuts.includes(600)) {
  console.error("❌ Expected cuts to include forced break at 600, got:", cuts);
  process.exit(1);
}
console.log("✓ Forced page break at 600px was strictly respected by calculateSmartPageBreaks");

console.log("🎉 ALL PAGE BREAK & PRINT EMULATION TESTS PASSED (100% SUCCESS)!");
