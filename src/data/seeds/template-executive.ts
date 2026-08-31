import type { CVDocument } from "@/types/cv";

export const executiveSeed: CVDocument = {
  id: "preset-executive-pro",
  version: "1.0",
  title: "Currículo Modelo Executivo",
  defaultLanguage: "pt",
  currentLanguage: "pt",
  availableLanguages: [
    { code: "pt", label: "Português" },
    { code: "en", label: "English" },
  ],
  template: "europass",
  theme: {
    primaryColor: "#1e3a8a",
    secondaryColor: "#3b82f6",
    fontFamily: "inter",
    fontSize: "normal",
  },
  personalInfo: {
    fullName: "Carlos Mendes",
    headline: {
      pt: "Consultor de Gestão Estratégica & Transformação Digital",
      en: "Strategic Management Consultant & Digital Transformation",
    },
    email: "carlos.mendes@exemplo.com",
    phone: "(+351) 934 567 890",
    location: {
      pt: "Lisboa, Portugal",
      en: "Lisbon, Portugal",
    },
    website: "https://carlosmendes.com",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    photoShape: "circle",
    showPhoto: true,
    links: [
      {
        id: "l-li",
        platform: "linkedin",
        label: { pt: "linkedin.com/in/carlos-mendes", en: "linkedin.com/in/carlos-mendes" },
        url: "https://linkedin.com/in/exemplo",
      },
    ],
    summary: {
      pt: "Consultor sénior com experiência internacional em reestruturação operacional, fusões & aquisições e adoção de tecnologias digitais em grandes organizações. Capacidade comprovada de liderar transformações com foco em resultados financeiros e eficiência sustentável.",
      en: "Senior consultant with international experience in operational restructuring, M&A, and digital technology adoption for enterprise organizations. Proven track record leading transformations focused on financial ROI and sustainable efficiency.",
    },
  },
  sections: [
    {
      id: "sec-exp",
      type: "experience",
      title: {
        pt: "Experiência Profissional",
        en: "Professional Experience",
      },
      visible: true,
      order: 1,
      items: [
        {
          id: "exp-1",
          role: {
            pt: "Diretor de Consultoria de Gestão",
            en: "Director of Management Consulting",
          },
          company: "Horizon Strategy Advisory",
          location: {
            pt: "Lisboa / Madrid",
            en: "Lisbon / Madrid",
          },
          startDate: "2021-04",
          endDate: "",
          isCurrent: true,
          url: "https://exemplo.com",
          visible: true,
          highlights: {
            pt: [
              "Gestão de carteira de clientes com volume de negócios anual superior a 4M€.",
              "Liderança de projetos de transformação digital para 8 grupos industriais de topo.",
              "Coordenação de equipa de 15 consultores séniores e gestores de projeto.",
            ],
            en: [
              "Managed client portfolio with annual business volume exceeding €4M.",
              "Led digital transformation initiatives for 8 top-tier industrial groups.",
              "Coordinated a team of 15 senior consultants and project managers.",
            ],
          },
        },
        {
          id: "exp-2",
          role: {
            pt: "Consultor Estratégico Sénior",
            en: "Senior Strategy Consultant",
          },
          company: "Vanguard Consulting Partners",
          location: {
            pt: "Lisboa, Portugal",
            en: "Lisbon, Portugal",
          },
          startDate: "2017-09",
          endDate: "2021-03",
          isCurrent: false,
          url: "https://exemplo.com",
          visible: true,
          highlights: {
            pt: [
              "Elaboração de estudos de viabilidade económica e planos de negócios estratégicos.",
              "Otimização de cadeias de abastecimento com ganhos de eficiência de 18%.",
            ],
            en: [
              "Developed economic feasibility studies and strategic business models.",
              "Optimized supply chain operations resulting in 18% efficiency gains.",
            ],
          },
        },
      ],
    },
    {
      id: "sec-edu",
      type: "education",
      title: {
        pt: "Habilitações & Formação",
        en: "Education & Qualifications",
      },
      visible: true,
      order: 2,
      items: [
        {
          id: "edu-1",
          degree: {
            pt: "MBA Executivo Internacional",
            en: "International Executive MBA",
          },
          institution: "Nova School of Business and Economics",
          location: {
            pt: "Lisboa, Portugal",
            en: "Lisbon, Portugal",
          },
          startDate: "2016",
          endDate: "2017",
          isCurrent: false,
          qeq: "Nível no QEQ: 8",
          visible: true,
        },
        {
          id: "edu-2",
          degree: {
            pt: "Licenciatura em Economia e Gestão",
            en: "BSc in Economics & Management",
          },
          institution: "Universidade Católica Portuguesa",
          location: {
            pt: "Lisboa, Portugal",
            en: "Lisbon, Portugal",
          },
          startDate: "2011",
          endDate: "2015",
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
        pt: "Certificações Profissionais",
        en: "Professional Certifications",
      },
      visible: true,
      order: 3,
      items: [
        {
          id: "cert-1",
          name: {
            pt: "Certified Management Consultant (CMC®)",
            en: "Certified Management Consultant (CMC®)",
          },
          issuer: "International Council of Management Consulting Institutes",
          date: "2022",
          visible: true,
        },
        {
          id: "cert-2",
          name: {
            pt: "Lean Six Sigma Black Belt",
            en: "Lean Six Sigma Black Belt",
          },
          issuer: "IASSC",
          date: "2020",
          visible: true,
        },
      ],
    },
    {
      id: "sec-skills",
      type: "skills",
      title: {
        pt: "Competências Estratégicas",
        en: "Strategic Skills",
      },
      visible: true,
      order: 4,
      categories: [
        {
          id: "sk-1",
          name: {
            pt: "Estratégia e Negócio",
            en: "Strategy & Business",
          },
          skills: [
            "Planeamento Estratégico",
            "Fusões e Aquisições (M&A)",
            "Governação Corporativa",
            "Gestão de Risco",
            "Análise Financeira",
          ],
          visible: true,
        },
        {
          id: "sk-2",
          name: {
            pt: "Transformação Digital",
            en: "Digital Transformation",
          },
          skills: [
            "Inovação de Processos",
            "Gestão da Mudança",
            "Business Intelligence (BI)",
            "Cloud Strategy",
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
          level: { pt: "Fluência Profissional Completa", en: "Full Professional Proficiency" },
          cefr: "C2",
          details: {
            listening: "C2",
            reading: "C2",
            spokenInteraction: "C2",
            spokenProduction: "C2",
            writing: "C2",
          },
          visible: true,
        },
        {
          id: "lang-3",
          name: { pt: "Francês", en: "French" },
          level: { pt: "Utilizador Avançado", en: "Advanced User" },
          cefr: "C1",
          details: {
            listening: "C1",
            reading: "C1",
            spokenInteraction: "C1",
            spokenProduction: "C1",
            writing: "C1",
          },
          visible: true,
        },
      ],
    },
    {
      id: "sec-hobbies",
      type: "hobbies",
      title: {
        pt: "Atividades & Interesses",
        en: "Interests & Activities",
      },
      visible: true,
      order: 6,
      items: [
        {
          id: "hob-1",
          name: {
            pt: "Mentoria de Startups & Empreendedorismo",
            en: "Startup Mentorship & Angel Investing",
          },
          description: {
            pt: "Apoio a projetos universitários de base tecnológica.",
            en: "Supporting university tech spin-offs and founders.",
          },
          visible: true,
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
