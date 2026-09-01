import { PRESET_SEEDS, emptySeed } from "../src/data/seeds";
import { analyzeCV } from "../src/data/linterRules";
import { formatDateRange } from "../src/lib/utils";
import { t, tArray } from "../src/lib/i18n";
import { exportToLatex } from "../src/lib/latexEngine";
import type { CVDocument, ExperienceSection, EducationSection, SkillsSection } from "../src/types/cv";

console.log("🧪 Running Comprehensive Field Editing Stress Test...");

// Start with emptySeed and lateralis
const cvsToTest: CVDocument[] = [
  JSON.parse(JSON.stringify(emptySeed)),
  JSON.parse(JSON.stringify(PRESET_SEEDS[0].cv)),
];

for (let i = 0; i < cvsToTest.length; i++) {
  const cv = cvsToTest[i];
  console.log(`\nTesting CV #${i + 1} (${cv.title || "Blank"})...`);

  // 1. Stress test Personal Info editing
  console.log("  Testing Personal Info editing (edge case inputs)...");
  cv.personalInfo.fullName = "";
  analyzeCV(cv, "en");
  cv.personalInfo.fullName = "A";
  analyzeCV(cv, "en");
  cv.personalInfo.fullName = "Alex Silva";
  analyzeCV(cv, "en");

  // Headline edge cases (undefined, null, string, object)
  cv.personalInfo.headline = undefined as any;
  analyzeCV(cv, "en");
  analyzeCV(cv, "pt");
  cv.personalInfo.headline = { en: "" };
  analyzeCV(cv, "pt");
  cv.personalInfo.headline = { en: "Engineer", pt: "Engenheiro" };
  analyzeCV(cv, "en");
  analyzeCV(cv, "pt");

  // Phone & Website with strange characters / malformed
  cv.personalInfo.phone = "  ";
  analyzeCV(cv, "en");
  cv.personalInfo.phone = "(+351) 912-345-678";
  analyzeCV(cv, "en");

  cv.personalInfo.website = "not-a-url";
  analyzeCV(cv, "en");
  cv.personalInfo.website = "https://alexsilva.dev";
  analyzeCV(cv, "en");

  // Links with empty labels and undefined URLs
  cv.personalInfo.links = [
    { id: "l-1", platform: "linkedin", url: "", label: {} },
    { id: "l-2", platform: "github", url: "https://github.com/alex", label: { en: "" } },
  ];
  analyzeCV(cv, "en");
  analyzeCV(cv, "pt");

  // 2. Stress test date formatting edge cases (typing partial dates)
  console.log("  Testing Date Range formatting with partial/invalid inputs...");
  const edgeDates = [
    ["", ""],
    ["2", ""],
    ["202", ""],
    ["2024", ""],
    ["2024-", ""],
    ["2024-0", ""],
    ["2024-1", ""],
    ["2024-13", ""], // invalid month
    ["2024-00", ""], // invalid month
    ["invalid", "invalid"],
    ["", "2024-05"],
    ["2022-01", "2024-05"],
  ];
  for (const [start, end] of edgeDates) {
    const formattedEn = formatDateRange(start, end, false, "en");
    const formattedPt = formatDateRange(start, end, true, "pt");
    if (typeof formattedEn !== "string" || typeof formattedPt !== "string") {
      throw new Error(`formatDateRange returned non-string for ${start} - ${end}`);
    }
  }

  // 3. Stress test Experience Section item and bullet editing
  console.log("  Testing Experience section updates...");
  let expSec = cv.sections.find((s) => s.type === "experience") as ExperienceSection;
  if (expSec) {
    // Add item with empty highlights
    const newItem = {
      id: "exp-test-1",
      role: { en: "" },
      company: "",
      location: {},
      startDate: "2024-",
      endDate: "",
      isCurrent: false,
      highlights: {} as Record<string, string[]>, // Empty highlights object
      visible: true,
    };
    expSec.items.unshift(newItem);
    analyzeCV(cv, "en");

    // Add empty bullet
    newItem.highlights["en"] = [""];
    analyzeCV(cv, "en");

    // Update bullet text
    newItem.highlights["en"][0] = "Increased performance by 45% using Next.js and TypeScript";
    analyzeCV(cv, "en");
  }

  // 4. Stress test Skills Section category and tag updates
  console.log("  Testing Skills section updates...");
  let skillSec = cv.sections.find((s) => s.type === "skills") as SkillsSection;
  if (skillSec) {
    const newCat = {
      id: "cat-test-1",
      name: { en: "Cloud & DevOps" },
      skills: ["Docker", "Kubernetes"],
      visible: true,
    };
    skillSec.categories.push(newCat);
    analyzeCV(cv, "en");
    analyzeCV(cv, "pt");
  }

  // 5. Test i18n t() and tArray() with wild inputs
  console.log("  Testing i18n helper robustness...");
  t(null, "en");
  t(undefined, "en");
  t("Plain string role", "en");
  t({ en: "English", pt: "Português" }, "en");
  t({ de: "German only" }, "en", "pt");
  t({ en: 12345 as any }, "en");

  tArray(null, "en");
  tArray(undefined, "en");
  tArray(["string 1", "string 2"], "en");
  tArray({ en: ["bullet 1", "bullet 2"] }, "en");
  tArray({ en: "single string" as any }, "en");

  // Export to LaTeX should also not crash with these edited fields
  console.log("  Testing LaTeX export with edited fields...");
  exportToLatex(cv, "en");
  exportToLatex(cv, "pt");
}

console.log("\n✅ ALL FIELD EDITING TESTS PASSED WITHOUT CRASHING!");
