import { FormEvent, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { resolveStoragePath, storageUploadTargets, uploadPortfolioAsset } from '@portfolio/shared-services';
import type { StorageUploadTarget } from '@portfolio/shared-types';
import { adminSupabase } from '../../lib/supabase';

export function StorageAdmin() {
  const [targetKind, setTargetKind] = useState(storageUploadTargets[0].kind);
  const [slug, setSlug] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<{ path: string; publicUrl: string } | null>(null);
  const target = useMemo<StorageUploadTarget>(() => storageUploadTargets.find((item) => item.kind === targetKind) ?? storageUploadTargets[0], [targetKind]);

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error('Choose a file to upload.');
      return uploadPortfolioAsset(adminSupabase, target, file, slug);
    },
    onSuccess: (result) => {
      setUploadResult(result);
      setFile(null);
    },
  });

  const expectedPath = (() => {
    try {
      return resolveStoragePath(target, slug);
    } catch {
      return target.pathTemplate;
    }
  })();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    uploadMutation.mutate();
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700 dark:text-brand-300">Storage</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">Portfolio Assets</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Upload and replace assets in the public `portfolio` bucket. Public URLs update immediately after the upload succeeds.
        </p>
      </div>

      <form className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900" onSubmit={handleSubmit}>
        <div className="grid gap-5 lg:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Asset type
            <select
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-brand-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              value={targetKind}
              onChange={(event) => {
                setTargetKind(event.target.value as StorageUploadTarget['kind']);
                setUploadResult(null);
              }}
            >
              {storageUploadTargets.map((item) => (
                <option key={item.kind} value={item.kind}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          {target.requiresSlug ? (
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Slug
              <input
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-brand-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="project-or-certificate-slug"
                required
              />
            </label>
          ) : null}

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 lg:col-span-2">
            File
            <input
              className="mt-2 w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              type="file"
              accept={target.accept}
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setUploadResult(null);
              }}
              required
            />
          </label>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
          <span className="font-semibold text-slate-900 dark:text-white">Target path:</span> {expectedPath}
        </div>

        {uploadMutation.error ? <p className="mt-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-100">{uploadMutation.error.message}</p> : null}
        {uploadResult ? (
          <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-100">
            <p className="font-semibold">Upload complete</p>
            <p className="mt-1 break-all">{uploadResult.publicUrl}</p>
          </div>
        ) : null}

        <button className="mt-6 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60 dark:bg-brand-300 dark:text-slate-950" type="submit" disabled={uploadMutation.isPending}>
          {uploadMutation.isPending ? 'Uploading...' : 'Upload asset'}
        </button>
      </form>
    </section>
  );
}
