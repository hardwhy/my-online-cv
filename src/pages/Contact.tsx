import { FormEvent, useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import { Section } from '../components/Section';
import { Seo } from '../components/Seo';
import { profile } from '../data/profile';

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const initialForm: FormState = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

export default function Contact() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: Partial<FormState> = {};

    if (!form.name.trim()) nextErrors.name = 'Please enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Please enter a valid email.';
    if (!form.subject.trim()) nextErrors.subject = 'Please add a subject.';
    if (form.message.trim().length < 20) nextErrors.message = 'Please write at least 20 characters.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    window.dispatchEvent(new CustomEvent('portfolio:contact-submission', { detail: form }));
    setSubmitted(true);
    setForm(initialForm);
  };

  return (
    <PageTransition>
      <Seo title="Contact" description="Contact Ayi Hardiyanto for software engineering opportunities and collaborations." path="/contact" />
      <Section eyebrow="Contact" title="Let us build something reliable and useful" description="Use the form for project inquiries, leadership roles, advisory work, or speaking opportunities.">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-display text-2xl font-bold text-slate-950 dark:text-white">Contact details</h2>
            <div className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <p><strong className="text-slate-950 dark:text-white">Email:</strong> <a href={`mailto:${profile.email}`} className="hover:text-brand-600">{profile.email}</a></p>
              <p><strong className="text-slate-950 dark:text-white">Location:</strong> {profile.location}</p>
              {profile.socials.map((social) => (
                <p key={social.label}><strong className="text-slate-950 dark:text-white">{social.label}:</strong> <a href={social.href} className="hover:text-brand-600">{social.href.replace('https://', '')}</a></p>
              ))}
            </div>
          </aside>

          <form onSubmit={onSubmit} className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              {([
                ['name', 'Name'],
                ['email', 'Email'],
                ['subject', 'Subject'],
              ] as const).map(([field, label]) => (
                <label key={field} className={field === 'subject' ? 'sm:col-span-2' : ''}>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{label}</span>
                  <input
                    value={form[field]}
                    onChange={(event) => updateField(field, event.target.value)}
                    className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-brand-950"
                    aria-invalid={Boolean(errors[field])}
                  />
                  {errors[field] && <span className="mt-1 block text-sm text-red-600 dark:text-red-300">{errors[field]}</span>}
                </label>
              ))}
              <label className="sm:col-span-2">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Message</span>
                <textarea
                  value={form.message}
                  onChange={(event) => updateField('message', event.target.value)}
                  rows={6}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-brand-950"
                  aria-invalid={Boolean(errors.message)}
                />
                {errors.message && <span className="mt-1 block text-sm text-red-600 dark:text-red-300">{errors.message}</span>}
              </label>
            </div>
            <button type="submit" className="btn-primary mt-6">
              Send message
            </button>
            {submitted && <p className="mt-4 text-sm font-semibold text-emerald-600 dark:text-emerald-300">Thanks. This demo captured the submission event for analytics.</p>}
          </form>
        </div>
      </Section>
    </PageTransition>
  );
}
