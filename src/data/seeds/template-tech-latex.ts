import type { CVDocument } from "@/types/cv";
import { createDylanAvatarDataUri } from "@/lib/avatar";

export const technicalLatexSeed: CVDocument = {
  id: "preset-technical-latex",
  version: "1.0",
  title: "Currículo Modelo Técnico",
  defaultLanguage: "en",
  currentLanguage: "en",
  availableLanguages: [
    { code: "en", label: "English" },
    { code: "pt", label: "Português" },
  ],
  template: "latex",
  theme: {
    primaryColor: "#004f90",
    secondaryColor: "#646464",
    fontFamily: "inter",
    fontSize: "normal",
  },
  personalInfo: {
    fullName: "Lorem Ipsum",
    headline: {
      en: "Lorem Ipsum Engineer | Dolor, Sit & Amet Architecture",
      pt: "Engenheiro Lorem Ipsum | Arquitetura Dolor, Sit & Amet",
    },
    email: "lorem.ipsum@example.com",
    phone: "(+351) 912 345 678",
    location: {
      en: "Lorem, Mundus",
      pt: "Lorem, Mundo",
    },
    website: "https://loremipsum.dev",
    photoUrl: createDylanAvatarDataUri("Lorem Ipsum"),
    avatarSeed: "Lorem Ipsum",
    photoShape: "circle",
    showPhoto: false,
    links: [
      {
        id: "l-web",
        platform: "website",
        label: { en: "loremipsum.dev", pt: "loremipsum.dev" },
        url: "https://loremipsum.dev",
      },
      {
        id: "l-li",
        platform: "linkedin",
        label: { en: "linkedin.com/in/lorem-ipsum", pt: "linkedin.com/in/lorem-ipsum" },
        url: "https://linkedin.com/in/lorem-ipsum",
      },
      {
        id: "l-gh",
        platform: "github",
        label: { en: "github.com/loremipsum", pt: "github.com/loremipsum" },
        url: "https://github.com/loremipsum",
      },
    ],
    summary: {
      en: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Senior software architect with 6+ years designing scalable distributed systems with 99.9% uptime and high developer productivity.",
      pt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Engenheiro sénior com mais de 6 anos a conceber sistemas escaláveis com 99.9% de disponibilidade e alto desempenho.",
    },
  },
  sections: [
    {
      id: "sec-exp",
      type: "experience",
      title: {
        en: "Work Experience",
        pt: "Experiência Profissional",
      },
      visible: true,
      order: 1,
      items: [
        {
          id: "exp-1",
          role: {
            en: "Lead Lorem Ipsum Engineer",
            pt: "Engenheiro Lead Lorem Ipsum",
          },
          company: "Lorem Technologies Ltd",
          location: {
            en: "Remote",
            pt: "Remoto",
          },
          startDate: "2022-04",
          endDate: "",
          isCurrent: true,
          url: "https://example.com",
          visible: true,
          highlights: {
            en: [
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit with 40% latency reduction.",
              "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore 100%.",
              "Excepteur sint occaecat cupidatat non proident across 15+ distributed microservices.",
            ],
            pt: [
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit com redução de 40% em latência.",
              "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore a 100%.",
              "Excepteur sint occaecat cupidatat non proident em mais de 15 microserviços.",
            ],
          },
        },
        {
          id: "exp-2",
          role: {
            en: "Senior Dolor Developer",
            pt: "Desenvolvedor Sénior Dolor",
          },
          company: "Ipsum Cloud Systems",
          location: {
            en: "Lorem, Mundus",
            pt: "Lorem, Mundo",
          },
          startDate: "2019-09",
          endDate: "2022-03",
          isCurrent: false,
          url: "https://example.com",
          visible: true,
          highlights: {
            en: [
              "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque 50k.",
              "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.",
            ],
            pt: [
              "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque 50k.",
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
        en: "Education",
        pt: "Formação Académica",
      },
      visible: true,
      order: 2,
      items: [
        {
          id: "edu-1",
          degree: {
            en: "M.Sc. in Lorem Computer Science",
            pt: "Mestrado em Engenharia Informática Lorem",
          },
          institution: "Universitas Lorem Tech",
          location: {
            en: "Lorem, Mundus",
            pt: "Lorem, Mundo",
          },
          startDate: "2017",
          endDate: "2019",
          isCurrent: false,
          visible: true,
          details: {
            en: "Lorem ipsum dolor sit amet, consectetur adipiscing elit magna aliqua.",
            pt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit magna aliqua.",
          },
        },
      ],
    },
    {
      id: "sec-skills",
      type: "skills",
      title: {
        en: "Technical Skills",
        pt: "Competências Técnicas",
      },
      visible: true,
      order: 3,
      categories: [
        {
          id: "sk-lang",
          name: { en: "Languages", pt: "Linguagens" },
          skills: ["TypeScript", "Rust", "Python", "Go", "SQL"],
          visible: true,
        },
        {
          id: "sk-fw",
          name: { en: "Frameworks & Tools", pt: "Frameworks & Ferramentas" },
          skills: ["React", "Next.js", "Node.js", "Tailwind CSS", "Docker"],
          visible: true,
        },
        {
          id: "sk-cloud",
          name: { en: "Cloud & DevOps", pt: "Cloud & DevOps" },
          skills: ["AWS", "Kubernetes", "CI/CD", "Terraform", "GraphQL"],
          visible: true,
        },
      ],
    },
    {
      id: "sec-lang",
      type: "languages",
      title: {
        en: "Languages",
        pt: "Idiomas",
      },
      visible: true,
      order: 4,
      items: [
        {
          id: "lang-1",
          name: { en: "English", pt: "Inglês" },
          level: { en: "Full Professional", pt: "Profissional Completo" },
          cefr: "C2",
          visible: true,
        },
        {
          id: "lang-2",
          name: { en: "Portuguese", pt: "Português" },
          level: { en: "Native", pt: "Nativo" },
          cefr: "C2",
          visible: true,
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
