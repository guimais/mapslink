export const seedUsers = [
  {
    id: "usr-001",
    type: "candidate",
    email: "gelado@gmail.com",
    password: "Senha@123",
    name: "Gelado da Silva",
    phone: "+55 19 99297-2688",
    avatar: "/assets/images/candidate-avatar.png",
    profile: {
      headline:
        "Desenvolvedor full stack com foco em produtos digitais, acessibilidade e crescimento sustentavel.",
      specialty: "Engenharia Full Stack",
      location: "Campinas, SP",
      experience: "12 anos em tecnologia",
      availability: "Hibrido - imediata",
      skills: ["React", "Node.js", "Arquitetura Cloud", "Discovery"],
      bio: "Profissional orientado a produto, com experiencia em lideranca tecnica, design colaborativo e plataformas de alto uso.",
      interviewsToday: 2,
      completion: 94,
      desiredModes: ["Hibrido", "Remoto"],
    },
  },
  {
    id: "biz-001",
    type: "company",
    email: "talentos@neuralworks.ai",
    password: "Empresa@123",
    name: "Marina Costa",
    phone: "+55 19 4002-1900",
    companySlug: "neuralworks-ai",
    profile: {
      role: "People Lead",
      completion: 88,
      tagline: "Contratando times de IA aplicada, produto e design.",
    },
  },
];
