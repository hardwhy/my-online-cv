import type { SupabaseClient } from '@supabase/supabase-js';
import type { AdminRecord, AdminRecordValue, AdminTableConfig, AdminTableName, StorageUploadTarget } from '@portfolio/shared-types';

export const adminTableConfigs: AdminTableConfig[] = [
  {
    name: 'site_profile',
    label: 'Profile',
    description: 'Home, about, contact, socials, and profile summary content.',
    orderBy: 'updated_at',
    supportsDelete: false,
    fields: [
      { column: 'full_name', label: 'Full name', kind: 'text', required: true },
      { column: 'title', label: 'Title', kind: 'text', required: true },
      { column: 'summary', label: 'Summary', kind: 'textarea', required: true },
      { column: 'location', label: 'Location', kind: 'text', required: true },
      { column: 'email', label: 'Email', kind: 'text', required: true },
      { column: 'phone', label: 'Phone', kind: 'text' },
      { column: 'resume_url', label: 'Resume URL', kind: 'text' },
      { column: 'socials', label: 'Social links JSON', kind: 'json', defaultValue: [] },
      { column: 'stats', label: 'Stats JSON', kind: 'json', defaultValue: [] },
      { column: 'strengths', label: 'Strengths', kind: 'array', defaultValue: [] },
      { column: 'interests', label: 'Interests', kind: 'array', defaultValue: [] },
      { column: 'is_published', label: 'Published', kind: 'boolean', defaultValue: true },
    ],
  },
  {
    name: 'skills',
    label: 'Skills',
    description: 'Skills grouped by category and ordered by sort order.',
    orderBy: 'sort_order',
    fields: [
      { column: 'name', label: 'Name', kind: 'text', required: true },
      { column: 'category', label: 'Category', kind: 'select', required: true, options: ['Frontend', 'Backend', 'Database', 'Tools'] },
      { column: 'proficiency', label: 'Proficiency', kind: 'number', required: true, defaultValue: 80 },
      { column: 'description', label: 'Description', kind: 'textarea' },
      { column: 'sort_order', label: 'Sort order', kind: 'number', defaultValue: 0 },
      { column: 'is_published', label: 'Published', kind: 'boolean', defaultValue: true },
    ],
  },
  {
    name: 'experiences',
    label: 'Work Experience',
    description: 'Professional experience timeline content.',
    orderBy: 'sort_order',
    fields: [
      { column: 'company', label: 'Company', kind: 'text', required: true },
      { column: 'position', label: 'Position', kind: 'text', required: true },
      { column: 'duration', label: 'Duration', kind: 'text', required: true },
      { column: 'location', label: 'Location', kind: 'text', required: true },
      { column: 'summary', label: 'Summary', kind: 'textarea', required: true },
      { column: 'responsibilities', label: 'Responsibilities', kind: 'array', defaultValue: [] },
      { column: 'achievements', label: 'Achievements', kind: 'array', defaultValue: [] },
      { column: 'technologies', label: 'Technologies', kind: 'array', defaultValue: [] },
      { column: 'sort_order', label: 'Sort order', kind: 'number', defaultValue: 0 },
      { column: 'is_published', label: 'Published', kind: 'boolean', defaultValue: true },
    ],
  },
  {
    name: 'projects',
    label: 'Projects',
    description: 'Portfolio project cards and detail pages.',
    orderBy: 'sort_order',
    fields: [
      { column: 'slug', label: 'Slug', kind: 'text', required: true },
      { column: 'title', label: 'Title', kind: 'text', required: true },
      { column: 'category', label: 'Category', kind: 'select', required: true, options: ['Web App', 'Platform', 'Mobile', 'Publication'] },
      { column: 'description', label: 'Description', kind: 'textarea', required: true },
      { column: 'impact', label: 'Impact', kind: 'textarea', required: true },
      { column: 'technologies', label: 'Technologies', kind: 'array', defaultValue: [] },
      { column: 'github_url', label: 'GitHub URL', kind: 'text' },
      { column: 'live_url', label: 'Live URL', kind: 'text' },
      { column: 'featured', label: 'Featured', kind: 'boolean', defaultValue: false },
      { column: 'sort_order', label: 'Sort order', kind: 'number', defaultValue: 0 },
      { column: 'is_published', label: 'Published', kind: 'boolean', defaultValue: true },
    ],
  },
  {
    name: 'certifications',
    label: 'Certificates',
    description: 'Certificates, credentials, downloads, and preview URLs.',
    orderBy: 'sort_order',
    fields: [
      { column: 'name', label: 'Name', kind: 'text', required: true },
      { column: 'issuer', label: 'Issuer', kind: 'text', required: true },
      { column: 'issue_date', label: 'Issue date', kind: 'text', required: true },
      { column: 'credential_url', label: 'Credential URL', kind: 'text' },
      { column: 'download_url', label: 'Download URL', kind: 'text' },
      { column: 'image_url', label: 'Image URL', kind: 'text' },
      { column: 'sort_order', label: 'Sort order', kind: 'number', defaultValue: 0 },
      { column: 'is_published', label: 'Published', kind: 'boolean', defaultValue: true },
    ],
  },
  {
    name: 'achievements',
    label: 'Achievements',
    description: 'Short achievement entries used in profile sections.',
    orderBy: 'sort_order',
    fields: [
      { column: 'title', label: 'Title', kind: 'text', required: true },
      { column: 'description', label: 'Description', kind: 'textarea', required: true },
      { column: 'date', label: 'Date', kind: 'text', required: true },
      { column: 'sort_order', label: 'Sort order', kind: 'number', defaultValue: 0 },
      { column: 'is_published', label: 'Published', kind: 'boolean', defaultValue: true },
    ],
  },
  {
    name: 'testimonials',
    label: 'Testimonials',
    description: 'Quotes and references for future public display.',
    orderBy: 'sort_order',
    fields: [
      { column: 'quote', label: 'Quote', kind: 'textarea', required: true },
      { column: 'author', label: 'Author', kind: 'text', required: true },
      { column: 'role', label: 'Role', kind: 'text', required: true },
      { column: 'sort_order', label: 'Sort order', kind: 'number', defaultValue: 0 },
      { column: 'is_published', label: 'Published', kind: 'boolean', defaultValue: true },
    ],
  },
  {
    name: 'blog_posts',
    label: 'Blog Posts',
    description: 'Future blog content with tags and markdown/plain text content.',
    orderBy: 'sort_order',
    fields: [
      { column: 'slug', label: 'Slug', kind: 'text', required: true },
      { column: 'title', label: 'Title', kind: 'text', required: true },
      { column: 'date', label: 'Date', kind: 'date', required: true },
      { column: 'tags', label: 'Tags', kind: 'array', defaultValue: [] },
      { column: 'excerpt', label: 'Excerpt', kind: 'textarea', required: true },
      { column: 'content', label: 'Content', kind: 'textarea', required: true },
      { column: 'sort_order', label: 'Sort order', kind: 'number', defaultValue: 0 },
      { column: 'is_published', label: 'Published', kind: 'boolean', defaultValue: true },
    ],
  },
];

export const storageUploadTargets: StorageUploadTarget[] = [
  {
    kind: 'profile',
    label: 'Profile image',
    bucket: 'portfolio',
    accept: 'image/*',
    pathTemplate: 'profile/ayi-hardiyanto-profile.png',
  },
  {
    kind: 'project-thumbnail',
    label: 'Project thumbnail',
    bucket: 'portfolio',
    accept: 'image/*',
    pathTemplate: 'projects/{slug}/thumbnail.webp',
    requiresSlug: true,
  },
  {
    kind: 'certificate-file',
    label: 'Certificate file',
    bucket: 'portfolio',
    accept: 'application/pdf',
    pathTemplate: 'certificates/{slug}/certificate.pdf',
    requiresSlug: true,
  },
  {
    kind: 'certificate-preview',
    label: 'Certificate preview',
    bucket: 'portfolio',
    accept: 'image/*',
    pathTemplate: 'certificates/{slug}/preview.webp',
    requiresSlug: true,
  },
];

const ensureClient = (client: SupabaseClient | null): SupabaseClient => {
  if (!client) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  return client;
};

const normalizePayload = (record: AdminRecord) =>
  Object.entries(record).reduce<Record<string, AdminRecordValue>>((payload, [key, value]) => {
    if (key === 'id' || key === 'updated_at' || value === undefined) return payload;
    payload[key] = value;
    return payload;
  }, {});

export function getAdminTableConfig(tableName: AdminTableName) {
  const config = adminTableConfigs.find((table) => table.name === tableName);
  if (!config) throw new Error(`Unknown admin table: ${tableName}`);
  return config;
}

export async function listAdminRecords(client: SupabaseClient | null, config: AdminTableConfig): Promise<AdminRecord[]> {
  let query = ensureClient(client).from(config.name).select('*');

  if (config.orderBy) {
    query = query.order(config.orderBy, { ascending: config.orderBy !== 'updated_at' });
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as AdminRecord[];
}

export async function createAdminRecord(client: SupabaseClient | null, tableName: AdminTableName, record: AdminRecord): Promise<AdminRecord> {
  const { data, error } = await ensureClient(client).from(tableName).insert(normalizePayload(record)).select('*').single();
  if (error) throw error;
  return data as AdminRecord;
}

export async function updateAdminRecord(client: SupabaseClient | null, tableName: AdminTableName, id: string, record: AdminRecord): Promise<AdminRecord> {
  const { data, error } = await ensureClient(client).from(tableName).update(normalizePayload(record)).eq('id', id).select('*').single();
  if (error) throw error;
  return data as AdminRecord;
}

export async function deleteAdminRecord(client: SupabaseClient | null, tableName: AdminTableName, id: string): Promise<void> {
  const { error } = await ensureClient(client).from(tableName).delete().eq('id', id);
  if (error) throw error;
}

export function resolveStoragePath(target: StorageUploadTarget, slug?: string) {
  const normalizedSlug = slug?.trim();
  if (target.requiresSlug && !normalizedSlug) {
    throw new Error(`${target.label} requires a slug.`);
  }

  return target.pathTemplate.replace('{slug}', normalizedSlug ?? '');
}

export async function uploadPortfolioAsset(client: SupabaseClient | null, target: StorageUploadTarget, file: File, slug?: string) {
  const supabase = ensureClient(client);
  const path = resolveStoragePath(target, slug);
  const { error } = await supabase.storage.from(target.bucket).upload(path, file, {
    cacheControl: '3600',
    contentType: file.type || undefined,
    upsert: true,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(target.bucket).getPublicUrl(path);
  return {
    path,
    publicUrl: data.publicUrl,
  };
}
