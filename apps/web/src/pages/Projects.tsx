import { KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageTransition } from '../components/PageTransition';
import { ProjectCard } from '../components/ProjectCard';
import { Section } from '../components/Section';
import { Seo } from '../components/Seo';
import { projectCategories, useProjects } from '../hooks/usePortfolioContent';

type ProjectCategoryFilter = (typeof projectCategories)[number];

function ProjectFilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(Math.max(options.indexOf(value), 0));

  useEffect(() => {
    if (!isOpen) return;

    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };

    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [isOpen]);

  const choose = (nextValue: string) => {
    onChange(nextValue);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!isOpen && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      setActiveIndex(Math.max(options.indexOf(value), 0));
      setIsOpen(true);
      return;
    }

    if (!isOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, options.length - 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(options[activeIndex]);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</span>
      <button
        ref={triggerRef}
        className="flex h-12 w-full items-center justify-between gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 text-left text-sm font-semibold text-slate-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-brand-950"
        type="button"
        role="combobox"
        aria-controls={`${id}-listbox`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleKeyDown}
      >
        <span className="truncate">{value}</span>
        <svg className={`h-4 w-4 shrink-0 text-slate-400 transition ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-soft dark:border-slate-800 dark:bg-slate-950" id={`${id}-listbox`} role="listbox" aria-label={label}>
          {options.map((option, index) => {
            const isSelected = option === value;
            const isActive = index === activeIndex;

            return (
              <button
                key={option}
                className={`block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                  isSelected
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                    : isActive
                      ? 'bg-slate-100 text-slate-950 dark:bg-slate-900 dark:text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
                }`}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(option)}
              >
                {option}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

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
            <ProjectFilterSelect label="Category" value={category} options={[...projectCategories]} onChange={(nextValue) => updateFilter('category', nextValue)} />
            <ProjectFilterSelect label="Technology" value={technology} options={technologies} onChange={(nextValue) => updateFilter('technology', nextValue)} />
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
