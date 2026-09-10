import { PRESET_SEEDS, emptySeed } from "../src/data/seeds";
import {
  diffBullets,
  diffPersonalInfo,
  diffSections,
  diffATSMetrics,
  compareCVs,
  mergeItemIntoCV,
} from "../src/lib/cvDiff";
import type { CVDocument, ExperienceItem } from "../src/types/cv";

console.log("🧪 Running CV Diff Engine Unit & Integration Tests...\n");

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion failed: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

// 1. Test diffBullets with Longest Common Subsequence (LCS)
console.log("1. Testing diffBullets (LCS algorithm)...");
{
  const bulletsA = ["Led backend team", "Optimized database queries by 40%", "Deployed Docker containers"];
  const bulletsB = ["Led backend team", "Architected cloud microservices", "Optimized database queries by 40%"];

  const diff = diffBullets(bulletsA, bulletsB);
  assert(diff.length > 0, "Diff produced results");
  assert(diff.some((d) => d.type === "keep" && d.text === "Led backend team"), "Kept identical bullet");
  assert(diff.some((d) => d.type === "add" && d.text === "Architected cloud microservices"), "Detected added bullet");
  assert(diff.some((d) => d.type === "remove" && d.text === "Deployed Docker containers"), "Detected removed bullet");
}

// 2. Test diffPersonalInfo
console.log("\n2. Testing diffPersonalInfo...");
{
  const pA = {
    fullName: "Alex Silva",
    headline: { en: "Software Engineer", pt: "Engenheiro de Software" },
    email: "alex@example.com",
    phone: "+351 912 345 678",
    location: { en: "Lisbon, Portugal" },
  };
  const pB = {
    fullName: "Alex Silva",
    headline: { en: "Senior Staff Engineer", pt: "Engenheiro Staff Sénior" },
    email: "alex.silva@tech.io",
    phone: "+351 912 345 678",
    location: { en: "Lisbon, Portugal" },
  };

  const diffsEn = diffPersonalInfo(pA as any, pB as any, "en");
  const headlineDiff = diffsEn.find((d) => d.field === "headline");
  const emailDiff = diffsEn.find((d) => d.field === "email");
  const nameDiff = diffsEn.find((d) => d.field === "fullName");

  assert(headlineDiff?.status === "modified", "Detected modified headline");
  assert(headlineDiff?.valueA === "Software Engineer" && headlineDiff?.valueB === "Senior Staff Engineer", "Correct headline values in EN");
  assert(emailDiff?.status === "modified", "Detected modified email");
  assert(nameDiff?.status === "unchanged", "Detected unchanged full name");

  const diffsPt = diffPersonalInfo(pA as any, pB as any, "pt");
  const headlinePt = diffsPt.find((d) => d.field === "headline");
  assert(headlinePt?.valueA === "Engenheiro de Software" && headlinePt?.valueB === "Engenheiro Staff Sénior", "Correct headline values in PT");
}

// 3. Test diffSections between Seeds
console.log("\n3. Testing diffSections between lateralis and classic seeds...");
{
  const lateralis = PRESET_SEEDS.find((s) => s.id === "lateralis")?.cv!;
  const classic = PRESET_SEEDS.find((s) => s.id === "classic")?.cv!;

  assert(!!lateralis && !!classic, "Loaded lateralis and classic preset seeds");

  const sectionDiffs = diffSections(lateralis.sections, classic.sections, "en");
  assert(sectionDiffs.length > 0, "Found section diffs");

  const expDiff = sectionDiffs.find((s) => s.type === "experience");
  assert(!!expDiff, "Found experience section diff");
  assert(expDiff!.itemsDiff.length > 0, "Experience items compared");
}

// 4. Test diffATSMetrics
console.log("\n4. Testing diffATSMetrics...");
{
  const lateralis = PRESET_SEEDS.find((s) => s.id === "lateralis")?.cv!;
  const empty = emptySeed;

  const ats = diffATSMetrics(empty, lateralis, "en");
  assert(typeof ats.scoreA === "number" && typeof ats.scoreB === "number", "Calculated scores");
  assert(ats.scoreB > ats.scoreA, "Full CV has higher ATS score than empty seed");
  assert(ats.metrics.length >= 4, "Generated at least 4 comparison metrics");
  const scoreMetric = ats.metrics.find((m) => m.name === "ATS Quality Score");
  assert(scoreMetric?.improved === true, "Marked score improvement correctly");
}

// 5. Test compareCVs (Full pipeline)
console.log("\n5. Testing compareCVs full pipeline...");
{
  const lateralis = PRESET_SEEDS.find((s) => s.id === "lateralis")?.cv!;
  const classic = PRESET_SEEDS.find((s) => s.id === "classic")?.cv!;

  const result = compareCVs(lateralis, classic, "en");
  assert(result.summary.totalChanges >= 0, "Computed total changes count");
  assert(result.sectionsDiff.length > 0, "Contains section diffs");
  assert(result.atsMetrics.length > 0, "Contains ATS metrics");
  assert(result.scoreA > 0 && result.scoreB > 0, "Computed non-zero scores");
}

// 6. Test mergeItemIntoCV (Selective merge)
console.log("\n6. Testing mergeItemIntoCV (Selective merge)...");
{
  const targetCV: CVDocument = JSON.parse(JSON.stringify(emptySeed));
  const newExp: ExperienceItem = {
    id: "exp-merge-test-1",
    role: { en: "Staff Architect", pt: "Arquiteto Staff" },
    company: "Acme Cloud",
    startDate: "2023-01",
    endDate: "2024-05",
    isCurrent: false,
    highlights: {
      en: ["Engineered zero-downtime migration pipeline", "Saved 30% AWS costs"],
      pt: ["Engenharia de pipeline com zero downtime", "Poupança de 30% custos AWS"],
    },
    visible: true,
  };

  const updatedCV = mergeItemIntoCV(targetCV, "experience", newExp);
  const expSec = updatedCV.sections.find((s) => s.type === "experience");
  assert(!!expSec, "Experience section created/found in target CV");
  assert((expSec as any).items.some((it: any) => it.id === "exp-merge-test-1"), "Merged item exists in target CV");

  // Modify and re-merge
  const modifiedExp = { ...newExp, company: "Acme Global Cloud" };
  const reMergedCV = mergeItemIntoCV(updatedCV, "experience", modifiedExp);
  const reExpSec = reMergedCV.sections.find((s) => s.type === "experience");
  assert(
    (reExpSec as any).items.find((it: any) => it.id === "exp-merge-test-1")?.company === "Acme Global Cloud",
    "Successfully updated existing item on re-merge"
  );

  // Merge Language item
  const newLang = {
    id: "lang-merge-test-1",
    language: { en: "Japanese", pt: "Japonês" },
    level: { en: "Conversational", pt: "Conversacional" },
    cefr: "B1" as const,
  };
  const withLangCV = mergeItemIntoCV(reMergedCV, "languages", newLang);
  const langSec = withLangCV.sections.find((s) => s.type === "languages");
  assert(!!langSec, "Languages section created/found in target CV");
  assert((langSec as any).items.some((it: any) => it.id === "lang-merge-test-1"), "Merged language item exists in target CV");
}

console.log("\n🎉 All CV Diff Engine Unit Tests Passed Successfully!\n");
