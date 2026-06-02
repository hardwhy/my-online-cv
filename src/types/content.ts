export type SocialLink = {
  label: string;
  href: string;
};

export type Stat = {
  label: string;
  value: string;
};

export type Profile = {
  fullName: string;
  title: string;
  summary: string;
  location: string;
  email: string;
  phone?: string;
  photo: string;
  resumeUrl: string;
  socials: SocialLink[];
  stats: Stat[];
  strengths: string[];
  interests: string[];
};

export type SkillCategory = 'Frontend' | 'Backend' | 'Database' | 'Tools';

export type Skill = {
  name: string;
  category: SkillCategory;
  proficiency: number;
  description?: string;
};

export type Experience = {
  company: string;
  position: string;
  duration: string;
  location: string;
  summary: string;
  responsibilities: string[];
  achievements: string[];
  technologies: string[];
};

export type ProjectCategory = 'Web App' | 'Platform' | 'Mobile' | 'Publication';

export type Project = {
  slug: string;
  title: string;
  category: ProjectCategory;
  description: string;
  impact: string;
  thumbnail?: string;
  screenshots?: string[];
  technologies: string[];
  githubUrl: string;
  liveUrl: string;
  featured: boolean;
};

export type Certification = {
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl: string;
  downloadUrl: string;
};

export type Achievement = {
  title: string;
  description: string;
  date: string;
};

export type Testimonial = {
  quote: string;
  author: string;
  role: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  content: string;
};
