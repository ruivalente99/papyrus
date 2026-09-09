import { t, tArray } from "../src/lib/i18n";
import type { MultiLangString, MultiLangArray } from "../src/types/cv";

console.log("=== RUNNING MULTILINGUAL ERASING & FALLBACK TEST SUITE ===");

// Test 1: t() with explicit empty string in target language
const fieldWithEmptyPt: MultiLangString = {
  en: "Senior Full-Stack Engineer",
  pt: "",
};

const resultPt = t(fieldWithEmptyPt, "pt", "en");
if (resultPt !== "") {
  console.error(`❌ Test 1 Failed: Expected "" for empty pt, got "${resultPt}"`);
  process.exit(1);
}
console.log("✓ Test 1 Passed: Explicit empty string in pt returns empty string, not English fallback");

// Test 2: t() with missing key in target language
const fieldWithoutPt: MultiLangString = {
  en: "Senior Full-Stack Engineer",
};

const fallbackResult = t(fieldWithoutPt, "pt", "en");
if (fallbackResult !== "Senior Full-Stack Engineer") {
  console.error(`❌ Test 2 Failed: Expected "Senior Full-Stack Engineer" for missing pt, got "${fallbackResult}"`);
  process.exit(1);
}
console.log("✓ Test 2 Passed: Missing target language key falls back to default language");

// Test 3: tArray() with explicit empty array
const arrayWithEmptyPt: MultiLangArray = {
  en: ["Bullet 1", "Bullet 2"],
  pt: [],
};

const resultArrPt = tArray(arrayWithEmptyPt, "pt", "en");
if (resultArrPt.length !== 0) {
  console.error(`❌ Test 3 Failed: Expected empty array, got ${JSON.stringify(resultArrPt)}`);
  process.exit(1);
}
console.log("✓ Test 3 Passed: Explicit empty array in pt returns empty array, not English bullets");

// Test 4: tArray() with missing key
const arrayWithoutPt: MultiLangArray = {
  en: ["Bullet 1", "Bullet 2"],
};

const resultArrFallback = tArray(arrayWithoutPt, "pt", "en");
if (resultArrFallback.length !== 2 || resultArrFallback[0] !== "Bullet 1") {
  console.error(`❌ Test 4 Failed: Expected English fallback bullets, got ${JSON.stringify(resultArrFallback)}`);
  process.exit(1);
}
console.log("✓ Test 4 Passed: Missing target language array falls back to default language");

console.log("\n🎉 ALL MULTILINGUAL ERASING TESTS PASSED (100% SUCCESS)!\n");
