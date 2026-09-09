import type { FontFamilyId } from "@/types/cv";

export type { FontFamilyId };

export type FontCategory = "sans" | "serif" | "mono";

export interface FontDefinition {
  id: FontFamilyId;
  name: string;
  category: FontCategory;
  stack: string;
  sampleText: string;
  latexPackage: string;
  description: {
    en: string;
    pt: string;
  };
  atsRating: "optimal" | "standard";
}

export const FONT_CATALOG: FontDefinition[] = [
  // --- Sans-Serif ---
  {
    id: "inter",
    name: "Inter",
    category: "sans",
    stack: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    sampleText: "Aa Bb Gg 123",
    latexPackage: "\\usepackage[default]{sourcesanspro}",
    description: {
      en: "Crisp, balanced geometric sans-serif engineered for digital screens and modern tech roles.",
      pt: "Sans-serif geométrico de alta legibilidade, ideal para tecnologia e engenharia moderna.",
    },
    atsRating: "optimal",
  },
  {
    id: "roboto",
    name: "Roboto",
    category: "sans",
    stack: "Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
    sampleText: "Aa Bb Gg 123",
    latexPackage: "\\usepackage[sfdefault]{roboto}",
    description: {
      en: "Modern neo-grotesque sans-serif with dual nature—mechanical skeleton and friendly open curves.",
      pt: "Sans-serif neo-grotesco clássico com curvas abertas e excelente densidade de texto.",
    },
    atsRating: "optimal",
  },
  {
    id: "outfit",
    name: "Outfit",
    category: "sans",
    stack: "Outfit, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    sampleText: "Aa Bb Gg 123",
    latexPackage: "\\usepackage[sfdefault]{FiraSans}",
    description: {
      en: "Fresh, contemporary geometric font with a distinctive editorial flair and confident presence.",
      pt: "Tipografia geométrica contemporânea com personalidade editorial distintiva e confiante.",
    },
    atsRating: "optimal",
  },
  {
    id: "plus-jakarta-sans",
    name: "Plus Jakarta Sans",
    category: "sans",
    stack: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    sampleText: "Aa Bb Gg 123",
    latexPackage: "\\usepackage[default]{sourcesanspro}",
    description: {
      en: "Clean modern grotesque with warm geometric touches, perfect for product and leadership CVs.",
      pt: "Grotesco moderno com toques geométricos quentes, ideal para perfis de produto e liderança.",
    },
    atsRating: "optimal",
  },
  {
    id: "raleway",
    name: "Raleway",
    category: "sans",
    stack: "Raleway, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    sampleText: "Aa Bb Gg 123",
    latexPackage: "\\usepackage[default]{raleway}",
    description: {
      en: "Refined display sans-serif featuring elegant proportions and subtle old-style numerals.",
      pt: "Sans-serif refinado de alta elegância, com proporções cuidadas para design e arquitetura.",
    },
    atsRating: "standard",
  },

  // --- Serif ---
  {
    id: "merriweather",
    name: "Merriweather",
    category: "serif",
    stack: "Merriweather, Georgia, Cambria, 'Times New Roman', serif",
    sampleText: "Aa Bb Gg 123",
    latexPackage: "\\usepackage{merriweather}",
    description: {
      en: "Sturdy, highly readable serif with generous x-height and mild diagonal stress.",
      pt: "Serifada robusta e equilibrada, desenhada para leitura agradável em ecrã e papel.",
    },
    atsRating: "optimal",
  },
  {
    id: "eb-garamond",
    name: "EB Garamond",
    category: "serif",
    stack: "'EB Garamond', Garamond, 'Times New Roman', Georgia, serif",
    sampleText: "Aa Bb Gg 123",
    latexPackage: "\\usepackage{ebgaramond}",
    description: {
      en: "Timeless Renaissance humanist serif embodying classical prestige, academia, and executive authority.",
      pt: "Serifada humanista renascentista clássica, personificando prestígio académico e executivo.",
    },
    atsRating: "optimal",
  },
  {
    id: "lora",
    name: "Lora",
    category: "serif",
    stack: "Lora, Georgia, 'Times New Roman', serif",
    sampleText: "Aa Bb Gg 123",
    latexPackage: "\\usepackage{lora}",
    description: {
      en: "Contemporary serif with calligraphy roots, bringing moderate contrast and literary sophistication.",
      pt: "Serifada contemporânea de inspiração caligráfica, conferindo sofisticação literária e calor.",
    },
    atsRating: "optimal",
  },
  {
    id: "source-serif",
    name: "Source Serif 4",
    category: "serif",
    stack: "'Source Serif 4', 'Source Serif Pro', Georgia, serif",
    sampleText: "Aa Bb Gg 123",
    latexPackage: "\\usepackage{sourceserifpro}",
    description: {
      en: "Adobe's workhorse serif tailored for technical documentation, academic clarity, and law.",
      pt: "Serifada técnica da Adobe concebida para documentação rigorosa, direito e academia.",
    },
    atsRating: "optimal",
  },

  // --- Monospace ---
  {
    id: "jetbrains-mono",
    name: "JetBrains Mono",
    category: "mono",
    stack: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, 'Courier New', monospace",
    sampleText: "Aa Bb Gg 123",
    latexPackage: "\\usepackage{jetbrainsmono}",
    description: {
      en: "Distinctive monospaced font engineered for software engineers, systems programmers, and DevOps.",
      pt: "Monospace de eleição para programadores de sistemas, engenharia de software e DevOps.",
    },
    atsRating: "standard",
  },
  {
    id: "fira-code",
    name: "Fira Code",
    category: "mono",
    stack: "'Fira Code', 'JetBrains Mono', Menlo, Monaco, monospace",
    sampleText: "Aa Bb Gg 123",
    latexPackage: "\\usepackage{FiraMono}",
    description: {
      en: "Popular technical monospace with clean glyph shapes and strong programming character.",
      pt: "Monospace técnica icónica com glifos limpos e forte identidade de programação.",
    },
    atsRating: "standard",
  },
  {
    id: "roboto-mono",
    name: "Roboto Mono",
    category: "mono",
    stack: "'Roboto Mono', Menlo, Monaco, 'Courier New', monospace",
    sampleText: "Aa Bb Gg 123",
    latexPackage: "\\usepackage{roboto-mono}",
    description: {
      en: "Geometric monospaced font balancing mechanical structure with crisp tabular alignment.",
      pt: "Tipografia monoespaçada geométrica que assegura alinhamento tabular perfeito.",
    },
    atsRating: "standard",
  },
];

/**
 * Retrieves the full font definition by ID, defaulting to Inter.
 */
export function getFontDefinition(id?: string): FontDefinition {
  if (!id) return FONT_CATALOG[0];
  const found = FONT_CATALOG.find((f) => f.id === id);
  return found || FONT_CATALOG[0];
}

/**
 * Returns the CSS font-family stack string for a given font ID.
 */
export function getFontFamilyCss(id?: string): string {
  return getFontDefinition(id).stack;
}

/**
 * Returns LaTeX package inclusion snippet for the active font family.
 */
export function getLatexFontPackage(id?: string): string {
  return getFontDefinition(id).latexPackage;
}
