import { PageTransition } from '../components/PageTransition';
import { Section } from '@web-cv/shared-ui';
import { Seo } from '../components/Seo';
import { useBlogPosts } from '../hooks/usePortfolioContent';

export default function Blog() {
  const { data: blogPosts } = useBlogPosts();
  const hasBlogPosts = blogPosts.length > 0;

  return (
    <PageTransition>
      <Seo title="Blog" description="Future articles on software architecture, delivery, leadership, and engineering systems." path="/blog" />
      {hasBlogPosts ? (
        <Section eyebrow="Blog" title="Writing and notes" description="A future-ready article section with typed post data, tags, dates, excerpts, and content placeholders.">
          <div className="grid gap-6 md:grid-cols-2">
            {blogPosts.map((post) => (
              <article key={post.slug} className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-bold text-brand-700 dark:text-brand-300">{new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <h2 className="mt-3 font-display text-2xl font-bold text-slate-950 dark:text-white">{post.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{post.excerpt}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </Section>
      ) : null}
    </PageTransition>
  );
}
