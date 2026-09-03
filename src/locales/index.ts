import enCommon from "./en/common.json";
import ptCommon from "./pt/common.json";
import enBuilder from "./en/builder.json";
import ptBuilder from "./pt/builder.json";
import enPreview from "./en/preview.json";
import ptPreview from "./pt/preview.json";
import enA11y from "./en/a11y.json";
import ptA11y from "./pt/a11y.json";

export const dictionaries = {
  en: {
    common: enCommon,
    builder: enBuilder,
    preview: enPreview,
    a11y: enA11y,
  },
  pt: {
    common: ptCommon,
    builder: ptBuilder,
    preview: ptPreview,
    a11y: ptA11y,
  },
} as const;

export type SupportedLocale = keyof typeof dictionaries;
export type TranslationSchema = typeof dictionaries["en"];

// Helper type to recursively compute dot-notation string paths
type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`;
export type DotNestedKeys<T> = (
  T extends object
    ? { [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<DotNestedKeys<T[K]>>}` }[Exclude<keyof T, symbol>]
    : ""
) extends infer D
  ? Extract<D, string>
  : never;

export type TranslationKey = DotNestedKeys<TranslationSchema>;

/**
 * Resolves a nested key in an object using dot notation.
 */
function getNestedValue(obj: any, path: string): any {
  if (!obj || typeof obj !== "object") return undefined;
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current;
}

/**
 * Resolves a translation key in the given locale with variable interpolation and fallback.
 */
export function translate(
  key: string,
  lang: string = "en",
  params?: Record<string, string | number | undefined | null>
): string {
  const targetLocale = (lang in dictionaries ? lang : "en") as SupportedLocale;
  const targetDict = dictionaries[targetLocale];
  const fallbackDict = dictionaries.en;

  let template = getNestedValue(targetDict, key);

  if (typeof template !== "string") {
    template = getNestedValue(fallbackDict, key);
  }

  if (typeof template !== "string") {
    return key;
  }

  if (params && Object.keys(params).length > 0) {
    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, placeholder) => {
      const val = params[placeholder];
      return val !== undefined && val !== null ? String(val) : "";
    });
  }

  return template;
}
