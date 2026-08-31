import type { CVDocument } from "@/types/cv";

export const emptySeed: CVDocument = {
  id: "seed-empty",
  version: "1.0",
  title: "Novo Currículo",
  defaultLanguage: "pt",
  currentLanguage: "pt",
  availableLanguages: [
    { code: "pt", label: "Português" },
    { code: "en", label: "English" },
  ],
  template: "canva",
  theme: {
    primaryColor: "#0f766e",
    secondaryColor: "#0d9488",
    fontFamily: "inter",
    fontSize: "normal",
    sidebarPosition: "left",
  },
  personalInfo: {
    fullName: "O Seu Nome",
    headline: {
      pt: "O seu título profissional",
      en: "Your professional title",
    },
    email: "seu.email@exemplo.com",
    phone: "(+351) 900 000 000",
    location: {
      pt: "Lisboa, Portugal",
      en: "Lisbon, Portugal",
    },
    website: "https://exemplo.com",
    photoUrl: "",
    photoShape: "circle",
    showPhoto: true,
    links: [],
    summary: {
      pt: "Resumo do seu perfil profissional, conquistas e objetivos.",
      en: "Summary of your professional background, achievements, and career goals.",
    },
  },
  sections: [
    {
      id: "sec-exp",
      type: "experience",
      title: { pt: "Experiência Profissional", en: "Work Experience" },
      visible: true,
      order: 1,
      items: [
        {
          id: "exp-demo",
          role: { pt: "Cargo / Função", en: "Job Title / Role" },
          company: "Nome da Empresa",
          location: { pt: "Cidade, País", en: "City, Country" },
          startDate: "2023-01",
          endDate: "",
          isCurrent: true,
          visible: true,
          highlights: {
            pt: ["Descrição das suas principais responsabilidades e resultados alcançados."],
            en: ["Description of your key responsibilities and accomplishments."],
          },
        },
      ],
    },
    {
      id: "sec-edu",
      type: "education",
      title: { pt: "Educação & Formação", en: "Education & Qualifications" },
      visible: true,
      order: 2,
      items: [
        {
          id: "edu-demo",
          degree: { pt: "Nome do Curso / Grau", en: "Degree / Course Name" },
          institution: "Instituição de Ensino",
          location: { pt: "Cidade, País", en: "City, Country" },
          startDate: "2019",
          endDate: "2022",
          isCurrent: false,
          visible: true,
        },
      ],
    },
    {
      id: "sec-skills",
      type: "skills",
      title: { pt: "Competências", en: "Skills" },
      visible: true,
      order: 3,
      categories: [
        {
          id: "sk-demo",
          name: { pt: "Competências Principais", en: "Key Skills" },
          skills: ["Comunicação", "Organização", "Trabalho em Equipa"],
          visible: true,
        },
      ],
    },
    {
      id: "sec-lang",
      type: "languages",
      title: { pt: "Idiomas", en: "Languages" },
      visible: true,
      order: 4,
      items: [
        {
          id: "lang-pt",
          name: { pt: "Português", en: "Portuguese" },
          level: { pt: "Língua materna", en: "Native" },
          cefr: "C2",
          visible: true,
        },
        {
          id: "lang-en",
          name: { pt: "Inglês", en: "English" },
          level: { pt: "Avançado", en: "Advanced" },
          cefr: "B2 / C1",
          visible: true,
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
