import type {
  CVDocument,
  SupportedLanguage,
  ExperienceSection,
  EducationSection,
  SkillsSection,
  LanguagesSection,
  CertificationsSection,
  HobbiesSection,
  SocialLink,
} from "@/types/cv";
import { t, tArray } from "@/lib/i18n";
import { generateId } from "@/lib/utils";

// ==========================================
// JSON RESUME INTERFACES (jsonresume.org)
// ==========================================

export interface JsonResumeProfile {
  network?: string;
  username?: string;
  url?: string;
}

export interface JsonResumeLocation {
  address?: string;
  postalCode?: string;
  city?: string;
  countryCode?: string;
  region?: string;
}

export interface JsonResumeBasics {
  name?: string;
  label?: string;
  image?: string;
  email?: string;
  phone?: string;
  url?: string;
  summary?: string;
  location?: JsonResumeLocation;
  profiles?: JsonResumeProfile[];
}

export interface JsonResumeWork {
  name?: string;
  position?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  summary?: string;
  highlights?: string[];
}

export interface JsonResumeEducation {
  institution?: string;
  url?: string;
  area?: string;
  studyType?: string;
  startDate?: string;
  endDate?: string;
  score?: string;
  courses?: string[];
}

export interface JsonResumeCertificate {
  name?: string;
  date?: string;
  issuer?: string;
  url?: string;
}

export interface JsonResumeSkill {
  name?: string;
  level?: string;
  keywords?: string[];
}

export interface JsonResumeLanguage {
  language?: string;
  fluency?: string;
}

export interface JsonResumeInterest {
  name?: string;
  keywords?: string[];
}

export interface JsonResume {
  $schema?: string;
  basics?: JsonResumeBasics;
  work?: JsonResumeWork[];
  education?: JsonResumeEducation[];
  certificates?: JsonResumeCertificate[];
  skills?: JsonResumeSkill[];
  languages?: JsonResumeLanguage[];
  interests?: JsonResumeInterest[];
}

// ==========================================
// XML ESCAPING & UTILITIES
// ==========================================

export function escapeXml(text: string | undefined | null): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function unescapeXml(text: string | undefined | null): string {
  if (!text) return "";
  return text
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&");
}

/**
 * Detects format of resume string (papyrus json, jsonresume, europass xml, or latex)
 */
export function detectResumeFormat(
  content: string
): "papyrus" | "jsonresume" | "europass-xml" | "latex" | "unknown" {
  const trimmed = content.trim();

  // XML check
  if (trimmed.startsWith("<?xml") || trimmed.includes("<SkillsPassport") || trimmed.includes("<Europass")) {
    return "europass-xml";
  }

  // LaTeX check
  if (trimmed.includes("\\documentclass") || trimmed.includes("\\begin{document}")) {
    return "latex";
  }

  // JSON checks
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.basics && (parsed.work || parsed.education || parsed.skills)) {
        return "jsonresume";
      }
      if (parsed.personalInfo && Array.isArray(parsed.sections)) {
        return "papyrus";
      }
    } catch {
      return "unknown";
    }
  }

  return "unknown";
}

// ==========================================
// 1. JSON RESUME EXPORT & IMPORT
// ==========================================

export function exportToJsonResume(cv: CVDocument, lang: SupportedLanguage = "en"): JsonResume {
  const p = cv.personalInfo;
  const headline = t(p.headline, lang, cv.defaultLanguage);
  const location = t(p.location, lang, cv.defaultLanguage);
  const summary = t(p.summary, lang, cv.defaultLanguage);

  // Basics profiles
  const profiles: JsonResumeProfile[] = (p.links || []).map((link) => ({
    network: link.platform,
    username: t(link.label, lang, cv.defaultLanguage) || "",
    url: link.url,
  }));

  const basics: JsonResumeBasics = {
    name: p.fullName,
    label: headline,
    image: p.showPhoto ? p.photoUrl || "" : "",
    email: p.email,
    phone: p.phone,
    url: p.website || "",
    summary,
    location: {
      city: location,
      countryCode: lang === "pt" ? "PT" : "US",
    },
    profiles,
  };

  // Work experience
  const work: JsonResumeWork[] = [];
  const expSections = cv.sections.filter((s): s is ExperienceSection => s.type === "experience" && s.visible);
  expSections.forEach((sec) => {
    sec.items
      .filter((i) => i.visible)
      .forEach((item) => {
        const highlights = tArray(item.highlights, lang, cv.defaultLanguage);
        work.push({
          name: item.company,
          position: t(item.role, lang, cv.defaultLanguage),
          url: item.url || "",
          startDate: item.startDate,
          endDate: item.isCurrent ? "" : item.endDate || "",
          summary: "",
          highlights,
        });
      });
  });

  // Education
  const education: JsonResumeEducation[] = [];
  const eduSections = cv.sections.filter((s): s is EducationSection => s.type === "education" && s.visible);
  eduSections.forEach((sec) => {
    sec.items
      .filter((i) => i.visible)
      .forEach((item) => {
        education.push({
          institution: item.institution,
          studyType: t(item.degree, lang, cv.defaultLanguage),
          startDate: item.startDate,
          endDate: item.isCurrent ? "" : item.endDate || "",
          url: item.url || "",
        });
      });
  });

  // Skills
  const skills: JsonResumeSkill[] = [];
  const skillSections = cv.sections.filter((s): s is SkillsSection => s.type === "skills" && s.visible);
  skillSections.forEach((sec) => {
    sec.categories
      .filter((c) => c.visible)
      .forEach((cat) => {
        skills.push({
          name: t(cat.name, lang, cv.defaultLanguage),
          keywords: cat.skills,
        });
      });
  });

  // Languages
  const languages: JsonResumeLanguage[] = [];
  const langSections = cv.sections.filter((s): s is LanguagesSection => s.type === "languages" && s.visible);
  langSections.forEach((sec) => {
    sec.items
      .filter((i) => i.visible)
      .forEach((item) => {
        languages.push({
          language: t(item.name, lang, cv.defaultLanguage),
          fluency: item.cefr || t(item.level, lang, cv.defaultLanguage),
        });
      });
  });

  // Certificates
  const certificates: JsonResumeCertificate[] = [];
  const certSections = cv.sections.filter((s): s is CertificationsSection => s.type === "certifications" && s.visible);
  certSections.forEach((sec) => {
    sec.items
      .filter((i) => i.visible)
      .forEach((item) => {
        certificates.push({
          name: t(item.name, lang, cv.defaultLanguage),
          issuer: item.issuer,
          date: item.date || "",
          url: item.url || "",
        });
      });
  });

  // Interests / Hobbies
  const interests: JsonResumeInterest[] = [];
  const hobbySections = cv.sections.filter((s): s is HobbiesSection => s.type === "hobbies" && s.visible);
  hobbySections.forEach((sec) => {
    sec.items
      .filter((i) => i.visible)
      .forEach((item) => {
        interests.push({
          name: t(item.name, lang, cv.defaultLanguage),
        });
      });
  });

  return {
    $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
    basics,
    work: work.length > 0 ? work : undefined,
    education: education.length > 0 ? education : undefined,
    skills: skills.length > 0 ? skills : undefined,
    languages: languages.length > 0 ? languages : undefined,
    certificates: certificates.length > 0 ? certificates : undefined,
    interests: interests.length > 0 ? interests : undefined,
  };
}

export function importFromJsonResume(
  input: JsonResume | string,
  defaultLang: SupportedLanguage = "en"
): CVDocument {
  const jsonResume: JsonResume = typeof input === "string" ? JSON.parse(input) : input;
  const b = jsonResume.basics || {};
  const otherLang = defaultLang === "en" ? "pt" : "en";

  const fullName = b.name || "Unnamed Candidate";
  const headline = b.label || "";
  const locationStr = b.location?.city || b.location?.region || "";
  const summaryStr = b.summary || "";

  // Convert social links
  const links: SocialLink[] = (b.profiles || []).map((prof) => {
    const net = (prof.network || "other").toLowerCase();
    let platform: SocialLink["platform"] = "other";
    if (net.includes("linkedin")) platform = "linkedin";
    else if (net.includes("github")) platform = "github";
    else if (net.includes("twitter") || net.includes("x")) platform = "twitter";
    else if (net.includes("portfolio") || net.includes("website") || net.includes("site") || net.includes("blog")) platform = "website";

    return {
      id: generateId(),
      platform,
      url: prof.url || "",
      label: {
        [defaultLang]: prof.username || prof.network || "",
        [otherLang]: prof.username || prof.network || "",
      },
    };
  });

  const sections: any[] = [];
  let order = 1;

  // 1. Work Experience
  if (jsonResume.work && jsonResume.work.length > 0) {
    sections.push({
      id: `sec-${generateId()}`,
      type: "experience",
      title: {
        en: "Work Experience",
        pt: "Experiência Profissional",
      },
      visible: true,
      order: order++,
      items: jsonResume.work.map((w) => ({
        id: `exp-${generateId()}`,
        role: { [defaultLang]: w.position || "", [otherLang]: w.position || "" },
        company: w.name || "Company",
        startDate: (w.startDate || "").slice(0, 7),
        endDate: (w.endDate || "").slice(0, 7),
        isCurrent: !w.endDate,
        url: w.url || "",
        highlights: {
          [defaultLang]: w.highlights || [],
          [otherLang]: w.highlights || [],
        },
        visible: true,
      })),
    });
  }

  // 2. Education
  if (jsonResume.education && jsonResume.education.length > 0) {
    sections.push({
      id: `sec-${generateId()}`,
      type: "education",
      title: {
        en: "Education",
        pt: "Educação e Formação",
      },
      visible: true,
      order: order++,
      items: jsonResume.education.map((e) => {
        const degreeTitle = [e.studyType, e.area].filter(Boolean).join(" in ") || "Degree";
        return {
          id: `edu-${generateId()}`,
          degree: { [defaultLang]: degreeTitle, [otherLang]: degreeTitle },
          institution: e.institution || "Institution",
          startDate: (e.startDate || "").slice(0, 7),
          endDate: (e.endDate || "").slice(0, 7),
          isCurrent: !e.endDate,
          url: e.url || "",
          visible: true,
        };
      }),
    });
  }

  // 3. Skills
  if (jsonResume.skills && jsonResume.skills.length > 0) {
    sections.push({
      id: `sec-${generateId()}`,
      type: "skills",
      title: {
        en: "Skills & Technologies",
        pt: "Competências e Tecnologias",
      },
      visible: true,
      order: order++,
      categories: jsonResume.skills.map((s) => ({
        id: `cat-${generateId()}`,
        name: { [defaultLang]: s.name || "Skills", [otherLang]: s.name || "Competências" },
        skills: s.keywords || [],
        visible: true,
      })),
    });
  }

  // 4. Languages
  if (jsonResume.languages && jsonResume.languages.length > 0) {
    sections.push({
      id: `sec-${generateId()}`,
      type: "languages",
      title: {
        en: "Languages",
        pt: "Idiomas",
      },
      visible: true,
      order: order++,
      items: jsonResume.languages.map((l) => {
        const fluency = l.fluency || "";
        let cefr: string | undefined = undefined;
        if (/C2|native/i.test(fluency)) cefr = "C2 (Native)";
        else if (/C1|advanced/i.test(fluency)) cefr = "C1";
        else if (/B2|fluent/i.test(fluency)) cefr = "B2";
        else if (/B1|intermediate/i.test(fluency)) cefr = "B1";

        return {
          id: `lang-${generateId()}`,
          name: { [defaultLang]: l.language || "", [otherLang]: l.language || "" },
          level: { [defaultLang]: fluency, [otherLang]: fluency },
          cefr,
          visible: true,
        };
      }),
    });
  }

  // 5. Certifications
  if (jsonResume.certificates && jsonResume.certificates.length > 0) {
    sections.push({
      id: `sec-${generateId()}`,
      type: "certifications",
      title: {
        en: "Certifications",
        pt: "Certificações",
      },
      visible: true,
      order: order++,
      items: jsonResume.certificates.map((c) => ({
        id: `cert-${generateId()}`,
        name: { [defaultLang]: c.name || "", [otherLang]: c.name || "" },
        issuer: c.issuer || "",
        date: c.date || "",
        url: c.url || "",
        visible: true,
      })),
    });
  }

  // 6. Interests / Hobbies
  if (jsonResume.interests && jsonResume.interests.length > 0) {
    sections.push({
      id: `sec-${generateId()}`,
      type: "hobbies",
      title: {
        en: "Interests",
        pt: "Interesses e Atividades",
      },
      visible: true,
      order: order++,
      items: jsonResume.interests.map((it) => ({
        id: `hob-${generateId()}`,
        name: { [defaultLang]: it.name || "", [otherLang]: it.name || "" },
        visible: true,
      })),
    });
  }

  return {
    id: `cv-${generateId()}`,
    version: "1.0",
    title: `CV - ${fullName}`,
    defaultLanguage: defaultLang,
    currentLanguage: defaultLang,
    availableLanguages: [
      { code: "en", label: "English" },
      { code: "pt", label: "Português" },
    ],
    template: "classic",
    theme: {
      primaryColor: "#004f90",
      fontFamily: "inter",
      fontSize: "normal",
    },
    personalInfo: {
      fullName,
      headline: { [defaultLang]: headline, [otherLang]: headline },
      email: b.email || "",
      phone: b.phone || "",
      location: { [defaultLang]: locationStr, [otherLang]: locationStr },
      website: b.url || "",
      photoUrl: b.image || "",
      photoShape: "circle",
      showPhoto: Boolean(b.image),
      links,
      summary: { [defaultLang]: summaryStr, [otherLang]: summaryStr },
    },
    sections,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ==========================================
// 2. EUROPASS XML EXPORT & IMPORT
// ==========================================

export function exportToEuropassXml(cv: CVDocument, lang: SupportedLanguage = "en"): string {
  const p = cv.personalInfo;
  const fullNameParts = p.fullName.trim().split(" ");
  const firstName = fullNameParts[0] || "";
  const surname = fullNameParts.slice(1).join(" ") || "";
  const headline = t(p.headline, lang, cv.defaultLanguage);
  const location = t(p.location, lang, cv.defaultLanguage);
  const summary = t(p.summary, lang, cv.defaultLanguage);
  const now = new Date().toISOString().split(".")[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<SkillsPassport xmlns="http://europass.cedefop.europa.eu/Europass" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <DocumentInfo>
    <DocumentType>ECV_ESP</DocumentType>
    <CreationDate>${now}</CreationDate>
    <LastUpdateDate>${now}</LastUpdateDate>
    <XSDVersion>V3.4</XSDVersion>
  </DocumentInfo>
  <LearnerInfo>
    <Identification>
      <PersonName>
        <FirstName>${escapeXml(firstName)}</FirstName>
        <Surname>${escapeXml(surname)}</Surname>
      </PersonName>
      <ContactInfo>
        <Address>
          <Contact>
            <AddressLine>${escapeXml(location)}</AddressLine>
            <Municipality>${escapeXml(location)}</Municipality>
          </Contact>
        </Address>
        <Email>
          <Contact>${escapeXml(p.email)}</Contact>
        </Email>
        <Telephone>
          <Contact>${escapeXml(p.phone)}</Contact>
        </Telephone>
        ${p.website ? `<Website><Contact>${escapeXml(p.website)}</Contact></Website>` : ""}
      </ContactInfo>
    </Identification>
    ${headline ? `
    <Headline>
      <Type>
        <Code>profession</Code>
        <Label>${escapeXml(headline)}</Label>
      </Type>
    </Headline>` : ""}
`;

  // Work Experience
  const expSections = cv.sections.filter((s): s is ExperienceSection => s.type === "experience" && s.visible);
  const expItems = expSections.flatMap((s) => s.items.filter((i) => i.visible));
  if (expItems.length > 0) {
    xml += `    <WorkExperience>\n`;
    expItems.forEach((exp) => {
      const role = escapeXml(t(exp.role, lang, cv.defaultLanguage));
      const company = escapeXml(exp.company);
      const startParts = exp.startDate.split("-");
      const endParts = exp.endDate ? exp.endDate.split("-") : [];
      const highlights = tArray(exp.highlights, lang, cv.defaultLanguage).join("\n• ");

      xml += `      <WorkExperience>
        <Period>
          <From Year="${startParts[0] || ""}" Month="${startParts[1] || ""}" />
          ${exp.isCurrent ? "<Current>true</Current>" : `<To Year="${endParts[0] || ""}" Month="${endParts[1] || ""}" />`}
        </Period>
        <Position>
          <Label>${role}</Label>
        </Position>
        <Employer>
          <OrganisationName>${company}</OrganisationName>
        </Employer>
        ${highlights ? `<Activities>${escapeXml(highlights)}</Activities>` : ""}
      </WorkExperience>\n`;
    });
    xml += `    </WorkExperience>\n`;
  }

  // Education
  const eduSections = cv.sections.filter((s): s is EducationSection => s.type === "education" && s.visible);
  const eduItems = eduSections.flatMap((s) => s.items.filter((i) => i.visible));
  if (eduItems.length > 0) {
    xml += `    <Education>\n`;
    eduItems.forEach((edu) => {
      const degree = escapeXml(t(edu.degree, lang, cv.defaultLanguage));
      const institution = escapeXml(edu.institution);
      const startParts = edu.startDate.split("-");
      const endParts = edu.endDate ? edu.endDate.split("-") : [];

      xml += `      <Education>
        <Period>
          <From Year="${startParts[0] || ""}" Month="${startParts[1] || ""}" />
          ${edu.isCurrent ? "<Current>true</Current>" : `<To Year="${endParts[0] || ""}" Month="${endParts[1] || ""}" />`}
        </Period>
        <Title>${degree}</Title>
        <Organisation>
          <OrganisationName>${institution}</OrganisationName>
        </Organisation>
      </Education>\n`;
    });
    xml += `    </Education>\n`;
  }

  // Skills
  xml += `    <Skills>\n`;

  // Languages
  const langSections = cv.sections.filter((s): s is LanguagesSection => s.type === "languages" && s.visible);
  const langItems = langSections.flatMap((s) => s.items.filter((i) => i.visible));
  if (langItems.length > 0) {
    xml += `      <Linguistic>\n`;
    const mother = langItems[0];
    if (mother) {
      xml += `        <MotherTongue>
          <Description>
            <Label>${escapeXml(t(mother.name, lang, cv.defaultLanguage))}</Label>
          </Description>
        </MotherTongue>\n`;
    }
    langItems.slice(1).forEach((fl) => {
      const cefrLevel = fl.cefr?.split(" ")[0] || "B2";
      xml += `        <ForeignLanguage>
          <Description>
            <Label>${escapeXml(t(fl.name, lang, cv.defaultLanguage))}</Label>
          </Description>
          <ProficiencyLevel>
            <Listening>${cefrLevel}</Listening>
            <Reading>${cefrLevel}</Reading>
            <SpokenInteraction>${cefrLevel}</SpokenInteraction>
            <SpokenProduction>${cefrLevel}</SpokenProduction>
            <Writing>${cefrLevel}</Writing>
          </ProficiencyLevel>
        </ForeignLanguage>\n`;
    });
    xml += `      </Linguistic>\n`;
  }

  // Technical / Computer skills
  const skillSections = cv.sections.filter((s): s is SkillsSection => s.type === "skills" && s.visible);
  const allSkills = skillSections.flatMap((s) => s.categories.filter((c) => c.visible).flatMap((c) => c.skills));
  if (allSkills.length > 0) {
    xml += `      <Computer>
        <Description>${escapeXml(allSkills.join(", "))}</Description>
      </Computer>\n`;
  }

  if (summary) {
    xml += `      <Communication>
        <Description>${escapeXml(summary)}</Description>
      </Communication>\n`;
  }

  xml += `    </Skills>
  </LearnerInfo>
</SkillsPassport>`;

  return xml;
}

export function importFromEuropassXml(
  xml: string,
  defaultLang: SupportedLanguage = "en"
): CVDocument {
  const otherLang = defaultLang === "en" ? "pt" : "en";

  const getTag = (source: string, tagName: string): string => {
    const match = source.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
    return match ? unescapeXml(match[1].trim()) : "";
  };

  const getTags = (source: string, tagName: string): string[] => {
    const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi");
    const matches: string[] = [];
    let m;
    while ((m = regex.exec(source)) !== null) {
      matches.push(m[1]);
    }
    return matches;
  };

  const firstName = getTag(xml, "FirstName");
  const surname = getTag(xml, "Surname");
  const fullName = [firstName, surname].filter(Boolean).join(" ") || "Europass Candidate";

  const headline = getTag(xml, "Headline");
  const professionLabel = getTag(headline, "Label") || "";

  const email = getTag(getTag(xml, "Email"), "Contact") || "";
  const phone = getTag(getTag(xml, "Telephone"), "Contact") || "";
  const website = getTag(getTag(xml, "Website"), "Contact") || "";
  const address = getTag(getTag(xml, "Address"), "AddressLine") || "";

  const communication = getTag(getTag(xml, "Communication"), "Description") || "";

  const sections: any[] = [];
  let order = 1;

  // Work Experience
  const workXmlList = getTags(xml, "WorkExperience");
  const experienceItems: any[] = [];
  workXmlList.forEach((w) => {
    const pos = getTag(w, "Position");
    const roleLabel = getTag(pos, "Label") || "Role";
    const employer = getTag(w, "Employer");
    const company = getTag(employer, "OrganisationName") || "Company";
    const activities = getTag(w, "Activities");

    const fromMatch = w.match(/<From\s+Year="([^"]+)"(?:\s+Month="([^"]+)")?/i);
    const toMatch = w.match(/<To\s+Year="([^"]+)"(?:\s+Month="([^"]+)")?/i);
    const isCurrent = w.includes("<Current>true</Current>") || !toMatch;

    const startYear = fromMatch ? fromMatch[1] : "";
    const startMonth = fromMatch && fromMatch[2] ? `-${fromMatch[2].padStart(2, "0")}` : "";
    const endYear = toMatch ? toMatch[1] : "";
    const endMonth = toMatch && toMatch[2] ? `-${toMatch[2].padStart(2, "0")}` : "";

    const bullets = activities
      ? activities.split(/\n|•/).map((s) => s.trim()).filter(Boolean)
      : [];

    if (roleLabel || company) {
      experienceItems.push({
        id: `exp-${generateId()}`,
        role: { [defaultLang]: roleLabel, [otherLang]: roleLabel },
        company,
        startDate: `${startYear}${startMonth}`,
        endDate: isCurrent ? "" : `${endYear}${endMonth}`,
        isCurrent,
        highlights: { [defaultLang]: bullets, [otherLang]: bullets },
        visible: true,
      });
    }
  });

  if (experienceItems.length > 0) {
    sections.push({
      id: `sec-${generateId()}`,
      type: "experience",
      title: { en: "Work Experience", pt: "Experiência Profissional" },
      visible: true,
      order: order++,
      items: experienceItems,
    });
  }

  // Education
  const eduXmlList = getTags(xml, "Education");
  const educationItems: any[] = [];
  eduXmlList.forEach((e) => {
    const title = getTag(e, "Title") || "Degree";
    const org = getTag(e, "Organisation");
    const institution = getTag(org, "OrganisationName") || "Institution";

    const fromMatch = e.match(/<From\s+Year="([^"]+)"(?:\s+Month="([^"]+)")?/i);
    const toMatch = e.match(/<To\s+Year="([^"]+)"(?:\s+Month="([^"]+)")?/i);
    const isCurrent = e.includes("<Current>true</Current>") || !toMatch;

    const startYear = fromMatch ? fromMatch[1] : "";
    const startMonth = fromMatch && fromMatch[2] ? `-${fromMatch[2].padStart(2, "0")}` : "";
    const endYear = toMatch ? toMatch[1] : "";
    const endMonth = toMatch && toMatch[2] ? `-${toMatch[2].padStart(2, "0")}` : "";

    if (title || institution) {
      educationItems.push({
        id: `edu-${generateId()}`,
        degree: { [defaultLang]: title, [otherLang]: title },
        institution,
        startDate: `${startYear}${startMonth}`,
        endDate: isCurrent ? "" : `${endYear}${endMonth}`,
        isCurrent,
        visible: true,
      });
    }
  });

  if (educationItems.length > 0) {
    sections.push({
      id: `sec-${generateId()}`,
      type: "education",
      title: { en: "Education", pt: "Educação e Formação" },
      visible: true,
      order: order++,
      items: educationItems,
    });
  }

  // Skills
  const computer = getTag(getTag(xml, "Computer"), "Description") || "";
  if (computer) {
    const skillList = computer.split(/,|;/).map((s) => s.trim()).filter(Boolean);
    sections.push({
      id: `sec-${generateId()}`,
      type: "skills",
      title: { en: "Technical Skills", pt: "Competências Técnicas" },
      visible: true,
      order: order++,
      categories: [
        {
          id: `cat-${generateId()}`,
          name: { en: "Technical Skills", pt: "Competências Técnicas" },
          skills: skillList,
          visible: true,
        },
      ],
    });
  }

  // Languages
  const motherLabel = getTag(getTag(xml, "MotherTongue"), "Label");
  const foreignList = getTags(xml, "ForeignLanguage");
  const languageItems: any[] = [];

  if (motherLabel) {
    languageItems.push({
      id: `lang-${generateId()}`,
      name: { [defaultLang]: motherLabel, [otherLang]: motherLabel },
      level: { en: "Native", pt: "Nativo" },
      cefr: "C2 (Native)",
      visible: true,
    });
  }

  foreignList.forEach((fl) => {
    const label = getTag(fl, "Label") || "Language";
    const listening = getTag(fl, "Listening") || "B2";
    languageItems.push({
      id: `lang-${generateId()}`,
      name: { [defaultLang]: label, [otherLang]: label },
      level: { en: `CEFR ${listening}`, pt: `QECR ${listening}` },
      cefr: listening,
      visible: true,
    });
  });

  if (languageItems.length > 0) {
    sections.push({
      id: `sec-${generateId()}`,
      type: "languages",
      title: { en: "Languages", pt: "Idiomas" },
      visible: true,
      order: order++,
      items: languageItems,
    });
  }

  return {
    id: `cv-${generateId()}`,
    version: "1.0",
    title: `Europass - ${fullName}`,
    defaultLanguage: defaultLang,
    currentLanguage: defaultLang,
    availableLanguages: [
      { code: "en", label: "English" },
      { code: "pt", label: "Português" },
    ],
    template: "matrix",
    theme: {
      primaryColor: "#004f90",
      fontFamily: "inter",
      fontSize: "normal",
    },
    personalInfo: {
      fullName,
      headline: { [defaultLang]: professionLabel, [otherLang]: professionLabel },
      email,
      phone,
      location: { [defaultLang]: address, [otherLang]: address },
      website,
      photoUrl: "",
      photoShape: "circle",
      showPhoto: false,
      links: [],
      summary: { [defaultLang]: communication, [otherLang]: communication },
    },
    sections,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
