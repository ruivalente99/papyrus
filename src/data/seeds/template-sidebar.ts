import type { CVDocument } from "@/types/cv";

export const creativeSidebarSeed: CVDocument = {
  id: "preset-creative-sidebar",
  version: "1.0",
  title: "Currículo Modelo Criativo",
  defaultLanguage: "pt",
  currentLanguage: "pt",
  availableLanguages: [
    { code: "pt", label: "Português" },
    { code: "en", label: "English" },
  ],
  template: "canva",
  theme: {
    primaryColor: "#005555",
    secondaryColor: "#337777",
    fontFamily: "inter",
    fontSize: "normal",
    sidebarPosition: "left",
  },
  personalInfo: {
    fullName: "Maria Santos",
    headline: {
      pt: "Especialista em Gestão de Projetos & Ação Comunitária",
      en: "Project Management Specialist & Community Action",
    },
    email: "maria.santos@exemplo.com",
    phone: "(+351) 912 345 678",
    location: {
      pt: "Porto, Portugal",
      en: "Porto, Portugal",
    },
    website: "https://exemplo.com",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    photoShape: "circle",
    showPhoto: true,
    links: [
      {
        id: "l-li",
        platform: "linkedin",
        label: { pt: "linkedin.com/in/maria-santos", en: "linkedin.com/in/maria-santos" },
        url: "https://linkedin.com/in/exemplo",
      },
    ],
    summary: {
      pt: "Profissional dedicada com mais de 5 anos de experiência em gestão de projetos, planeamento estratégico e liderança de equipas multidisciplinares. Foco em otimização de processos, impacto social mensurável e comunicação assertiva.",
      en: "Dedicated professional with 5+ years of experience in project management, strategic planning, and multidisciplinary team leadership. Focused on process optimization, measurable impact, and clear communication.",
    },
  },
  sections: [
    {
      id: "sec-exp",
      type: "experience",
      title: {
        pt: "Experiência Profissional",
        en: "Work Experience",
      },
      visible: true,
      order: 1,
      items: [
        {
          id: "exp-1",
          role: {
            pt: "Gestora de Projetos Sénior",
            en: "Senior Project Manager",
          },
          company: "Inovação & Soluções SA",
          location: {
            pt: "Porto, Portugal",
            en: "Porto, Portugal",
          },
          startDate: "2023-01",
          endDate: "",
          isCurrent: true,
          url: "https://exemplo.com",
          visible: true,
          highlights: {
            pt: [
              "Liderança de 4 equipas transversais com entrega de projetos antes do prazo estipulado.",
              "Redução de 25% nos custos operacionais através de automação e melhoria de processos.",
            ],
            en: [
              "Led 4 cross-functional teams delivering key initiatives ahead of schedule.",
              "Reduced operational expenses by 25% through workflow automation and process improvements.",
            ],
          },
        },
        {
          id: "exp-2",
          role: {
            pt: "Coordenadora de Operações",
            en: "Operations Coordinator",
          },
          company: "Nexus Global",
          location: {
            pt: "Lisboa, Portugal",
            en: "Lisbon, Portugal",
          },
          startDate: "2021-03",
          endDate: "2022-12",
          isCurrent: false,
          url: "https://exemplo.com",
          visible: true,
          highlights: {
            pt: [
              "Coordenação logística e acompanhamento de mais de 50 iniciativas corporativas.",
              "Implementação de novos indicadores-chave de desempenho (KPIs) para monitorização contínua.",
            ],
            en: [
              "Coordinated logistics and monitored over 50 corporate initiatives.",
              "Implemented new key performance indicators (KPIs) for continuous monitoring.",
            ],
          },
        },
        {
          id: "exp-3",
          role: {
            pt: "Técnica de Apoio e Diagnóstico",
            en: "Support & Analysis Specialist",
          },
          company: "Fundação Progresso",
          location: {
            pt: "Coimbra, Portugal",
            en: "Coimbra, Portugal",
          },
          startDate: "2019-09",
          endDate: "2021-02",
          isCurrent: false,
          visible: true,
          highlights: {
            pt: [
              "Realização de diagnósticos situacionais e elaboração de relatórios técnicos detalhados.",
              "Acompanhamento direto a mais de 120 utentes e famílias.",
            ],
            en: [
              "Conducted situational assessments and prepared detailed technical reports.",
              "Direct support and casework for over 120 clients and families.",
            ],
          },
        },
      ],
    },
    {
      id: "sec-edu",
      type: "education",
      title: {
        pt: "Formação Académica",
        en: "Education & Qualifications",
      },
      visible: true,
      order: 2,
      items: [
        {
          id: "edu-1",
          degree: {
            pt: "Mestrado em Gestão e Políticas Públicas",
            en: "Master's Degree in Management & Public Policies",
          },
          institution: "Universidade do Porto",
          location: {
            pt: "Porto, Portugal",
            en: "Porto, Portugal",
          },
          startDate: "2019",
          endDate: "2021",
          isCurrent: false,
          qeq: "Nível no QEQ: 7",
          visible: true,
          details: {
            pt: "Especialização em avaliação de impacto, governação corporativa e liderança estratégica.",
            en: "Specialization in impact assessment, corporate governance, and strategic leadership.",
          },
        },
        {
          id: "edu-2",
          degree: {
            pt: "Licenciatura em Ciências Sociais",
            en: "Bachelor's Degree in Social Sciences",
          },
          institution: "Universidade de Coimbra",
          location: {
            pt: "Coimbra, Portugal",
            en: "Coimbra, Portugal",
          },
          startDate: "2015",
          endDate: "2019",
          isCurrent: false,
          qeq: "Nível no QEQ: 6",
          visible: true,
        },
      ],
    },
    {
      id: "sec-cert",
      type: "certifications",
      title: {
        pt: "Certificações & Cursos",
        en: "Certifications & Training",
      },
      visible: true,
      order: 3,
      items: [
        {
          id: "cert-1",
          name: {
            pt: "Project Management Professional (PMP / Agile)",
            en: "Project Management Professional (PMP / Agile)",
          },
          issuer: "Project Management Institute (PMI)",
          date: "2023",
          visible: true,
        },
        {
          id: "cert-2",
          name: {
            pt: "Certificado de Competências Pedagógicas (CCP)",
            en: "Pedagogical Trainer Certificate (CCP)",
          },
          issuer: "IEFP",
          date: "2022",
          visible: true,
        },
      ],
    },
    {
      id: "sec-skills",
      type: "skills",
      title: {
        pt: "Competências",
        en: "Skills",
      },
      visible: true,
      order: 4,
      categories: [
        {
          id: "sk-1",
          name: {
            pt: "Competências de Gestão",
            en: "Management & Leadership",
          },
          skills: [
            "Gestão de Projetos (Agile)",
            "Liderança de Equipas",
            "Planeamento Estratégico",
            "Gestão Orçamental",
            "Resolução de Conflitos",
          ],
          visible: true,
        },
        {
          id: "sk-2",
          name: {
            pt: "Competências Técnicas",
            en: "Technical Skills",
          },
          skills: [
            "Análise de Dados (Excel/Power BI)",
            "Elaboração de Relatórios",
            "Mapeamento de Processos",
            "Jira & Trello",
          ],
          visible: true,
        },
      ],
    },
    {
      id: "sec-lang",
      type: "languages",
      title: {
        pt: "Competências Linguísticas",
        en: "Languages",
      },
      visible: true,
      order: 5,
      items: [
        {
          id: "lang-1",
          name: { pt: "Português", en: "Portuguese" },
          level: { pt: "Língua materna", en: "Native" },
          cefr: "C2 (Materno)",
          visible: true,
        },
        {
          id: "lang-2",
          name: { pt: "Inglês", en: "English" },
          level: { pt: "Utilizador Avançado", en: "Full Professional" },
          cefr: "C1",
          visible: true,
        },
        {
          id: "lang-3",
          name: { pt: "Espanhol", en: "Spanish" },
          level: { pt: "Utilizador Independente", en: "Professional Working" },
          cefr: "B2",
          visible: true,
        },
      ],
    },
    {
      id: "sec-hobbies",
      type: "hobbies",
      title: {
        pt: "Interesses & Voluntariado",
        en: "Interests & Volunteering",
      },
      visible: true,
      order: 6,
      items: [
        {
          id: "hob-1",
          name: {
            pt: "Voluntariado Comunitário & Mentoria de Jovens",
            en: "Community Volunteering & Youth Mentorship",
          },
          description: {
            pt: "Apoio no desenvolvimento de competências de liderança para jovens.",
            en: "Supporting leadership and life skills workshops for local youth.",
          },
          visible: true,
        },
        {
          id: "hob-2",
          name: {
            pt: "Fotografia Urbana & Trail Running",
            en: "Urban Photography & Trail Running",
          },
          visible: true,
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
