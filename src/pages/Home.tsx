import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageTransition } from '../components/PageTransition';
import { ProjectCard } from '../components/ProjectCard';
import { Section } from '../components/Section';
import { Seo } from '../components/Seo';
import { achievements, profile, testimonials } from '../data/profile';
import { projects } from '../data/projects';

export default function Home() {
  const featuredProjects = projects.filter((project) => project.featured);

  return (
    <PageTransition>
      <Seo title="Software Engineer Portfolio" description="Online CV and portfolio for Ayi Hardiyanto, Software Engineer at DKATALIS." />
      <section className="relative overflow-hidden bg-hero-grid bg-[length:42px_42px]">
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-slate-50/80 to-slate-50 dark:from-slate-950/90 dark:via-slate-950/80 dark:to-slate-950" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-28">
          <div>
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-sm font-bold uppercase tracking-[0.28em] text-brand-700 dark:text-brand-300">
              Available for senior engineering leadership
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mt-5 font-display text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
              {profile.fullName}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="mt-4 text-2xl font-semibold text-brand-700 dark:text-brand-300">
              {profile.title}
            </motion.p>
            <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 max-w-2xl text-lg leading-9 text-slate-600 dark:text-slate-300">
              {profile.summary}
            </motion.p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={profile.resumeUrl} className="btn-primary" download>
                Download CV
              </a>
              <Link to="/contact" className="btn-secondary">
                Contact Me
              </Link>
              <Link to="/projects" className="btn-secondary">
                View Portfolio
              </Link>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.18 }} className="relative">
            <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-brand-300/40 to-slate-900/10 blur-3xl dark:to-brand-800/40" />
            <img src={profile.photo} alt={profile.fullName} className="relative mx-auto w-full max-w-md rounded-[2.5rem] border border-white/70 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900" />
          </motion.div>
        </div>
      </section>

      <Section className="-mt-8 pt-0">
        <div className="grid gap-4 sm:grid-cols-3">
          {profile.stats.map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="font-display text-4xl font-extrabold text-slate-950 dark:text-white">{stat.value}</p>
              <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Featured work" title="Selected products and platforms" description="A sample of recent projects focused on speed, reliability, user experience, and business outcomes.">
        <div className="grid gap-6 lg:grid-cols-3">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </Section>

      <Section eyebrow="Recent achievements" title="Measurable engineering impact">
        <div className="grid gap-4 md:grid-cols-3">
          {achievements.map((achievement) => (
            <article key={achievement.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-bold text-brand-700 dark:text-brand-300">{achievement.date}</p>
              <h3 className="mt-3 font-display text-xl font-bold text-slate-950 dark:text-white">{achievement.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{achievement.description}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="Testimonials" title="Recommendations from collaborators">
        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <blockquote key={testimonial.author} className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-lg leading-8 text-slate-700 dark:text-slate-200">"{testimonial.quote}"</p>
              <footer className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">
                {testimonial.author}, {testimonial.role}
              </footer>
            </blockquote>
          ))}
        </div>
      </Section>
    </PageTransition>
  );
}
