import { ExperienceAccordion } from '../components/ExperienceAccordion';
import { PageTransition } from '../components/PageTransition';
import { Section } from '../components/Section';
import { Seo } from '../components/Seo';
import { useExperiences } from '../hooks/usePortfolioContent';

export default function Experience() {
  const { data: experiences } = useExperiences();

  return (
    <PageTransition>
      <Seo title="Experience" description="Timeline of roles, responsibilities, achievements, and technologies used." path="/experience" />
      <Section eyebrow="Experience" title="Timeline of engineering leadership" description="Expandable role summaries with outcomes, ownership areas, and the technologies used to deliver them.">
        <div className="space-y-8">
          {experiences.map((experience, index) => (
            <ExperienceAccordion key={experience.company} experience={experience} index={index} />
          ))}
        </div>
      </Section>
    </PageTransition>
  );
}
