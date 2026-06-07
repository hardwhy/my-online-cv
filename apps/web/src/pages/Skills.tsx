import { PageTransition } from '../components/PageTransition';
import { Section } from '@web-cv/shared-ui';
import { Seo } from '../components/Seo';
import { SkillBar } from '../components/SkillBar';
import { skillCategories, useSkills } from '../hooks/usePortfolioContent';

export default function Skills() {
  const { data: skills } = useSkills();
  const categoriesWithSkills = skillCategories
    .map((category) => ({
      category,
      skills: skills.filter((skill) => skill.category === category),
    }))
    .filter(({ skills }) => skills.length > 0);
  const hasSkills = categoriesWithSkills.length > 0;

  return (
    <PageTransition>
      <Seo title="Skills" description="Categorized technical skills with visual proficiency indicators." path="/skills" />
      {hasSkills ? (
        <Section eyebrow="Skills" title="Technical capabilities" description="A categorized view of frontend, backend, database, and delivery tooling experience.">
          <div className="space-y-12">
            {categoriesWithSkills.map(({ category, skills }) => (
              <div key={category}>
                <h2 className="mb-5 font-display text-2xl font-bold text-slate-950 dark:text-white">{category}</h2>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {skills.map((skill) => (
                      <SkillBar key={`${skill.category}-${skill.name}`} skill={skill} />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}
    </PageTransition>
  );
}
