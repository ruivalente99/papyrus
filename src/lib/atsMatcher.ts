import type { CVDocument, SupportedLanguage, SkillsSection } from "@/types/cv";
import { t, tArray } from "@/lib/i18n";
import { generateId } from "@/lib/utils";

export interface MatchedKeyword {
  term: string;
  countInJob: number;
  countInCV: number;
  category: "technical" | "soft" | "domain" | "tool";
}

export interface MissingKeyword {
  term: string;
  countInJob: number;
  category: "technical" | "soft" | "domain" | "tool";
  importance: "high" | "medium" | "low";
}

export interface ATSMatchResult {
  overallScore: number; // 0 - 100
  rating: "excellent" | "good" | "moderate" | "low";
  matchedKeywords: MatchedKeyword[];
  missingKeywords: MissingKeyword[];
  keywordDensity: {
    term: string;
    jobFrequency: number;
    cvFrequency: number;
  }[];
  summary: {
    totalJobKeywords: number;
    matchedCount: number;
    missingCount: number;
    topMissingSkills: string[];
  };
}

// Common technical and professional dictionary terms
const KNOWN_TECH_KEYWORDS = new Set([
  // Frontend
  "react", "next.js", "nextjs", "vue", "vue.js", "angular", "svelte", "typescript",
  "javascript", "html", "html5", "css", "css3", "tailwind", "tailwindcss", "sass",
  "redux", "graphql", "rest", "api", "webpack", "vite", "esbuild", "jest", "cypress",
  "playwright", "storybook", "ui/ux", "figma", "responsive design", "web performance",
  // Backend & Languages
  "node", "node.js", "nodejs", "express", "nest.js", "python", "django", "fastapi",
  "java", "spring", "spring boot", "c#", ".net", "dotnet", "c++", "go", "golang",
  "rust", "ruby", "rails", "php", "laravel",
  // Cloud & DevOps
  "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s", "terraform",
  "ansible", "ci/cd", "github actions", "gitlab ci", "jenkins", "linux", "nginx",
  "serverless", "lambda", "microservices", "kafka", "rabbitmq", "redis",
  // Databases
  "sql", "postgresql", "postgres", "mysql", "mongodb", "sqlite", "elasticsearch",
  "dynamodb", "prisma", "orm", "nosql",
  // Methodologies & Practices
  "agile", "scrum", "kanban", "tdd", "bdd", "clean code", "solid", "dry",
  "system design", "software architecture", "code review", "git", "devops",
  "security", "owasp", "oauth", "jwt", "unit testing", "integration testing"
]);

const KNOWN_SOFT_KEYWORDS = new Set([
  "leadership", "mentoring", "communication", "teamwork", "problem solving",
  "critical thinking", "collaboration", "cross-functional", "stakeholder management",
  "project management", "time management", "adaptability", "autonomy",
  "liderança", "comunicação", "trabalho em equipa", "resolução de problemas",
  "gestão de projetos", "autonomia", "colaboração"
]);

// Stop words for keyword filtering (EN + PT)
const STOP_WORDS = new Set([
  // English
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
  "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
  "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't",
  "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
  "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
  "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
  "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i",
  "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's",
  "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself",
  "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought",
  "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
  "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
  "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
  "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
  "they've", "this", "those", "through", "to", "too", "under", "until", "up",
  "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
  "weren't", "what", "what's", "when", "when's", "where", "where's", "which",
  "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
  "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
  "yourself", "yourselves", "will", "shall", "must", "can", "may", "might",
  "job", "role", "candidate", "responsibilities", "requirements", "experience",
  "years", "work", "working", "team", "company", "opportunity", "join", "looking",
  // Portuguese
  "o", "a", "os", "as", "um", "uma", "uns", "umas", "de", "do", "da", "dos", "das",
  "em", "no", "na", "nos", "nas", "por", "pelo", "pela", "pelos", "pelas", "para",
  "com", "sem", "sob", "sobre", "e", "ou", "mas", "se", "como", "que", "quando",
  "onde", "porque", "porquê", "este", "esta", "estes", "estas", "esse", "essa",
  "esses", "essas", "aquele", "aquela", "aqueles", "aquelas", "isto", "isso", "aquilo",
  "eu", "tu", "ele", "ela", "nós", "vós", "eles", "elas", "meu", "minha", "meus",
  "minhas", "teu", "tua", "teus", "tuas", "seu", "sua", "seus", "suas", "nosso",
  "nossa", "nossos", "nossas", "ser", "estar", "ter", "haver", "fazer", "ir",
  "foi", "era", "será", "são", "está", "estão", "tem", "têm", "havia", "anos",
  "experiência", "vaga", "função", "empresa", "candidato", "requisitos", "responsabilidades"
]);

/**
 * Extracts and normalizes tokens and key phrases from text.
 */
function extractTokens(text: string): Map<string, number> {
  const counts = new Map<string, number>();
  if (!text || typeof text !== "string") return counts;

  // Normalized raw text
  const clean = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s.#+\-/'’]/gu, " ")
    .replace(/\s+/g, " ");

  // 1. Single word tokens (strip surrounding punctuation while preserving internal dots/hyphens like next.js, c++)
  const words = clean
    .split(" ")
    .map((w) => w.trim().replace(/^[\s.,;:!?'’"()[\]{}]+|[\s.,;:!?'’"()[\]{}]+$/gu, ""))
    .filter((w) => w.length >= 2);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (!STOP_WORDS.has(word) && !/^\d+$/.test(word)) {
      counts.set(word, (counts.get(word) || 0) + 1);
    }

    // 2. Bigrams (2-word phrases like "next.js", "responsive design", "spring boot")
    if (i < words.length - 1) {
      const bigram = `${word} ${words[i + 1]}`;
      if (KNOWN_TECH_KEYWORDS.has(bigram) || KNOWN_SOFT_KEYWORDS.has(bigram)) {
        counts.set(bigram, (counts.get(bigram) || 0) + 1);
      }
    }

    // 3. Trigrams (3-word phrases like "continuous integration continuous")
    if (i < words.length - 2) {
      const trigram = `${word} ${words[i + 1]} ${words[i + 2]}`;
      if (KNOWN_TECH_KEYWORDS.has(trigram) || KNOWN_SOFT_KEYWORDS.has(trigram)) {
        counts.set(trigram, (counts.get(trigram) || 0) + 1);
      }
    }
  }

  return counts;
}

/**
 * Extracts all searchable text and tokens from a CVDocument in the chosen language.
 */
export function extractCVTokens(cv: CVDocument, lang: SupportedLanguage): Map<string, number> {
  const fullTextPieces: string[] = [];

  // Personal Info
  if (cv.personalInfo) {
    if (cv.personalInfo.fullName) fullTextPieces.push(cv.personalInfo.fullName);
    const headline = t(cv.personalInfo.headline, lang, cv.defaultLanguage);
    if (headline) fullTextPieces.push(headline);
    const summary = t(cv.personalInfo.summary, lang, cv.defaultLanguage);
    if (summary) fullTextPieces.push(summary);
  }

  // Sections
  if (Array.isArray(cv.sections)) {
    cv.sections.forEach((sec) => {
      if (!sec || !sec.visible) return;

      if (sec.type === "skills" && Array.isArray((sec as any).categories)) {
        (sec as any).categories.forEach((cat: any) => {
          if (!cat || !cat.visible) return;
          const catName = t(cat.name, lang, cv.defaultLanguage);
          if (catName) fullTextPieces.push(catName);
          if (Array.isArray(cat.skills)) {
            cat.skills.forEach((s: string) => fullTextPieces.push(s));
          }
        });
      } else if (sec.type === "experience" && Array.isArray((sec as any).items)) {
        (sec as any).items.forEach((item: any) => {
          if (!item || !item.visible) return;
          const role = t(item.role, lang, cv.defaultLanguage);
          if (role) fullTextPieces.push(role);
          if (item.company) fullTextPieces.push(item.company);
          const highlights = tArray(item.highlights, lang, cv.defaultLanguage);
          highlights.forEach((h) => fullTextPieces.push(h));
        });
      } else if (sec.type === "education" && Array.isArray((sec as any).items)) {
        (sec as any).items.forEach((item: any) => {
          if (!item || !item.visible) return;
          const degree = t(item.degree, lang, cv.defaultLanguage);
          if (degree) fullTextPieces.push(degree);
          if (item.institution) fullTextPieces.push(item.institution);
          const details = t(item.details, lang, cv.defaultLanguage);
          if (details) fullTextPieces.push(details);
        });
      } else if (sec.type === "certifications" && Array.isArray((sec as any).items)) {
        (sec as any).items.forEach((item: any) => {
          if (!item || !item.visible) return;
          const name = t(item.name, lang, cv.defaultLanguage);
          if (name) fullTextPieces.push(name);
          if (item.issuer) fullTextPieces.push(item.issuer);
        });
      }
    });
  }

  return extractTokens(fullTextPieces.join(" "));
}

/**
 * Matches a job vacancy description against the candidate's CV document.
 */
export function matchJobVacancy(
  cv: CVDocument,
  jobText: string,
  lang: SupportedLanguage = "en"
): ATSMatchResult {
  const jobTokens = extractTokens(jobText);
  const cvTokens = extractCVTokens(cv, lang);

  const matchedKeywords: MatchedKeyword[] = [];
  const missingKeywords: MissingKeyword[] = [];
  const density: { term: string; jobFrequency: number; cvFrequency: number }[] = [];

  // Filter job tokens to prioritize industry & technical keywords + significant recurring words
  const significantJobTerms = Array.from(jobTokens.entries())
    .filter(([term, count]) => {
      if (KNOWN_TECH_KEYWORDS.has(term) || KNOWN_SOFT_KEYWORDS.has(term)) {
        return true;
      }
      return count >= 2 && term.length >= 3;
    })
    .sort((a, b) => b[1] - a[1]);

  let weightedMatchScore = 0;
  let totalPossibleWeight = 0;

  for (const [term, jobCount] of significantJobTerms) {
    const cvCount = cvTokens.get(term) || 0;
    const isTech = KNOWN_TECH_KEYWORDS.has(term);
    const isSoft = KNOWN_SOFT_KEYWORDS.has(term);

    const category: "technical" | "soft" | "domain" | "tool" = isTech
      ? "technical"
      : isSoft
      ? "soft"
      : "domain";

    const weight = isTech ? 3 * jobCount : isSoft ? 2 * jobCount : 1 * jobCount;
    totalPossibleWeight += weight;

    density.push({
      term,
      jobFrequency: jobCount,
      cvFrequency: cvCount,
    });

    if (cvCount > 0) {
      weightedMatchScore += weight;
      matchedKeywords.push({
        term,
        countInJob: jobCount,
        countInCV: cvCount,
        category,
      });
    } else {
      const importance: "high" | "medium" | "low" = isTech || jobCount >= 3
        ? "high"
        : jobCount >= 2
        ? "medium"
        : "low";

      missingKeywords.push({
        term,
        countInJob: jobCount,
        category,
        importance,
      });
    }
  }

  // Calculate final percentage score
  const rawScore = totalPossibleWeight > 0 ? (weightedMatchScore / totalPossibleWeight) * 100 : 0;
  const overallScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  let rating: "excellent" | "good" | "moderate" | "low" = "low";
  if (overallScore >= 85) rating = "excellent";
  else if (overallScore >= 70) rating = "good";
  else if (overallScore >= 50) rating = "moderate";

  const topMissing = missingKeywords
    .filter((m) => m.importance === "high")
    .map((m) => m.term)
    .slice(0, 5);

  return {
    overallScore,
    rating,
    matchedKeywords: matchedKeywords.sort((a, b) => b.countInJob - a.countInJob),
    missingKeywords: missingKeywords.sort((a, b) => b.countInJob - a.countInJob),
    keywordDensity: density.slice(0, 20),
    summary: {
      totalJobKeywords: significantJobTerms.length,
      matchedCount: matchedKeywords.length,
      missingCount: missingKeywords.length,
      topMissingSkills: topMissing,
    },
  };
}

/**
 * Injects a missing skill directly into the active CVDocument's skills section.
 */
export function injectMissingSkill(
  cv: CVDocument,
  skillName: string,
  targetCategoryName?: string
): CVDocument {
  const updated: CVDocument = JSON.parse(JSON.stringify(cv));
  let skillsSection = updated.sections.find((s) => s.type === "skills") as SkillsSection | undefined;

  if (!skillsSection) {
    skillsSection = {
      id: `sec-${generateId()}`,
      type: "skills",
      title: { pt: "Competências", en: "Skills" },
      visible: true,
      order: updated.sections.length + 1,
      categories: [
        {
          id: `cat-${generateId()}`,
          name: { pt: "Competências Técnicas", en: "Technical Skills" },
          skills: [skillName],
          visible: true,
        },
      ],
    };
    updated.sections.push(skillsSection);
    updated.updatedAt = new Date().toISOString();
    return updated;
  }

  if (!Array.isArray(skillsSection.categories) || skillsSection.categories.length === 0) {
    skillsSection.categories = [
      {
        id: `cat-${generateId()}`,
        name: { pt: "Competências Técnicas", en: "Technical Skills" },
        skills: [skillName],
        visible: true,
      },
    ];
    updated.updatedAt = new Date().toISOString();
    return updated;
  }

  let targetCat = targetCategoryName
    ? skillsSection.categories.find(
        (c) =>
          c.name?.en?.toLowerCase() === targetCategoryName.toLowerCase() ||
          c.name?.pt?.toLowerCase() === targetCategoryName.toLowerCase()
      )
    : skillsSection.categories[0];

  if (!targetCat) {
    targetCat = skillsSection.categories[0];
  }

  if (!Array.isArray(targetCat.skills)) {
    targetCat.skills = [];
  }

  // Prevent duplicates (case-insensitive)
  const alreadyExists = targetCat.skills.some(
    (s) => s.toLowerCase().trim() === skillName.toLowerCase().trim()
  );

  if (!alreadyExists) {
    targetCat.skills.push(skillName);
  }

  updated.updatedAt = new Date().toISOString();
  return updated;
}
