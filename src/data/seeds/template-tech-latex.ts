import type { CVDocument } from "@/types/cv";

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
    fullName: "Alex Silva",
    headline: {
      en: "Senior Frontend Engineer | React, TypeScript & Cloud Architecture",
      pt: "Engenheiro Frontend Sénior | React, TypeScript e Arquitetura Cloud",
    },
    email: "alex.silva@exemplo.com",
    phone: "(+351) 912 345 678",
    location: {
      en: "Lisbon, Portugal",
      pt: "Lisboa, Portugal",
    },
    website: "https://alexsilva.dev",
    photoUrl: "",
    photoShape: "circle",
    showPhoto: false,
    links: [
      {
        id: "l-web",
        platform: "website",
        label: { en: "alexsilva.dev", pt: "alexsilva.dev" },
        url: "https://alexsilva.dev",
      },
      {
        id: "l-li",
        platform: "linkedin",
        label: { en: "linkedin.com/in/alexsilva", pt: "linkedin.com/in/alexsilva" },
        url: "https://linkedin.com/in/alexsilva",
      },
      {
        id: "l-gh",
        platform: "github",
        label: { en: "github.com/alexsilva", pt: "github.com/alexsilva" },
        url: "https://github.com/alexsilva",
      },
    ],
    summary: {
      en: "Senior Software Engineer with 6+ years of experience designing scalable frontend architectures, high-performance web applications, and developer tooling. Passionate about TypeScript, component systems, and clean maintainable codebases.",
      pt: "Engenheiro de Software Sénior com mais de 6 anos de experiência em arquiteturas frontend escaláveis, aplicações web de alto desempenho e ferramentas para desenvolvedores. Especialista em TypeScript, component systems e código limpo.",
    },
  },
  sections: [
    {
      id: "sec-exp",
      type: "experience",
      title: {
        en: "Experience",
        pt: "Experiência Profissional",
      },
      visible: true,
      order: 1,
      items: [
        {
          id: "exp-techcorp",
          role: {
            en: "Senior Frontend Engineer",
            pt: "Engenheiro Frontend Sénior",
          },
          company: "TechCorp Global",
          location: {
            en: "Hybrid",
            pt: "Híbrido",
          },
          startDate: "2022-06",
          endDate: "",
          isCurrent: true,
          url: "https://techcorp.example.com",
          visible: true,
          highlights: {
            en: [
              "Architected core micro-frontend platform serving 500k+ daily active users using React and TypeScript.",
              "Decreased Core Web Vitals LCP by 42% through code-splitting and edge caching strategies.",
              "Engineered unified design system adopted by 12 cross-functional product teams.",
              "Implemented comprehensive end-to-end testing suite achieving 94% test coverage with Jest and Playwright.",
            ],
            pt: [
              "Desenvolveu arquitetura micro-frontend servindo mais de 500 mil utilizadores ativos diários com React e TypeScript.",
              "Otimizou o Core Web Vitals (LCP) em 42% através de estratégias de code-splitting e edge caching.",
              "Criou design system unificado adotado por 12 equipas de produto.",
              "Implementou conjunto abrangente de testes automatizados atingindo 94% de cobertura.",
            ],
          },
        },
        {
          id: "exp-acme",
          role: {
            en: "Frontend Software Engineer",
            pt: "Engenheiro de Software Frontend",
          },
          company: "Acme Systems",
          location: {
            en: "Remote",
            pt: "Remoto",
          },
          startDate: "2020-01",
          endDate: "2022-05",
          isCurrent: false,
          url: "https://acme.example.com",
          visible: true,
          highlights: {
            en: [
              "Built responsive enterprise web dashboards with real-time WebSocket data visualization.",
              "Integrated GraphQL APIs and optimized state management using Zustand and TanStack Query.",
              "Mentored 4 junior engineers on modern React patterns and clean code conventions.",
            ],
            pt: [
              "Construiu painéis de gestão empresariais responsivos com visualização de dados em tempo real via WebSockets.",
              "Integrou APIs GraphQL e otimizou gestão de estado com Zustand e TanStack Query.",
              "Orientou 4 engenheiros juniores em boas práticas e padrões modernos de React.",
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
        pt: "Educação & Formação",
      },
      visible: true,
      order: 2,
      items: [
        {
          id: "edu-master",
          degree: {
            en: "Master of Science in Computer Science & Engineering",
            pt: "Mestrado em Engenharia Informática",
          },
          institution: "University Institute of Technology",
          location: {
            en: "Lisbon, Portugal",
            pt: "Lisboa, Portugal",
          },
          startDate: "2018",
          endDate: "2020",
          isCurrent: false,
          url: "https://university.example.com",
          visible: true,
        },
        {
          id: "edu-bachelor",
          degree: {
            en: "Bachelor of Science in Informatics Engineering",
            pt: "Licenciatura em Engenharia Informática",
          },
          institution: "University Institute of Technology",
          location: {
            en: "Lisbon, Portugal",
            pt: "Lisboa, Portugal",
          },
          startDate: "2015",
          endDate: "2018",
          isCurrent: false,
          url: "https://university.example.com",
          visible: true,
        },
      ],
    },
    {
      id: "sec-cert",
      type: "certifications",
      title: {
        en: "Certifications",
        pt: "Certificações",
      },
      visible: true,
      order: 3,
      items: [
        {
          id: "cert-aws",
          name: {
            en: "AWS Certified Solutions Architect – Associate",
            pt: "AWS Certified Solutions Architect – Associate",
          },
          issuer: "Amazon Web Services",
          date: "2024",
          visible: true,
        },
        {
          id: "cert-ts",
          name: {
            en: "Advanced TypeScript & Distributed Systems",
            pt: "TypeScript Avançado e Sistemas Distribuídos",
          },
          issuer: "Frontend Masters",
          date: "2023",
          visible: true,
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
      order: 4,
      categories: [
        {
          id: "cat-lang",
          name: {
            en: "Languages & Frameworks",
            pt: "Linguagens & Frameworks",
          },
          skills: [
            "TypeScript",
            "JavaScript (ESNext)",
            "React 19",
            "Next.js",
            "Node.js",
            "GraphQL",
            "Tailwind CSS",
            "HTML5 / CSS3",
          ],
          visible: true,
        },
        {
          id: "cat-tools",
          name: {
            en: "DevOps & Tooling",
            pt: "DevOps & Ferramentas",
          },
          skills: [
            "Docker",
            "Git & GitHub Actions",
            "CI/CD Pipelines",
            "Jest & Vitest",
            "Playwright",
            "Webpack / Vite",
            "AWS",
          ],
          visible: true,
        },
        {
          id: "cat-method",
          name: {
            en: "Architecture & Practices",
            pt: "Arquitetura & Boas Práticas",
          },
          skills: [
            "Micro-Frontends",
            "Design Systems",
            "Test-Driven Development (TDD)",
            "REST & GraphQL API Design",
            "Agile / Scrum",
          ],
          visible: true,
        },
      ],
    },
    {
      id: "sec-custom",
      type: "custom",
      title: {
        en: "Selected Talks & Open Source",
        pt: "Palestras e Projetos Open Source",
      },
      visible: true,
      order: 5,
      items: [
        {
          id: "act-1",
          title: {
            en: "Keynote Speaker at WebTech Summit",
            pt: "Orador Principal no WebTech Summit",
          },
          subtitle: {
            en: "Frontend Architecture at Scale",
            pt: "Arquitetura Frontend em Escala",
          },
          date: "2025",
          description: {
            en: "Presented architectural paradigms for high-concurrency web applications to an audience of 600+ engineers.",
            pt: "Apresentação sobre paradigmas arquiteturais para aplicações web de alta concorrência para mais de 600 engenheiros.",
          },
          visible: true,
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
