import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { achievements, profile, testimonials } from '../data/profile';
import { blogPosts } from '../data/blog';
import { certifications } from '../data/certifications';
import { experiences } from '../data/experiences';
import { projects } from '../data/projects';
import { skills } from '../data/skills';
import { activeContentSource } from '../lib/contentSource';
import {
  getAchievements,
  getBlogPosts,
  getCertifications,
  getCVData,
  getExperiences,
  getProfile,
  getProjects,
  getSkills,
  getTestimonials,
} from '../services/portfolioService';

export const skillCategories = ['Frontend', 'Backend', 'Database', 'Tools'] as const;
export const projectCategories = ['All', 'Web App', 'Platform', 'Mobile', 'Publication'] as const;

export function useProfile() {
  return useQuery({
    initialData: profile,
    initialDataUpdatedAt: 0,
    queryFn: getProfile,
    queryKey: ['portfolio', activeContentSource, 'profile'],
  });
}

export function useSkills() {
  return useQuery({
    initialData: skills,
    initialDataUpdatedAt: 0,
    queryFn: getSkills,
    queryKey: ['portfolio', activeContentSource, 'skills'],
  });
}

export function useExperiences() {
  return useQuery({
    initialData: experiences,
    initialDataUpdatedAt: 0,
    queryFn: getExperiences,
    queryKey: ['portfolio', activeContentSource, 'experiences'],
  });
}

export function useProjects() {
  return useQuery({
    initialData: projects,
    initialDataUpdatedAt: 0,
    queryFn: getProjects,
    queryKey: ['portfolio', activeContentSource, 'projects'],
  });
}

export function useProject(slug: string | undefined) {
  const projectsQuery = useProjects();

  return {
    ...projectsQuery,
    data: useMemo(() => (projectsQuery.data ?? projects).find((project) => project.slug === slug), [projectsQuery.data, slug]),
  };
}

export function useCertifications() {
  return useQuery({
    initialData: certifications,
    initialDataUpdatedAt: 0,
    queryFn: getCertifications,
    queryKey: ['portfolio', activeContentSource, 'certifications'],
  });
}

export function useAchievements() {
  return useQuery({
    initialData: achievements,
    initialDataUpdatedAt: 0,
    queryFn: getAchievements,
    queryKey: ['portfolio', activeContentSource, 'achievements'],
  });
}

export function useTestimonials() {
  return useQuery({
    initialData: testimonials,
    initialDataUpdatedAt: 0,
    queryFn: getTestimonials,
    queryKey: ['portfolio', activeContentSource, 'testimonials'],
  });
}

export function useBlogPosts() {
  return useQuery({
    initialData: blogPosts,
    initialDataUpdatedAt: 0,
    queryFn: getBlogPosts,
    queryKey: ['portfolio', activeContentSource, 'blog-posts'],
  });
}

export function useCVData() {
  return useQuery({
    queryFn: getCVData,
    queryKey: ['portfolio', activeContentSource, 'cv-data'],
  });
}
