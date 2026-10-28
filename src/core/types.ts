/**
 * Core domain types for Notebook extension.
 * Strictly aligned with SPEC.md and GLOSSARY.md.
 */

export const SYSTEM_GLOBAL_PAGE_ID = 'SYSTEM_GLOBAL_PAGE';

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
  systemGlobalPageId: string; // "SYSTEM_GLOBAL_PAGE"
}

export type SearchResultType = 'field' | 'jot' | 'section' | 'page';

export interface SearchResult {
  type: SearchResultType;
  pageId: string;
  pageTitle: string;
  sectionId?: string;
  sectionTitle?: string;
  item: Field | Jot | Section | Page;
  matchedField: 'title' | 'key' | 'value' | 'content';
  content: string;
  sourcePath: string;
}

export interface MoveItemParams {
  itemId: string;
  sourcePageId: string;
  sourceSectionId: string;
  targetPageId: string;
  targetSectionId: string;
  targetIndex?: number;
}
