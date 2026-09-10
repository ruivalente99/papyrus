import type {
  CVDocument,
  SupportedLanguage,
  PersonalInfo,
  CVSection,
  ExperienceSection,
  EducationSection,
  SkillsSection,
  LanguagesSection,
  ExperienceItem,
  EducationItem,
  SkillCategory,
  LanguageItem,
} from "@/types/cv";
import type {
  DiffStatus,
  FieldDiff,
  BulletDiff,
  ItemDiff,
  SectionDiff,
  ATSComparisonMetric,
  CVDiffResult,
} from "@/types/diff";
import { t, tArray } from "@/lib/i18n";
import { analyzeCV } from "@/data/linterRules";

/**
 * Longest Common Subsequence (LCS) diffing between two arrays of bullet points.
 */
export function diffBullets(bulletsA: string[] = [], bulletsB: string[] = []): BulletDiff[] {
  const m = bulletsA.length;
  const n = bulletsB.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (bulletsA[i].trim().toLowerCase() === bulletsB[j].trim().toLowerCase()) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const result: BulletDiff[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (
      i > 0 &&
      j > 0 &&
      bulletsA[i - 1].trim().toLowerCase() === bulletsB[j - 1].trim().toLowerCase()
    ) {
      result.unshift({ type: "keep", text: bulletsB[j - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: "add", text: bulletsB[j - 1] });
      j--;
    } else if (i > 0) {
      result.unshift({ type: "remove", text: bulletsA[i - 1] });
      i--;
    }
  }

  return result;
}

/**
 * Compare Personal Information fields between CV A and CV B.
 */
export function diffPersonalInfo(
  pA: PersonalInfo,
  pB: PersonalInfo,
  lang: SupportedLanguage
): FieldDiff[] {
  const fields: { key: keyof PersonalInfo; label: string; isMultiLang?: boolean }[] = [
    { key: "fullName", label: "Full Name" },
    { key: "headline", label: "Headline", isMultiLang: true },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "location", label: "Location", isMultiLang: true },
    { key: "website", label: "Website" },
    { key: "summary", label: "Summary", isMultiLang: true },
  ];

  const diffs: FieldDiff[] = [];

  for (const f of fields) {
    let valA = "";
    let valB = "";

    if (f.isMultiLang) {
      valA = (t(pA[f.key] as any, lang) || "").trim();
      valB = (t(pB[f.key] as any, lang) || "").trim();
    } else {
      valA = (String(pA[f.key] || "")).trim();
      valB = (String(pB[f.key] || "")).trim();
    }

    let status: DiffStatus = "unchanged";
    if (!valA && valB) status = "added";
    else if (valA && !valB) status = "removed";
    else if (valA !== valB) status = "modified";

    diffs.push({
      field: f.key,
      label: f.label,
      valueA: valA,
      valueB: valB,
      status,
    });
  }

  return diffs;
}

/**
 * Compare Experience Section items.
 */
function diffExperienceItems(
  itemsA: ExperienceItem[] = [],
  itemsB: ExperienceItem[] = [],
  lang: SupportedLanguage
): ItemDiff[] {
  const diffs: ItemDiff[] = [];
  const matchedB = new Set<string>();

  for (const itemA of itemsA) {
    const roleA = t(itemA.role, lang).trim();
    const companyA = itemA.company.trim();

    // Match by ID or by company + role
    const itemB = itemsB.find(
      (b) =>
        b.id === itemA.id ||
        (b.company.trim().toLowerCase() === companyA.toLowerCase() &&
          t(b.role, lang).trim().toLowerCase() === roleA.toLowerCase())
    );

    if (!itemB) {
      diffs.push({
        id: itemA.id,
        title: roleA || itemA.company,
        subtitle: itemA.company,
        status: "removed",
        fieldChanges: [],
        bulletsDiff: tArray(itemA.highlights, lang).map((h) => ({ type: "remove", text: h })),
        rawItemA: itemA,
      });
      continue;
    }

    matchedB.add(itemB.id);

    const roleB = t(itemB.role, lang).trim();
    const companyB = itemB.company.trim();

    const fieldChanges: FieldDiff[] = [];
    if (roleA !== roleB) {
      fieldChanges.push({ field: "role", label: "Role", valueA: roleA, valueB: roleB, status: "modified" });
    }
    if (companyA !== companyB) {
      fieldChanges.push({ field: "company", label: "Company", valueA: companyA, valueB: companyB, status: "modified" });
    }
    if (itemA.startDate !== itemB.startDate || itemA.endDate !== itemB.endDate) {
      fieldChanges.push({
        field: "dates",
        label: "Dates",
        valueA: `${itemA.startDate} - ${itemA.endDate || "Present"}`,
        valueB: `${itemB.startDate} - ${itemB.endDate || "Present"}`,
        status: "modified",
      });
    }

    const bulletsA = tArray(itemA.highlights, lang);
    const bulletsB = tArray(itemB.highlights, lang);
    const bulletsDiff = diffBullets(bulletsA, bulletsB);

    const hasBulletChanges = bulletsDiff.some((b) => b.type !== "keep");
    const isModified = fieldChanges.length > 0 || hasBulletChanges;

    diffs.push({
      id: itemA.id,
      title: roleB || companyB,
      subtitle: companyB,
      status: isModified ? "modified" : "unchanged",
      fieldChanges,
      bulletsDiff,
      rawItemA: itemA,
      rawItemB: itemB,
    });
  }

  // Check for items added in B
  for (const itemB of itemsB) {
    if (!matchedB.has(itemB.id)) {
      const roleB = t(itemB.role, lang).trim();
      diffs.push({
        id: itemB.id,
        title: roleB || itemB.company,
        subtitle: itemB.company,
        status: "added",
        fieldChanges: [],
        bulletsDiff: tArray(itemB.highlights, lang).map((h) => ({ type: "add", text: h })),
        rawItemB: itemB,
      });
    }
  }

  return diffs;
}

/**
 * Compare Education Section items.
 */
function diffEducationItems(
  itemsA: EducationItem[] = [],
  itemsB: EducationItem[] = [],
  lang: SupportedLanguage
): ItemDiff[] {
  const diffs: ItemDiff[] = [];
  const matchedB = new Set<string>();

  for (const itemA of itemsA) {
    const degreeA = t(itemA.degree, lang).trim();
    const instA = itemA.institution.trim();

    const itemB = itemsB.find(
      (b) =>
        b.id === itemA.id ||
        (b.institution.trim().toLowerCase() === instA.toLowerCase() &&
          t(b.degree, lang).trim().toLowerCase() === degreeA.toLowerCase())
    );

    if (!itemB) {
      diffs.push({
        id: itemA.id,
        title: degreeA || instA,
        subtitle: instA,
        status: "removed",
        fieldChanges: [],
        rawItemA: itemA,
      });
      continue;
    }

    matchedB.add(itemB.id);
    const degreeB = t(itemB.degree, lang).trim();
    const instB = itemB.institution.trim();

    const fieldChanges: FieldDiff[] = [];
    if (degreeA !== degreeB) {
      fieldChanges.push({ field: "degree", label: "Degree", valueA: degreeA, valueB: degreeB, status: "modified" });
    }
    if (instA !== instB) {
      fieldChanges.push({ field: "institution", label: "Institution", valueA: instA, valueB: instB, status: "modified" });
    }
    if (itemA.startDate !== itemB.startDate || itemA.endDate !== itemB.endDate) {
      fieldChanges.push({
        field: "dates",
        label: "Dates",
        valueA: `${itemA.startDate} - ${itemA.endDate || "Present"}`,
        valueB: `${itemB.startDate} - ${itemB.endDate || "Present"}`,
        status: "modified",
      });
    }

    diffs.push({
      id: itemA.id,
      title: degreeB || instB,
      subtitle: instB,
      status: fieldChanges.length > 0 ? "modified" : "unchanged",
      fieldChanges,
      rawItemA: itemA,
      rawItemB: itemB,
    });
  }

  for (const itemB of itemsB) {
    if (!matchedB.has(itemB.id)) {
      const degreeB = t(itemB.degree, lang).trim();
      diffs.push({
        id: itemB.id,
        title: degreeB || itemB.institution,
        subtitle: itemB.institution,
        status: "added",
        fieldChanges: [],
        rawItemB: itemB,
      });
    }
  }

  return diffs;
}

/**
 * Compare Skill Categories and their skill lists.
 */
function diffSkillCategories(
  catsA: SkillCategory[] = [],
  catsB: SkillCategory[] = [],
  lang: SupportedLanguage
): ItemDiff[] {
  const diffs: ItemDiff[] = [];
  const matchedB = new Set<string>();

  for (const catA of catsA) {
    const nameA = t(catA.name, lang).trim();
    const catB = catsB.find(
      (b) => b.id === catA.id || t(b.name, lang).trim().toLowerCase() === nameA.toLowerCase()
    );

    if (!catB) {
      diffs.push({
        id: catA.id,
        title: nameA,
        status: "removed",
        fieldChanges: [],
        bulletsDiff: catA.skills.map((s) => ({ type: "remove", text: s })),
        rawItemA: catA,
      });
      continue;
    }

    matchedB.add(catB.id);
    const nameB = t(catB.name, lang).trim();

    const skillsA = catA.skills || [];
    const skillsB = catB.skills || [];
    const bulletsDiff = diffBullets(skillsA, skillsB);
    const hasChanges = nameA !== nameB || bulletsDiff.some((b) => b.type !== "keep");

    diffs.push({
      id: catA.id,
      title: nameB || nameA,
      status: hasChanges ? "modified" : "unchanged",
      fieldChanges: nameA !== nameB ? [{ field: "name", label: "Category", valueA: nameA, valueB: nameB, status: "modified" }] : [],
      bulletsDiff,
      rawItemA: catA,
      rawItemB: catB,
    });
  }

  for (const catB of catsB) {
    if (!matchedB.has(catB.id)) {
      diffs.push({
        id: catB.id,
        title: t(catB.name, lang).trim(),
        status: "added",
        fieldChanges: [],
        bulletsDiff: (catB.skills || []).map((s) => ({ type: "add", text: s })),
        rawItemB: catB,
      });
    }
  }

  return diffs;
}

/**
 * Compare Language items.
 */
function diffLanguageItems(
  itemsA: LanguageItem[] = [],
  itemsB: LanguageItem[] = [],
  lang: SupportedLanguage
): ItemDiff[] {
  const diffs: ItemDiff[] = [];
  const matchedB = new Set<string>();

  for (const itA of itemsA) {
    const nameA = t(itA.name, lang).trim();
    const itB = itemsB.find(
      (b) => b.id === itA.id || t(b.name, lang).trim().toLowerCase() === nameA.toLowerCase()
    );

    if (!itB) {
      diffs.push({
        id: itA.id,
        title: nameA,
        subtitle: itA.cefr || t(itA.level, lang),
        status: "removed",
        fieldChanges: [],
        rawItemA: itA,
      });
      continue;
    }

    matchedB.add(itB.id);
    const levelA = t(itA.level, lang).trim();
    const levelB = t(itB.level, lang).trim();
    const cefrA = itA.cefr || "";
    const cefrB = itB.cefr || "";

    const fieldChanges: FieldDiff[] = [];
    if (levelA !== levelB) {
      fieldChanges.push({ field: "level", label: "Level", valueA: levelA, valueB: levelB, status: "modified" });
    }
    if (cefrA !== cefrB) {
      fieldChanges.push({ field: "cefr", label: "CEFR", valueA: cefrA, valueB: cefrB, status: "modified" });
    }

    diffs.push({
      id: itA.id,
      title: t(itB.name, lang).trim(),
      subtitle: cefrB || levelB,
      status: fieldChanges.length > 0 ? "modified" : "unchanged",
      fieldChanges,
      rawItemA: itA,
      rawItemB: itB,
    });
  }

  for (const itB of itemsB) {
    if (!matchedB.has(itB.id)) {
      diffs.push({
        id: itB.id,
        title: t(itB.name, lang).trim(),
        subtitle: itB.cefr || t(itB.level, lang),
        status: "added",
        fieldChanges: [],
        rawItemB: itB,
      });
    }
  }

  return diffs;
}

/**
 * Compare all sections between CV A and CV B.
 */
export function diffSections(
  sectionsA: CVSection[] = [],
  sectionsB: CVSection[] = [],
  lang: SupportedLanguage
): SectionDiff[] {
  const diffs: SectionDiff[] = [];
  const matchedB = new Set<string>();

  for (const secA of sectionsA) {
    const secB = sectionsB.find((b) => b.id === secA.id || b.type === secA.type);

    if (!secB) {
      diffs.push({
        sectionId: secA.id,
        type: secA.type,
        titleA: t(secA.title, lang),
        titleB: "",
        status: "removed",
        itemsDiff: [],
      });
      continue;
    }

    matchedB.add(secB.id);

    let itemsDiff: ItemDiff[] = [];

    if (secA.type === "experience" && secB.type === "experience") {
      itemsDiff = diffExperienceItems((secA as ExperienceSection).items, (secB as ExperienceSection).items, lang);
    } else if (secA.type === "education" && secB.type === "education") {
      itemsDiff = diffEducationItems((secA as EducationSection).items, (secB as EducationSection).items, lang);
    } else if (secA.type === "skills" && secB.type === "skills") {
      itemsDiff = diffSkillCategories((secA as SkillsSection).categories, (secB as SkillsSection).categories, lang);
    } else if (secA.type === "languages" && secB.type === "languages") {
      itemsDiff = diffLanguageItems((secA as LanguagesSection).items, (secB as LanguagesSection).items, lang);
    }

    const hasItemChanges = itemsDiff.some((it) => it.status !== "unchanged");

    diffs.push({
      sectionId: secA.id,
      type: secA.type,
      titleA: t(secA.title, lang),
      titleB: t(secB.title, lang),
      status: hasItemChanges ? "modified" : "unchanged",
      itemsDiff,
    });
  }

  for (const secB of sectionsB) {
    if (!matchedB.has(secB.id)) {
      diffs.push({
        sectionId: secB.id,
        type: secB.type,
        titleA: "",
        titleB: t(secB.title, lang),
        status: "added",
        itemsDiff: [],
      });
    }
  }

  return diffs;
}

/**
 * Compare ATS quality metrics between CV A and CV B.
 */
export function diffATSMetrics(
  cvA: CVDocument,
  cvB: CVDocument,
  lang: SupportedLanguage
): { scoreA: number; scoreB: number; metrics: ATSComparisonMetric[] } {
  const reportA = analyzeCV(cvA, lang);
  const reportB = analyzeCV(cvB, lang);

  const extractAllText = (cv: CVDocument): string => {
    let txt = t(cv.personalInfo?.summary, lang) + " ";
    for (const s of cv.sections || []) {
      if (s.type === "experience") {
        for (const it of (s as ExperienceSection).items || []) {
          txt += t(it.role, lang) + " " + it.company + " " + tArray(it.highlights, lang).join(" ") + " ";
        }
      }
      if (s.type === "education") {
        for (const it of (s as EducationSection).items || []) {
          txt += t(it.degree, lang) + " " + it.institution + " ";
        }
      }
      if (s.type === "skills") {
        for (const cat of (s as SkillsSection).categories || []) {
          txt += (cat.skills || []).join(" ") + " ";
        }
      }
    }
    return txt;
  };

  const textA = extractAllText(cvA);
  const textB = extractAllText(cvB);

  const countWords = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
  const countQuantifiables = (s: string) =>
    (s.match(/(?:\d+%\b|\$[\d,]+|€[\d,]+|£[\d,]+|\b\d+x\b)/gi) || []).length;

  const countActionVerbs = (s: string) => {
    const verbs = [
      "lead", "led", "develop", "developed", "architect", "architected", "design", "designed",
      "implement", "implemented", "engineer", "engineered", "create", "created", "optimize", "optimized",
      "accelerate", "accelerated", "deploy", "deployed", "scale", "scaled", "orchestrate", "orchestrated",
      "liderar", "desenvolver", "arquitetar", "conceber", "implementar", "otimizar", "reduzir", "aumentar"
    ];
    const words = s.toLowerCase().split(/\W+/);
    return words.filter((w) => verbs.includes(w)).length;
  };

  const wordsA = countWords(textA);
  const wordsB = countWords(textB);
  const quantA = countQuantifiables(textA);
  const quantB = countQuantifiables(textB);
  const verbsA = countActionVerbs(textA);
  const verbsB = countActionVerbs(textB);

  const metrics: ATSComparisonMetric[] = [
    {
      name: "ATS Quality Score",
      valueA: `${reportA.score}%`,
      valueB: `${reportB.score}%`,
      diff: reportB.score - reportA.score >= 0 ? `+${reportB.score - reportA.score}%` : `${reportB.score - reportA.score}%`,
      positiveBetter: true,
      improved: reportB.score > reportA.score ? true : reportB.score < reportA.score ? false : null,
    },
    {
      name: "Total Word Count",
      valueA: wordsA,
      valueB: wordsB,
      diff: wordsB - wordsA >= 0 ? `+${wordsB - wordsA}` : `${wordsB - wordsA}`,
      positiveBetter: true,
      improved: wordsB > wordsA ? true : wordsB < wordsA ? false : null,
    },
    {
      name: "Action Verbs Count",
      valueA: verbsA,
      valueB: verbsB,
      diff: verbsB - verbsA >= 0 ? `+${verbsB - verbsA}` : `${verbsB - verbsA}`,
      positiveBetter: true,
      improved: verbsB > verbsA ? true : verbsB < verbsA ? false : null,
    },
    {
      name: "Quantifiable Metrics (%, $, €)",
      valueA: quantA,
      valueB: quantB,
      diff: quantB - quantA >= 0 ? `+${quantB - quantA}` : `${quantB - quantA}`,
      positiveBetter: true,
      improved: quantB > quantA ? true : quantB < quantA ? false : null,
    },
    {
      name: "Active Sections",
      valueA: (cvA.sections || []).filter((s) => s.visible).length,
      valueB: (cvB.sections || []).filter((s) => s.visible).length,
      diff: (() => {
        const d =
          (cvB.sections || []).filter((s) => s.visible).length -
          (cvA.sections || []).filter((s) => s.visible).length;
        return d >= 0 ? `+${d}` : `${d}`;
      })(),
      positiveBetter: true,
      improved: null,
    },
  ];

  return {
    scoreA: reportA.score,
    scoreB: reportB.score,
    metrics,
  };
}

/**
 * Main entry point: Performs full side-by-side comparison between two CV Documents.
 */
export function compareCVs(
  cvA: CVDocument,
  cvB: CVDocument,
  lang: SupportedLanguage = "en"
): CVDiffResult {
  const personalInfoDiff = diffPersonalInfo(cvA.personalInfo || {} as any, cvB.personalInfo || {} as any, lang);
  const sectionsDiff = diffSections(cvA.sections || [], cvB.sections || [], lang);
  const { scoreA, scoreB, metrics: atsMetrics } = diffATSMetrics(cvA, cvB, lang);

  let additions = 0;
  let deletions = 0;
  let modifications = 0;

  personalInfoDiff.forEach((d) => {
    if (d.status === "added") additions++;
    else if (d.status === "removed") deletions++;
    else if (d.status === "modified") modifications++;
  });

  sectionsDiff.forEach((s) => {
    if (s.status === "added") additions++;
    else if (s.status === "removed") deletions++;
    else if (s.status === "modified") {
      modifications++;
      s.itemsDiff.forEach((it) => {
        if (it.status === "added") additions++;
        else if (it.status === "removed") deletions++;
        else if (it.status === "modified") modifications++;
      });
    }
  });

  return {
    cvA,
    cvB,
    lang,
    personalInfoDiff,
    sectionsDiff,
    atsMetrics,
    scoreA,
    scoreB,
    summary: {
      totalChanges: additions + deletions + modifications,
      additions,
      deletions,
      modifications,
    },
  };
}

/**
 * Selective Merge: Transfer an item from CV B into CV A.
 */
export function mergeItemIntoCV(
  targetCV: CVDocument,
  sectionType: string,
  sourceItem: any
): CVDocument {
  const cloned = JSON.parse(JSON.stringify(targetCV)) as CVDocument;
  let section = cloned.sections?.find((s) => s.type === sectionType);

  if (!section) {
    const newSec: CVSection = {
      id: `sec-${sectionType}-${Date.now()}`,
      type: sectionType as any,
      title: { en: sectionType.toUpperCase(), pt: sectionType.toUpperCase() },
      visible: true,
      order: (cloned.sections || []).length + 1,
      ...(sectionType === "skills" ? { categories: [] } : { items: [] }),
    } as any;
    if (!cloned.sections) cloned.sections = [];
    cloned.sections.push(newSec);
    section = newSec;
  }

  if (section && section.type === "experience") {
    const expSec = section as ExperienceSection;
    if (!expSec.items) expSec.items = [];
    const existingIdx = expSec.items.findIndex((it) => it.id === sourceItem.id);
    if (existingIdx !== -1) {
      expSec.items[existingIdx] = JSON.parse(JSON.stringify(sourceItem));
    } else {
      expSec.items.unshift(JSON.parse(JSON.stringify(sourceItem)));
    }
  } else if (section && section.type === "education") {
    const eduSec = section as EducationSection;
    if (!eduSec.items) eduSec.items = [];
    const existingIdx = eduSec.items.findIndex((it) => it.id === sourceItem.id);
    if (existingIdx !== -1) {
      eduSec.items[existingIdx] = JSON.parse(JSON.stringify(sourceItem));
    } else {
      eduSec.items.unshift(JSON.parse(JSON.stringify(sourceItem)));
    }
  } else if (section && section.type === "skills") {
    const skillSec = section as SkillsSection;
    if (!skillSec.categories) skillSec.categories = [];
    const existingCat = skillSec.categories.find((c) => c.id === sourceItem.id);
    if (existingCat) {
      existingCat.skills = Array.from(new Set([...(existingCat.skills || []), ...(sourceItem.skills || [])]));
    } else {
      skillSec.categories.push(JSON.parse(JSON.stringify(sourceItem)));
    }
  } else if (section && section.type === "languages") {
    const langSec = section as LanguagesSection;
    if (!langSec.items) langSec.items = [];
    const existingIdx = langSec.items.findIndex((it) => it.id === sourceItem.id);
    if (existingIdx !== -1) {
      langSec.items[existingIdx] = JSON.parse(JSON.stringify(sourceItem));
    } else {
      langSec.items.push(JSON.parse(JSON.stringify(sourceItem)));
    }
  }

  cloned.updatedAt = new Date().toISOString();
  return cloned;
}
