/**
 * Core domain types for Notebook extension.
 * Strictly aligned with SPEC.md and GLOSSARY.md.
 */

export const SYSTEM_GLOBAL_PAGE_ID = 'SYSTEM_GLOBAL_PAGE';

/**
 * Cell is the atomic unit of content in a Section.
 * - If key is present and non-empty: treated as a Field (key-value pair).
 * - If key is omitted or empty: treated as a Jot (freeform memo/note).
 */
export interface Cell {
  id: string;
  key?: string;
  value: string;
  createdAt: number;
  updatedAt: number;
  sourceUrl?: string;
  sourceTitle?: string;
}

/**
 * Common input payload for creating a new Cell.
 */
export interface CreateCellInput {
  key?: string;
  value: string;
  sourceUrl?: string;
  sourceTitle?: string;
}

/**
 * Section is a flexible container within a Page holding an ordered list of Cells.
 */
export interface Section {
  id: string;
  title: string;
  items: Cell[];
  order: number;
  createdAt: number;
  updatedAt: number;
}

/**
 * Page is a thematic document or workspace tab that binds to target web domains.
 */
export interface Page {
  id: string;
  title: string;
  icon?: string;
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
  id: string; // Cell ID
  type: SearchResultType; // 'field' if cell.key exists, otherwise 'jot'
  pageId: string;
  pageTitle: string;
  sectionId: string;
  sectionTitle: string;
  title: string; // Key name for field, or truncated value for jot
  content: string; // cell.value
  sourcePath: string; // e.g. "來自 [104 中文經歷] > [工作經驗欄位]"
  sourceUrl?: string;
  sourceTitle?: string;
  matchedField?: 'key' | 'value';
}

export interface MoveCellParams {
  cellId: string;
  sourcePageId: string;
  sourceSectionId: string;
  targetPageId: string;
  targetSectionId: string;
  targetIndex?: number;
}

/**
 * @deprecated Use MoveCellParams instead.
 */
export type MoveItemParams = MoveCellParams;
