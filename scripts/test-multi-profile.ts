import { loadCV } from "../src/lib/cv-helper";
import {
  initProfiles,
  loadProfile,
  saveProfileData,
  createNewProfile,
  duplicateProfile,
  renameProfile,
  deleteProfile,
  exportAllProfilesBundle,
  importProfilesBundle,
  PROFILES_META_KEY,
  ACTIVE_PROFILE_KEY,
  PROFILE_DATA_PREFIX,
  LEGACY_ACTIVE_DOC_KEY,
} from "../src/lib/profileStorage";
import type { CVProfileMeta } from "../src/types/profile";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion failed: ${message}`);
    process.exit(1);
  }
}

console.log("=== RUNNING MULTI-PROFILE CV MANAGEMENT TEST SUITE ===");

// -------------------------------------------------------------
// In-memory Storage Mock for Node.js environment
// -------------------------------------------------------------
const storageMap = new Map<string, string>();

const mockStorage = {
  getItem: (key: string) => storageMap.get(key) ?? null,
  setItem: (key: string, val: string) => {
    storageMap.set(key, val);
  },
  removeItem: (key: string) => {
    storageMap.delete(key);
  },
  clear: () => {
    storageMap.clear();
  },
  get length() {
    return storageMap.size;
  },
  key: (index: number) => Array.from(storageMap.keys())[index] ?? null,
};

(global as any).window = {
  localStorage: mockStorage,
};

const lateralisCv = loadCV("lateralis");
const classicCv = loadCV("classic");

// -------------------------------------------------------------
// Test 1: Initialization & Legacy Migration
// -------------------------------------------------------------
console.log("\n[Test 1] Profile Initialization & Legacy Migration...");
storageMap.clear();

// Set up legacy document in storage
storageMap.set(LEGACY_ACTIVE_DOC_KEY, JSON.stringify(classicCv));

const initResult = initProfiles(lateralisCv);
assert(initResult.profiles.length === 1, "Should initialize with 1 profile");
assert(initResult.activeId === "profile-default", "Default profile ID should be profile-default");
assert(initResult.profiles[0].template === classicCv.template, "Migrated profile should have template from legacy doc");
assert(storageMap.has(PROFILES_META_KEY), "Meta key should be saved to localStorage");
assert(storageMap.has(`${PROFILE_DATA_PREFIX}profile-default`), "Profile data should be saved to localStorage");
console.log("✓ Initialization and legacy migration verified");

// -------------------------------------------------------------
// Test 2: Create New Profile
// -------------------------------------------------------------
console.log("\n[Test 2] Create New Profile...");
const createResult = createNewProfile("Frontend Architect", lateralisCv);
assert(createResult.profiles.length === 2, "Should have 2 profiles now");
assert(createResult.meta.name === "Frontend Architect", "New profile should have specified name");
assert(createResult.meta.template === lateralisCv.template, "New profile template should match lateralis template");
assert(mockStorage.getItem(ACTIVE_PROFILE_KEY) === createResult.meta.id, "Active profile should be set to new profile ID");

const loadedNew = loadProfile(createResult.meta.id);
assert(loadedNew !== null, "Created profile should load from storage");
assert(loadedNew?.cv.title === "Frontend Architect", "Loaded CV title should match profile name");
console.log("✓ Profile creation verified");

// -------------------------------------------------------------
// Test 3: Save and Update Profile Data
// -------------------------------------------------------------
console.log("\n[Test 3] Save and Update Profile Data...");
const updatedDoc = {
  ...loadedNew!.cv,
  personalInfo: {
    ...loadedNew!.cv.personalInfo,
    headline: { en: "Staff Software Engineer", pt: "Engenheiro de Software Staff" },
  },
};

const saveResult = saveProfileData(createResult.meta.id, updatedDoc);
assert(saveResult.meta.targetRole === "Staff Software Engineer", "Target role should be updated in meta");
assert(typeof saveResult.meta.atsScore === "number", "ATS score should be computed");

const reloaded = loadProfile(createResult.meta.id);
assert(
  reloaded?.cv.personalInfo.headline?.en === "Staff Software Engineer",
  "Reloaded profile should reflect headline updates"
);
console.log("✓ Profile update and ATS calculation verified");

// -------------------------------------------------------------
// Test 4: Profile Duplication and Renaming
// -------------------------------------------------------------
console.log("\n[Test 4] Profile Duplication & Renaming...");
const dupResult = duplicateProfile(createResult.meta.id, "Frontend Architect (Copy)");
assert(dupResult !== null, "Duplicate should succeed");
assert(dupResult?.meta.name === "Frontend Architect (Copy)", "Duplicate profile should have copy name");

const renamedList = renameProfile(dupResult!.meta.id, "Fullstack Lead");
const renamedTarget = renamedList.find((p: CVProfileMeta) => p.id === dupResult!.meta.id);
assert(renamedTarget?.name === "Fullstack Lead", "Profile should be renamed to Fullstack Lead");

const loadedRenamed = loadProfile(dupResult!.meta.id);
assert(loadedRenamed?.cv.title === "Fullstack Lead", "Document title should be updated on rename");
console.log("✓ Duplication and renaming verified");

// -------------------------------------------------------------
// Test 5: Profile Deletion & Active Profile Switch
// -------------------------------------------------------------
console.log("\n[Test 5] Profile Deletion & Active Profile Switching...");
const profileToDeleteId = dupResult!.meta.id;
const deleteRes = deleteProfile(profileToDeleteId, profileToDeleteId, lateralisCv);

assert(!deleteRes.profiles.some((p: CVProfileMeta) => p.id === profileToDeleteId), "Deleted profile should be removed");
assert(deleteRes.nextActiveId !== profileToDeleteId, "Next active ID should not be deleted profile");
assert(mockStorage.getItem(`${PROFILE_DATA_PREFIX}${profileToDeleteId}`) === null, "Deleted profile storage should be purged");
console.log("✓ Profile deletion verified");

// -------------------------------------------------------------
// Test 6: Multi-Profile Bundle Export and Import Roundtrip
// -------------------------------------------------------------
console.log("\n[Test 6] Multi-Profile Bundle Export and Import Roundtrip...");
const bundle = exportAllProfilesBundle("profile-default");
assert(bundle.version === "1.0.0", "Bundle version should be 1.0.0");
assert(bundle.profiles.length >= 2, "Exported bundle should contain at least 2 profiles");
assert(bundle.activeProfileId === "profile-default", "Active profile in bundle should match");

// Simulate fresh storage on another machine or browser
storageMap.clear();

const importRes = importProfilesBundle(bundle);
assert(importRes.profiles.length === bundle.profiles.length, "Imported profiles count should match bundle");
assert(importRes.activeId === "profile-default", "Imported active ID should match bundle");

const restoredDefault = loadProfile("profile-default");
assert(restoredDefault !== null, "Default profile should be restored from bundle");
assert(storageMap.has(LEGACY_ACTIVE_DOC_KEY), "Legacy active doc should be restored from imported active profile");
console.log("✓ Multi-profile bundle export and import roundtrip verified");

console.log("\n🎉 ALL MULTI-PROFILE TESTS PASSED SUCCESSFULLY!\n");
