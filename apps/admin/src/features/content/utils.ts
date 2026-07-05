import type { AdminFieldConfig, AdminRecord, AdminRecordValue, AdminTableConfig, ProjectCategory } from '@web-cv-services/shared-types';
import type { FormState, StructuredItem } from './types';

export const localAssetPath = (filename: string) => `${import.meta.env.BASE_URL}assets/${filename}`;

export const editableFields = (config: AdminTableConfig) => config.fields.filter((field) => !field.readOnly);

export const stringifyFieldValue = (
  field: AdminFieldConfig,
  value: AdminRecordValue | undefined,
): string | boolean | string[] | StructuredItem[] => {
  if (field.kind === 'boolean') return Boolean(value ?? field.defaultValue ?? false);
  if (field.kind === 'array') return Array.isArray(value) ? value.map(String) : [];
  if (field.column === 'socials') return Array.isArray(value) ? (value as StructuredItem[]) : [];
  if (field.column === 'stats') return Array.isArray(value) ? (value as StructuredItem[]) : [];
  if (field.kind === 'json') return JSON.stringify(value ?? field.defaultValue ?? [], null, 2);
  if (field.kind === 'number') return String(value ?? field.defaultValue ?? 0);
  return String(value ?? field.defaultValue ?? '');
};

export const createInitialFormState = (config: AdminTableConfig, record?: AdminRecord | null): FormState =>
  editableFields(config).reduce<FormState>((state, field) => {
    state[field.column] = stringifyFieldValue(field, record?.[field.column] as AdminRecordValue | undefined);
    return state;
  }, {});

export const parseFieldValue = (
  field: AdminFieldConfig,
  value: string | boolean | string[] | StructuredItem[],
): AdminRecordValue => {
  if (field.kind === 'boolean') return Boolean(value);
  if (field.kind === 'number') return Number(value);
  if (field.kind === 'array') {
    if (Array.isArray(value)) {
      return value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return String(value)
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (field.column === 'socials' && Array.isArray(value)) {
    return (value as StructuredItem[])
      .map((item) => ({ label: item.label.trim(), href: (item.href ?? item.value ?? '').trim() }))
      .filter((item) => item.label && item.href);
  }
  if (field.column === 'stats' && Array.isArray(value)) {
    return (value as StructuredItem[])
      .map((item) => ({ label: item.label.trim(), value: (item.value ?? '').trim() }))
      .filter((item) => item.label && item.value);
  }
  if (field.kind === 'json') {
    const rawValue = String(value).trim();
    return rawValue ? (JSON.parse(rawValue) as AdminRecordValue) : [];
  }
  return String(value).trim() || null;
};

export const asArrayValue = (value: string | boolean | string[] | StructuredItem[] | undefined) =>
  Array.isArray(value) && value.every((item) => typeof item === 'string') ? (value as string[]) : [];

export const asStructuredItems = (value: string | boolean | string[] | StructuredItem[] | undefined): StructuredItem[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'object') ? (value as StructuredItem[]) : [];

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const displayValue = (value: AdminRecordValue | undefined): string => {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value && typeof value === 'object') return JSON.stringify(value);
  return value === null || value === undefined || value === '' ? '-' : String(value);
};

export const formatAdminDate = (value: AdminRecordValue | undefined): string => {
  if (!value) return '-';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return displayValue(value);
  return date.toLocaleDateString('en-US');
};

const cloneAdminRecordValue = (value: AdminRecordValue | undefined): AdminRecordValue | undefined => {
  if (Array.isArray(value)) {
    return value.map((item) =>
      item && typeof item === 'object' ? { ...(item as Record<string, unknown>) } : item,
    ) as AdminRecordValue;
  }
  if (value && typeof value === 'object') return { ...value };
  return value;
};

const createUniqueCopyValue = (
  value: string,
  existingValues: string[],
  formatCopy: (base: string, copyNumber: number) => string,
): string => {
  const base = value.trim() || 'record';
  const existing = new Set(existingValues.map((v) => v.toLowerCase()));
  let copyNumber = 1;
  let candidate = formatCopy(base, copyNumber);
  while (existing.has(candidate.toLowerCase())) {
    copyNumber += 1;
    candidate = formatCopy(base, copyNumber);
  }
  return candidate;
};

export const createDuplicateRecordPayload = (
  config: AdminTableConfig,
  record: AdminRecord,
  records: AdminRecord[],
): AdminRecord => {
  const payload = editableFields(config).reduce<AdminRecord>((nextRecord, field) => {
    nextRecord[field.column] = cloneAdminRecordValue(record[field.column] as AdminRecordValue | undefined);
    return nextRecord;
  }, {});

  const existingValuesFor = (column: string) =>
    records.map((r) => r[column]).filter((v): v is string => typeof v === 'string');

  if (typeof payload.slug === 'string') {
    payload.slug = createUniqueCopyValue(
      slugify(payload.slug) || 'record',
      existingValuesFor('slug'),
      (base, n) => `${base}-copy${n === 1 ? '' : `-${n}`}`,
    );
  }

  const labelColumn = ['title', 'name', 'company', 'author', 'full_name'].find(
    (col) => typeof payload[col] === 'string',
  );
  if (labelColumn && typeof payload[labelColumn] === 'string') {
    payload[labelColumn] = createUniqueCopyValue(
      payload[labelColumn] as string,
      existingValuesFor(labelColumn),
      (base, n) => `${base} (copy${n === 1 ? '' : ` ${n}`})`,
    );
  }

  if (config.fields.some((field) => field.column === 'is_published')) {
    payload.is_published = false;
  }

  return payload;
};

export const getProjectVisualKind = (record: AdminRecord): ProjectCategory => {
  return record.category as ProjectCategory;
};

export const isProjectTerminalFallback = (record: AdminRecord) => getProjectVisualKind(record) === 'Platform';

export const getProjectFallbackImage = (record: AdminRecord) => {
  const kind = getProjectVisualKind(record);
  if (kind === 'Mobile') return localAssetPath('fallback-mobile-platforms.png');
  if (kind === 'Web App') return localAssetPath('fallback-web-react-typescript.png');
  return undefined;
};
