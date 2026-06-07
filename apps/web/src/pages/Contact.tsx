import { FormEvent, useRef, useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import { Section } from '@web-cv/shared-ui';
import { Seo } from '../components/Seo';
import { useProfile } from '../hooks/usePortfolioContent';

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

const contactEndpoint = import.meta.env.VITE_CONTACT_ENDPOINT;
const submittedStorageKey = 'portfolio:contact-submitted';
const submissionStorageKey = 'portfolio:last-contact-submission';
const submissionCooldownMs = 60_000;
const minimumCompletionMs = 3_000;

const getRemainingCooldownMs = () => {
  const lastSubmission = Number(window.localStorage.getItem(submissionStorageKey) ?? 0);
  return Math.max(0, submissionCooldownMs - (Date.now() - lastSubmission));
};

export default function Contact() {
  const { data: profile } = useProfile();
  const [form, setForm] = useState<FormState>(initialForm);
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'sending' | 'sent' | 'error' | 'rate-limited'>(() =>
    window.localStorage.getItem(submittedStorageKey) === 'true' ? 'sent' : 'idle',
  );
  const [isFormVisible, setIsFormVisible] = useState(false);
  const formStartedAt = useRef<number | null>(null);

  const updateField = (field: keyof FormState, value: string) => {
    formStartedAt.current ??= Date.now();
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitStatus('idle');
  };

  const revealContactForm = () => {
    formStartedAt.current = Date.now();
    setIsFormVisible(true);
    setSubmitStatus('idle');
  };

  const validate = () => {
    const nextErrors: Partial<FormState> = {};
    const email = form.email.trim().toLowerCase();

    if (!form.name.trim()) nextErrors.name = 'Please enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Please enter a valid email.';
    else if (email === profile.email.toLowerCase()) nextErrors.email = 'Please use your own email address.';
    if (!form.subject.trim()) nextErrors.subject = 'Please add a subject.';
    if (form.message.trim().length < 20) nextErrors.message = 'Please write at least 20 characters.';
    if (form.name.length > 80) nextErrors.name = 'Please keep your name under 80 characters.';
    if (form.subject.length > 120) nextErrors.subject = 'Please keep the subject under 120 characters.';
    if (form.message.length > 2_000) nextErrors.message = 'Please keep the message under 2,000 characters.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    if (honeypot) return;
    if (!contactEndpoint) {
      setSubmitStatus('error');
      return;
    }

    if (!formStartedAt.current || Date.now() - formStartedAt.current < minimumCompletionMs || getRemainingCooldownMs() > 0) {
      setSubmitStatus('rate-limited');
      return;
    }

    setSubmitStatus('sending');

    try {
      const response = await fetch(contactEndpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
          _subject: `Portfolio contact: ${form.subject}`,
          _template: 'table',
        }),
      });

      if (!response.ok) {
        throw new Error('Unable to send message');
      }

      window.dispatchEvent(new CustomEvent('portfolio:contact-submission', { detail: form }));
      window.localStorage.setItem(submittedStorageKey, 'true');
      window.localStorage.setItem(submissionStorageKey, String(Date.now()));
      setSubmitStatus('sent');
      setForm(initialForm);
      setHoneypot('');
      formStartedAt.current = null;
    } catch {
      setSubmitStatus('error');
    }
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
            </div>
          </aside>

          {submitStatus === 'sent' ? (
            <div className="flex flex-col justify-center rounded-[2rem] border border-emerald-200 bg-emerald-50 p-7 shadow-sm dark:border-emerald-900/70 dark:bg-emerald-950/30">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-700 dark:text-emerald-300">Message sent</p>
              <h2 className="mt-3 font-display text-2xl font-bold text-slate-950 dark:text-white">Thanks for reaching out.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Your message has been submitted successfully. To prevent duplicate submissions, the contact form is now closed.
              </p>
              <a href={`mailto:${profile.email}`} className="btn-secondary mt-6 w-fit">
                Email directly
              </a>
            </div>
          ) : isFormVisible ? (
            <form onSubmit={onSubmit} className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900" noValidate>
              <label className="hidden" aria-hidden="true">
                Company
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(event) => setHoneypot(event.target.value)}
                />
              </label>
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
                      type={field === 'email' ? 'email' : 'text'}
                      autoComplete={field === 'email' ? 'email' : field}
                      maxLength={field === 'name' ? 80 : field === 'subject' ? 120 : undefined}
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
                    autoComplete="off"
                    maxLength={2_000}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-brand-950"
                    aria-invalid={Boolean(errors.message)}
                  />
                  {errors.message && <span className="mt-1 block text-sm text-red-600 dark:text-red-300">{errors.message}</span>}
                </label>
              </div>
              <button type="submit" className="btn-primary mt-6 disabled:cursor-not-allowed disabled:opacity-70" disabled={submitStatus === 'sending'}>
                {submitStatus === 'sending' ? 'Sending...' : 'Send message'}
              </button>
              {submitStatus === 'rate-limited' && (
                <p className="mt-4 text-sm font-semibold text-amber-600 dark:text-amber-300">
                  Please wait a moment before sending another message.
                </p>
              )}
              {submitStatus === 'error' && (
                <p className="mt-4 text-sm font-semibold text-red-600 dark:text-red-300">
                  Sorry, the message could not be sent. Please email me directly at <a href={`mailto:${profile.email}`}>{profile.email}</a>.
                </p>
              )}
            </form>
          ) : (
            <div className="flex flex-col justify-center rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-600 dark:text-brand-300">Protected form</p>
              <h2 className="mt-3 font-display text-2xl font-bold text-slate-950 dark:text-white">Ready to send a message?</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                To reduce automated spam, the contact form only loads after you choose to open it. You can also email me directly anytime.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button type="button" className="btn-primary" onClick={revealContactForm}>
                  Open contact form
                </button>
                <a href={`mailto:${profile.email}`} className="btn-secondary">
                  Email directly
                </a>
              </div>
            </div>
          )}
        </div>
      </Section>
    </PageTransition>
  );
}
