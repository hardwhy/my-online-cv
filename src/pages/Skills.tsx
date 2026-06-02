import { PageTransition } from '../components/PageTransition';
import { Section } from '../components/Section';
import { Seo } from '../components/Seo';
import { SkillBar } from '../components/SkillBar';
import { skillCategories, skills } from '../data/skills';

export default function Skills() {
  return (
    <PageTransition>
      <Seo title="Skills" description="Categorized technical skills with visual proficiency indicators." path="/skills" />
      <Section eyebrow="Skills" title="Technical capabilities" description="A categorized view of frontend, backend, database, and delivery tooling experience.">
        <div className="space-y-12">
          {skillCategories.map((category) => (
            <div key={category}>
              <h2 className="mb-5 font-display text-2xl font-bold text-slate-950 dark:text-white">{category}</h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {skills
                  .filter((skill) => skill.category === category)
                  .map((skill) => (
                    <SkillBar key={`${skill.category}-${skill.name}`} skill={skill} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </PageTransition>
  );
}
