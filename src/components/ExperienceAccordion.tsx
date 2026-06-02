import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Experience } from '../types/content';

type ExperienceAccordionProps = {
  experience: Experience;
  index: number;
};

export function ExperienceAccordion({ experience, index }: ExperienceAccordionProps) {
  const [isOpen, setIsOpen] = useState(index === 0);

  return (
    <motion.article
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="relative border-l border-slate-200 pl-8 dark:border-slate-800"
    >
      <span className="absolute -left-2 top-2 h-4 w-4 rounded-full border-4 border-white bg-brand-500 dark:border-slate-950" />
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="w-full rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-slate-800 dark:bg-slate-900/80"
        aria-expanded={isOpen}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-300">{experience.duration}</p>
            <h3 className="mt-2 font-display text-2xl font-bold text-slate-950 dark:text-white">{experience.position}</h3>
            <p className="mt-1 font-semibold text-slate-700 dark:text-slate-200">{experience.company} - {experience.location}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {isOpen ? 'Collapse' : 'Expand'}
          </span>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{experience.summary}</p>
      </button>

      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="mt-4 grid gap-4 rounded-3xl bg-slate-100 p-6 dark:bg-slate-900 sm:grid-cols-2">
            <div>
              <h4 className="font-bold text-slate-950 dark:text-white">Responsibilities</h4>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {experience.responsibilities.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-950 dark:text-white">Achievements</h4>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {experience.achievements.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>
            <div className="sm:col-span-2">
              <h4 className="font-bold text-slate-950 dark:text-white">Technologies</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {experience.technologies.map((technology) => (
                  <span key={technology} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {technology}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.article>
  );
}
