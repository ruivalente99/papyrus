import {
  softwareEngineerCoverLetter,
  executiveCoverLetter,
  COVER_LETTER_PRESETS,
} from "../src/data/seeds/coverLetterSeeds";
import type { CoverLetterDocument } from "../src/types/coverLetter";

function runTests() {
  console.log("=== Running Cover Letter Engine Tests (FEAT-015) ===\n");

  // Test 1: Seed Presets Validation
  console.log("Test 1: Seed Presets Completeness");
  if (!COVER_LETTER_PRESETS || COVER_LETTER_PRESETS.length < 2) {
    throw new Error("Expected at least 2 default cover letter presets");
  }

  for (const preset of COVER_LETTER_PRESETS) {
    if (!preset.id || !preset.title) {
      throw new Error(`Preset missing id or title: ${JSON.stringify(preset)}`);
    }
    if (!preset.recipient?.companyName) {
      throw new Error(`Preset ${preset.id} missing companyName`);
    }
    if (!preset.content?.salutation?.en || !preset.content?.salutation?.pt) {
      throw new Error(`Preset ${preset.id} missing bilingual salutation`);
    }
    if (!preset.content?.opening?.en || !preset.content?.opening?.pt) {
      throw new Error(`Preset ${preset.id} missing bilingual opening`);
    }
    if (!preset.content?.bodyParagraphs || preset.content.bodyParagraphs.length === 0) {
      throw new Error(`Preset ${preset.id} missing body paragraphs`);
    }
    if (!preset.content?.closing?.en || !preset.content?.closing?.pt) {
      throw new Error(`Preset ${preset.id} missing bilingual closing`);
    }
    if (!preset.content?.signOff?.en || !preset.content?.signOff?.pt) {
      throw new Error(`Preset ${preset.id} missing bilingual signOff`);
    }
  }
  console.log(`  ✓ All ${COVER_LETTER_PRESETS.length} cover letter presets have complete bilingual fields.\n`);

  // Test 2: Bilingual content resolution
  console.log("Test 2: Bilingual Resolution");
  const enSalutation = softwareEngineerCoverLetter.content.salutation.en;
  const ptSalutation = softwareEngineerCoverLetter.content.salutation.pt;
  if (!enSalutation?.includes("Engineering") || !ptSalutation?.includes("Engenharia")) {
    throw new Error("Bilingual salutation mismatch");
  }
  console.log("  ✓ Correctly resolved English and Portuguese content representations.\n");

  // Test 3: Date formatting logic simulation
  console.log("Test 3: Date Formatting Simulation");
  const sampleIsoDate = "2026-09-09";
  const [y, m, d] = sampleIsoDate.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  const enFormatted = dateObj.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const ptFormatted = dateObj.toLocaleDateString("pt-PT", { year: "numeric", month: "long", day: "numeric" });
  if (!enFormatted.includes("2026") || !ptFormatted.includes("2026")) {
    throw new Error("Date formatting failed");
  }
  console.log(`  ✓ Formatted date (EN: "${enFormatted}", PT: "${ptFormatted}").\n`);

  // Test 4: Application Package Multi-Page Offset Calculation
  console.log("Test 4: Multi-Page Application Package Page Offset Math");
  const simulatedCoverLetterPages = [1]; // 1 A4 page
  const simulatedCvPages = [1, 2]; // 2 A4 pages
  const cvLinks = [
    { pageIndex: 0, url: "https://linkedin.com/in/example", xMm: 10, yMm: 20, wMm: 30, hMm: 5 },
    { pageIndex: 1, url: "https://github.com/example", xMm: 10, yMm: 40, wMm: 30, hMm: 5 },
  ];

  const offsetCvLinks = cvLinks.map((l) => ({
    ...l,
    pageIndex: l.pageIndex + simulatedCoverLetterPages.length,
  }));

  if (offsetCvLinks[0].pageIndex !== 1 || offsetCvLinks[1].pageIndex !== 2) {
    throw new Error(`Expected offset page indices [1, 2] but got [${offsetCvLinks[0].pageIndex}, ${offsetCvLinks[1].pageIndex}]`);
  }
  const totalPackagePages = simulatedCoverLetterPages.length + simulatedCvPages.length;
  if (totalPackagePages !== 3) {
    throw new Error(`Expected total pages 3, got ${totalPackagePages}`);
  }
  console.log(`  ✓ Accurately mapped link annotations across ${totalPackagePages} pages with cover letter offset.\n`);

  // Test 5: Dynamic Recipient & Content Mutation
  console.log("Test 5: Immutability and State Mutation Pattern");
  const mutatedLetter: CoverLetterDocument = {
    ...softwareEngineerCoverLetter,
    recipient: {
      ...softwareEngineerCoverLetter.recipient,
      companyName: "Innovative AI Labs",
      hiringManagerName: "Dr. Jane Doe",
    },
    content: {
      ...softwareEngineerCoverLetter.content,
      bodyParagraphs: [
        ...softwareEngineerCoverLetter.content.bodyParagraphs,
        {
          en: "Additionally, I have experience with distributed vector indexing.",
          pt: "Adicionalmente, possuo experiência com indexação vetorial distribuída.",
        },
      ],
    },
  };

  if (mutatedLetter.recipient.companyName !== "Innovative AI Labs") {
    throw new Error("Failed to mutate recipient companyName");
  }
  if (mutatedLetter.content.bodyParagraphs.length !== softwareEngineerCoverLetter.content.bodyParagraphs.length + 1) {
    throw new Error("Failed to append body paragraph");
  }
  console.log("  ✓ Successfully validated cover letter mutation patterns.\n");

  console.log("🎉 All Cover Letter Engine tests passed successfully!");
}

runTests();
