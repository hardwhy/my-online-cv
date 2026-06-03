import { achievements as fallbackAchievements, profile as fallbackProfile, testimonials as fallbackTestimonials } from '../data/profile';
import { blogPosts as fallbackBlogPosts } from '../data/blog';
import { certifications as fallbackCertifications } from '../data/certifications';
import { experiences as fallbackExperiences } from '../data/experiences';
import { projects as fallbackProjects } from '../data/projects';
import { skills as fallbackSkills } from '../data/skills';
import type { Achievement, BlogPost, Certification, Experience, Profile, Project, Skill, SocialLink, Stat, Testimonial } from '../types/content';
import { isSupabaseContentEnabled } from '../lib/contentSource';
import { supabase } from '../lib/supabase';

type ProfileRow = {
  full_name: string;
  title: string;
  summary: string;
  location: string;
  email: string;
  phone: string | null;
  photo_url: string | null;
  resume_url: string | null;
  socials: unknown;
  stats: unknown;
  strengths: string[] | null;
  interests: string[] | null;
};

type SkillRow = {
  name: string;
  category: Skill['category'];
  proficiency: number;
  description: string | null;
};

type ExperienceRow = {
  company: string;
  position: string;
  duration: string;
  location: string;
  summary: string;
  responsibilities: string[] | null;
  achievements: string[] | null;
  technologies: string[] | null;
};

type ProjectRow = {
  slug: string;
  title: string;
  category: Project['category'];
  description: string;
  impact: string;
  thumbnail_url: string | null;
  screenshots: string[] | null;
  technologies: string[] | null;
  github_url: string | null;
  live_url: string | null;
  featured: boolean;
};

type CertificationRow = {
  name: string;
  issuer: string;
  issue_date: string;
  credential_url: string | null;
  download_url: string | null;
  image_url: string | null;
};

type AchievementRow = {
  title: string;
  description: string;
  date: string;
};

type TestimonialRow = {
  quote: string;
  author: string;
  role: string;
};

type BlogPostRow = {
  slug: string;
  title: string;
  date: string;
  tags: string[] | null;
  excerpt: string;
  content: string;
};

const readArray = <T>(value: unknown, fallback: T[] = []): T[] => (Array.isArray(value) ? (value as T[]) : fallback);
const optionalUrl = (value: string | null | undefined) => value?.trim() || undefined;
const linkUrl = (value: string | null | undefined) => value?.trim() || '#';

const mapProfile = (row: ProfileRow): Profile => ({
  fullName: row.full_name,
  title: row.title,
  summary: row.summary,
  location: row.location,
  email: row.email,
  phone: row.phone ?? undefined,
  photo: optionalUrl(row.photo_url) ?? fallbackProfile.photo,
  resumeUrl: optionalUrl(row.resume_url) ?? fallbackProfile.resumeUrl,
  socials: readArray<SocialLink>(row.socials, fallbackProfile.socials),
  stats: readArray<Stat>(row.stats, fallbackProfile.stats),
  strengths: readArray<string>(row.strengths, fallbackProfile.strengths),
  interests: readArray<string>(row.interests, fallbackProfile.interests),
});

const mapSkill = (row: SkillRow): Skill => ({
  name: row.name,
  category: row.category,
  proficiency: row.proficiency,
  description: row.description ?? undefined,
});

const mapExperience = (row: ExperienceRow): Experience => ({
  company: row.company,
  position: row.position,
  duration: row.duration,
  location: row.location,
  summary: row.summary,
  responsibilities: readArray<string>(row.responsibilities),
  achievements: readArray<string>(row.achievements),
  technologies: readArray<string>(row.technologies),
});

const mapProject = (row: ProjectRow): Project => ({
  slug: row.slug,
  title: row.title,
  category: row.category,
  description: row.description,
  impact: row.impact,
  thumbnail: optionalUrl(row.thumbnail_url),
  screenshots: readArray<string>(row.screenshots),
  technologies: readArray<string>(row.technologies),
  githubUrl: linkUrl(row.github_url),
  liveUrl: linkUrl(row.live_url),
  featured: row.featured,
});

const mapCertification = (row: CertificationRow): Certification => ({
  name: row.name,
  issuer: row.issuer,
  issueDate: row.issue_date,
  credentialUrl: linkUrl(row.credential_url),
  downloadUrl: optionalUrl(row.download_url),
  imageUrl: optionalUrl(row.image_url),
});

const mapBlogPost = (row: BlogPostRow): BlogPost => ({
  slug: row.slug,
  title: row.title,
  date: row.date,
  tags: readArray<string>(row.tags),
  excerpt: row.excerpt,
  content: row.content,
});

export async function getProfile(): Promise<Profile> {
  console.log('isSupabaseContentEnabled', isSupabaseContentEnabled);
  console.log('supabase', supabase);
  if (!isSupabaseContentEnabled || !supabase) return fallbackProfile;

  const { data, error } = await supabase
    .from('site_profile')
    .select('full_name,title,summary,location,email,phone,photo_url,resume_url,socials,stats,strengths,interests')
    .eq('is_published', true)
    .limit(1)
    .maybeSingle<ProfileRow>();

  if (error) throw error;
  return data ? mapProfile(data) : fallbackProfile;
}

export async function getSkills(): Promise<Skill[]> {
  if (!isSupabaseContentEnabled || !supabase) return fallbackSkills;

  const { data, error } = await supabase
    .from('skills')
    .select('name,category,proficiency,description')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data as SkillRow[]).map(mapSkill);
}

export async function getExperiences(): Promise<Experience[]> {
  if (!isSupabaseContentEnabled || !supabase) return fallbackExperiences;

  const { data, error } = await supabase
    .from('experiences')
    .select('company,position,duration,location,summary,responsibilities,achievements,technologies')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data as ExperienceRow[]).map(mapExperience);
}

export async function getProjects(): Promise<Project[]> {
  if (!isSupabaseContentEnabled || !supabase) return fallbackProjects;

  const { data, error } = await supabase
    .from('projects')
    .select('slug,title,category,description,impact,thumbnail_url,screenshots,technologies,github_url,live_url,featured')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data as ProjectRow[]).map(mapProject);
}

export async function getCertifications(): Promise<Certification[]> {
  if (!isSupabaseContentEnabled || !supabase) return fallbackCertifications;

  const { data, error } = await supabase
    .from('certifications')
    .select('name,issuer,issue_date,credential_url,download_url,image_url')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data as CertificationRow[]).map(mapCertification);
}

export async function getAchievements(): Promise<Achievement[]> {
  if (!isSupabaseContentEnabled || !supabase) return fallbackAchievements;

  const { data, error } = await supabase
    .from('achievements')
    .select('title,description,date')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data as AchievementRow[]).map((row) => ({ ...row }));
}

export async function getTestimonials(): Promise<Testimonial[]> {
  if (!isSupabaseContentEnabled || !supabase) return fallbackTestimonials;

  const { data, error } = await supabase
    .from('testimonials')
    .select('quote,author,role')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data as TestimonialRow[]).map((row) => ({ ...row }));
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (!isSupabaseContentEnabled || !supabase) return fallbackBlogPosts;

  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug,title,date,tags,excerpt,content')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data as BlogPostRow[]).map(mapBlogPost);
}
