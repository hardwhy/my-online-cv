import { useState } from 'react';
import type { Project } from '../types/content';

type ProjectVisualProps = {
  project: Project;
  imageSrc?: string;
  className?: string;
  imageClassName?: string;
};

type VisualKind = 'mobile' | 'web' | 'terminal';

const assetPath = (filename: string) => `${import.meta.env.BASE_URL}assets/${filename}`;

const getVisualKind = (project: Project): VisualKind => {
  const technologies = project.technologies.join(' ').toLowerCase();

  if (project.category === 'Mobile' || /android|ios|flutter|dart/.test(technologies)) {
    return 'mobile';
  }

  if (project.category === 'Platform' || /backend|api|cli|terminal|java|maven|docker|jenkins|express|node|python|nx/.test(technologies)) {
    return 'terminal';
  }

  return 'web';
};

function MobileFallback() {
  return (
    <div className="h-full w-full bg-white dark:bg-slate-950">
      <img src={assetPath('fallback-mobile-platforms.png')} alt="Android and iOS platforms" className="h-full w-full object-cover object-center" loading="lazy" />
    </div>
  );
}

function WebFallback() {
  return (
    <div className="h-full w-full bg-black">
      <img src={assetPath('fallback-web-react-typescript.png')} alt="React and TypeScript stack" className="h-full w-full object-cover object-center" loading="lazy" />
    </div>
  );
}

function TerminalFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 p-8">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 shadow-soft">
        <div className="flex gap-2 border-b border-slate-800 px-5 py-4">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
        </div>
        <div className="space-y-3 p-6 font-mono text-sm font-semibold text-brand-200">
          <p>$ npm run build</p>
          <p className="text-slate-300">&gt; API ready</p>
          <p className="text-emerald-300">200 OK</p>
        </div>
      </div>
    </div>
  );
}

export function ProjectVisual({ project, imageSrc, className = '', imageClassName = '' }: ProjectVisualProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const src = imageSrc?.trim();

  if (src && !hasImageError) {
    return (
      <img
        src={src}
        alt={`${project.title} project preview`}
        loading="lazy"
        onError={() => setHasImageError(true)}
        className={imageClassName}
      />
    );
  }

  const kind = getVisualKind(project);

  return (
    <div className={className} aria-label={`${project.title} fallback preview`} role="img">
      {kind === 'mobile' && <MobileFallback />}
      {kind === 'web' && <WebFallback />}
      {kind === 'terminal' && <TerminalFallback />}
    </div>
  );
}
