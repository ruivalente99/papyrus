import type {
  CVDocument,
  SupportedLanguage,
  ExperienceSection,
  EducationSection,
  SkillsSection,
  LanguagesSection,
  CertificationsSection,
  HobbiesSection,
  CustomSection,
} from "@/types/cv";
import { t, tArray } from "@/lib/i18n";
import { generateId } from "@/lib/utils";

/**
 * Escapes LaTeX special characters in plain text strings
 */
export function escapeLatex(text: string | undefined | null): string {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

/**
 * Generates clean, compilable LaTeX code from a CVDocument
 */
export function exportToLatex(cv: CVDocument, lang: SupportedLanguage = "pt"): string {
  const p = cv.personalInfo;
  const headline = t(p.headline, lang, cv.defaultLanguage);
  const summary = t(p.summary, lang, cv.defaultLanguage);
  const location = t(p.location, lang, cv.defaultLanguage);
  const primaryHex = (cv.theme.primaryColor || "#004f90").replace("#", "");

  let tex = `%-------------------------------------------------------------------
% CVANA - Dynamic Multilingual Resume
% Generated on ${new Date().toISOString().split("T")[0]}
%-------------------------------------------------------------------

\\documentclass[10pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=1.5cm]{geometry}
\\usepackage{hyperref}
\\usepackage{xcolor}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{parskip}

% Color definitions
\\definecolor{primaryColor}{HTML}{${primaryHex}}
\\definecolor{darkgray}{HTML}{333333}

\\hypersetup{
    colorlinks=true,
    linkcolor=primaryColor,
    urlcolor=primaryColor
}

% Section formatting
\\titleformat{\\section}
  {\\color{primaryColor}\\normalfont\\large\\bfseries\\uppercase}
  {}{0em}{}[\\color{primaryColor}\\titlerule]
\\titlespacing*{\\section}{0pt}{10pt}{6pt}

\\pagestyle{empty}

\\begin{document}

%-------------------------------------------------------------------
% HEADER / CONTACT INFO
%-------------------------------------------------------------------
\\begin{center}
    {\\color{primaryColor}\\Huge\\bfseries ${escapeLatex(p.fullName)}}\\\\
    \\vspace{2pt}
    ${headline ? `{\\color{darkgray}\\normalsize\\bfseries ${escapeLatex(headline)}}\\\\` : ""}
    \\vspace{4pt}
    {\\small
`;

  const contactItems: string[] = [];
  if (p.email) contactItems.push(`\\href{mailto:${p.email}}{${escapeLatex(p.email)}}`);
  if (p.phone) contactItems.push(`\\href{tel:${p.phone.replace(/[\s()]/g, "")}}{${escapeLatex(p.phone)}}`);
  if (location) contactItems.push(escapeLatex(location));
  if (p.website) contactItems.push(`\\href{${p.website}}{${escapeLatex(p.website.replace(/^https?:\/\//, ""))}}`);

  p.links?.forEach((link) => {
    const label = t(link.label, lang, cv.defaultLanguage) || link.url.replace(/^https?:\/\//, "");
    contactItems.push(`\\href{${link.url}}{${escapeLatex(label)}}`);
  });

  tex += `    ${contactItems.join(" $\\cdot$ ")}\n    }\n\\end{center}\n\\vspace{-6pt}\n`;

  // Summary / Profile
  if (summary) {
    const summaryTitle = lang === "pt" ? "Perfil Profissional" : "Profile Summary";
    tex += `\n%-------------------------------------------------------------------\n% PROFILE SUMMARY\n%-------------------------------------------------------------------\n`;
    tex += `\\section{${summaryTitle}}\n`;
    tex += `${escapeLatex(summary)}\n`;
  }

  // Sections loop
  cv.sections
    .filter((s) => s.visible)
    .forEach((section) => {
      const sectionTitle = escapeLatex(t(section.title, lang, cv.defaultLanguage));

      if (section.type === "experience") {
        const exp = section as ExperienceSection;
        tex += `\n%-------------------------------------------------------------------\n% EXPERIENCE\n%-------------------------------------------------------------------\n`;
        tex += `\\section{${sectionTitle}}\n`;

        exp.items
          .filter((i) => i.visible)
          .forEach((item) => {
            const role = escapeLatex(t(item.role, lang, cv.defaultLanguage));
            const company = escapeLatex(item.company);
            const loc = escapeLatex(t(item.location, lang, cv.defaultLanguage));
            const dates = escapeLatex(`${item.startDate} -- ${item.isCurrent ? (lang === "pt" ? "Atual" : "Present") : item.endDate || ""}`);
            const bullets = tArray(item.highlights, lang, cv.defaultLanguage);

            tex += `\\textbf{${role}} \\hfill {\\small ${dates}}\\\\\n`;
            tex += `{\\textit{${company}${loc ? `, ${loc}` : ""}}}\n`;

            if (bullets.length > 0) {
              tex += `\\begin{itemize}[leftmargin=1.5em, itemsep=1pt, topsep=2pt]\n`;
              bullets.forEach((b) => {
                tex += `  \\item ${escapeLatex(b)}\n`;
              });
              tex += `\\end{itemize}\n`;
            }
            tex += `\\vspace{4pt}\n`;
          });
      } else if (section.type === "education") {
        const edu = section as EducationSection;
        tex += `\n%-------------------------------------------------------------------\n% EDUCATION\n%-------------------------------------------------------------------\n`;
        tex += `\\section{${sectionTitle}}\n`;

        edu.items
          .filter((i) => i.visible)
          .forEach((item) => {
            const degree = escapeLatex(t(item.degree, lang, cv.defaultLanguage));
            const inst = escapeLatex(item.institution);
            const loc = escapeLatex(t(item.location, lang, cv.defaultLanguage));
            const dates = escapeLatex(`${item.startDate} -- ${item.isCurrent ? (lang === "pt" ? "Atual" : "Present") : item.endDate || ""}`);
            const details = escapeLatex(t(item.details, lang, cv.defaultLanguage));

            tex += `\\textbf{${degree}} \\hfill {\\small ${dates}}\\\\\n`;
            tex += `{\\textit{${inst}${loc ? `, ${loc}` : ""}}}${item.qeq ? ` \\hfill {\\small [${escapeLatex(item.qeq)}]}` : ""}\\\\\n`;
            if (details) {
              tex += `{\\small ${details}}\\\\\n`;
            }
            tex += `\\vspace{3pt}\n`;
          });
      } else if (section.type === "skills") {
        const skills = section as SkillsSection;
        tex += `\n%-------------------------------------------------------------------\n% SKILLS\n%-------------------------------------------------------------------\n`;
        tex += `\\section{${sectionTitle}}\n`;
        tex += `\\begin{itemize}[leftmargin=1em, itemsep=1pt, topsep=2pt]\n`;
        skills.categories
          .filter((c) => c.visible)
          .forEach((cat) => {
            const catName = escapeLatex(t(cat.name, lang, cv.defaultLanguage));
            const skList = cat.skills.map(escapeLatex).join(", ");
            tex += `  \\item \\textbf{${catName}:} ${skList}\n`;
          });
        tex += `\\end{itemize}\n`;
      } else if (section.type === "languages") {
        const langs = section as LanguagesSection;
        tex += `\n%-------------------------------------------------------------------\n% LANGUAGES\n%-------------------------------------------------------------------\n`;
        tex += `\\section{${sectionTitle}}\n`;
        tex += `\\begin{itemize}[leftmargin=1em, itemsep=1pt, topsep=2pt]\n`;
        langs.items
          .filter((i) => i.visible)
          .forEach((item) => {
            const name = escapeLatex(t(item.name, lang, cv.defaultLanguage));
            const level = escapeLatex(t(item.level, lang, cv.defaultLanguage));
            const cefr = item.cefr ? ` (${escapeLatex(item.cefr)})` : "";
            tex += `  \\item \\textbf{${name}:} ${level}${cefr}\n`;
          });
        tex += `\\end{itemize}\n`;
      } else if (section.type === "certifications") {
        const certs = section as CertificationsSection;
        tex += `\n%-------------------------------------------------------------------\n% CERTIFICATIONS\n%-------------------------------------------------------------------\n`;
        tex += `\\section{${sectionTitle}}\n`;
        tex += `\\begin{itemize}[leftmargin=1em, itemsep=1pt, topsep=2pt]\n`;
        certs.items
          .filter((i) => i.visible)
          .forEach((item) => {
            const name = escapeLatex(t(item.name, lang, cv.defaultLanguage));
            const issuer = escapeLatex(item.issuer);
            const date = item.date ? ` (${escapeLatex(item.date)})` : "";
            tex += `  \\item \\textbf{${name}} -- ${issuer}${date}\n`;
          });
        tex += `\\end{itemize}\n`;
      } else if (section.type === "hobbies") {
        const hobbies = section as HobbiesSection;
        tex += `\n%-------------------------------------------------------------------\n% INTERESTS\n%-------------------------------------------------------------------\n`;
        tex += `\\section{${sectionTitle}}\n`;
        tex += `\\begin{itemize}[leftmargin=1em, itemsep=1pt, topsep=2pt]\n`;
        hobbies.items
          .filter((i) => i.visible)
          .forEach((item) => {
            const name = escapeLatex(t(item.name, lang, cv.defaultLanguage));
            const desc = t(item.description, lang, cv.defaultLanguage);
            tex += `  \\item \\textbf{${name}}${desc ? ` -- ${escapeLatex(desc)}` : ""}\n`;
          });
        tex += `\\end{itemize}\n`;
      } else if (section.type === "custom") {
        const custom = section as CustomSection;
        tex += `\n%-------------------------------------------------------------------\n% ${sectionTitle.toUpperCase()}\n%-------------------------------------------------------------------\n`;
        tex += `\\section{${sectionTitle}}\n`;
        custom.items
          .filter((i) => i.visible)
          .forEach((item) => {
            const title = escapeLatex(t(item.title, lang, cv.defaultLanguage));
            const sub = escapeLatex(t(item.subtitle, lang, cv.defaultLanguage));
            const date = item.date ? ` \\hfill {\\small ${escapeLatex(item.date)}}` : "";
            const desc = escapeLatex(t(item.description, lang, cv.defaultLanguage));
            tex += `\\textbf{${title}}${date}\\\\\n`;
            if (sub) tex += `{\\textit{${sub}}}\\\\\n`;
            if (desc) tex += `{\\small ${desc}}\\\\\n`;
            tex += `\\vspace{3pt}\n`;
          });
      }
    });

  tex += `\n\\end{document}\n`;
  return tex;
}

/**
 * Parses LaTeX resume code into a CVDocument structure
 */
export function importFromLatex(tex: string): Partial<CVDocument> {
  const clean = tex.replace(/%.*$/gm, ""); // Remove comments

  // Extract Name
  let fullName = "Nome Importado";
  const nameMatch = clean.match(/\\Huge\\bfseries\s+([^\\\}]+)/) ||
    clean.match(/\\textbf\{\\Huge\s+([^\\\}]+)\}/) ||
    clean.match(/\\author\{([^\\\}]+)\}/);
  if (nameMatch) {
    fullName = nameMatch[1].trim();
  }

  // Extract Headline
  let headline = "";
  const headMatch = clean.match(/\\normalsize\\bfseries\s+([^\\\}]+)/) ||
    clean.match(/\\large\s+([^\\\}]+)/);
  if (headMatch) {
    headline = headMatch[1].trim();
  }

  // Extract Email
  let email = "";
  const emailMatch = clean.match(/mailto:([^\}]+)/);
  if (emailMatch) email = emailMatch[1].trim();

  // Extract Phone
  let phone = "";
  const phoneMatch = clean.match(/tel:([^\}]+)/) || clean.match(/(\(\+\d{1,3}\)\s*[\d\s-]{6,15})/);
  if (phoneMatch) phone = phoneMatch[1].trim();

  // Extract Website
  let website = "";
  const webMatch = clean.match(/\\href\{((?:https?:\/\/)[^\}]+)\}/);
  if (webMatch) website = webMatch[1].trim();

  // Split into sections by \section{...}
  const sectionSplits = clean.split(/\\section\*?\{([^}]+)\}/);
  const sections: any[] = [];
  let order = 1;

  for (let i = 1; i < sectionSplits.length; i += 2) {
    const secTitle = sectionSplits[i].trim();
    const secBody = sectionSplits[i + 1] || "";
    const lower = secTitle.toLowerCase();

    if (
      lower.includes("experi") ||
      lower.includes("work") ||
      lower.includes("emprego") ||
      lower.includes("histórico")
    ) {
      // Parse experience items
      const items: any[] = [];
      const itemBlocks = secBody.split(/\\textbf\{/);

      itemBlocks.forEach((blk) => {
        if (!blk.trim()) return;
        const roleEnd = blk.indexOf("}");
        if (roleEnd === -1) return;
        const role = blk.slice(0, roleEnd).trim();
        const rest = blk.slice(roleEnd + 1);

        // Date range
        const dateMatch = rest.match(/\\hfill\s*\{?[\\small\s]*([^\\\}]+)\}?/);
        const dates = dateMatch ? dateMatch[1].trim().split(/--|-/) : ["", ""];

        // Company
        const compMatch = rest.match(/\\textit\{([^,}]+)/);
        const company = compMatch ? compMatch[1].trim() : "Empresa";

        // Highlights
        const bullets: string[] = [];
        const itemMatches = rest.matchAll(/\\item\s+([^\n\\]+)/g);
        for (const m of itemMatches) {
          bullets.push(m[1].trim());
        }

        items.push({
          id: `exp-${generateId()}`,
          role: { pt: role, en: role },
          company,
          startDate: dates[0]?.trim() || "",
          endDate: dates[1]?.trim() || "",
          isCurrent: dates[1]?.toLowerCase().includes("atual") || dates[1]?.toLowerCase().includes("present") || false,
          highlights: { pt: bullets, en: bullets },
          visible: true,
        });
      });

      sections.push({
        id: `sec-${generateId()}`,
        type: "experience",
        title: { pt: secTitle, en: secTitle },
        visible: true,
        order: order++,
        items: items.length > 0 ? items : [
          {
            id: `exp-${generateId()}`,
            role: { pt: "Função", en: "Role" },
            company: "Empresa",
            startDate: "2022",
            isCurrent: true,
            highlights: { pt: [], en: [] },
            visible: true,
          },
        ],
      });
    } else if (
      lower.includes("educa") ||
      lower.includes("forma") ||
      lower.includes("habilita") ||
      lower.includes("academic")
    ) {
      const items: any[] = [];
      const itemBlocks = secBody.split(/\\textbf\{/);

      itemBlocks.forEach((blk) => {
        if (!blk.trim()) return;
        const degEnd = blk.indexOf("}");
        if (degEnd === -1) return;
        const degree = blk.slice(0, degEnd).trim();
        const rest = blk.slice(degEnd + 1);

        const dateMatch = rest.match(/\\hfill\s*\{?[\\small\s]*([^\\\}]+)\}?/);
        const dates = dateMatch ? dateMatch[1].trim().split(/--|-/) : ["", ""];

        const instMatch = rest.match(/\\textit\{([^,}]+)/);
        const institution = instMatch ? instMatch[1].trim() : "Instituição";

        items.push({
          id: `edu-${generateId()}`,
          degree: { pt: degree, en: degree },
          institution,
          startDate: dates[0]?.trim() || "",
          endDate: dates[1]?.trim() || "",
          isCurrent: false,
          visible: true,
        });
      });

      sections.push({
        id: `sec-${generateId()}`,
        type: "education",
        title: { pt: secTitle, en: secTitle },
        visible: true,
        order: order++,
        items: items.length > 0 ? items : [],
      });
    } else if (lower.includes("compet") || lower.includes("skill") || lower.includes("habilidade")) {
      const categories: any[] = [];
      const itemMatches = secBody.matchAll(/\\item\s+\\textbf\{([^}]+):\s*\}\s*([^\n\\]+)/g);
      for (const m of itemMatches) {
        const catName = m[1].trim();
        const skillsList = m[2].split(",").map((s) => s.trim()).filter(Boolean);
        categories.push({
          id: `cat-${generateId()}`,
          name: { pt: catName, en: catName },
          skills: skillsList,
          visible: true,
        });
      }

      sections.push({
        id: `sec-${generateId()}`,
        type: "skills",
        title: { pt: secTitle, en: secTitle },
        visible: true,
        order: order++,
        categories: categories.length > 0 ? categories : [
          {
            id: `cat-${generateId()}`,
            name: { pt: "Competências Gerais", en: "General Skills" },
            skills: ["Trabalho em Equipa", "Comunicação"],
            visible: true,
          },
        ],
      });
    }
  }

  return {
    title: `CV de ${fullName}`,
    personalInfo: {
      fullName,
      headline: { pt: headline, en: headline },
      email,
      phone,
      location: { pt: "", en: "" },
      website,
      photoUrl: "",
      photoShape: "circle",
      showPhoto: false,
      links: [],
      summary: { pt: "", en: "" },
    },
    sections: sections.length > 0 ? sections : undefined,
  };
}
