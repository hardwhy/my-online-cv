import type { Achievement, BlogPost, Certification, CVData, Experience, Profile, Project, Skill, Testimonial } from '../types/content';
import {
  getPortfolioAchievements,
  getPortfolioBlogPosts,
  getPortfolioCertifications,
  getPortfolioCVData,
  getPortfolioExperiences,
  getPortfolioProfile,
  getPortfolioProjects,
  getPortfolioSkills,
  getPortfolioTestimonials,
} from '@web-cv-services/shared-services';
import { achievements as fallbackAchievements, profile as fallbackProfile, testimonials as fallbackTestimonials } from '../data/profile';
import { blogPosts as fallbackBlogPosts } from '../data/blog';
import { certifications as fallbackCertifications } from '../data/certifications';
import { experiences as fallbackExperiences } from '../data/experiences';
import { projects as fallbackProjects } from '../data/projects';
import { skills as fallbackSkills } from '../data/skills';
import { isSupabaseContentEnabled } from '../lib/contentSource';
import { supabase } from '../lib/supabase';

const publicFallbacks = {
  profile: fallbackProfile,
  skills: fallbackSkills,
  experiences: fallbackExperiences,
  projects: fallbackProjects,
  certifications: fallbackCertifications,
  achievements: fallbackAchievements,
  testimonials: fallbackTestimonials,
  blogPosts: fallbackBlogPosts,
};

const publicOptions = {
  visibility: 'public' as const,
  fallbacks: publicFallbacks,
};

export async function getProfile(): Promise<Profile> {
  if (!isSupabaseContentEnabled) return fallbackProfile;
  return getPortfolioProfile(supabase, publicOptions);
}

export async function getSkills(): Promise<Skill[]> {
  if (!isSupabaseContentEnabled) return fallbackSkills;
  return getPortfolioSkills(supabase, publicOptions);
}

export async function getExperiences(): Promise<Experience[]> {
  if (!isSupabaseContentEnabled) return fallbackExperiences;
  return getPortfolioExperiences(supabase, publicOptions);
}

export async function getProjects(): Promise<Project[]> {
  if (!isSupabaseContentEnabled) return fallbackProjects;
  return getPortfolioProjects(supabase, publicOptions);
}

export async function getCertifications(): Promise<Certification[]> {
  if (!isSupabaseContentEnabled) return fallbackCertifications;
  return getPortfolioCertifications(supabase, publicOptions);
}

export async function getAchievements(): Promise<Achievement[]> {
  if (!isSupabaseContentEnabled) return fallbackAchievements;
  return getPortfolioAchievements(supabase, publicOptions);
}

export async function getTestimonials(): Promise<Testimonial[]> {
  if (!isSupabaseContentEnabled) return fallbackTestimonials;
  return getPortfolioTestimonials(supabase, publicOptions);
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (!isSupabaseContentEnabled) return fallbackBlogPosts;
  return getPortfolioBlogPosts(supabase, publicOptions);
}

export async function getCVData(): Promise<CVData> {
  if (!isSupabaseContentEnabled) {
    return {
      profile: fallbackProfile,
      skills: fallbackSkills,
      experiences: fallbackExperiences,
      projects: fallbackProjects,
      certifications: fallbackCertifications,
      achievements: fallbackAchievements,
    };
  }

  return getPortfolioCVData(supabase, publicOptions);
}
