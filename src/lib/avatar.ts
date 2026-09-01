import { Style, Avatar } from "@dicebear/core";
import definition from "@dicebear/styles/dylan.json";

// Initialize Dylan style with definition
const dylanStyle = new Style(definition);

/**
 * Generates an offline vector SVG data URI using DiceBear Dylan style.
 * Uses the person's name as seed, or an optional override seed.
 */
export function createDylanAvatarDataUri(seed: string): string {
  const cleanSeed = (seed && seed.trim()) || "Lorem";
  const avatar = new Avatar(dylanStyle, {
    seed: cleanSeed,
  });
  return avatar.toDataUri();
}

/**
 * Returns the raw SVG string for Dylan avatar.
 */
export function createDylanAvatarSvg(seed: string): string {
  const cleanSeed = (seed && seed.trim()) || "Lorem";
  const avatar = new Avatar(dylanStyle, {
    seed: cleanSeed,
  });
  return avatar.toString();
}

/**
 * Resolves the effective avatar image source:
 * - If the user imported/uploaded a custom photo, returns their custom photoUrl.
 * - Otherwise, returns the Dylan vector avatar based on their name or custom seed.
 */
export function resolveAvatarUrl(personalInfo?: {
  photoUrl?: string;
  isCustomPhoto?: boolean;
  fullName?: string;
  avatarSeed?: string;
}): string {
  if (!personalInfo) {
    return createDylanAvatarDataUri("Lorem");
  }

  // If user explicitly imported their own custom photo file
  if (personalInfo.isCustomPhoto && personalInfo.photoUrl) {
    return personalInfo.photoUrl;
  }

  // If photoUrl is set to a non-svg custom image URL (e.g. data:image/png or http... other than dicebear)
  if (
    personalInfo.photoUrl &&
    !personalInfo.photoUrl.startsWith("data:image/svg+xml") &&
    !personalInfo.photoUrl.includes("dicebear.com")
  ) {
    return personalInfo.photoUrl;
  }

  // Default: Dylan avatar based on name or avatarSeed
  const seed = personalInfo.avatarSeed || personalInfo.fullName || "Lorem";
  return createDylanAvatarDataUri(seed);
}
