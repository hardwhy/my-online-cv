export type AdminTableName =
  | 'site_profile'
  | 'skills'
  | 'experiences'
  | 'projects'
  | 'certifications'
  | 'achievements'
  | 'testimonials'
  | 'blog_posts';

export type AdminFieldKind = 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'array' | 'json' | 'date';

export type AdminRecordValue = string | number | boolean | string[] | unknown[] | Record<string, unknown> | null;

export type AdminRecord = {
  id?: string;
  is_published?: boolean;
  updated_at?: string;
  [key: string]: AdminRecordValue | undefined;
};

export type AdminFieldConfig = {
  column: string;
  label: string;
  kind: AdminFieldKind;
  required?: boolean;
  readOnly?: boolean;
  options?: string[];
  defaultValue?: AdminRecordValue;
};

export type AdminTableConfig = {
  name: AdminTableName;
  label: string;
  description: string;
  fields: AdminFieldConfig[];
  orderBy?: string;
  supportsCreate?: boolean;
  supportsDelete?: boolean;
};

export type StorageTargetKind = 'profile' | 'project-thumbnail' | 'certificate-file' | 'certificate-preview';

export type StorageUploadTarget = {
  kind: StorageTargetKind;
  label: string;
  bucket: 'portfolio';
  accept: string;
  pathTemplate: string;
  requiresSlug?: boolean;
};
