import type { Project } from "../types/content";

export const projects: Project[] = [
  {
    slug: "people-xperience-android",
    title: "People Xperience (Android/iOS)",
    category: "Mobile",
    description:
      "PX is a mobile HR operations app that helps talents handle onboarding, digital contracts, task management, leave tracking, mood check-ins, and personal information updates from their phone.",
    impact:
      "Increased talent productivity and engagement through a seamless, mobile-first HR experience.",
    technologies: ["Flutter", "Serverless Computing", "Hasura", "Agile"],
    githubUrl: "#",
    liveUrl:
      "https://play.google.com/store/apps/details?id=com.dkatalis.px&hl=id",
    featured: true,
  },
  {
    slug: "plebo-mobile-application",
    title: "Plebo (Android/iOS)",
    category: "Mobile",
    description:
      "Plebo is a secure personal health app for organizing medical records, conditions, medications, allergies, immunizations, and daily health tracker data in one place.",
    impact:
      "Developed from scratch as a Flutter Developer, including Cubit state management, Dio API integration, secure token authentication, and Android/iOS release coordination.",
    technologies: [
      "Flutter",
      "Dart",
      "Cubit / Bloc",
      "Dio",
      "REST API",
      "Android",
      "iOS",
    ],
    githubUrl: "#",
    liveUrl: "https://play.google.com/store/apps/details?id=com.plebo.pro.mobile.patient&hl=en",
    featured: true,
  },
  {
    slug: "sabasior-dashboard",
    title: "Sabasior Dashboard",
    category: "Web App",
    description:
      "Real-time lightning strike monitoring dashboard that helps customers track lightning protection device activity as events happen.",
    impact:
      "Built as a Full Stack Developer using React, Redux, CSS, Firebase Authentication, Firestore real-time updates, and backend services for receiving and storing lightning strike data.",
    technologies: [
      "React",
      "Redux",
      "JavaScript",
      "CSS",
      "Firebase Authentication",
      "Firestore",
      "Backend Development",
    ],
    githubUrl: "#",
    liveUrl: "#",
    featured: true,
  },
  {
    slug: "stellar-mobile-suite",
    title: "Stellar Mobile Application Suite",
    category: "Mobile",
    description:
      "Development and maintenance work across You Are Stellar, Stellar Growth, Purposeful Experience, and Purposeful Well.",
    impact:
      "Enhanced user engagement and satisfaction for HR and people development mobile experiences.",
    technologies: [
      "Mobile Development",
      "Application Maintenance",
      "User Engagement",
      "Product Delivery",
    ],
    githubUrl: "#",
    liveUrl: "https://www.linkedin.com/company/pt-infra-solusi-indonesia",
    featured: true,
  },
  {
    slug: "full-stack-engineering-delivery",
    title: "Full-Stack Engineering Delivery",
    category: "Web App",
    description:
      "Software delivery lifecycle experience from Enigma Camp, focused on building high-quality applications and mobile app experiences.",
    impact:
      "Built a strong foundation in full-stack application development and exceeded training targets by 30%.",
    technologies: [
      "Full-Stack Development",
      "Software Delivery",
      "Mobile App Experience",
      "Agile",
    ],
    githubUrl: "#",
    liveUrl: "https://enigmacamp.com/",
    featured: false,
  },
  {
    slug: "android-text-summarization-publication",
    title: "Android Application for Extractive Text Summarization",
    category: "Publication",
    description:
      "Published academic work related to an Android application for extractive text summarization.",
    impact:
      "Demonstrates early applied interest in mobile development, research, and practical software systems.",
    technologies: [
      "Android",
      "Mobile Development",
      "Research",
      "Text Summarization",
    ],
    githubUrl: "https://github.com/hardwhy/summarator",
    liveUrl:
      "https://www.emerald.com/insight/content/doi/10.1108/LHTN-06-2021-0038/full/html",
    featured: false,
  },
  {
    slug: "housepetall-mobile-app",
    title: "HousePetAll Mobile App",
    category: "Mobile",
    description:
      "Flutter mobile application for HousePetAll, a pet-care platform where pets can receive medical care, treatment, and attention.",
    impact:
      "Provides the mobile client for a pet healthcare experience integrated with the HousePetAll API.",
    technologies: ["Flutter", "Dart", "Android", "iOS", "Mobile Development"],
    githubUrl: "https://github.com/hardwhy/housepetall",
    liveUrl: "#",
    featured: false,
  },
  {
    slug: "housepetall-api",
    title: "HousePetAll API",
    category: "Platform",
    description:
      "Backend API service powering the HousePetAll pet healthcare application with a scalable Node.js and Nx-based service structure.",
    impact:
      "Supports the mobile app with backend services for a dedicated pet medical care platform.",
    technologies: ["TypeScript", "Node.js", "Nx Monorepo", "API", "Backend"],
    githubUrl: "https://github.com/hardwhy/housepetall-api",
    liveUrl: "#",
    featured: false,
  },
  {
    slug: "holiyay",
    title: "HoliYAY",
    category: "Web App",
    description:
      "Next.js web app for discovering a break from daily routines, built as a modern holiday and rest-focused experience.",
    impact:
      "Demonstrates full-stack web development using Next.js, TypeScript, Prisma, and deployment on Vercel.",
    technologies: ["Next.js", "TypeScript", "Prisma", "Tailwind CSS", "Vercel"],
    githubUrl: "https://github.com/hardwhy/holiyay",
    liveUrl: "https://holiyay.vercel.app",
    featured: false,
  },
  {
    slug: "summarator-service",
    title: "Summarator Service",
    category: "Platform",
    description:
      "Python service for text summarization workflows, organized with model and use-case modules for backend processing.",
    impact:
      "Shows applied machine learning and service-side work supporting summarization features.",
    technologies: ["Python", "Jupyter Notebook", "Machine Learning", "Text Summarization"],
    githubUrl: "https://github.com/hardwhy/summarator-service",
    liveUrl: "#",
    featured: false,
  },
  {
    slug: "summarator-mobile-app",
    title: "Summarator Mobile App",
    category: "Mobile",
    description:
      "Flutter mobile application for text summarization, connected to the broader summarization research and service ecosystem.",
    impact:
      "Highlights mobile delivery, test coverage workflow, and applied natural language processing exploration.",
    technologies: ["Flutter", "Dart", "Shell", "Text Summarization", "Mobile Development"],
    githubUrl: "https://github.com/hardwhy/summarator",
    liveUrl: "#",
    featured: false,
  },
  {
    slug: "duit-yourself",
    title: "Duit Yourself",
    category: "Web App",
    description:
      "Flutter mobile application prototype with Android, iOS, and web targets for exploring personal finance product ideas.",
    impact:
      "Demonstrates cross-platform Flutter setup across mobile and web surfaces.",
    technologies: ["Flutter", "Dart", "Android", "iOS", "Web"],
    githubUrl: "https://github.com/hardwhy/duit-yourself",
    liveUrl: "#",
    featured: false,
  },
  {
    slug: "duit-yourself-api",
    title: "Duit Yourself Backend",
    category: "Platform",
    description:
      "Express backend service prototype for the Duit Yourself application ecosystem.",
    impact:
      "Complements the Flutter app with a JavaScript backend foundation for API development.",
    technologies: ["JavaScript", "Express", "Backend", "API"],
    githubUrl: "https://github.com/hardwhy/duit-yourselef-BE-express",
    liveUrl: "#",
    featured: false,
  },
  {
    slug: "cinelog",
    title: "Cinelog",
    category: "Mobile",
    description:
      "Android movie catalog application built as a Dicoding Android Developer Expert submission.",
    impact:
      "Demonstrates native Android development fundamentals and certification-oriented project delivery.",
    technologies: ["Android", "Java", "Android Studio", "Dicoding"],
    githubUrl: "https://github.com/hardwhy/cinelog",
    liveUrl: "#",
    featured: false,
  },
  {
    slug: "kontak-jodoh",
    title: "Kontak Jodoh",
    category: "Mobile",
    description:
      "Android beginner submission project for Dicoding, built as a native contact-style mobile application.",
    impact:
      "Shows early Android learning progress and completion of beginner-level mobile development requirements.",
    technologies: ["Android", "Java", "Android Studio", "Dicoding"],
    githubUrl: "https://github.com/hardwhy/kontak-jodoh",
    liveUrl: "#",
    featured: false,
  },
  {
    slug: "docking-bay-app",
    title: "Docking Bay App",
    category: "Platform",
    description:
      "Java command-line docking system for creating piers, reserving boats, docking, leaving, and checking pier status.",
    impact:
      "Built for a DKATALIS recruitment program, demonstrating algorithmic command handling and Java application packaging.",
    technologies: ["Java", "Maven", "Docker", "Jenkins", "CLI"],
    githubUrl: "https://github.com/hardwhy/docking-bay-app",
    liveUrl: "#",
    featured: false,
  },
];

export const projectCategories = [
  "All",
  "Web App",
  "Platform",
  "Mobile",
  "Publication",
] as const;
