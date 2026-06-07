import { PageTransition } from '../components/PageTransition';
import { Section } from '@web-cv/shared-ui';
import { Seo } from '../components/Seo';
import { SkillBar } from '../components/SkillBar';
import { useExperiences, useProfile, useSkills } from '../hooks/usePortfolioContent';

export default function About() {
  const { data: experiences } = useExperiences();
  const { data: profile } = useProfile();
  const { data: skills } = useSkills();
  const highlightedSkills = skills.slice(0, 8);
  const hasStrengths = profile.strengths.length > 0;
  const hasExperiences = experiences.length > 0;
  const hasAboutContent = hasStrengths || hasExperiences;
  const hasHighlightedSkills = highlightedSkills.length > 0;
  const hasInterests = profile.interests.length > 0;

  return (
    <PageTransition>
      <Seo title="About" description="Professional summary, career journey, strengths, interests, and technology stack." path="/about" />
      {hasAboutContent ? (
        <Section eyebrow="About me" title="Product-minded engineering with strong technical depth" description={profile.summary}>
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            {hasStrengths ? (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="font-display text-2xl font-bold text-slate-950 dark:text-white">Core strengths</h3>
                <div className="mt-5 grid gap-3">
                  {profile.strengths.map((strength) => (
                    <div key={strength} className="rounded-2xl bg-slate-100 p-4 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {strength}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {hasExperiences ? (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="font-display text-2xl font-bold text-slate-950 dark:text-white">Career journey</h3>
                <div className="mt-6 space-y-5">
                  {experiences.map((experience) => (
                    <div key={experience.company} className="border-l-2 border-brand-200 pl-5 dark:border-brand-800">
                      <p className="text-sm font-bold text-brand-700 dark:text-brand-300">{experience.duration}</p>
                      <p className="mt-1 font-bold text-slate-950 dark:text-white">{experience.position}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{experience.company}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}

      {hasHighlightedSkills ? (
        <Section eyebrow="Technology stack" title="Tools I use to ship maintainable products">
          <div className="grid gap-4 md:grid-cols-2">
            {highlightedSkills.map((skill) => (
              <SkillBar key={`${skill.category}-${skill.name}`} skill={skill} />
            ))}
          </div>
        </Section>
      ) : null}

      {hasInterests ? (
        <Section eyebrow="Beyond work" title="Personal interests">
          <div className="flex flex-wrap gap-3">
            {profile.interests.map((interest) => (
              <span key={interest} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                {interest}
              </span>
            ))}
          </div>
        </Section>
      ) : null}
    </PageTransition>
  );
}
