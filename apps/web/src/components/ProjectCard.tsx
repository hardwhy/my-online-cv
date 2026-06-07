import { Link, useNavigate } from 'react-router-dom';
import type { Project } from '../types/content';
import { getProjectThumbnailUrl } from '../lib/storage';
import { ProjectVisual } from './ProjectVisual';

const TECH_VISIBLE_COUNT = 3;

function TechnologyList({ technologies }: { technologies: string[] }) {
  const visible = technologies.slice(0, TECH_VISIBLE_COUNT);
  const remainder = technologies.length - TECH_VISIBLE_COUNT;
  const hiddenTechs = technologies.slice(TECH_VISIBLE_COUNT);

  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {visible.map((technology) => (
        <span key={technology} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {technology}
        </span>
      ))}
      {remainder > 0 && (
        <span
          title={hiddenTechs.join(', ')}
          className="cursor-default rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400"
        >
          +{remainder} more
        </span>
      )}
    </div>
  );
}

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();
  const thumbnailUrl = getProjectThumbnailUrl(project.slug);
  const detailPath = `/projects/${project.slug}`;

  const openProjectDetail = () => {
    navigate(detailPath);
  };

  const handleCardClick = (event: React.MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('a')) {
      return;
    }

    openProjectDetail();
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    openProjectDetail();
  };

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`View details for ${project.title}`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm outline-none transition hover:-translate-y-1 hover:shadow-soft focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-800 dark:bg-slate-900/80 dark:focus-visible:ring-offset-slate-950"
    >
      <div className="aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <ProjectVisual
          project={project}
          imageSrc={thumbnailUrl}
          className="h-full w-full transition duration-500 group-hover:scale-105"
          imageClassName="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-4">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-700 dark:bg-brand-950 dark:text-brand-200">
            {project.category}
          </span>
          {project.featured && <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Featured</span>}
        </div>
        <h3 title={project.title} className="mt-4 line-clamp-2 font-display text-xl font-bold text-slate-950 dark:text-white">{project.title}</h3>
        <p title={project.description} className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{project.description}</p>
        <p title={project.impact} className="mt-3 line-clamp-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{project.impact}</p>
        <TechnologyList technologies={project.technologies} />
        <div className="mt-auto pt-6 flex flex-wrap gap-3">
          <Link to={detailPath} className="btn-primary">
            Details
          </Link>
          {project.githubUrl !== '#' && (
            <a href={project.githubUrl} target="_blank" rel="noreferrer" className="btn-secondary">
              GitHub
            </a>
          )}
          {project.liveUrl !== '#' && (
            <a href={project.liveUrl} target="_blank" rel="noreferrer" className="btn-secondary">
              Reference
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
