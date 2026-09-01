import type { CVDocument, LinterReport, LinterIssue, SupportedLanguage } from "@/types/cv";
import { t, tArray } from "@/lib/i18n";

export function analyzeCV(cv: CVDocument, lang: SupportedLanguage): LinterReport {
  const issues: LinterIssue[] = [];
  let passedChecks = 0;
  let totalChecks = 0;

  function check(
    condition: boolean,
    issue: Omit<LinterIssue, "id">,
    id: string
  ) {
    totalChecks += 1;
    if (condition) {
      passedChecks += 1;
    } else {
      issues.push({ id, ...issue });
    }
  }

  // 1. Personal Information Checks
  const pInfo = cv.personalInfo || ({} as any);
  check(
    Boolean(pInfo.fullName && typeof pInfo.fullName === "string" && pInfo.fullName.trim().length >= 3),
    {
      level: "error",
      sectionId: "personalInfo",
      field: "fullName",
      title: lang === "pt" ? "Nome completo em falta" : "Missing full name",
      message:
        lang === "pt"
          ? "O seu nome completo é essencial para qualquer candidatura."
          : "Your full name is essential for job applications.",
    },
    "p-name"
  );

  check(
    Boolean(pInfo.email && typeof pInfo.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pInfo.email.trim())),
    {
      level: "error",
      sectionId: "personalInfo",
      field: "email",
      title: lang === "pt" ? "Email inválido ou em falta" : "Missing or invalid email",
      message:
        lang === "pt"
          ? "Insira um endereço de email profissional válido."
          : "Provide a valid professional email address.",
    },
    "p-email"
  );

  check(
    Boolean(pInfo.phone && typeof pInfo.phone === "string" && pInfo.phone.trim().length >= 6),
    {
      level: "warning",
      sectionId: "personalInfo",
      field: "phone",
      title: lang === "pt" ? "Número de telefone recomendado" : "Phone number recommended",
      message:
        lang === "pt"
          ? "Adicionar contacto telefónico facilita o contacto direto por recrutadores."
          : "Adding a phone number helps recruiters contact you quickly.",
    },
    "p-phone"
  );

  const summaryText = t(pInfo.summary, lang, cv.defaultLanguage);
  check(
    Boolean(summaryText && summaryText.trim().length >= 50),
    {
      level: "warning",
      sectionId: "personalInfo",
      field: "summary",
      title: lang === "pt" ? "Resumo de perfil curto ou em falta" : "Short or missing summary",
      message:
        lang === "pt"
          ? "Um bom resumo profissional (50 a 300 caracteres) aumenta o impacto inicial do CV."
          : "A compelling summary (50 to 300 characters) boosts initial impression.",
    },
    "p-summary"
  );

  check(
    Boolean(Array.isArray(pInfo.links) && pInfo.links.length > 0),
    {
      level: "info",
      sectionId: "personalInfo",
      field: "links",
      title: lang === "pt" ? "Adicionar links profissionais (LinkedIn, GitHub, Portfólio)" : "Add professional links",
      message:
        lang === "pt"
          ? "Recrutadores valorizam links diretos para LinkedIn ou portfólio online."
          : "Recruiters appreciate direct links to LinkedIn or online portfolios.",
    },
    "p-links"
  );

  // 2. Experience Section Checks
  const expSection = Array.isArray(cv.sections) ? cv.sections.find((s) => s.type === "experience") : undefined;
  if (expSection && expSection.visible) {
    const expItems = Array.isArray(expSection.items) ? expSection.items.filter((i) => i && i.visible) : [];

    check(
      expItems.length > 0,
      {
        level: "warning",
        sectionId: expSection.id,
        title: lang === "pt" ? "Secção de experiência vazia" : "Empty experience section",
        message:
          lang === "pt"
            ? "A secção de experiência está visível mas não contém itens."
            : "The experience section is visible but has no entries.",
      },
      "exp-empty"
    );

    expItems.forEach((item, idx) => {
      const role = t(item.role, lang, cv.defaultLanguage);
      check(
        Boolean(role && role.trim().length > 0),
        {
          level: "error",
          sectionId: expSection.id,
          field: `role-${idx}`,
          title: lang === "pt" ? `Cargo em falta no item #${idx + 1}` : `Missing job title on item #${idx + 1}`,
          message:
            lang === "pt"
              ? "Defina a sua função ou cargo na empresa."
              : "Specify your position or role at the company.",
        },
        `exp-role-${item.id}`
      );

      check(
        Boolean(item.company && typeof item.company === "string" && item.company.trim().length > 0),
        {
          level: "error",
          sectionId: expSection.id,
          field: `company-${idx}`,
          title: lang === "pt" ? `Empresa em falta no item #${idx + 1}` : `Missing company on item #${idx + 1}`,
          message:
            lang === "pt"
              ? "Indique o nome da entidade patronal ou organização."
              : "Specify the employer or organization name.",
        },
        `exp-company-${item.id}`
      );

      check(
        Boolean(item.startDate && typeof item.startDate === "string" && item.startDate.trim().length > 0),
        {
          level: "warning",
          sectionId: expSection.id,
          title: lang === "pt" ? `Data de início em falta no cargo "${role || item.company}"` : `Missing start date on "${role || item.company}"`,
          message:
            lang === "pt"
              ? "Indicar as datas é indispensável para a ordem cronológica do CV."
              : "Specifying dates is crucial for resume chronological order.",
        },
        `exp-date-${item.id}`
      );

      const bullets = tArray(item.highlights, lang, cv.defaultLanguage);
      check(
        bullets.length > 0,
        {
          level: "warning",
          sectionId: expSection.id,
          title: lang === "pt" ? `Sem pontos de destaque em "${role || item.company}"` : `No bullet highlights on "${role || item.company}"`,
          message:
            lang === "pt"
              ? "Adicione 2 a 4 pontos com as suas principais conquistas e responsabilidades."
              : "Add 2 to 4 bullet points outlining key achievements and duties.",
        },
        `exp-bullets-${item.id}`
      );

      // Action verbs & numbers check
      const hasMetrics = bullets.some((b) => typeof b === "string" && /\d+|%|\$|€|mil|k/i.test(b));
      check(
        hasMetrics,
        {
          level: "info",
          sectionId: expSection.id,
          title: lang === "pt" ? `Dica de Impacto em "${role || item.company}"` : `Impact Tip on "${role || item.company}"`,
          message:
            lang === "pt"
              ? "Incluir números ou métricas (ex: percentagens, número de pessoas, projetos) destaca o seu impacto."
              : "Including quantifiable metrics (e.g. %, team size, projects) highlights your impact.",
        },
        `exp-metrics-${item.id}`
      );
    });
  }

  // 3. Education Section Checks
  const eduSection = Array.isArray(cv.sections) ? cv.sections.find((s) => s.type === "education") : undefined;
  if (eduSection && eduSection.visible) {
    const eduItems = Array.isArray(eduSection.items) ? eduSection.items.filter((i) => i && i.visible) : [];

    check(
      eduItems.length > 0,
      {
        level: "warning",
        sectionId: eduSection.id,
        title: lang === "pt" ? "Secção de educação vazia" : "Empty education section",
        message:
          lang === "pt"
            ? "Indique as suas habilitações académicas ou cursos mais relevantes."
            : "Add your main degrees or education qualifications.",
      },
      "edu-empty"
    );
  }

  // 4. Skills & Languages Checks
  const skillsSection = Array.isArray(cv.sections) ? cv.sections.find((s) => s.type === "skills") : undefined;
  if (skillsSection && skillsSection.visible) {
    const categories = Array.isArray(skillsSection.categories)
      ? skillsSection.categories.filter((c) => c && c.visible)
      : [];
    const totalSkills = categories.reduce(
      (acc, cat) => acc + (Array.isArray(cat.skills) ? cat.skills.length : 0),
      0
    );

    check(
      totalSkills >= 3,
      {
        level: "info",
        sectionId: skillsSection.id,
        title: lang === "pt" ? "Adicione pelo menos 3 a 6 competências chave" : "Add at least 3-6 core skills",
        message:
          lang === "pt"
            ? "Competências técnicas e interpessoais ajudam nos filtros ATS e triagem inicial."
            : "Technical and soft skills optimize your resume for ATS filters.",
      },
      "skills-count"
    );
  }

  // 5. Language translation check in current active language
  if (lang !== cv.defaultLanguage) {
    const headline = pInfo.headline;
    const isHeadlineTranslated = Boolean(
      headline && typeof headline === "object" ? headline[lang] : typeof headline === "string" ? headline : false
    );
    check(
      isHeadlineTranslated,
      {
        level: "warning",
        sectionId: "personalInfo",
        field: "headline",
        title: lang === "pt" ? `Título profissional não traduzido para "${lang.toUpperCase()}"` : `Professional headline not translated to "${lang.toUpperCase()}"`,
        message:
          lang === "pt"
            ? "Alterne para esta língua e traduza o título para manter a coerência."
            : "Translate headline into the selected language for full consistency.",
      },
      `trans-headline-${lang}`
    );
  }

  // Calculate quality score
  const errorCount = issues.filter((i) => i.level === "error").length;
  const warningCount = issues.filter((i) => i.level === "warning").length;
  const infoCount = issues.filter((i) => i.level === "info").length;

  let penalty = errorCount * 25 + warningCount * 10 + infoCount * 3;
  let score = Math.max(15, Math.min(100, 100 - penalty));

  return {
    score,
    totalChecks,
    passedChecks,
    issues,
  };
}
