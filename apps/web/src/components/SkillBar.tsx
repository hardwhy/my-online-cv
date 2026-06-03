import { motion } from 'framer-motion';
import type { Skill } from '../types/content';

type SkillBarProps = {
  skill: Skill;
};

export function SkillBar({ skill }: SkillBarProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-950 dark:text-white">{skill.name}</h3>
          {skill.description && <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{skill.description}</p>}
        </div>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-200">
          {skill.proficiency}%
        </span>
      </div>
      <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${skill.proficiency}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-300"
        />
      </div>
    </div>
  );
}
