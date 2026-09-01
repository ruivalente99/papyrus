import type { CVDocument } from "@/types/cv";
import { createDylanAvatarDataUri } from "@/lib/avatar";

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
    fullName: "Lorem Ipsum",
    headline: {
      pt: "Lorem Ipsum Executive | Estratégia & Transformação Digital",
      en: "Lorem Ipsum Executive | Strategy & Digital Transformation",
    },
    email: "lorem.executive@example.com",
    phone: "(+351) 934 567 890",
    location: {
      pt: "Lorem, Mundus",
      en: "Lorem, World",
    },
    website: "https://loremipsum.com",
    photoUrl: createDylanAvatarDataUri("Lorem Ipsum"),
    avatarSeed: "Lorem Ipsum",
    photoShape: "circle",
    showPhoto: true,
    links: [
      {
        id: "l-li",
        platform: "linkedin",
        label: { pt: "linkedin.com/in/lorem-executive", en: "linkedin.com/in/lorem-executive" },
        url: "https://linkedin.com/in/example",
      },
    ],
    summary: {
      pt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Consultor executivo com mais de 10 anos de experiência internacional em governança corporativa, crescimento escalável e 100% de foco em resultados.",
      en: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Executive consultant with 10+ years international track record in corporate governance, scalable expansion, and 100% ROI orientation.",
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
            pt: "Diretor Executivo Lorem Ipsum",
            en: "Lorem Ipsum Managing Director",
          },
          company: "Global Dolor Advisory",
          location: {
            pt: "Lorem, Mundus",
            en: "Lorem, World",
          },
          startDate: "2021-01",
          endDate: "",
          isCurrent: true,
          url: "https://example.com",
          visible: true,
          highlights: {
            pt: [
              "Lorem ipsum dolor sit amet com liderança de 80 colaboradores e crescimento de 35%.",
              "Duis aute irure dolor in reprehenderit com volume superior a 5M€ anuais.",
              "Excepteur sint occaecat cupidatat non proident otimizando margens operacionais.",
            ],
            en: [
              "Lorem ipsum dolor sit amet leading 80+ professionals and achieving 35% growth.",
              "Duis aute irure dolor in reprehenderit managing 5M€+ annual strategic portfolio.",
              "Excepteur sint occaecat cupidatat non proident optimizing key operating margins.",
            ],
          },
        },
        {
          id: "exp-2",
          role: {
            pt: "Partner & Strategist Dolor",
            en: "Partner & Dolor Strategist",
          },
          company: "Ipsum Corporate Partners",
          location: {
            pt: "Lorem, Mundus",
            en: "Lorem, World",
          },
          startDate: "2016-05",
          endDate: "2020-12",
          isCurrent: false,
          url: "https://example.com",
          visible: true,
          highlights: {
            pt: [
              "Sed ut perspiciatis unde omnis iste natus error sit voluptatem em mais de 20 fusões.",
              "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.",
            ],
            en: [
              "Sed ut perspiciatis unde omnis iste natus error sit voluptatem across 20+ M&A deals.",
              "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.",
            ],
          },
        },
      ],
    },
    {
      id: "sec-edu",
      type: "education",
      title: {
        pt: "Educação & Formação",
        en: "Education & Training",
      },
      visible: true,
      order: 2,
      items: [
        {
          id: "edu-1",
          degree: {
            pt: "Executive MBA em Lorem Ipsum",
            en: "Executive MBA in Lorem Ipsum",
          },
          institution: "Universitas Lorem Business School",
          location: {
            pt: "Lorem, Mundus",
            en: "Lorem, World",
          },
          startDate: "2015",
          endDate: "2016",
          isCurrent: false,
          visible: true,
        },
      ],
    },
    {
      id: "sec-skills",
      type: "skills",
      title: {
        pt: "Competências Estratégicas",
        en: "Core Competencies",
      },
      visible: true,
      order: 3,
      categories: [
        {
          id: "sk-exec",
          name: { pt: "Liderança", en: "Executive Leadership" },
          skills: [
            "Corporate Governance",
            "M&A Advisory",
            "Digital Transformation",
            "Risk Management",
            "P&L Management",
          ],
          visible: true,
        },
      ],
    },
    {
      id: "sec-lang",
      type: "languages",
      title: {
        pt: "Idiomas",
        en: "Languages",
      },
      visible: true,
      order: 4,
      items: [
        {
          id: "lang-1",
          name: { pt: "Português", en: "Portuguese" },
          level: { pt: "Nativo", en: "Native" },
          cefr: "C2",
          visible: true,
        },
        {
          id: "lang-2",
          name: { pt: "Inglês", en: "English" },
          level: { pt: "Fluente", en: "Fluent" },
          cefr: "C2",
          visible: true,
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
