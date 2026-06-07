import type { PropsWithChildren, ReactNode } from 'react';
import { motion } from 'framer-motion';

type SectionProps = PropsWithChildren<{
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
  backButton?: ReactNode;
}>;

export function Section({ eyebrow, title, description, className = '', backButton, children }: SectionProps) {
  return (
    <motion.section
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className={`mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20 ${className}`}
    >
      {(eyebrow || title || description || backButton) && (
        <div className="mb-10 max-w-3xl">
          {(eyebrow || backButton) && (
            <div className="flex items-center gap-3">
              {backButton}
              {eyebrow && <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-300">{eyebrow}</p>}
            </div>
          )}
          {title && <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">{title}</h2>}
          {description && <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">{description}</p>}
        </div>
      )}
      {children}
    </motion.section>
  );
}
