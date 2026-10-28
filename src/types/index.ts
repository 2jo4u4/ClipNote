export interface Field {
  id: string;
  key: string;
  value: string;
  sourceUrl?: string;
  sourceTitle?: string;
}

export interface Jot {
  id: string;
  content: string;
  createdAt: number;
  sourceUrl?: string;
  sourceTitle?: string;
}

export interface BaseSection {
  id: string;
  title: string;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface FieldsSection extends BaseSection {
  type: 'fields';
  fields: Field[];
}

export interface JotsSection extends BaseSection {
  type: 'jots';
  jots: Jot[];
}

export type Section = FieldsSection | JotsSection;

export interface Page {
  id: string;
  title: string;
  domains: string[];
  isPrimary?: boolean;
  isSystem?: boolean;
  sections: Section[];
  createdAt: number;
  updatedAt: number;
}

export interface NotebookStorage {
  pages: Record<string, Page>;
  systemGlobalPageId: string;
}

export interface SearchResultItem {
  id: string;
  type: 'field' | 'jot';
  pageId: string;
  pageTitle: string;
  sectionId: string;
  sectionTitle: string;
  title: string; // Key or snippet
  content: string; // Value or content
  sourceUrl?: string;
}
