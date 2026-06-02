import type { Achievement, Profile, Testimonial } from '../types/content';

export const profile: Profile = {
  fullName: 'Ayi Hardiyanto',
  title: 'Software Engineer',
  summary:
    'Software Engineer at DKATALIS with experience building web and mobile applications using Flutter, TypeScript, React, Redux, and Firebase. I focus on modular architecture, responsive interfaces, reliable source control practices, and scalable product delivery.',
  location: 'Banten, Indonesia',
  email: 'ayihardyan@gmail.com',
  photo: '/assets/ayi-hardiyanto-profile.png',
  resumeUrl: import.meta.env.VITE_CV_URL,
  socials: [
    { label: 'LinkedIn', href: 'https://id.linkedin.com/in/ayi-hardiyanto-986b88139' },
    { label: 'Email', href: 'mailto:ayihardyan@gmail.com' },
  ],
  stats: [
    { label: 'Years of experience', value: '8+' },
    { label: 'Professional roles', value: '5+' },
    { label: 'LinkedIn followers', value: '273' },
  ],
  strengths: [
    'Cross-platform web and mobile application development',
    'Flutter, TypeScript, React, Redux, and Firebase delivery',
    'Modular, extensible architecture for maintainability and scalability',
    'Code reviews, unit testing, secure authentication, and version control practices',
  ],
  interests: ['Continuous learning', 'Technological innovation', 'Mobile development', 'Agile delivery', 'User satisfaction'],
};

export const achievements: Achievement[] = [
  {
    title: 'Delivering web and mobile applications at DKATALIS',
    description: 'Develops Flutter and TypeScript applications, responsive websites, and React/Redux SPAs with Firebase-backed data flows.',
    date: '2022 - Present',
  },
  {
    title: 'Led mobile delivery at PT Infra Solusi Indonesia',
    description: 'Led mobile developers across recruiter, talent, LMS, and wellness products with geolocation, push notifications, and secure authentication.',
    date: '2021 - 2022',
  },
  {
    title: 'Improved quality at PT Enigma Cipta Humanika',
    description: 'Built Flutter and TypeScript applications with code reviews, scalable architecture, Firebase, and unit testing practices.',
    date: '2019 - 2021',
  },
];

export const testimonials: Testimonial[] = [
  {
    quote:
      'A quality-driven engineer focused on user acceptance criteria, collaboration, and reliable application delivery.',
    author: 'Professional profile summary',
    role: 'Public LinkedIn reference',
  },
  {
    quote:
      'Combines continuous learning with practical React JS, Flutter, serverless, and Hasura experience for user-focused products.',
    author: 'Professional profile summary',
    role: 'Public LinkedIn reference',
  },
];
