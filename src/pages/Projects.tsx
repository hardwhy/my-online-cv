import { useMemo, useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import { ProjectCard } from '../components/ProjectCard';
import { Section } from '../components/Section';
import { Seo } from '../components/Seo';
import { projectCategories, useProjects } from '../hooks/usePortfolioContent';

export default function Projects() {
  const { data: projects } = useProjects();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof projectCategories)[number]>('All');
  const [technology, setTechnology] = useState('All');

  const technologies = useMemo(
    () => ['All', ...Array.from(new Set(projects.flatMap((project) => project.technologies))).sort()],
    [projects],
  );

  const filteredProjects = projects.filter((project) => {
    const matchesQuery = `${project.title} ${project.description} ${project.technologies.join(' ')}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === 'All' || project.category === category;
    const matchesTechnology = technology === 'All' || project.technologies.includes(technology);
    return matchesQuery && matchesCategory && matchesTechnology;
  });

  return (
    <PageTransition>
      <Seo title="Projects" description="Portfolio gallery with searchable and filterable software engineering projects." path="/projects" />
      <Section
        eyebrow="Projects"
        title="Portfolio gallery"
        description={`Showing ${filteredProjects.length} of ${projects.length} projects. Search and filter by technology or category to explore selected products, platforms, mobile releases, and open-source work.`}
      >
        <div className="mb-8 grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1fr_220px_220px]">
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Search</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects..."
              className="h-12 w-full rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-brand-950"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Category</span>
            <span className="relative block">
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as (typeof projectCategories)[number])}
                className="h-12 w-full appearance-none rounded-full border border-slate-200 bg-slate-50 px-4 pr-11 text-sm font-semibold text-slate-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-brand-950"
              >
                {projectCategories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400 dark:text-slate-500" aria-hidden="true">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
                  <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </span>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Technology</span>
            <span className="relative block">
              <select
                value={technology}
                onChange={(event) => setTechnology(event.target.value)}
                className="h-12 w-full appearance-none rounded-full border border-slate-200 bg-slate-50 px-4 pr-11 text-sm font-semibold text-slate-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-brand-950"
              >
                {technologies.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400 dark:text-slate-500" aria-hidden="true">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
                  <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </span>
          </label>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
        {filteredProjects.length === 0 && <p className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700">No projects match the current filters.</p>}
      </Section>
    </PageTransition>
  );
}
