import type {
  CVDocument,
  SupportedLanguage,
  PersonalInfo,
  ExperienceItem,
  EducationItem,
  LanguageItem,
  LinterReport,
  SectionType,
  CVSection,
} from "@/types/cv";
import { analyzeCV } from "@/data/linterRules";
import { generateId } from "@/lib/utils";
import { t, tArray } from "@/lib/i18n";
import {
  creativeSidebarSeed,
  technicalLatexSeed,
  executiveSeed,
  emptySeed,
} from "@/data/seeds";
import { exportToLatex, importFromLatex } from "@/lib/latexEngine";
import fs from "fs";
import path from "path";

export interface ValidationError {
  path: string;
  field: string;
  receivedValue: any;
  rule: string;
  severity: "error" | "warning";
  message: string;
  suggestion: string;
}

export interface ValidationReport {
  valid: boolean;
  errorCount: number;
  warningCount: number;
  errors: ValidationError[];
  summary: string;
}

/**
 * Validates CV document schema and semantic integrity.
 * Produces structured diagnostic logs for human developers and LLM agents.
 */
export function validateCVSchema(doc: any): ValidationReport {
  const errors: ValidationError[] = [];

  if (!doc || typeof doc !== "object") {
    return {
      valid: false,
      errorCount: 1,
      warningCount: 0,
      errors: [
        {
          path: "root",
          field: "document",
          receivedValue: typeof doc,
          rule: "INVALID_ROOT_OBJECT",
          severity: "error",
          message: "The document root must be a valid JSON object.",
          suggestion: "Provide a JSON object containing 'id', 'personalInfo', and 'sections'.",
        },
      ],
      summary: "Invalid root object.",
    };
  }

  // 1. Validate top-level properties
  if (!doc.id || typeof doc.id !== "string") {
    errors.push({
      path: "id",
      field: "id",
      receivedValue: doc.id,
      rule: "MISSING_DOCUMENT_ID",
      severity: "error",
      message: "Document is missing a unique string 'id'.",
      suggestion: "Set 'id' to a unique string like 'cv-main' or 'cv-software-engineer'.",
    });
  }

  if (!doc.personalInfo || typeof doc.personalInfo !== "object") {
    errors.push({
      path: "personalInfo",
      field: "personalInfo",
      receivedValue: doc.personalInfo,
      rule: "MISSING_PERSONAL_INFO",
      severity: "error",
      message: "Document is missing 'personalInfo' object.",
      suggestion: "Define 'personalInfo' with 'fullName', 'email', and 'headline'.",
    });
  } else {
    const p = doc.personalInfo;
    if (!p.fullName || typeof p.fullName !== "string" || !p.fullName.trim()) {
      errors.push({
        path: "personalInfo.fullName",
        field: "fullName",
        receivedValue: p.fullName,
        rule: "EMPTY_FULL_NAME",
        severity: "error",
        message: "Full name is empty or missing.",
        suggestion: "Set 'personalInfo.fullName' to your candidate's name.",
      });
    }

    if (p.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(p.email)) {
        errors.push({
          path: "personalInfo.email",
          field: "email",
          receivedValue: p.email,
          rule: "INVALID_EMAIL_FORMAT",
          severity: "warning",
          message: `Email '${p.email}' does not follow standard RFC email format.`,
          suggestion: "Format email as 'user@domain.com'.",
        });
      }
    }

    if (p.website && !p.website.startsWith("http://") && !p.website.startsWith("https://")) {
      errors.push({
        path: "personalInfo.website",
        field: "website",
        receivedValue: p.website,
        rule: "INVALID_URL_PROTOCOL",
        severity: "warning",
        message: "Website URL should start with http:// or https://",
        suggestion: `Change '${p.website}' to 'https://${p.website}'`,
      });
    }
  }

  // 2. Validate sections array
  if (!Array.isArray(doc.sections)) {
    errors.push({
      path: "sections",
      field: "sections",
      receivedValue: doc.sections,
      rule: "INVALID_SECTIONS_ARRAY",
      severity: "error",
      message: "'sections' must be an array of CV sections.",
      suggestion: "Initialize 'sections' as an array: [ { id: 'sec-1', type: 'experience', ... } ].",
    });
  } else {
    const seenIds = new Set<string>();

    doc.sections.forEach((sec: any, sIdx: number) => {
      const secPath = `sections[${sIdx}]`;

      if (!sec.id) {
        errors.push({
          path: `${secPath}.id`,
          field: "id",
          receivedValue: sec.id,
          rule: "MISSING_SECTION_ID",
          severity: "error",
          message: `Section at index ${sIdx} is missing an 'id'.`,
          suggestion: `Add a unique id like 'sec-${sec.type || sIdx}'.`,
        });
      } else if (seenIds.has(sec.id)) {
        errors.push({
          path: `${secPath}.id`,
          field: "id",
          receivedValue: sec.id,
          rule: "DUPLICATE_SECTION_ID",
          severity: "error",
          message: `Duplicate section ID '${sec.id}' found at index ${sIdx}.`,
          suggestion: `Ensure every section has a globally unique id.`,
        });
      } else {
        seenIds.add(sec.id);
      }

      if (!sec.type) {
        errors.push({
          path: `${secPath}.type`,
          field: "type",
          receivedValue: sec.type,
          rule: "MISSING_SECTION_TYPE",
          severity: "error",
          message: `Section '${sec.id || sIdx}' is missing 'type'.`,
          suggestion: "Set type to one of: 'experience', 'education', 'skills', 'languages', 'certifications', 'hobbies', 'custom'.",
        });
      }

      // Validate Experience items
      if (sec.type === "experience" && Array.isArray(sec.items)) {
        sec.items.forEach((item: any, iIdx: number) => {
          const itemPath = `${secPath}.items[${iIdx}]`;
          if (!item.company || typeof item.company !== "string") {
            errors.push({
              path: `${itemPath}.company`,
              field: "company",
              receivedValue: item.company,
              rule: "MISSING_COMPANY_NAME",
              severity: "error",
              message: `Experience item ${iIdx + 1} is missing company name.`,
              suggestion: "Specify 'company' as a non-empty string.",
            });
          }
          if (item.startDate && !/^\d{4}(-\d{2})?$/.test(item.startDate)) {
            errors.push({
              path: `${itemPath}.startDate`,
              field: "startDate",
              receivedValue: item.startDate,
              rule: "INVALID_DATE_FORMAT",
              severity: "warning",
              message: `Start date '${item.startDate}' does not follow YYYY or YYYY-MM format.`,
              suggestion: "Use format 'YYYY-MM' (e.g. '2023-01') or 'YYYY' (e.g. '2023').",
            });
          }
          if (item.url && !item.url.startsWith("http")) {
            errors.push({
              path: `${itemPath}.url`,
              field: "url",
              receivedValue: item.url,
              rule: "INVALID_URL",
              severity: "warning",
              message: `Company URL '${item.url}' should start with https://`,
              suggestion: `Use 'https://${item.url}'.`,
            });
          }
        });
      }

      // Validate Education items
      if (sec.type === "education" && Array.isArray(sec.items)) {
        sec.items.forEach((item: any, iIdx: number) => {
          const itemPath = `${secPath}.items[${iIdx}]`;
          if (!item.institution) {
            errors.push({
              path: `${itemPath}.institution`,
              field: "institution",
              receivedValue: item.institution,
              rule: "MISSING_INSTITUTION_NAME",
              severity: "error",
              message: `Education item ${iIdx + 1} is missing institution name.`,
              suggestion: "Set 'institution' to university or school name.",
            });
          }
        });
      }
    });
  }

  const errorCount = errors.filter((e) => e.severity === "error").length;
  const warningCount = errors.filter((e) => e.severity === "warning").length;

  return {
    valid: errorCount === 0,
    errorCount,
    warningCount,
    errors,
    summary:
      errorCount === 0
        ? `Schema validation passed (${warningCount} warnings).`
        : `Schema validation failed with ${errorCount} errors and ${warningCount} warnings.`,
  };
}

/**
 * Loads CV document from a JSON file path, seed ID, or default.
 */
export function loadCV(filePathOrSeed?: string): CVDocument {
  if (!filePathOrSeed) return technicalLatexSeed;
  if (filePathOrSeed === "creative-sidebar" || filePathOrSeed === "sidebar" || filePathOrSeed === "lateralis") {
    return creativeSidebarSeed;
  }
  if (filePathOrSeed === "technical-latex" || filePathOrSeed === "latex" || filePathOrSeed === "classic") {
    return technicalLatexSeed;
  }
  if (filePathOrSeed === "executive-pro" || filePathOrSeed === "matrix" || filePathOrSeed === "executive") {
    return executiveSeed;
  }
  if (filePathOrSeed === "empty" || filePathOrSeed === "blank") {
    return emptySeed;
  }

  const resolved = path.resolve(process.cwd(), filePathOrSeed);
  if (fs.existsSync(resolved)) {
    const raw = fs.readFileSync(resolved, "utf-8");
    const parsed = JSON.parse(raw);
    const validation = validateCVSchema(parsed);
    if (!validation.valid) {
      console.warn(`[PAPYRUS VALIDATION WARNING] ${validation.summary}`);
    }
    return parsed as CVDocument;
  }

  throw new Error(`File or seed not found: ${filePathOrSeed}`);
}

/**
 * Saves CV document to a JSON file.
 */
export function saveCV(cv: CVDocument, outputPath: string): void {
  const validation = validateCVSchema(cv);
  if (!validation.valid) {
    throw new Error(`Cannot save invalid CV schema: ${validation.summary}`);
  }

  const resolved = path.resolve(process.cwd(), outputPath);
  const dir = path.dirname(resolved);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(resolved, JSON.stringify(cv, null, 2), "utf-8");
}

/**
 * Exports CV to LaTeX .tex string or file
 */
export function exportCVToLatex(cv: CVDocument, lang: SupportedLanguage = "en", outputPath?: string): string {
  const tex = exportToLatex(cv, lang);
  if (outputPath) {
    const resolved = path.resolve(process.cwd(), outputPath);
    const dir = path.dirname(resolved);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(resolved, tex, "utf-8");
  }
  return tex;
}

/**
 * Imports CV from a LaTeX file
 */
export function importCVFromLatex(filePathOrString: string): Partial<CVDocument> {
  let content = filePathOrString;
  const resolved = path.resolve(process.cwd(), filePathOrString);
  if (fs.existsSync(resolved)) {
    content = fs.readFileSync(resolved, "utf-8");
  }
  return importFromLatex(content);
}

/**
 * Returns a human-readable text summary of the CV in the specified language.
 */
export function summarizeCV(cv: CVDocument, lang: SupportedLanguage = "en"): string {
  const p = cv.personalInfo;
  const headline = t(p.headline, lang, cv.defaultLanguage);
  const summary = t(p.summary, lang, cv.defaultLanguage);
  const location = t(p.location, lang, cv.defaultLanguage);

  let out = `========================================================\n`;
  out += `  ${p.fullName.toUpperCase()}\n`;
  if (headline) out += `  ${headline}\n`;
  out += `  Email: ${p.email} | Tel: ${p.phone} | Loc: ${location}\n`;
  if (p.website) out += `  Web: ${p.website}\n`;
  out += `========================================================\n\n`;

  if (summary) {
    out += `[SUMMARY / PROFILE]\n${summary}\n\n`;
  }

  cv.sections.forEach((sec) => {
    const secTitle = t(sec.title, lang, cv.defaultLanguage);
    out += `[${secTitle.toUpperCase()}] ${sec.visible ? "" : "(HIDDEN)"}\n`;

    if (sec.type === "experience") {
      sec.items.forEach((item) => {
        const role = t(item.role, lang, cv.defaultLanguage);
        const loc = t(item.location, lang, cv.defaultLanguage);
        const bullets = tArray(item.highlights, lang, cv.defaultLanguage);
        const dates = `${item.startDate} - ${item.isCurrent ? "Present" : item.endDate || ""}`;
        out += `  • ${role} @ ${item.company} (${dates})${loc ? ` [${loc}]` : ""}\n`;
        if (item.url) out += `    Link: ${item.url}\n`;
        bullets.forEach((b) => {
          out += `      - ${b}\n`;
        });
      });
    } else if (sec.type === "education") {
      sec.items.forEach((item) => {
        const degree = t(item.degree, lang, cv.defaultLanguage);
        const dates = `${item.startDate} - ${item.isCurrent ? "Present" : item.endDate || ""}`;
        out += `  • ${degree} @ ${item.institution} (${dates})${item.qeq ? ` [${item.qeq}]` : ""}\n`;
        if (item.url) out += `    Link: ${item.url}\n`;
      });
    } else if (sec.type === "skills") {
      sec.categories.forEach((cat) => {
        const catName = t(cat.name, lang, cv.defaultLanguage);
        out += `  • ${catName}: ${cat.skills.join(", ")}\n`;
      });
    } else if (sec.type === "languages") {
      sec.items.forEach((item) => {
        const name = t(item.name, lang, cv.defaultLanguage);
        const level = t(item.level, lang, cv.defaultLanguage);
        out += `  • ${name}: ${level} ${item.cefr ? `(${item.cefr})` : ""}\n`;
      });
    } else if (sec.type === "certifications") {
      sec.items.forEach((item) => {
        const name = t(item.name, lang, cv.defaultLanguage);
        const notes = t(item.notes, lang, cv.defaultLanguage);
        out += `  • ${name} (${item.issuer}${item.date ? `, ${item.date}` : ""})${notes ? ` [${notes}]` : ""}\n`;
        if (item.url) out += `    Credential: ${item.url}\n`;
      });
    } else if (sec.type === "hobbies") {
      sec.items.forEach((item) => {
        const name = t(item.name, lang, cv.defaultLanguage);
        const desc = t(item.description, lang, cv.defaultLanguage);
        out += `  • ${name}${desc ? ` — ${desc}` : ""}\n`;
        if (item.url) out += `    Link: ${item.url}\n`;
      });
    } else if (sec.type === "custom") {
      sec.items.forEach((item) => {
        const title = t(item.title, lang, cv.defaultLanguage);
        out += `  • ${title} ${item.date ? `(${item.date})` : ""}\n`;
        if (item.url) out += `    Link: ${item.url}\n`;
      });
    }
    out += `\n`;
  });

  return out;
}

/**
 * Runs the linter engine and returns the report.
 */
export function lintCV(cv: CVDocument, lang: SupportedLanguage = "en"): LinterReport {
  return analyzeCV(cv, lang);
}

/**
 * Adds or updates a work experience entry in the CV.
 */
export function addExperience(
  cv: CVDocument,
  exp: {
    role: { pt?: string; en?: string; [lang: string]: string | undefined };
    company: string;
    location?: { pt?: string; en?: string; [lang: string]: string | undefined };
    startDate: string;
    endDate?: string;
    isCurrent?: boolean;
    url?: string;
    highlights: { pt?: string[]; en?: string[]; [lang: string]: string[] | undefined };
    visible?: boolean;
  }
): CVDocument {
  let expSection = cv.sections.find((s) => s.type === "experience");
  if (!expSection) {
    expSection = {
      id: `sec-${generateId()}`,
      type: "experience",
      title: { pt: "Experiência Profissional", en: "Work Experience" },
      visible: true,
      order: 1,
      items: [],
    };
    cv.sections.push(expSection);
  }

  const newItem: ExperienceItem = {
    id: `exp-${generateId()}`,
    role: (exp.role as any) || { en: "" },
    company: exp.company,
    location: (exp.location as any) || { en: "" },
    startDate: exp.startDate,
    endDate: exp.endDate || "",
    isCurrent: Boolean(exp.isCurrent),
    url: exp.url,
    highlights: (exp.highlights as any) || { en: [] },
    visible: exp.visible !== false,
  };

  (expSection as any).items.unshift(newItem);
  cv.updatedAt = new Date().toISOString();
  return cv;
}

/**
 * Adds or updates a skill in a category.
 */
export function addSkill(
  cv: CVDocument,
  categoryName: { pt: string; en: string },
  skill: string
): CVDocument {
  let skillsSection = cv.sections.find((s) => s.type === "skills");
  if (!skillsSection) {
    skillsSection = {
      id: `sec-${generateId()}`,
      type: "skills",
      title: { pt: "Competências", en: "Skills" },
      visible: true,
      order: 4,
      categories: [],
    };
    cv.sections.push(skillsSection);
  }

  let cat = (skillsSection as any).categories.find(
    (c: any) => c.name.pt === categoryName.pt || c.name.en === categoryName.en
  );

  if (!cat) {
    cat = {
      id: `cat-${generateId()}`,
      name: categoryName,
      skills: [],
      visible: true,
    };
    (skillsSection as any).categories.push(cat);
  }

  if (!cat.skills.includes(skill)) {
    cat.skills.push(skill);
  }

  cv.updatedAt = new Date().toISOString();
  return cv;
}

/**
 * Scans the CV for missing translations in target language.
 */
export function findMissingTranslations(
  cv: CVDocument,
  targetLang: string
): Array<{ path: string; sourceText: string }> {
  const missing: Array<{ path: string; sourceText: string }> = [];

  const check = (pathStr: string, field: Record<string, any> | undefined) => {
    if (!field) return;
    if (!field[targetLang] || field[targetLang].toString().trim() === "") {
      const source = field[cv.defaultLanguage] || Object.values(field)[0] || "";
      if (source) {
        missing.push({ path: pathStr, sourceText: source });
      }
    }
  };

  check("personalInfo.headline", cv.personalInfo.headline);
  check("personalInfo.summary", cv.personalInfo.summary);
  check("personalInfo.location", cv.personalInfo.location);

  cv.sections.forEach((sec, sIdx) => {
    check(`sections[${sIdx}].title`, sec.title);
    if (sec.type === "experience") {
      sec.items.forEach((it, iIdx) => {
        check(`sections[${sIdx}].items[${iIdx}].role`, it.role);
        check(`sections[${sIdx}].items[${iIdx}].location`, it.location);
      });
    } else if (sec.type === "education") {
      sec.items.forEach((it, iIdx) => {
        check(`sections[${sIdx}].items[${iIdx}].degree`, it.degree);
      });
    } else if (sec.type === "languages") {
      sec.items.forEach((it, iIdx) => {
        check(`sections[${sIdx}].items[${iIdx}].name`, it.name);
        check(`sections[${sIdx}].level`, it.level);
      });
    }
  });

  return missing;
}
