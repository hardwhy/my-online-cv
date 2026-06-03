-- Seed current portfolio content into Supabase.
-- Run docs/supabase-schema.sql first.
--
-- This file replaces portfolio content in the public tables below. If you have
-- already edited content manually in the Supabase Dashboard, export or copy it
-- before rerunning this seed.

begin;

delete from public.blog_posts;
delete from public.testimonials;
delete from public.achievements;
delete from public.certifications;
delete from public.projects;
delete from public.experiences;
delete from public.skills;
delete from public.site_profile;

insert into public.site_profile (
  full_name,
  title,
  summary,
  location,
  email,
  phone,
  photo_url,
  resume_url,
  socials,
  stats,
  strengths,
  interests,
  is_published
) values (
  $$Ayi Hardiyanto$$,
  $$Software Engineer$$,
  $$Software Engineer at DKATALIS with experience building web and mobile applications using Flutter, TypeScript, React, Redux, and Firebase. I focus on modular architecture, responsive interfaces, reliable source control practices, and scalable product delivery.$$,
  $$Banten, Indonesia$$,
  $$ayihardyan@gmail.com$$,
  null,
  null,
  $$/cv/ayi-hardiyanto-cv.pdf$$,
  $$[
    { "label": "LinkedIn", "href": "https://id.linkedin.com/in/ayi-hardiyanto-986b88139" }
  ]$$::jsonb,
  $$[
    { "label": "Years of experience", "value": "8+" },
    { "label": "Professional roles", "value": "5+" },
    { "label": "LinkedIn followers", "value": "273" }
  ]$$::jsonb,
  array[
    $$Cross-platform web and mobile application development$$,
    $$Flutter, TypeScript, React, Redux, and Firebase delivery$$,
    $$Modular, extensible architecture for maintainability and scalability$$,
    $$Code reviews, unit testing, secure authentication, and version control practices$$
  ],
  array[
    $$Continuous learning$$,
    $$Technological innovation$$,
    $$Mobile development$$,
    $$Agile delivery$$,
    $$User satisfaction$$
  ],
  true
);

insert into public.skills (name, category, proficiency, description, sort_order, is_published) values
  ($$React JS$$, $$Frontend$$, 90, $$User-centric interfaces, front-end development, and product feature delivery.$$, 10, true),
  ($$Flutter$$, $$Frontend$$, 88, $$Mobile app development, cross-device responsiveness, and app experience optimization.$$, 20, true),
  ($$JavaScript$$, $$Frontend$$, 86, $$Feature creation, application behavior, and practical front-end engineering.$$, 30, true),
  ($$Mobile Development$$, $$Frontend$$, 88, $$Architecture, implementation, maintenance, and deployment for mobile products.$$, 40, true),
  ($$Front-End Development$$, $$Frontend$$, 84, $$Responsive product flows focused on user engagement and acceptance criteria.$$, 50, true),
  ($$APIs$$, $$Backend$$, 84, $$API integration and data flow between front-end and back-end systems.$$, 60, true),
  ($$Hasura$$, $$Backend$$, 82, $$GraphQL-backed application development and data-driven product workflows.$$, 70, true),
  ($$Serverless Computing$$, $$Backend$$, 82, $$Serverless application patterns for scalable user-centric products.$$, 80, true),
  ($$Full-Stack Development$$, $$Backend$$, 82, $$Software delivery across application layers and product requirements.$$, 90, true),
  ($$Data Flow$$, $$Database$$, 80, $$Managing product data movement between application layers and service integrations.$$, 100, true),
  ($$Oracle PL/SQL$$, $$Database$$, 72, $$Foundation from Oracle Database 11g: Program with PL/SQL certification.$$, 110, true),
  ($$Agile$$, $$Tools$$, 84, $$Collaborative delivery, continuous improvement, planning, and iterative product work.$$, 120, true),
  ($$Code Reviews$$, $$Tools$$, 82, $$Maintaining clean, well-documented code and shared quality standards.$$, 130, true),
  ($$Deployment$$, $$Tools$$, 80, $$Supporting application delivery from development through release.$$, 140, true),
  ($$Project Leadership$$, $$Tools$$, 78, $$Coordinating feature planning, requirements, and interdisciplinary collaboration.$$, 150, true),
  ($$Troubleshooting$$, $$Tools$$, 80, $$Investigating issues and maintaining workflow efficiency across application delivery.$$, 160, true);

insert into public.experiences (
  company,
  position,
  duration,
  location,
  summary,
  responsibilities,
  achievements,
  technologies,
  sort_order,
  is_published
) values
  (
    $$DKATALIS$$,
    $$Software Engineer$$,
    $$Nov 2022 - Present$$,
    $$Banten, Indonesia$$,
    $$Builds user-centric application functionality with a focus on React JS, Flutter, serverless computing, Hasura, performance, and quality.$$,
    array[
      $$Engineer user-centric functionalities that improve the application experience.$$,
      $$Collaborate with interdisciplinary teams to streamline project execution.$$,
      $$Use React JS, Flutter, serverless computing, and Hasura to deliver reliable product features.$$
    ],
    array[
      $$Helped ensure robust app performance through stringent software quality standards.$$,
      $$Delivered releases that met user acceptance criteria through close attention to client requirements.$$,
      $$Contributed to collaborative, quality-driven delivery practices focused on user satisfaction.$$
    ],
    array[$$React JS$$, $$Flutter$$, $$Serverless Computing$$, $$Hasura$$, $$APIs$$, $$Agile$$],
    10,
    true
  ),
  (
    $$PT Solusi Diagnostik Indonesia$$,
    $$Mobile Application Developer$$,
    $$Sep 2022 - Jun 2023$$,
    $$Jakarta, Indonesia$$,
    $$Built a mobile application from scratch while working in a small, ambitious, and fast-paced product team.$$,
    array[
      $$Designed the application architecture and developed product features from the ground up.$$,
      $$Integrated APIs and managed data flow between front-end and back-end systems.$$,
      $$Participated in code reviews while maintaining clean and well-documented code.$$
    ],
    array[
      $$Supported feature planning and continuous improvement initiatives.$$,
      $$Helped ensure application performance, responsiveness, and reliability across devices.$$,
      $$Delivered high-quality product outcomes through close team collaboration.$$
    ],
    array[$$Mobile Development$$, $$APIs$$, $$Architecture$$, $$Code Reviews$$, $$Deployment$$],
    20,
    true
  ),
  (
    $$PT Infra Solusi Indonesia$$,
    $$Mobile Developer$$,
    $$Dec 2021 - Dec 2022$$,
    $$Tangerang, Banten, Indonesia$$,
    $$Developed and maintained mobile applications supporting HR and people development services.$$,
    array[
      $$Spearheaded development and maintenance of the You Are Stellar mobile application suite.$$,
      $$Worked on Stellar Growth, Purposeful Experience, and Purposeful Well applications.$$,
      $$Improved user engagement and satisfaction through mobile app development and maintenance.$$
    ],
    array[
      $$Contributed to a suite of mobile products for HR and people development experiences.$$,
      $$Maintained product quality across multiple app surfaces.$$,
      $$Supported user engagement through reliable mobile functionality.$$
    ],
    array[$$Mobile Development$$, $$Application Maintenance$$, $$User Engagement$$, $$Product Delivery$$],
    30,
    true
  ),
  (
    $$Enigma Camp$$,
    $$Full Stack Engineer$$,
    $$Dec 2019 - Dec 2021$$,
    $$Jakarta, Indonesia$$,
    $$Worked across the software delivery lifecycle to build high-quality applications and optimized mobile experiences.$$,
    array[
      $$Developed full-stack applications through the software delivery lifecycle.$$,
      $$Focused on improving user engagement through mobile application experiences.$$,
      $$Applied training in adaptability, rapid learning, and practical engineering delivery.$$
    ],
    array[
      $$Exceeded training targets by 30% during the Enigma Camp trainee program.$$,
      $$Built a strong foundation in full-stack software engineering practices.$$,
      $$Gained practical experience in application development, delivery, and collaboration.$$
    ],
    array[$$Full-Stack Development$$, $$Software Delivery$$, $$Mobile App Experience$$, $$Agile$$],
    40,
    true
  );

insert into public.projects (
  slug,
  title,
  category,
  description,
  impact,
  thumbnail_url,
  screenshots,
  technologies,
  github_url,
  live_url,
  featured,
  sort_order,
  is_published
) values
  (
    $$people-xperience-android$$,
    $$People Xperience (Android/iOS)$$,
    $$Mobile$$,
    $$PX is a mobile HR operations app that helps talents handle onboarding, digital contracts, task management, leave tracking, mood check-ins, and personal information updates from their phone.$$,
    $$Increased talent productivity and engagement through a seamless, mobile-first HR experience.$$,
    $$https://play-lh.googleusercontent.com/Yg6VjY1oTYFZpT64yC92IYRAMM5TjjPk6DlurZlUoGkPoiAxp5OhHW3CLmowhIRZWQ=w480-h960-rw$$,
    array[$$https://play-lh.googleusercontent.com/Yg6VjY1oTYFZpT64yC92IYRAMM5TjjPk6DlurZlUoGkPoiAxp5OhHW3CLmowhIRZWQ=w480-h960-rw$$],
    array[$$Flutter$$, $$Serverless Computing$$, $$Hasura$$, $$Agile$$],
    $$#$$,
    $$https://play.google.com/store/apps/details?id=com.dkatalis.px&hl=id$$,
    true,
    10,
    true
  ),
  (
    $$plebo-mobile-application$$,
    $$Plebo (Android/iOS)$$,
    $$Mobile$$,
    $$Plebo is a secure personal health app for organizing medical records, conditions, medications, allergies, immunizations, and daily health tracker data in one place.$$,
    $$Developed from scratch as a Flutter Developer, including Cubit state management, Dio API integration, secure token authentication, and Android/iOS release coordination.$$,
    $$https://play-lh.googleusercontent.com/WZEjgEPb3Jcqe1tdFrbUtouVDBhizrwIUCzs07CgWJ4WpoD4udEKpnOES_lxL6RjRA=w480-h960-rw$$,
    array[$$https://play-lh.googleusercontent.com/WZEjgEPb3Jcqe1tdFrbUtouVDBhizrwIUCzs07CgWJ4WpoD4udEKpnOES_lxL6RjRA=w480-h960-rw$$],
    array[$$Flutter$$, $$Dart$$, $$Cubit / Bloc$$, $$Dio$$, $$REST API$$, $$Android$$, $$iOS$$],
    $$#$$,
    $$https://play.google.com/store/apps/details?id=com.plebo.pro.mobile.patient&hl=en$$,
    true,
    20,
    true
  ),
  (
    $$sabasior-dashboard$$,
    $$Sabasior Dashboard$$,
    $$Web App$$,
    $$Real-time lightning strike monitoring dashboard that helps customers track lightning protection device activity as events happen.$$,
    $$Built as a Full Stack Developer using React, Redux, CSS, Firebase Authentication, Firestore real-time updates, and backend services for receiving and storing lightning strike data.$$,
    null,
    array[]::text[],
    array[$$React$$, $$Redux$$, $$JavaScript$$, $$CSS$$, $$Firebase Authentication$$, $$Firestore$$, $$Backend Development$$],
    $$#$$,
    $$#$$,
    true,
    30,
    true
  ),
  (
    $$stellar-mobile-suite$$,
    $$Stellar Mobile Application Suite$$,
    $$Mobile$$,
    $$Development and maintenance work across You Are Stellar, Stellar Growth, Purposeful Experience, and Purposeful Well.$$,
    $$Enhanced user engagement and satisfaction for HR and people development mobile experiences.$$,
    null,
    array[]::text[],
    array[$$Mobile Development$$, $$Application Maintenance$$, $$User Engagement$$, $$Product Delivery$$],
    $$#$$,
    $$https://www.linkedin.com/company/pt-infra-solusi-indonesia$$,
    true,
    40,
    true
  ),
  (
    $$full-stack-engineering-delivery$$,
    $$Full-Stack Engineering Delivery$$,
    $$Web App$$,
    $$Software delivery lifecycle experience from Enigma Camp, focused on building high-quality applications and mobile app experiences.$$,
    $$Built a strong foundation in full-stack application development and exceeded training targets by 30%.$$,
    null,
    array[]::text[],
    array[$$Full-Stack Development$$, $$Software Delivery$$, $$Mobile App Experience$$, $$Agile$$],
    $$#$$,
    $$https://enigmacamp.com/$$,
    false,
    50,
    true
  ),
  (
    $$android-text-summarization-publication$$,
    $$Android Application for Extractive Text Summarization$$,
    $$Publication$$,
    $$Published academic work related to an Android application for extractive text summarization.$$,
    $$Demonstrates early applied interest in mobile development, research, and practical software systems.$$,
    $$https://emer.silverchair-cdn.com/emer/content_public/journal/lhtn/issue/38/5/2/m_lhtn_cover.jpeg?Expires=1783415462&Signature=Bnzs8~UUS8YaYNVQt-pS119AlYNorLnfzzmcOgDv8PAY8TYKS~FTVHmxuEK82Piq-xBt15MFgbospUQlegs3nmS23gLgFQ5yHEwh~j5M6YsTBceys7pJniyPH~p4U64yJkakaVC0Wqa7qUJFwU0bkF925odOAwiBrAxHdf6dt-JjZVWk65Ssuvx7WSN4xtbA6PdcjfXA-izlQKZsOOu2Ks3yqnfs8R~59kGp8Q2ferHgdhDDISz8fNSWmy6Dv0NWluy-rPs9UD~rCnarDue7SLoC-KoIGDVG3GOcHpSNEnL8vUajzDTrFdws9mLVQ-9bXenDEtVLbN6oFDzxr1EEHg__&Key-Pair-Id=APKAIE5G5CRDK6RD3PGA$$,
    array[$$https://emer.silverchair-cdn.com/emer/content_public/journal/lhtn/issue/38/5/2/m_lhtn_cover.jpeg?Expires=1783415462&Signature=Bnzs8~UUS8YaYNVQt-pS119AlYNorLnfzzmcOgDv8PAY8TYKS~FTVHmxuEK82Piq-xBt15MFgbospUQlegs3nmS23gLgFQ5yHEwh~j5M6YsTBceys7pJniyPH~p4U64yJkakaVC0Wqa7qUJFwU0bkF925odOAwiBrAxHdf6dt-JjZVWk65Ssuvx7WSN4xtbA6PdcjfXA-izlQKZsOOu2Ks3yqnfs8R~59kGp8Q2ferHgdhDDISz8fNSWmy6Dv0NWluy-rPs9UD~rCnarDue7SLoC-KoIGDVG3GOcHpSNEnL8vUajzDTrFdws9mLVQ-9bXenDEtVLbN6oFDzxr1EEHg__&Key-Pair-Id=APKAIE5G5CRDK6RD3PGA$$],
    array[$$Android$$, $$Mobile Development$$, $$Research$$, $$Text Summarization$$],
    $$https://github.com/hardwhy/summarator$$,
    $$https://www.emerald.com/insight/content/doi/10.1108/LHTN-06-2021-0038/full/html$$,
    false,
    60,
    true
  ),
  (
    $$housepetall-mobile-app$$,
    $$HousePetAll Mobile App$$,
    $$Mobile$$,
    $$Flutter mobile application for HousePetAll, a pet-care platform where pets can receive medical care, treatment, and attention.$$,
    $$Provides the mobile client for a pet healthcare experience integrated with the HousePetAll API.$$,
    null,
    array[]::text[],
    array[$$Flutter$$, $$Dart$$, $$Android$$, $$iOS$$, $$Mobile Development$$],
    $$https://github.com/hardwhy/housepetall$$,
    $$#$$,
    false,
    70,
    true
  ),
  (
    $$housepetall-api$$,
    $$HousePetAll API$$,
    $$Platform$$,
    $$Backend API service powering the HousePetAll pet healthcare application with a scalable Node.js and Nx-based service structure.$$,
    $$Supports the mobile app with backend services for a dedicated pet medical care platform.$$,
    null,
    array[]::text[],
    array[$$TypeScript$$, $$Node.js$$, $$Nx Monorepo$$, $$API$$, $$Backend$$],
    $$https://github.com/hardwhy/housepetall-api$$,
    $$#$$,
    false,
    80,
    true
  ),
  (
    $$holiyay$$,
    $$HoliYAY$$,
    $$Web App$$,
    $$Next.js web app for discovering a break from daily routines, built as a modern holiday and rest-focused experience.$$,
    $$Demonstrates full-stack web development using Next.js, TypeScript, Prisma, and deployment on Vercel.$$,
    null,
    array[]::text[],
    array[$$Next.js$$, $$TypeScript$$, $$Prisma$$, $$Tailwind CSS$$, $$Vercel$$],
    $$https://github.com/hardwhy/holiyay$$,
    $$https://holiyay.vercel.app$$,
    false,
    90,
    true
  ),
  (
    $$summarator-service$$,
    $$Summarator Service$$,
    $$Platform$$,
    $$Python service for text summarization workflows, organized with model and use-case modules for backend processing.$$,
    $$Shows applied machine learning and service-side work supporting summarization features.$$,
    null,
    array[]::text[],
    array[$$Python$$, $$Jupyter Notebook$$, $$Machine Learning$$, $$Text Summarization$$],
    $$https://github.com/hardwhy/summarator-service$$,
    $$#$$,
    false,
    100,
    true
  ),
  (
    $$summarator-mobile-app$$,
    $$Summarator Mobile App$$,
    $$Mobile$$,
    $$Flutter mobile application for text summarization, connected to the broader summarization research and service ecosystem.$$,
    $$Highlights mobile delivery, test coverage workflow, and applied natural language processing exploration.$$,
    null,
    array[]::text[],
    array[$$Flutter$$, $$Dart$$, $$Shell$$, $$Text Summarization$$, $$Mobile Development$$],
    $$https://github.com/hardwhy/summarator$$,
    $$#$$,
    false,
    110,
    true
  ),
  (
    $$duit-yourself$$,
    $$Duit Yourself$$,
    $$Web App$$,
    $$Flutter mobile application prototype with Android, iOS, and web targets for exploring personal finance product ideas.$$,
    $$Demonstrates cross-platform Flutter setup across mobile and web surfaces.$$,
    null,
    array[]::text[],
    array[$$Flutter$$, $$Dart$$, $$Android$$, $$iOS$$, $$Web$$],
    $$https://github.com/hardwhy/duit-yourself$$,
    $$#$$,
    false,
    120,
    true
  ),
  (
    $$duit-yourself-api$$,
    $$Duit Yourself Backend$$,
    $$Platform$$,
    $$Express backend service prototype for the Duit Yourself application ecosystem.$$,
    $$Complements the Flutter app with a JavaScript backend foundation for API development.$$,
    null,
    array[]::text[],
    array[$$JavaScript$$, $$Express$$, $$Backend$$, $$API$$],
    $$https://github.com/hardwhy/duit-yourselef-BE-express$$,
    $$#$$,
    false,
    130,
    true
  ),
  (
    $$cinelog$$,
    $$Cinelog$$,
    $$Mobile$$,
    $$Android movie catalog application built as a Dicoding Android Developer Expert submission.$$,
    $$Demonstrates native Android development fundamentals and certification-oriented project delivery.$$,
    null,
    array[]::text[],
    array[$$Android$$, $$Java$$, $$Android Studio$$, $$Dicoding$$],
    $$https://github.com/hardwhy/cinelog$$,
    $$#$$,
    false,
    140,
    true
  ),
  (
    $$kontak-jodoh$$,
    $$Kontak Jodoh$$,
    $$Mobile$$,
    $$Android beginner submission project for Dicoding, built as a native contact-style mobile application.$$,
    $$Shows early Android learning progress and completion of beginner-level mobile development requirements.$$,
    null,
    array[]::text[],
    array[$$Android$$, $$Java$$, $$Android Studio$$, $$Dicoding$$],
    $$https://github.com/hardwhy/kontak-jodoh$$,
    $$#$$,
    false,
    150,
    true
  ),
  (
    $$docking-bay-app$$,
    $$Docking Bay App$$,
    $$Platform$$,
    $$Java command-line docking system for creating piers, reserving boats, docking, leaving, and checking pier status.$$,
    $$Built for a DKATALIS recruitment program, demonstrating algorithmic command handling and Java application packaging.$$,
    null,
    array[]::text[],
    array[$$Java$$, $$Maven$$, $$Docker$$, $$Jenkins$$, $$CLI$$],
    $$https://github.com/hardwhy/docking-bay-app$$,
    $$#$$,
    false,
    160,
    true
  );

insert into public.certifications (
  name,
  issuer,
  issue_date,
  credential_url,
  download_url,
  image_url,
  sort_order,
  is_published
) values
  ($$Online TOEFL Test 10$$, $$Englishvit$$, $$Apr 2024 - Apr 2026$$, $$https://englishvit.com/certificate/status/EV-TO10-04-2024-0208$$, null, null, 10, true),
  ($$Certified Secure Computer User (C/SCU)$$, $$EC-Council$$, $$Jul 2019$$, $$https://linkedin.com/company/ec-council$$, null, null, 20, true),
  ($$EF SET English Certificate 75/100 (C2 Proficient)$$, $$EF SET$$, $$Jul 2019$$, $$https://cert.efset.org/9Jo9eB$$, null, null, 30, true),
  ($$Cisco Certified Network Associate Routing and Switching (CCNA)$$, $$Cisco$$, $$Jan 2019$$, $$https://linkedin.com/company/cisco$$, null, null, 40, true),
  ($$Oracle Database 11g: Program with PL/SQL$$, $$Oracle$$, $$Dec 2018$$, $$https://linkedin.com/company/oracle$$, null, null, 50, true),
  ($$Belajar Membuat Aplikasi Android untuk Pemula$$, $$Dicoding Academy$$, $$Aug 2019 - Aug 2022$$, $$https://dicoding.com/users/440216/academies$$, null, null, 60, true);

insert into public.achievements (title, description, date, sort_order, is_published) values
  ($$Delivering web and mobile applications at DKATALIS$$, $$Develops Flutter and TypeScript applications, responsive websites, and React/Redux SPAs with Firebase-backed data flows.$$, $$2022 - Present$$, 10, true),
  ($$Led mobile delivery at PT Infra Solusi Indonesia$$, $$Led mobile developers across recruiter, talent, LMS, and wellness products with geolocation, push notifications, and secure authentication.$$, $$2021 - 2022$$, 20, true),
  ($$Improved quality at PT Enigma Cipta Humanika$$, $$Built Flutter and TypeScript applications with code reviews, scalable architecture, Firebase, and unit testing practices.$$, $$2019 - 2021$$, 30, true);

insert into public.testimonials (quote, author, role, sort_order, is_published) values
  ($$A quality-driven engineer focused on user acceptance criteria, collaboration, and reliable application delivery.$$, $$Professional profile summary$$, $$Public LinkedIn reference$$, 10, true),
  ($$Combines continuous learning with practical React JS, Flutter, serverless, and Hasura experience for user-focused products.$$, $$Professional profile summary$$, $$Public LinkedIn reference$$, 20, true);

insert into public.blog_posts (
  slug,
  title,
  date,
  tags,
  excerpt,
  content,
  sort_order,
  is_published
) values
  (
    $$android-extractive-text-summarization$$,
    $$Android Application for Extractive Text Summarization$$,
    date $$2021-06-01$$,
    array[$$Android$$, $$Mobile Development$$, $$Research$$],
    $$Published work exploring an Android application for extractive text summarization.$$,
    $$This publication reflects an early focus on applied mobile development and software systems for text summarization.$$,
    10,
    true
  ),
  (
    $$user-centric-app-development$$,
    $$Notes on User-Centric App Development$$,
    date $$2024-04-01$$,
    array[$$React JS$$, $$Flutter$$, $$Agile$$],
    $$A future article placeholder for lessons from building applications around user acceptance criteria and client requirements.$$,
    $$User-centric app development depends on collaborative planning, quality standards, clear acceptance criteria, and continuous improvement.$$,
    20,
    true
  );

commit;
