/**
 * Core domain types for Notebook extension.
 * Strictly aligned with SPEC.md and GLOSSARY.md.
 */

export const SYSTEM_GLOBAL_PAGE_ID = 'SYSTEM_GLOBAL_PAGE';

export interface Field {
  id: string;
  key: string;
  value: string;
  createdAt?: number;
  updatedAt?: number;
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
  icon?: string; // Optional custom emoji or icon identifier, e.g. "💼", "💬", "📝"
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

export type SearchResultType = 'field' | 'jot';

export interface SearchResult {
  id: string; // Field ID or Jot ID
  type: SearchResultType;
  pageId: string;
  pageTitle: string;
  sectionId: string;
  sectionTitle: string;
  title: string; // Key name for field, or truncated content for jot
  content: string; // Value to copy
  sourcePath: string; // e.g., "來自 [104 中文經歷] > [基本資料]"
  sourceUrl?: string;
  sourceTitle?: string;
  matchedField?: 'key' | 'value' | 'content';
}

export interface MoveItemParams {
  itemId: string;
  sourcePageId: string;
  sourceSectionId: string;
  targetPageId: string;
  targetSectionId: string;
  targetIndex?: number;
}
