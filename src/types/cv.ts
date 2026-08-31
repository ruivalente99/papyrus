export type SupportedLanguage = "en" | "pt" | string;

export interface MultiLangString {
  [lang: string]: string;
}

export interface MultiLangArray {
  [lang: string]: string[];
}

export interface SocialLink {
  id: string;
  platform: "linkedin" | "github" | "website" | "twitter" | "email" | "phone" | "other";
  label: MultiLangString;
  url: string;
}

export interface PersonalInfo {
  fullName: string;
  headline: MultiLangString;
  email: string;
  phone: string;
  location: MultiLangString;
  website?: string;
  photoUrl?: string;
  photoShape: "circle" | "rounded" | "square";
  showPhoto: boolean;
  links: SocialLink[];
  summary: MultiLangString;
}

export interface ExperienceItem {
  id: string;
  role: MultiLangString;
  company: string;
  location?: MultiLangString;
  startDate: string; // YYYY-MM or YYYY
  endDate?: string;   // YYYY-MM or YYYY or empty if current
  isCurrent: boolean;
  url?: string;
  highlights: MultiLangArray;
  visible: boolean;
}

export interface EducationItem {
  id: string;
  degree: MultiLangString;
  institution: string;
  location?: MultiLangString;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  qeq?: string; // e.g. "EQF Level: 6"
  details?: MultiLangString;
  url?: string;
  visible: boolean;
}

export interface SkillCategory {
  id: string;
  name: MultiLangString; // e.g. "Languages & Frameworks", "Methodologies"
  skills: string[];
  visible: boolean;
}

export interface LanguageItem {
  id: string;
  name: MultiLangString; // "English", "Portuguese", "French"
  level: MultiLangString; // "Native", "Fluent", "Intermediate"
  cefr?: string;          // e.g. "C1", "B2", "Native"
  details?: {
    listening?: string;
    reading?: string;
    spokenInteraction?: string;
    spokenProduction?: string;
    writing?: string;
  };
  visible: boolean;
}

export interface CertificationItem {
  id: string;
  name: MultiLangString;
  issuer: string;
  date: string;
  url?: string;
  visible: boolean;
}

export interface HobbyItem {
  id: string;
  name: MultiLangString;
  description?: MultiLangString;
  visible: boolean;
}

export interface CustomSectionItem {
  id: string;
  title: MultiLangString;
  subtitle?: MultiLangString;
  date?: string;
  description: MultiLangString;
  bullets?: MultiLangArray;
  visible: boolean;
}

export type SectionType =
  | "experience"
  | "education"
  | "skills"
  | "languages"
  | "certifications"
  | "hobbies"
  | "custom";

export interface BaseSectionConfig {
  id: string;
  type: SectionType;
  title: MultiLangString;
  visible: boolean;
  order: number;
}

export interface ExperienceSection extends BaseSectionConfig {
  type: "experience";
  items: ExperienceItem[];
}

export interface EducationSection extends BaseSectionConfig {
  type: "education";
  items: EducationItem[];
}

export interface SkillsSection extends BaseSectionConfig {
  type: "skills";
  categories: SkillCategory[];
}

export interface LanguagesSection extends BaseSectionConfig {
  type: "languages";
  items: LanguageItem[];
}

export interface CertificationsSection extends BaseSectionConfig {
  type: "certifications";
  items: CertificationItem[];
}

export interface HobbiesSection extends BaseSectionConfig {
  type: "hobbies";
  items: HobbyItem[];
}

export interface CustomSection extends BaseSectionConfig {
  type: "custom";
  items: CustomSectionItem[];
}

export type CVSection =
  | ExperienceSection
  | EducationSection
  | SkillsSection
  | LanguagesSection
  | CertificationsSection
  | HobbiesSection
  | CustomSection;

// Latin & generic visual template identifiers
export type TemplateId = "lateralis" | "classic" | "matrix" | "canva" | "latex" | "europass";

export interface CVTheme {
  primaryColor: string; // e.g. "#004f90" or "#047857" or "#292524"
  secondaryColor?: string;
  fontFamily: "inter" | "merriweather" | "roboto-mono" | "raleway" | "lora";
  fontSize: "compact" | "normal" | "spacious";
  sidebarPosition?: "left" | "right";
}

export interface CVDocument {
  id: string;
  version: string;
  title: string;
  defaultLanguage: SupportedLanguage;
  currentLanguage: SupportedLanguage;
  availableLanguages: Array<{ code: string; label: string }>;
  template: TemplateId;
  theme: CVTheme;
  personalInfo: PersonalInfo;
  sections: CVSection[];
  createdAt: string;
  updatedAt: string;
}

export interface LinterIssue {
  id: string;
  level: "error" | "warning" | "info";
  sectionId?: string;
  field?: string;
  title: string;
  message: string;
  actionLabel?: string;
}

export interface LinterReport {
  score: number; // 0 to 100
  totalChecks: number;
  passedChecks: number;
  issues: LinterIssue[];
}
