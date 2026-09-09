import type { CoverLetterDocument } from "@/types/coverLetter";

export const softwareEngineerCoverLetter: CoverLetterDocument = {
  id: "letter-software-engineer",
  version: "1.0",
  title: "Software Engineer Application",
  preset: "tech",
  currentLanguage: "en",
  recipient: {
    companyName: "Acme Technologies Inc.",
    hiringManagerName: "Engineering Hiring Committee",
    jobTitle: {
      en: "Senior Full-Stack Engineer",
      pt: "Engenheiro Full-Stack Sénior",
    },
    department: "Core Platform & Infrastructure",
    companyAddress: {
      en: "500 Innovation Boulevard",
      pt: "Avenida da Inovação, 500",
    },
    cityStateZip: "San Francisco, CA 94105",
  },
  content: {
    date: new Date().toISOString().split("T")[0],
    salutation: {
      en: "Dear Engineering Hiring Committee,",
      pt: "Exma. Comissão de Recrutamento de Engenharia,",
    },
    opening: {
      en: "I am writing to express my enthusiastic interest in the Senior Full-Stack Engineer role at Acme Technologies Inc. Having closely followed Acme's technical breakthroughs in scalable distributed systems and developer tooling, I am eager to bring my deep expertise in modern web architectures, TypeScript, and high-throughput systems to your mission-driven team.",
      pt: "Venho por este meio manifestar o meu grande interesse na posição de Engenheiro Full-Stack Sénior na Acme Technologies Inc. Acompanhando com entusiasmo os avanços técnicos da vossa equipa em sistemas distribuídos escaláveis e ferramentas para programadores, sinto-me motivado a contribuir com a minha experiência em arquiteturas web modernas, TypeScript e sistemas de alto débito.",
    },
    bodyParagraphs: [
      {
        en: "Over the past 7 years, I have architected and deployed resilient cloud applications serving millions of active users. At my previous role, I spearheaded the complete refactoring of a legacy monolithic frontend into an offline-first, micro-frontend architecture using Next.js, React, and GraphQL. This strategic transformation reduced Largest Contentful Paint (LCP) by 62% and accelerated continuous deployment velocity by 3.5x across 14 cross-functional feature teams.",
        pt: "Ao longo dos últimos 7 anos, projetei e implementei aplicações resilientes na cloud para milhões de utilizadores ativos. Na minha experiência anterior, liderei a refatorização integral de um monolítico legado numa arquitetura offline-first orientada a micro-frontends com Next.js, React e GraphQL. Esta iniciativa reduziu o tempo de Largest Contentful Paint (LCP) em 62% e acelerou a cadência de entrega contínua em 3,5x entre 14 equipas multidisciplinares.",
      },
      {
        en: "Beyond core frontend engineering, I have substantial experience optimizing backend pipelines, orchestrating Docker/Kubernetes container clusters, and enforcing rigorous automated test coverage. I hold an uncompromising standard for web accessibility (WCAG 2.1 AA), typography clarity, and sub-second operational latency. In pair programming and mentoring junior engineers, I foster a culture of transparent documentation, rapid feedback loops, and empathetic collaboration.",
        pt: "Para além da engenharia de frontend, possuo vasta experiência na otimização de serviços backend, orquestração de contentores Docker/Kubernetes e garantia de cobertura rigorosa de testes automatizados. Mantenho um padrão exigente de acessibilidade web (WCAG 2.1 AA), clareza editorial e latência de resposta inferior a um segundo. Na mentoria e colaboração técnica, cultivo uma cultura de documentação transparente, ciclos curtos de feedback e trabalho em equipa empático.",
      },
    ],
    closing: {
      en: "Acme's commitment to developer excellence and product craftsmanship strongly resonates with my professional ethos. I welcome the opportunity to discuss how my technical acumen and problem-solving mindset can accelerate your upcoming product roadmap. Thank you for your time, consideration, and dedication to high-impact engineering.",
      pt: "O compromisso da Acme com a excelência técnica e rigor de produto está alinhado com a minha visão profissional. Teria enorme gosto em aprofundar como as minhas competências técnicas e raciocínio analítico podem acelerar os vossos próximos marcos de engenharia. Agradeço desde já a atenção e disponibilidade.",
    },
    signOff: {
      en: "Sincerely,",
      pt: "Com os melhores cumprimentos,",
    },
  },
  layout: "standard",
  showSenderHeader: true,
  createdAt: "2026-09-01T10:00:00.000Z",
  updatedAt: "2026-09-09T08:00:00.000Z",
};

export const executiveCoverLetter: CoverLetterDocument = {
  id: "letter-executive-leadership",
  version: "1.0",
  title: "Executive & Engineering Leadership",
  preset: "executive",
  currentLanguage: "en",
  recipient: {
    companyName: "Global Horizon Enterprise",
    hiringManagerName: "Chief Executive Officer & Search Committee",
    jobTitle: {
      en: "Head of Engineering / VP of Technology",
      pt: "Diretor de Engenharia / VP de Tecnologia",
    },
    department: "Executive Leadership Team",
    companyAddress: {
      en: "100 Financial Center Plaza",
      pt: "Praça do Centro Financeiro, 100",
    },
    cityStateZip: "New York, NY 10005",
  },
  content: {
    date: new Date().toISOString().split("T")[0],
    salutation: {
      en: "Dear Members of the Search Committee,",
      pt: "Exmos. Membros da Comissão de Seleção,",
    },
    opening: {
      en: "I am writing to present my candidacy for the Head of Engineering position at Global Horizon Enterprise. With over a decade of experience scaling international engineering organizations, shaping product strategy, and navigating complex technical transformations, I am poised to lead your technology organization into its next phase of exponential growth.",
      pt: "Apresento a minha candidatura à posição de Diretor de Engenharia na Global Horizon Enterprise. Com mais de uma década de experiência na liderança de equipas internacionais, definição de estratégia de produto e condução de transformações tecnológicas complexas, estou preparado para liderar a vossa organização tecnológica na sua próxima fase de expansão sustentável.",
    },
    bodyParagraphs: [
      {
        en: "Throughout my career, I have prioritized aligning engineering velocity with measurable business outcomes. In my most recent executive capacity, I scaled an engineering department from 18 to 95 engineers across 4 timezones while reducing sprint cycle times by 40% and cutting cloud infrastructure expenditures by $1.8M annually. By instituting transparent career progression frameworks, I maintained a 94% retention rate among top engineering talent over a 4-year tenure.",
        pt: "Ao longo do meu percurso, foquei-me em alinhar a velocidade de desenvolvimento com resultados tangíveis de negócio. Na minha função de liderança mais recente, expandi um departamento de 18 para 95 engenheiros em 4 fusos horários, reduzindo o tempo de ciclo em 40% e poupando 1,8M$ anuais em custos de infraestrutura cloud. Através da implementação de planos transparentes de progressão na carreira, mantive uma taxa de retenção de 94% dos principais talentos ao longo de 4 anos.",
      },
      {
        en: "I champion high-trust engineering cultures grounded in technical rigor, data-informed decision making, and empathetic servant leadership. Whether negotiating enterprise vendor partnerships, steering cybersecurity governance, or bridging the gap between board-level business objectives and sprint deliverables, my focus remains unwavering on sustainable value creation.",
        pt: "Promovo culturas organizacionais de elevada confiança, sustentadas no rigor técnico, em decisões baseadas em métricas e numa liderança de serviço empática. Seja na negociação de parcerias estratégicas, na governação de segurança da informação ou no alinhamento entre as metas do conselho de administração e as entregas das equipas, o meu foco reside sempre na criação sustentável de valor.",
      },
    ],
    closing: {
      en: "Global Horizon Enterprise's visionary expansion presents an inspiring leadership challenge. I would welcome an executive conversation to explore how my strategic perspective and operational rigor can serve your organization. Thank you for your leadership and consideration.",
      pt: "A visão estratégica de expansão da Global Horizon Enterprise constitui um desafio estimulante de liderança. Teria muita honra em ter uma reunião executiva para discutir como a minha perspetiva estratégica e rigor operacional podem contribuir para o sucesso da organização. Muito obrigado pela atenção dispensada.",
    },
    signOff: {
      en: "Respectfully yours,",
      pt: "Com a mais elevada consideração,",
    },
  },
  layout: "executive-minimal",
  showSenderHeader: true,
  createdAt: "2026-09-01T10:00:00.000Z",
  updatedAt: "2026-09-09T08:00:00.000Z",
};

export const COVER_LETTER_PRESETS: CoverLetterDocument[] = [
  softwareEngineerCoverLetter,
  executiveCoverLetter,
];
