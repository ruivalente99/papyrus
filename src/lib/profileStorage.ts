import type { CVDocument } from "@/types/cv";
import type { CoverLetterDocument } from "@/types/coverLetter";
import type { CVProfileMeta, StoredProfileData, MultiProfileBundle } from "@/types/profile";
import { analyzeCV } from "@/data/linterRules";

export const PROFILES_META_KEY = "papyrus_profiles_meta";
export const ACTIVE_PROFILE_KEY = "papyrus_active_profile_id";
export const PROFILE_DATA_PREFIX = "papyrus_profile_data_";
export const LEGACY_ACTIVE_DOC_KEY = "papyrus_active_document";
export const LEGACY_ACTIVE_LETTER_KEY = "papyrus_active_cover_letter";

function getStorage(): Storage | null {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

/**
 * Initializes profiles from localStorage or creates initial default profile from active/legacy CV
 */
export function initProfiles(
  fallbackCv: CVDocument,
  fallbackLetter?: CoverLetterDocument
): { activeId: string; profiles: CVProfileMeta[] } {
  const storage = getStorage();
  if (!storage) {
    const defaultMeta: CVProfileMeta = {
      id: "profile-default",
      name: fallbackCv.title || "Default Profile",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      template: fallbackCv.template || "lateralis",
      targetRole: fallbackCv.personalInfo?.headline?.en || fallbackCv.personalInfo?.headline?.pt || "",
      atsScore: analyzeCV(fallbackCv, "en").score,
    };
    return { activeId: defaultMeta.id, profiles: [defaultMeta] };
  }

  try {
    const rawMeta = storage.getItem(PROFILES_META_KEY);
    let activeId = storage.getItem(ACTIVE_PROFILE_KEY);

    if (rawMeta) {
      const profiles: CVProfileMeta[] = JSON.parse(rawMeta);
      if (Array.isArray(profiles) && profiles.length > 0) {
        if (!activeId || !profiles.some((p) => p.id === activeId)) {
          activeId = profiles[0].id;
          storage.setItem(ACTIVE_PROFILE_KEY, activeId);
        }
        return { activeId, profiles };
      }
    }

    // Migration from legacy single document
    let initialCv = fallbackCv;
    const legacyDoc = storage.getItem(LEGACY_ACTIVE_DOC_KEY);
    if (legacyDoc) {
      try {
        const parsed = JSON.parse(legacyDoc);
        if (parsed && parsed.id && parsed.sections) {
          initialCv = parsed;
        }
      } catch {}
    }

    let initialLetter = fallbackLetter;
    const legacyLetter = storage.getItem(LEGACY_ACTIVE_LETTER_KEY);
    if (legacyLetter) {
      try {
        const parsedL = JSON.parse(legacyLetter);
        if (parsedL && parsedL.recipient && parsedL.content) {
          initialLetter = parsedL;
        }
      } catch {}
    }

    const defaultId = "profile-default";
    const defaultMeta: CVProfileMeta = {
      id: defaultId,
      name: initialCv.title || "Default Profile",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      template: initialCv.template || "lateralis",
      targetRole: initialCv.personalInfo?.headline?.en || initialCv.personalInfo?.headline?.pt || "",
      atsScore: analyzeCV(initialCv, "en").score,
    };

    const data: StoredProfileData = {
      meta: defaultMeta,
      cv: initialCv,
      coverLetter: initialLetter,
    };

    storage.setItem(`${PROFILE_DATA_PREFIX}${defaultId}`, JSON.stringify(data));
    storage.setItem(PROFILES_META_KEY, JSON.stringify([defaultMeta]));
    storage.setItem(ACTIVE_PROFILE_KEY, defaultId);

    return { activeId: defaultId, profiles: [defaultMeta] };
  } catch (e) {
    console.warn("Failed to initialize profiles from localStorage:", e);
    const defaultMeta: CVProfileMeta = {
      id: "profile-default",
      name: fallbackCv.title || "Default Profile",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      template: fallbackCv.template || "lateralis",
      targetRole: "",
      atsScore: 100,
    };
    return { activeId: defaultMeta.id, profiles: [defaultMeta] };
  }
}

/**
 * Loads a profile's stored data by ID
 */
export function loadProfile(id: string): StoredProfileData | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(`${PROFILE_DATA_PREFIX}${id}`);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return null;
    // Sanitize cover letter bodyParagraphs if present
    if (data.coverLetter?.content && !Array.isArray(data.coverLetter.content.bodyParagraphs)) {
      data.coverLetter.content.bodyParagraphs = [];
    }
    return data;
  } catch {
    return null;
  }
}

/**
 * Saves or updates profile CV, cover letter, and metadata
 */
export function saveProfileData(
  id: string,
  cv: CVDocument,
  coverLetter?: CoverLetterDocument,
  nameOverride?: string
): { meta: CVProfileMeta; profiles: CVProfileMeta[] } {
  const storage = getStorage();
  const now = new Date().toISOString();
  const ats = analyzeCV(cv, cv.currentLanguage || cv.defaultLanguage || "en").score;

  let profiles: CVProfileMeta[] = [];
  if (storage) {
    try {
      const raw = storage.getItem(PROFILES_META_KEY);
      if (raw) profiles = JSON.parse(raw);
    } catch {}
  }

  const existingIndex = profiles.findIndex((p) => p.id === id);
  let meta: CVProfileMeta;

  if (existingIndex >= 0) {
    meta = {
      ...profiles[existingIndex],
      name: nameOverride || profiles[existingIndex].name || cv.title || "Untitled Profile",
      template: cv.template,
      targetRole: cv.personalInfo?.headline?.en || cv.personalInfo?.headline?.pt || "",
      atsScore: ats,
      updatedAt: now,
    };
    profiles[existingIndex] = meta;
  } else {
    meta = {
      id,
      name: nameOverride || cv.title || "Untitled Profile",
      createdAt: now,
      updatedAt: now,
      template: cv.template,
      targetRole: cv.personalInfo?.headline?.en || cv.personalInfo?.headline?.pt || "",
      atsScore: ats,
    };
    profiles.push(meta);
  }

  const data: StoredProfileData = {
    meta,
    cv: { ...cv, title: meta.name },
    coverLetter,
  };

  if (storage) {
    try {
      storage.setItem(`${PROFILE_DATA_PREFIX}${id}`, JSON.stringify(data));
      storage.setItem(PROFILES_META_KEY, JSON.stringify(profiles));
      // Keep legacy keys updated with active profile
      storage.setItem(LEGACY_ACTIVE_DOC_KEY, JSON.stringify(data.cv));
      if (coverLetter) {
        storage.setItem(LEGACY_ACTIVE_LETTER_KEY, JSON.stringify(coverLetter));
      }
    } catch (e) {
      console.warn("Failed to save profile data:", e);
    }
  }

  return { meta, profiles };
}

/**
 * Creates a new profile with given name and starting document
 */
export function createNewProfile(
  name: string,
  initialCv: CVDocument,
  initialLetter?: CoverLetterDocument
): { meta: CVProfileMeta; profiles: CVProfileMeta[] } {
  const id = `profile-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const clonedCv: CVDocument = {
    ...JSON.parse(JSON.stringify(initialCv)),
    id: `cv-${Date.now()}`,
    title: name.trim() || "New Profile",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const clonedLetter = initialLetter
    ? {
        ...JSON.parse(JSON.stringify(initialLetter)),
        id: `letter-${Date.now()}`,
        updatedAt: new Date().toISOString(),
      }
    : undefined;

  const result = saveProfileData(id, clonedCv, clonedLetter, name.trim() || "New Profile");

  const storage = getStorage();
  if (storage) {
    try {
      storage.setItem(ACTIVE_PROFILE_KEY, id);
    } catch {}
  }

  return result;
}

/**
 * Duplicates an existing profile
 */
export function duplicateProfile(
  sourceId: string,
  customName?: string
): { meta: CVProfileMeta; profiles: CVProfileMeta[] } | null {
  const source = loadProfile(sourceId);
  if (!source) return null;

  const newName = customName || `${source.meta.name} (Copy)`;
  return createNewProfile(newName, source.cv, source.coverLetter);
}

/**
 * Renames an existing profile
 */
export function renameProfile(id: string, newName: string): CVProfileMeta[] {
  const storage = getStorage();
  if (!storage) return [];

  let profiles: CVProfileMeta[] = [];
  try {
    const raw = storage.getItem(PROFILES_META_KEY);
    if (raw) profiles = JSON.parse(raw);
  } catch {}

  const target = profiles.find((p) => p.id === id);
  if (!target) return profiles;

  target.name = newName.trim() || target.name;
  target.updatedAt = new Date().toISOString();

  try {
    storage.setItem(PROFILES_META_KEY, JSON.stringify(profiles));
    const profileData = loadProfile(id);
    if (profileData) {
      profileData.meta.name = target.name;
      profileData.cv.title = target.name;
      storage.setItem(`${PROFILE_DATA_PREFIX}${id}`, JSON.stringify(profileData));
    }
  } catch {}

  return [...profiles];
}

/**
 * Deletes a profile by ID and returns next active profile ID
 */
export function deleteProfile(
  id: string,
  currentActiveId: string,
  fallbackCv: CVDocument
): { nextActiveId: string; profiles: CVProfileMeta[] } {
  const storage = getStorage();
  if (!storage) return { nextActiveId: currentActiveId, profiles: [] };

  let profiles: CVProfileMeta[] = [];
  try {
    const raw = storage.getItem(PROFILES_META_KEY);
    if (raw) profiles = JSON.parse(raw);
  } catch {}

  profiles = profiles.filter((p) => p.id !== id);
  try {
    storage.removeItem(`${PROFILE_DATA_PREFIX}${id}`);
  } catch {}

  // If no profiles left, create a fresh default
  if (profiles.length === 0) {
    const fresh = initProfiles(fallbackCv);
    return { nextActiveId: fresh.activeId, profiles: fresh.profiles };
  }

  let nextActiveId = currentActiveId;
  if (currentActiveId === id) {
    nextActiveId = profiles[0].id;
  }

  try {
    storage.setItem(PROFILES_META_KEY, JSON.stringify(profiles));
    storage.setItem(ACTIVE_PROFILE_KEY, nextActiveId);
  } catch {}

  return { nextActiveId, profiles };
}

/**
 * Exports all profiles into a self-contained multi-profile bundle JSON
 */
export function exportAllProfilesBundle(activeId: string): MultiProfileBundle {
  const storage = getStorage();
  let profilesMeta: CVProfileMeta[] = [];
  if (storage) {
    try {
      const raw = storage.getItem(PROFILES_META_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) profilesMeta = parsed;
      }
    } catch {}
  }

  const profilesData: StoredProfileData[] = [];
  for (const meta of profilesMeta) {
    const data = loadProfile(meta.id);
    if (data) {
      profilesData.push(data);
    }
  }

  return {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    activeProfileId: activeId,
    profiles: profilesData,
  };
}

/**
 * Imports a multi-profile bundle JSON and restores profiles to localStorage
 */
export function importProfilesBundle(
  bundle: MultiProfileBundle
): { activeId: string; profiles: CVProfileMeta[] } {
  if (!bundle || !Array.isArray(bundle.profiles) || bundle.profiles.length === 0) {
    throw new Error("Invalid profile bundle: no profiles found.");
  }

  const storage = getStorage();
  const profilesMeta: CVProfileMeta[] = [];

  for (const item of bundle.profiles) {
    if (!item.meta || !item.cv) continue;
    profilesMeta.push(item.meta);
    if (storage) {
      storage.setItem(`${PROFILE_DATA_PREFIX}${item.meta.id}`, JSON.stringify(item));
    }
  }

  const activeId =
    bundle.activeProfileId && profilesMeta.some((p) => p.id === bundle.activeProfileId)
      ? bundle.activeProfileId
      : profilesMeta[0].id;

  if (storage) {
    storage.setItem(PROFILES_META_KEY, JSON.stringify(profilesMeta));
    storage.setItem(ACTIVE_PROFILE_KEY, activeId);
    const activeData = loadProfile(activeId);
    if (activeData) {
      storage.setItem(LEGACY_ACTIVE_DOC_KEY, JSON.stringify(activeData.cv));
      if (activeData.coverLetter) {
        storage.setItem(LEGACY_ACTIVE_LETTER_KEY, JSON.stringify(activeData.coverLetter));
      }
    }
  }

  return { activeId, profiles: profilesMeta };
}
