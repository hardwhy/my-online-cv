import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { adminTableConfigs, listAdminRecords, removePortfolioAsset, resolveStoragePath, storageUploadTargets, uploadPortfolioAsset } from '@portfolio/shared-services';
import type { AdminRecord, AdminTableName, StorageTargetKind, StorageUploadTarget } from '@portfolio/shared-types';
import { AdminSelect } from '../../components/AdminDropdown';
import { adminSupabase } from '../../lib/supabase';

const slugSourceByTarget: Partial<Record<StorageTargetKind, AdminTableName>> = {
  'project-thumbnail': 'projects',
  'certificate-file': 'certifications',
  'certificate-preview': 'certifications',
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const getSlugOption = (record: AdminRecord, tableName: AdminTableName) => {
  if (tableName === 'projects') {
    return {
      value: String(record.slug ?? ''),
      label: String(record.slug ?? ''),
      description: String(record.title ?? 'Untitled project'),
    };
  }

  const name = String(record.name ?? 'Untitled certificate');
  const issuer = String(record.issuer ?? '');
  const value = slugify([name, issuer].filter(Boolean).join('-'));
  return {
    value,
    label: value,
    description: issuer ? `${name} - ${issuer}` : name,
  };
};

export function StorageAdmin() {
  const [targetKind, setTargetKind] = useState(storageUploadTargets[0].kind);
  const [slug, setSlug] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<{ path: string; publicUrl: string } | null>(null);
  const target = useMemo<StorageUploadTarget>(() => storageUploadTargets.find((item) => item.kind === targetKind) ?? storageUploadTargets[0], [targetKind]);
  const slugSourceTableName = slugSourceByTarget[target.kind];
  const slugSourceConfig = useMemo(() => adminTableConfigs.find((table) => table.name === slugSourceTableName), [slugSourceTableName]);

  const slugOptionsQuery = useQuery({
    queryKey: ['storage-slug-options', slugSourceConfig?.name],
    queryFn: () => listAdminRecords(adminSupabase, slugSourceConfig!),
    enabled: Boolean(slugSourceConfig && target.requiresSlug),
  });

  const slugOptions = useMemo(
    () =>
      (slugOptionsQuery.data ?? [])
        .map((record) => getSlugOption(record, slugSourceConfig?.name ?? 'projects'))
        .filter((option) => option.value),
    [slugOptionsQuery.data, slugSourceConfig?.name],
  );

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

  const removeMutation = useMutation({
    mutationFn: () => removePortfolioAsset(adminSupabase, target, slug),
    onSuccess: () => {
      setUploadResult(null);
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
        <h1 className="mt-2 font-display text-3xl font-bold text-slate-950 dark:text-white">Portfolio Assets</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Upload and replace assets in the public `portfolio` bucket. Public URLs update immediately after the upload succeeds.
        </p>
      </div>

      <form className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900" onSubmit={handleSubmit}>
        <div className="grid gap-5 lg:grid-cols-2">
          <AdminSelect
            label="Asset type"
            value={targetKind}
            options={storageUploadTargets.map((item) => ({ label: item.label, value: item.kind, description: item.pathTemplate }))}
            onChange={(nextValue) => {
              setTargetKind(nextValue as StorageUploadTarget['kind']);
              setSlug('');
              setUploadResult(null);
            }}
          />

          {target.requiresSlug ? (
            <div>
              <AdminSelect
                label="Slug"
                value={slug}
                options={slugOptions}
                onChange={setSlug}
                placeholder="project-or-certificate-slug"
                searchable
                allowCustomValue
                emptyLabel="No related slug options found."
              />
              <p className="mt-2 text-xs font-normal text-slate-500 dark:text-slate-400">
                {slugOptionsQuery.isLoading ? 'Loading related slugs...' : slugOptions.length > 0 ? 'Start typing to pick from related content.' : 'No related content options found yet.'}
              </p>
            </div>
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
        {removeMutation.error ? <p className="mt-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-100">{removeMutation.error.message}</p> : null}
        {uploadResult ? (
          <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-100">
            <p className="font-semibold">Upload complete</p>
            <p className="mt-1 break-all">{uploadResult.publicUrl}</p>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60 dark:bg-brand-300 dark:text-slate-950" type="submit" disabled={uploadMutation.isPending}>
            {uploadMutation.isPending ? 'Uploading...' : 'Upload asset'}
          </button>
          <button
            className="rounded-full border border-red-200 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-400/30 dark:text-red-200 dark:hover:bg-red-400/10"
            type="button"
            disabled={removeMutation.isPending || (target.requiresSlug && !slug)}
            onClick={() => {
              if (window.confirm(`Remove ${target.label}?`)) removeMutation.mutate();
            }}
          >
            {removeMutation.isPending ? 'Removing...' : 'Remove asset'}
          </button>
        </div>
      </form>
    </section>
  );
}
