import { Link } from 'react-router-dom';
import type { Project } from '../types/content';

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900/80">
      <div className="aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={project.thumbnail}
          alt={`${project.title} project preview`}
          loading="lazy"
          className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
        />
  
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between gap-4">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-700 dark:bg-brand-950 dark:text-brand-200">
            {project.category}
          </span>
          {project.featured && <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Featured</span>}
        </div>
        <h3 className="mt-4 font-display text-xl font-bold text-slate-950 dark:text-white">{project.title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{project.description}</p>
        <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">{project.impact}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {project.technologies.map((technology) => (
            <span key={technology} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {technology}
            </span>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to={`/projects/${project.slug}`} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700 dark:bg-white dark:text-slate-950 dark:hover:bg-brand-200">
            Details
          </Link>
          {project.githubUrl !== '#' && (
            <a href={project.githubUrl} target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-brand-400 dark:hover:text-brand-200">
              GitHub
            </a>
          )}
          {project.liveUrl !== '#' && (
            <a href={project.liveUrl} target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-brand-400 dark:hover:text-brand-200">
              Reference
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
