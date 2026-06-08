export type StructuredItem = {
  label: string;
  value?: string;
  href?: string;
};

export type FormState = Record<string, string | boolean | string[] | StructuredItem[]>;

export type ProjectVisualKind = 'mobile' | 'web' | 'terminal';

export type PendingAssetChange = {
  file?: File;
  remove?: boolean;
};
