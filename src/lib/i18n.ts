import type { MultiLangString, MultiLangArray, SupportedLanguage } from "@/types/cv";

/**
 * Returns the text in the requested language, with fallback to defaultLang, or first available string.
 */
export function t(
  field?: MultiLangString | null,
  lang: SupportedLanguage = "en",
  defaultLang: SupportedLanguage = "en"
): string {
  if (!field || typeof field !== "object") return "";
  if (field[lang] && field[lang].trim().length > 0) {
    return field[lang];
  }
  if (field[defaultLang] && field[defaultLang].trim().length > 0) {
    return field[defaultLang];
  }
  const firstKey = Object.keys(field)[0];
  return firstKey && field[firstKey] ? field[firstKey] : "";
}

/**
 * Returns array of strings in the requested language, with fallback.
 */
export function tArray(
  field?: MultiLangArray | null,
  lang: SupportedLanguage = "en",
  defaultLang: SupportedLanguage = "en"
): string[] {
  if (!field || typeof field !== "object") return [];
  if (Array.isArray(field[lang]) && field[lang].length > 0) {
    return field[lang];
  }
  if (Array.isArray(field[defaultLang]) && field[defaultLang].length > 0) {
    return field[defaultLang];
  }
  const firstKey = Object.keys(field)[0];
  return firstKey && Array.isArray(field[firstKey]) ? field[firstKey] : [];
}

/**
 * Checks if a multilingual field is translated in the target language.
 */
export function isFieldTranslated(
  field?: MultiLangString | null,
  targetLang: SupportedLanguage = "en"
): boolean {
  if (!field) return false;
  return Boolean(field[targetLang] && field[targetLang].trim().length > 0);
}

/**
 * Application UI dictionary in English (default) and Portuguese.
 */
export const UI_DICTIONARY = {
  en: {
    brandName: "PAPYRUS",
    brandSubtitle: "ARCHITECTURA VITAE",
    tagline: "Dynamic Multilingual Resume & CV Engine",
    // Navigation
    newDoc: "New / Setup",
    templates: "Templates",
    templateLateralis: "Lateralis (Sidebar)",
    templateClassic: "Classic (Minimal ATS)",
    templateMatrix: "Matrix (Executive Grid)",
    texManagement: "TeX / Code",
    jsonBackup: "JSON",
    importAction: "Import",
    qualityAudit: "Quality Audit",
    editTab: "Editor",
    previewTab: "Live Preview",
    editingIn: "Editing in:",
    sectionsBuilder: "Sections Builder",
    addSection: "Add Section",
    // Setup Page
    setupTitle: "Architect Your Curriculum Vitae",
    setupSubtitle: "Upload an existing file, download a clean starter template, or start fresh.",
    dropzoneTitle: "Drag & drop your file here",
    dropzoneSubtitle: "Supports JSON or TeX (.tex) documents. Instant agnostic parsing.",
    browseFiles: "Browse Files",
    orDownloadTemplate: "Or download a boilerplate template to fill:",
    downloadJsonTemplate: "Download template.json",
    downloadTexTemplate: "Download template.tex",
    manualSetupTitle: "Or Start Manually",
    blankCanvas: "Blank Canvas",
    blankCanvasDesc: "Clean empty document ready to be filled.",
    demoDataset: "Explore Demo Dataset",
    demoDatasetDesc: "Start with structured professional sample data.",
    yourName: "Your Full Name",
    yourNamePlaceholder: "e.g. Alex Morgan or Elena Silva",
    primaryLang: "Primary Language",
    bilingualSupport: "Enable Bilingual Mode (EN + PT)",
    bilingualSupportDesc: "Switch and export between languages without creating separate files.",
    enterBuilder: "Enter Editor",
    // Preview Toolbar
    pageCountSingle: "1 A4 Page",
    pageCountPlural: "A4 Pages",
    densityCompact: "Compact",
    densityNormal: "Balanced",
    densitySpacious: "Spacious",
    densityTooltip: "Spacing density",
    printBtn: "Print",
    pdfBtn: "PDF",
    pngBtn: "PNG",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    resetZoom: "Reset zoom",
    pageLimitGuide: "A4 Page Limit",
    // Section Types
    personalInfo: "Personal Details",
    experience: "Work Experience",
    education: "Education & Qualifications",
    skills: "Skills",
    languages: "Languages",
    certifications: "Certifications",
    hobbies: "Interests & Activities",
    custom: "Custom Section",
  },
  pt: {
    brandName: "PAPYRUS",
    brandSubtitle: "ARCHITECTURA VITAE",
    tagline: "Motor Dinâmico e Multilíngue de Criação de Currículos",
    // Navigation
    newDoc: "Novo / Setup",
    templates: "Modelos",
    templateLateralis: "Lateralis (Barra Lateral)",
    templateClassic: "Classic (Minimalista ATS)",
    templateMatrix: "Matrix (Grelha Executiva)",
    texManagement: "TeX / Código",
    jsonBackup: "JSON",
    importAction: "Importar",
    qualityAudit: "Auditoria de Qualidade",
    editTab: "Editar",
    previewTab: "Pré-visualização",
    editingIn: "A editar em:",
    sectionsBuilder: "Construtor de Secções",
    addSection: "Adicionar Secção",
    // Setup Page
    setupTitle: "Arquitetura do Seu Curriculum Vitae",
    setupSubtitle: "Carregue um ficheiro existente, descarregue um modelo limpo ou comece do zero.",
    dropzoneTitle: "Arraste e solte o seu ficheiro aqui",
    dropzoneSubtitle: "Suporta documentos JSON ou TeX (.tex). Leitura agnóstica instantânea.",
    browseFiles: "Procurar Ficheiro",
    orDownloadTemplate: "Ou descarregue um modelo base para preencher:",
    downloadJsonTemplate: "Descarregar template.json",
    downloadTexTemplate: "Descarregar template.tex",
    manualSetupTitle: "Ou Inicie Manualmente",
    blankCanvas: "Folha em Branco",
    blankCanvasDesc: "Documento limpo pronto para ser preenchido do zero.",
    demoDataset: "Explorar com Dados de Exemplo",
    demoDatasetDesc: "Começar com dados estruturados de demonstração.",
    yourName: "O seu Nome Completo",
    yourNamePlaceholder: "ex: Alex Silva ou Maria Santos",
    primaryLang: "Idioma Principal",
    bilingualSupport: "Ativar Suporte Bilíngue (PT + EN)",
    bilingualSupportDesc: "Alterne e exporte entre línguas sem necessitar de duplicar ficheiros.",
    enterBuilder: "Entrar no Construtor",
    // Preview Toolbar
    pageCountSingle: "1 Página A4",
    pageCountPlural: "Páginas A4",
    densityCompact: "Compacto",
    densityNormal: "Equilibrado",
    densitySpacious: "Espaçoso",
    densityTooltip: "Densidade de espaçamento",
    printBtn: "Imprimir",
    pdfBtn: "PDF",
    pngBtn: "PNG",
    zoomIn: "Aumentar zoom",
    zoomOut: "Reduzir zoom",
    resetZoom: "Repor zoom",
    pageLimitGuide: "Limite da Página A4",
    // Section Types
    personalInfo: "Dados Pessoais",
    experience: "Experiência Profissional",
    education: "Habilitações e Formação",
    skills: "Competências",
    languages: "Competências Linguísticas",
    certifications: "Certificações",
    hobbies: "Interesses & Atividades",
    custom: "Secção Personalizada",
  },
};

export function tUI(key: keyof typeof UI_DICTIONARY["en"], lang: SupportedLanguage = "en"): string {
  const dictionary = (UI_DICTIONARY as any)[lang] || UI_DICTIONARY.en;
  return dictionary[key] || UI_DICTIONARY.en[key] || String(key);
}
