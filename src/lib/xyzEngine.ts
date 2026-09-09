import type { SupportedLanguage } from "@/types/cv";

export interface XYZAnalysis {
  score: number; // 0 to 100
  rating: "complete" | "needs-metric" | "needs-methodology" | "passive";
  hasAction: boolean;
  actionVerb?: string;
  isWeakAction?: boolean;
  actionAlternative?: string;
  hasMetric: boolean;
  metric?: string;
  hasMethodology: boolean;
  methodology?: string;
  suggestions: string[];
}

// Curated strong active past-tense verbs (Google XYZ standard)
export const STRONG_ACTION_VERBS_EN: Record<string, string[]> = {
  leadership: ["spearheaded", "orchestrated", "championed", "pioneered", "directed", "mentored", "mobilized"],
  engineering: ["architected", "engineered", "developed", "designed", "constructed", "refactored", "migrated"],
  optimization: ["accelerated", "optimized", "streamlined", "consolidated", "reduced", "scaled", "automated"],
  delivery: ["delivered", "launched", "deployed", "implemented", "shipped", "executed", "published"],
  problemSolving: ["resolved", "diagnosed", "mitigated", "overhauled", "remediated", "standardized", "debugged"],
};

export const STRONG_ACTION_VERBS_PT: Record<string, string[]> = {
  leadership: ["liderou", "orquestrou", "coordenou", "pioneirizou", "dirigiu", "orientou", "mobilizou"],
  engineering: ["arquitetou", "engenhou", "desenvolveu", "concebeu", "construiu", "refatorou", "migrou"],
  optimization: ["acelerou", "otimizou", "simplificou", "consolidou", "reduziu", "escalou", "automatizou"],
  delivery: ["entregou", "lançou", "implementou", "disponibilizou", "executou", "publicou", "concluiu"],
  problemSolving: ["resolveu", "diagnosticou", "mitigou", "reestruturou", "padronizou", "depurou"],
};

// Weak passive phrases that should be avoided
export const WEAK_VERBS_EN: Record<string, string> = {
  "worked on": "engineered",
  "helped with": "collaborated to deliver",
  "assisted in": "facilitated",
  "was responsible for": "spearheaded",
  "responsible for": "directed",
  "participated in": "contributed to developing",
  "handled": "managed and resolved",
  "did": "executed",
  "contributed to": "co-developed",
  "tried to": "initiated",
  "made": "created and deployed",
};

export const WEAK_VERBS_PT: Record<string, string> = {
  "trabalhou em": "desenvolveu",
  "ajudou": "colaborou na entrega de",
  "assistiu em": "facilitou",
  "foi responsável por": "liderou",
  "responsável por": "dirigiu",
  "participou em": "contribuiu ativamente para",
  "lidou com": "geriu e resolveu",
  "fez": "executou",
  "tentou": "iniciou",
  "esteve envolvido": "co-arquitetou",
};

// Regex patterns for quantitative metrics (Y)
const METRIC_PATTERNS = [
  /\b[+-]?\d+([.,]\d+)?\s*%/i, // 30%, +45%, -15.5%
  /[$€£¥]\s*\d+([.,]\d+)?\s*[kKmMbB]?/i, // $100k, €50M
  /\b\d+([.,]\d+)?\s*[kKmMbB]?\s*[$€£¥]/i, // 100k $, 50M €
  /\b\d+([.,]\d+)?x\b/i, // 3x, 10x, 2.5x
  /\b\d+([.,]\d+)?\s*(k|m|million|billion|thousand|users|active users|clients|customers|subscribers|rps|req\/s|prs|requests|queries|downloads|utilizadores|clientes|pedidos)\b/i,
  /\b\d+([.,]\d+)?\s*(ms|seconds|sec|minutes|min|hours|days|weeks|months|sprints|segundos|minutos|horas|dias|semanas|meses)\b/i,
  /\b(from\s+\d+.*to\s+\d+|de\s+\d+.*para\s+\d+)\b/i, // from 500ms to 80ms
  /\b(reduced|increased|improved|cut|boosted|saved|reduziu|aumentou|melhorou|poupou)\s+.*by\s+\d+/i,
  /\b[1-9]\d{1,}\b/, // numbers 10 and above
];

// Regex patterns for methodology / technology / context connectives (Z)
const METHODOLOGY_PATTERNS_EN = [
  /\b(by|via|using|utilizing|leveraging|through|implementing|adopting|architecting|with|employing|integrating|migrating to|introducing|relying on)\s+([a-z0-9+#.\-/ ]+)/i,
];

const METHODOLOGY_PATTERNS_PT = [
  /\b(através de|utilizando|via|com recurso a|recorrendo a|mediante|adotando|implementando|com|integrando|migrando para|introduzindo)\s+([a-z0-9+#.\-/ ]+)/i,
];

/**
 * Analyzes a resume bullet point according to Google's XYZ formula:
 * Accomplished [X], as measured by [Y], by doing [Z].
 */
export function analyzeXYZBullet(
  bullet: string,
  lang: SupportedLanguage = "en"
): XYZAnalysis {
  if (!bullet || typeof bullet !== "string" || bullet.trim().length === 0) {
    return {
      score: 0,
      rating: "passive",
      hasAction: false,
      hasMetric: false,
      hasMethodology: false,
      suggestions: [
        lang === "pt"
          ? "Escreva um ponto de destaque estruturado segundo a fórmula Google XYZ."
          : "Write a bullet point structured with Google's XYZ formula.",
      ],
    };
  }

  const clean = bullet.trim();
  const lower = clean.toLowerCase();
  const suggestions: string[] = [];

  // 1. Detect Action Verb (X)
  let hasAction = false;
  let actionVerb: string | undefined;
  let isWeakAction = false;
  let actionAlternative: string | undefined;

  const weakDict = lang === "pt" ? WEAK_VERBS_PT : WEAK_VERBS_EN;
  for (const [weak, alt] of Object.entries(weakDict)) {
    if (lower.startsWith(weak) || lower.includes(` ${weak}`)) {
      hasAction = true;
      isWeakAction = true;
      actionVerb = weak;
      actionAlternative = alt;
      break;
    }
  }

  if (!isWeakAction) {
    const strongDict = lang === "pt" ? STRONG_ACTION_VERBS_PT : STRONG_ACTION_VERBS_EN;
    const allStrong = Object.values(strongDict).flat();

    // Check first 3 words of bullet for a strong action verb
    const firstWords = lower.split(/\s+/).slice(0, 3).join(" ");
    for (const verb of allStrong) {
      if (firstWords.includes(verb)) {
        hasAction = true;
        actionVerb = verb;
        break;
      }
    }
  }

  // If no known strong or weak verb was matched, check if bullet starts with a verb-like capitalized word
  if (!hasAction && /^[A-Z][a-z]+(ed|ing|ou|ou-se|iu|eu)\b/.test(clean)) {
    hasAction = true;
    actionVerb = clean.split(/\s+/)[0];
  }

  // 2. Detect Quantifiable Metrics (Y)
  let hasMetric = false;
  let metricMatch: string | undefined;

  for (const pattern of METRIC_PATTERNS) {
    const m = clean.match(pattern);
    if (m) {
      hasMetric = true;
      metricMatch = m[0];
      break;
    }
  }

  // 3. Detect Methodology & Tools (Z)
  let hasMethodology = false;
  let methodologyMatch: string | undefined;

  const methodPatterns = lang === "pt" ? METHODOLOGY_PATTERNS_PT : METHODOLOGY_PATTERNS_EN;
  for (const pattern of methodPatterns) {
    const m = clean.match(pattern);
    if (m) {
      hasMethodology = true;
      methodologyMatch = m[0];
      break;
    }
  }

  // Also check if common tech terms appear in the second half of the bullet
  if (!hasMethodology && clean.length > 30) {
    if (/\b(react|typescript|docker|kubernetes|aws|postgresql|node|graphql|ci\/cd|next\.js|python|go)\b/i.test(clean)) {
      hasMethodology = true;
    }
  }

  // Calculate Weighted Score
  let score = 0;
  if (hasAction) {
    score += isWeakAction ? 15 : 35;
  }
  if (hasMetric) {
    score += 40;
  }
  if (hasMethodology) {
    score += 25;
  }

  // Build Contextual Suggestions
  if (isWeakAction && actionAlternative) {
    suggestions.push(
      lang === "pt"
        ? `Substitua o verbo passivo "${actionVerb}" por um verbo de impacto como "${actionAlternative}".`
        : `Replace passive phrase "${actionVerb}" with strong action verb "${actionAlternative}".`
    );
  } else if (!hasAction) {
    suggestions.push(
      lang === "pt"
        ? "Inicie a frase com um verbo de ação no passado (ex: 'Arquitetou', 'Liderou', 'Otimizou')."
        : "Start with a strong past-tense action verb (e.g. 'Engineered', 'Spearheaded', 'Optimized')."
    );
  }

  if (!hasMetric) {
    suggestions.push(
      lang === "pt"
        ? "Adicione uma métrica quantificável [Y] (ex: %, tempo poupado, receita, utilizadores ou volume)."
        : "Add a measurable outcome [Y] (e.g. %, latency reduction, revenue, user volume, or scale)."
    );
  }

  if (!hasMethodology) {
    suggestions.push(
      lang === "pt"
        ? "Especifique o método ou ferramentas [Z] (ex: 'utilizando TypeScript e Docker')."
        : "Specify the methodology or tech stack [Z] (e.g. 'by implementing TypeScript & Redis')."
    );
  }

  let rating: "complete" | "needs-metric" | "needs-methodology" | "passive" = "complete";
  if (score < 50 || isWeakAction || !hasAction) rating = "passive";
  else if (!hasMetric) rating = "needs-metric";
  else if (!hasMethodology) rating = "needs-methodology";

  return {
    score,
    rating,
    hasAction,
    actionVerb,
    isWeakAction,
    actionAlternative,
    hasMetric,
    metric: metricMatch,
    hasMethodology,
    methodology: methodologyMatch,
    suggestions,
  };
}

/**
 * Returns a generic XYZ formula template for candidate inspiration.
 */
export function getXYZExample(lang: SupportedLanguage = "en"): string {
  return lang === "pt"
    ? "Otimizou o pipeline de CI/CD, reduzindo os tempos de build em 45%, através de Docker e GitHub Actions."
    : "Engineered high-throughput streaming API, reducing response latency by 65%, by leveraging Go & Redis.";
}
