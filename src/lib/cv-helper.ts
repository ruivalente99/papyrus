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

/**
 * Loads CV document from a JSON file path, seed ID, or default.
 */
export function loadCV(filePathOrSeed?: string): CVDocument {
  if (!filePathOrSeed) return creativeSidebarSeed;
  if (filePathOrSeed === "creative-sidebar" || filePathOrSeed === "sidebar" || filePathOrSeed === "ana-maia") {
    return creativeSidebarSeed;
  }
  if (filePathOrSeed === "technical-latex" || filePathOrSeed === "latex" || filePathOrSeed === "rui-valente") {
    return technicalLatexSeed;
  }
  if (filePathOrSeed === "executive-pro" || filePathOrSeed === "europass" || filePathOrSeed === "executive") {
    return executiveSeed;
  }
  if (filePathOrSeed === "empty" || filePathOrSeed === "blank") {
    return emptySeed;
  }

  const resolved = path.resolve(process.cwd(), filePathOrSeed);
  if (fs.existsSync(resolved)) {
    const raw = fs.readFileSync(resolved, "utf-8");
    return JSON.parse(raw) as CVDocument;
  }

  throw new Error(`File or seed not found: ${filePathOrSeed}`);
}

/**
 * Saves CV document to a JSON file.
 */
export function saveCV(cv: CVDocument, outputPath: string): void {
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
export function exportCVToLatex(cv: CVDocument, lang: SupportedLanguage = "pt", outputPath?: string): string {
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
export function summarizeCV(cv: CVDocument, lang: SupportedLanguage = "pt"): string {
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
    out += `[RESUMO / PERFIL]\n${summary}\n\n`;
  }

  cv.sections.forEach((sec) => {
    const secTitle = t(sec.title, lang, cv.defaultLanguage);
    out += `[${secTitle.toUpperCase()}] ${sec.visible ? "" : "(OCULTO)"}\n`;

    if (sec.type === "experience") {
      sec.items.forEach((item) => {
        const role = t(item.role, lang, cv.defaultLanguage);
        const loc = t(item.location, lang, cv.defaultLanguage);
        const bullets = tArray(item.highlights, lang, cv.defaultLanguage);
        const dates = `${item.startDate} - ${item.isCurrent ? "Atual" : item.endDate || ""}`;
        out += `  • ${role} @ ${item.company} (${dates})${loc ? ` [${loc}]` : ""}\n`;
        bullets.forEach((b) => {
          out += `      - ${b}\n`;
        });
      });
    } else if (sec.type === "education") {
      sec.items.forEach((item) => {
        const degree = t(item.degree, lang, cv.defaultLanguage);
        const dates = `${item.startDate} - ${item.isCurrent ? "Atual" : item.endDate || ""}`;
        out += `  • ${degree} @ ${item.institution} (${dates})${item.qeq ? ` [${item.qeq}]` : ""}\n`;
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
        out += `  • ${name} (${item.issuer}, ${item.date})\n`;
      });
    } else if (sec.type === "hobbies") {
      sec.items.forEach((item) => {
        const name = t(item.name, lang, cv.defaultLanguage);
        out += `  • ${name}\n`;
      });
    } else if (sec.type === "custom") {
      sec.items.forEach((item) => {
        const title = t(item.title, lang, cv.defaultLanguage);
        out += `  • ${title} ${item.date ? `(${item.date})` : ""}\n`;
      });
    }
    out += `\n`;
  });

  return out;
}

/**
 * Runs the linter engine and returns the report.
 */
export function lintCV(cv: CVDocument, lang: SupportedLanguage = "pt"): LinterReport {
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
    role: (exp.role as any) || { pt: "" },
    company: exp.company,
    location: (exp.location as any) || { pt: "" },
    startDate: exp.startDate,
    endDate: exp.endDate || "",
    isCurrent: Boolean(exp.isCurrent),
    url: exp.url,
    highlights: (exp.highlights as any) || { pt: [] },
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
