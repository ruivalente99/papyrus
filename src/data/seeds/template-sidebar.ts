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
    fullName: "Lorem Ipsum",
    headline: {
      pt: "Lorem Ipsum Dolor Sit Amet | Consectetur Adipiscing Elit",
      en: "Lorem Ipsum Dolor Sit Amet | Consectetur Adipiscing Elit",
    },
    email: "lorem.ipsum@example.com",
    phone: "(+351) 912 345 678",
    location: {
      pt: "Lorem Ipsum, Mundus",
      en: "Lorem Ipsum, World",
    },
    website: "https://loremipsum.dev",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lorem&backgroundColor=b6e3f4,c0aede,d1d4f9",
    photoShape: "circle",
    showPhoto: true,
    links: [
      {
        id: "l-li",
        platform: "linkedin",
        label: { pt: "linkedin.com/in/lorem-ipsum", en: "linkedin.com/in/lorem-ipsum" },
        url: "https://linkedin.com/in/example",
      },
    ],
    summary: {
      pt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.",
      en: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.",
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
            pt: "Lorem Ipsum Senior Lead",
            en: "Lorem Ipsum Senior Lead",
          },
          company: "Lorem Corp SA",
          location: {
            pt: "Lorem, Mundus",
            en: "Lorem, World",
          },
          startDate: "2023-01",
          endDate: "",
          isCurrent: true,
          url: "https://example.com",
          visible: true,
          highlights: {
            pt: [
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit com 100% de eficácia.",
              "Duis aute irure dolor in reprehenderit com redução de 25% em custos operacionais.",
            ],
            en: [
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit with 100% deliverability.",
              "Duis aute irure dolor in reprehenderit reducing operational costs by 25%.",
            ],
          },
        },
        {
          id: "exp-2",
          role: {
            pt: "Ipsum Dolor Coordinator",
            en: "Ipsum Dolor Coordinator",
          },
          company: "Nexus Lorem Global",
          location: {
            pt: "Ipsum, Mundus",
            en: "Ipsum, World",
          },
          startDate: "2021-03",
          endDate: "2022-12",
          isCurrent: false,
          url: "https://example.com",
          visible: true,
          highlights: {
            pt: [
              "Excepteur sint occaecat cupidatat non proident em mais de 50 iniciativas de equipa.",
              "Sunt in culpa qui officia deserunt mollit anim id est laborum com 30% mais agilidade.",
            ],
            en: [
              "Excepteur sint occaecat cupidatat non proident across 50+ strategic initiatives.",
              "Sunt in culpa qui officia deserunt mollit anim id est laborum improving speed by 30%.",
            ],
          },
        },
        {
          id: "exp-3",
          role: {
            pt: "Dolor Sit Specialist",
            en: "Dolor Sit Specialist",
          },
          company: "Amet Foundation",
          location: {
            pt: "Amet, Mundus",
            en: "Amet, World",
          },
          startDate: "2019-09",
          endDate: "2021-02",
          isCurrent: false,
          visible: true,
          highlights: {
            pt: [
              "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque.",
              "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit a mais de 120 pessoas.",
            ],
            en: [
              "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque.",
              "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit for over 120 clients.",
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
            pt: "Mestrado em Lorem Ipsum & Consectetur",
            en: "Master in Lorem Ipsum & Consectetur",
          },
          institution: "Universitas Lorem Ipsum",
          location: {
            pt: "Lorem, Mundus",
            en: "Lorem, World",
          },
          startDate: "2019",
          endDate: "2021",
          isCurrent: false,
          qeq: "Nível no QEQ: 7",
          visible: true,
          details: {
            pt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
            en: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
          },
        },
        {
          id: "edu-2",
          degree: {
            pt: "Licenciatura em Dolor Sit Amet",
            en: "Bachelor in Dolor Sit Amet",
          },
          institution: "Universitas Dolor",
          location: {
            pt: "Dolor, Mundus",
            en: "Dolor, World",
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
            pt: "Lorem Ipsum Certified Professional (LICP)",
            en: "Lorem Ipsum Certified Professional (LICP)",
          },
          issuer: "Lorem Institute",
          date: "2023",
          visible: true,
        },
        {
          id: "cert-2",
          name: {
            pt: "Dolor Sit Amet Certificate",
            en: "Dolor Sit Amet Certificate",
          },
          issuer: "Amet Academy",
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
            pt: "Lorem Management",
            en: "Lorem Management",
          },
          skills: [
            "Lorem Ipsum (Agile)",
            "Consectetur Leadership",
            "Adipiscing Elit",
            "Sed Eiusmod",
            "Tempor Incididunt",
          ],
          visible: true,
        },
        {
          id: "sk-2",
          name: {
            pt: "Ipsum Technical Skills",
            en: "Ipsum Technical Skills",
          },
          skills: [
            "Labore & Dolore",
            "Magna Aliqua",
            "Minim Veniam",
            "Nostrud Exercitation",
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
          name: { pt: "Lorem", en: "Lorem" },
          level: { pt: "Língua Materna", en: "Native" },
          cefr: "C2 (Materno)",
          visible: true,
        },
        {
          id: "lang-2",
          name: { pt: "Ipsum", en: "Ipsum" },
          level: { pt: "Utilizador Avançado", en: "Full Professional" },
          cefr: "C1",
          visible: true,
        },
        {
          id: "lang-3",
          name: { pt: "Dolor", en: "Dolor" },
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
            pt: "Lorem Voluntariado & Mentoria",
            en: "Lorem Volunteering & Mentorship",
          },
          description: {
            pt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod.",
            en: "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod.",
          },
          visible: true,
        },
        {
          id: "hob-2",
          name: {
            pt: "Ipsum Photography & Trail",
            en: "Ipsum Photography & Trail",
          },
          visible: true,
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
