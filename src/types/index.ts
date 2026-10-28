/**
 * Unified types export for the entire Notebook application.
 * Re-exports core types to ensure a single source of truth.
 */
export * from '../core/types';
import type { SearchResult } from '../core/types';

// Alias for UI component backwards-compatibility if needed
export type SearchResultItem = SearchResult;
