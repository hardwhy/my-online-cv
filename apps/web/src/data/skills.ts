import type { Skill } from '../types/content';

export const skills: Skill[] = [
  { name: 'React JS', category: 'Frontend', proficiency: 90, description: 'User-centric interfaces, front-end development, and product feature delivery.' },
  { name: 'Flutter', category: 'Frontend', proficiency: 88, description: 'Mobile app development, cross-device responsiveness, and app experience optimization.' },
  { name: 'JavaScript', category: 'Frontend', proficiency: 86, description: 'Feature creation, application behavior, and practical front-end engineering.' },
  { name: 'Mobile Development', category: 'Frontend', proficiency: 88, description: 'Architecture, implementation, maintenance, and deployment for mobile products.' },
  { name: 'Front-End Development', category: 'Frontend', proficiency: 84, description: 'Responsive product flows focused on user engagement and acceptance criteria.' },
  { name: 'APIs', category: 'Backend', proficiency: 84, description: 'API integration and data flow between front-end and back-end systems.' },
  { name: 'Hasura', category: 'Backend', proficiency: 82, description: 'GraphQL-backed application development and data-driven product workflows.' },
  { name: 'Serverless Computing', category: 'Backend', proficiency: 82, description: 'Serverless application patterns for scalable user-centric products.' },
  { name: 'Full-Stack Development', category: 'Backend', proficiency: 82, description: 'Software delivery across application layers and product requirements.' },
  { name: 'Data Flow', category: 'Database', proficiency: 80, description: 'Managing product data movement between application layers and service integrations.' },
  { name: 'Oracle PL/SQL', category: 'Database', proficiency: 72, description: 'Foundation from Oracle Database 11g: Program with PL/SQL certification.' },
  { name: 'Agile', category: 'Tools', proficiency: 84, description: 'Collaborative delivery, continuous improvement, planning, and iterative product work.' },
  { name: 'Code Reviews', category: 'Tools', proficiency: 82, description: 'Maintaining clean, well-documented code and shared quality standards.' },
  { name: 'Deployment', category: 'Tools', proficiency: 80, description: 'Supporting application delivery from development through release.' },
  { name: 'Project Leadership', category: 'Tools', proficiency: 78, description: 'Coordinating feature planning, requirements, and interdisciplinary collaboration.' },
  { name: 'Troubleshooting', category: 'Tools', proficiency: 80, description: 'Investigating issues and maintaining workflow efficiency across application delivery.' },
];

export const skillCategories = ['Frontend', 'Backend', 'Database', 'Tools'] as const;
