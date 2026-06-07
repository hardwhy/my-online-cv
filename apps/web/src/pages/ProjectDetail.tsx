import { Link, Navigate, useParams } from 'react-router-dom';
import { PageTransition } from '../components/PageTransition';
import { ProjectVisual } from '../components/ProjectVisual';
import { Section } from '@web-cv/shared-ui';
import { Seo } from '../components/Seo';
import { useProject } from '../hooks/usePortfolioContent';
import { getProjectThumbnailUrl } from '../lib/storage';

export default function ProjectDetail() {
  const { slug } = useParams();
  const { data: project, isFetching } = useProject(slug);

  if (!project && isFetching) {
    return (
      <PageTransition>
        <Section eyebrow="Projects" title="Loading project" description="Fetching the latest project details." />
      </PageTransition>
    );
  }

  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  const thumbnailUrl = getProjectThumbnailUrl(project.slug);

  return (
    <PageTransition>
      <Seo title={project.title} description={project.description} path={`/projects/${project.slug}`} />
      <Section eyebrow={project.category} title={project.title} description={project.description}>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <ProjectVisual
              project={project}
              imageSrc={thumbnailUrl}
              className="aspect-[16/10] w-full"
              imageClassName="aspect-[16/10] w-full object-cover"
            />
          </div>
          <aside className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-display text-2xl font-bold text-slate-950 dark:text-white">Project impact</h2>
            <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">{project.impact}</p>
            <h3 className="mt-8 font-bold text-slate-950 dark:text-white">Technologies</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.technologies.map((technology) => (
                <span key={technology} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {technology}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {project.githubUrl !== '#' && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  View GitHub
                </a>
              )}
              {project.liveUrl !== '#' && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  View reference
                </a>
              )}
              <Link to="/projects" className="btn-secondary">
                Back
              </Link>
            </div>
          </aside>
        </div>
      </Section>
    </PageTransition>
  );
}
