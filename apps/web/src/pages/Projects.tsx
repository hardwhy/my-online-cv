import { useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageTransition } from '../components/PageTransition';
import { ProjectCard } from '../components/ProjectCard';
import { Section } from '../components/Section';
import { Seo } from '../components/Seo';
import { projectCategories, useProjects } from '../hooks/usePortfolioContent';

type ProjectCategoryFilter = (typeof projectCategories)[number];

export default function Projects() {
  const { data: projects } = useProjects();
  const [searchParams, setSearchParams] = useSearchParams();
  const resultsRef = useRef<HTMLDivElement>(null);
  const hasProjects = projects.length > 0;

  const technologies = useMemo(
    () => ['All', ...Array.from(new Set(projects.flatMap((project) => project.technologies))).sort()],
    [projects],
  );

  const query = searchParams.get('q') ?? '';
  const categoryParam = searchParams.get('category');
  const category: ProjectCategoryFilter = projectCategories.includes(categoryParam as ProjectCategoryFilter) ? (categoryParam as ProjectCategoryFilter) : 'All';
  const technologyParam = searchParams.get('technology');
  const technology = technologyParam && technologies.includes(technologyParam) ? technologyParam : 'All';
  const normalizedQuery = query.trim().toLowerCase();
  const isShowingAllProjects = normalizedQuery === '' && category === 'All' && technology === 'All';

  const updateFilter = (key: 'q' | 'category' | 'technology', value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    const defaultValue = key === 'q' ? '' : 'All';

    if (value === defaultValue) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }

    setSearchParams(nextParams, { replace: true });
  };

  const filteredProjects = useMemo(
    () =>
      [...projects]
        .sort((firstProject, secondProject) => firstProject.title.localeCompare(secondProject.title))
        .filter((project) => {
          const matchesQuery = `${project.title} ${project.description} ${project.technologies.join(' ')}`.toLowerCase().includes(normalizedQuery);
          const matchesCategory = category === 'All' || project.category === category;
          const matchesTechnology = technology === 'All' || project.technologies.includes(technology);
          return matchesQuery && matchesCategory && matchesTechnology;
        }),
    [category, normalizedQuery, projects, technology],
  );

  const groupedProjects = useMemo(
    () =>
      Object.entries(
        filteredProjects.reduce<Record<string, typeof filteredProjects>>((groups, project) => {
          groups[project.category] = [...(groups[project.category] ?? []), project];
          return groups;
        }, {}),
      ).sort(([firstCategory], [secondCategory]) => firstCategory.localeCompare(secondCategory)),
    [filteredProjects],
  );

  const showCategoryProjects = (projectCategory: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('q');
    nextParams.delete('technology');
    nextParams.set('category', projectCategory);
    setSearchParams(nextParams);

    window.requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <PageTransition>
      <Seo title="Projects" description="Portfolio gallery with searchable and filterable software engineering projects." path="/projects" />
      {hasProjects ? (
        <Section
          eyebrow="Projects"
          title="Portfolio gallery"
          description={`Showing ${filteredProjects.length} of ${projects.length} projects. Search and filter by technology or category to explore selected products, platforms, mobile releases, and open-source work.`}
        >
          <div className="mb-8 grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1fr_220px_220px]">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Search</span>
              <span className="relative block">
                <input
                  value={query}
                  onChange={(event) => updateFilter('q', event.target.value)}
                  placeholder="Search projects..."
                  className="h-12 w-full rounded-full border border-slate-200 bg-slate-50 px-4 pr-12 text-sm font-semibold text-slate-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-brand-950"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => updateFilter('q', '')}
                    className="absolute inset-y-0 right-3 my-auto flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    aria-label="Clear search"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M6 6 14 14M14 6 6 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                ) : null}
              </span>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Category</span>
              <span className="relative block">
                <select
                  value={category}
                  onChange={(event) => updateFilter('category', event.target.value)}
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
                  onChange={(event) => updateFilter('technology', event.target.value)}
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

          <div ref={resultsRef} className="scroll-mt-28">
            {isShowingAllProjects ? (
              <div className="space-y-12">
                {groupedProjects.map(([projectCategory, categoryProjects]) => (
                  <section key={projectCategory}>
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="font-display text-2xl font-bold text-slate-950 dark:text-white">{projectCategory}</h2>
                        <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                          Showing {Math.min(categoryProjects.length, 3)} of {categoryProjects.length} projects
                        </p>
                      </div>
                      {categoryProjects.length > 3 ? (
                        <button
                          type="button"
                          onClick={() => showCategoryProjects(projectCategory)}
                          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-brand-700 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900 dark:text-brand-200 dark:hover:border-brand-400"
                        >
                          View all {projectCategory}
                        </button>
                      ) : null}
                    </div>
                    <div className="grid gap-6 lg:grid-cols-3">
                      {categoryProjects.slice(0, 3).map((project) => (
                        <ProjectCard key={project.slug} project={project} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-3">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.slug} project={project} />
                ))}
              </div>
            )}
          </div>
          {filteredProjects.length === 0 && <p className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700">No projects match the current filters.</p>}
        </Section>
      ) : null}
    </PageTransition>
  );
}
