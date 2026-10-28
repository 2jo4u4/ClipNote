/**
 * NotebookService - Core Business Logic Engine
 *
 * Implements the single-seam domain layer:
 * - Deterministic Active Page Resolution with session memory
 * - Section & Cell CRUD with automatic updatedAt timestamp synchronization
 * - Omni-Search across all Pages, Sections, and Cells
 * - Section Extraction & Cross-Section Cell Moving
 * - Full & Single-Page JSON Import / Export
 */

import {
  NotebookStorage,
  Page,
  Section,
  Cell,
  CreateCellInput,
  SearchResult,
  MoveCellParams,
  SYSTEM_GLOBAL_PAGE_ID,
} from './types';
import { StorageAdapter, MemoryStorageAdapter } from './storage';

export const DEFAULT_STORAGE_KEY = 'notebook_storage_v1';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
}

/**
 * Extracts and normalizes the hostname from a URL or raw domain.
 */
export function extractHostname(urlOrDomain: string): string {
  const trimmed = urlOrDomain.trim();
  if (!trimmed) return '';

  try {
    if (trimmed.includes('://')) {
      return new URL(trimmed).hostname.toLowerCase();
    }
    // Attempt parsing as URL with protocol
    const parsed = new URL(`https://${trimmed}`);
    return parsed.hostname.toLowerCase();
  } catch {
    // Fallback: strip port and paths manually
    return trimmed.split('/')[0].split(':')[0].toLowerCase();
  }
}

/**
 * Matches a target hostname against a domain pattern (supports exact & *.domain.com wildcard).
 */
export function matchDomain(hostname: string, pattern: string): boolean {
  if (pattern === '*') return true;
  if (hostname === pattern) return true;

  if (pattern.startsWith('*.')) {
    const root = pattern.slice(2);
    return hostname === root || hostname.endsWith('.' + root);
  }

  return false;
}

export function createDefaultSeedData(): NotebookStorage {
  const now = Date.now();
  const globalPage: Page = {
    id: SYSTEM_GLOBAL_PAGE_ID,
    title: '全域筆記頁',
    icon: '🌐',
    domains: ['*'],
    isPrimary: false,
    isSystem: true,
    createdAt: now,
    updatedAt: now,
    sections: [
      {
        id: 'welcome-fields',
        title: '常用快速填表 (點擊即複製)',
        order: 0,
        createdAt: now,
        updatedAt: now,
        items: [
          {
            id: 'cell-1',
            key: '姓名',
            value: '王小明',
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'cell-2',
            key: 'Email',
            value: 'xiaoming@example.com',
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'cell-3',
            key: '電話',
            value: '0912-345-678',
            createdAt: now,
            updatedAt: now,
          },
        ],
      },
      {
        id: 'welcome-jots',
        title: '快速隨筆 (全網通用備忘)',
        order: 1,
        createdAt: now,
        updatedAt: now,
        items: [
          {
            id: 'cell-4',
            value: '歡迎使用 Notebook 擴充功能！使用 Alt+N 可以隨時喚起快速輸入與搜尋。',
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'cell-5',
            value: '反白網頁文字後，右鍵「存為全域隨筆」可直接保存，並記錄來源網址。',
            createdAt: now,
            updatedAt: now,
          },
        ],
      },
    ],
  };

  return {
    pages: {
      [SYSTEM_GLOBAL_PAGE_ID]: globalPage,
    },
    systemGlobalPageId: SYSTEM_GLOBAL_PAGE_ID,
  };
}

export class NotebookService {
  private storage: StorageAdapter;
  private storageKey: string;
  private cachedData: NotebookStorage | null = null;
  private initialized = false;
  private sessionActivePages = new Map<string, string>();

  constructor(storage?: StorageAdapter, storageKey = DEFAULT_STORAGE_KEY) {
    this.storage = storage || new MemoryStorageAdapter();
    this.storageKey = storageKey;
  }

  /**
   * Records the last active page selected for a given URL/domain during this session.
   */
  recordSessionActivePage(urlOrHostname: string, pageId: string): void {
    const hostname = extractHostname(urlOrHostname);
    if (hostname) {
      this.sessionActivePages.set(hostname, pageId);
    }
  }

  /**
   * Initializes the Notebook storage. Creates and preloads SYSTEM_GLOBAL_PAGE if not present.
   */
  async init(): Promise<NotebookStorage> {
    let data = await this.storage.get<NotebookStorage>(this.storageKey);

    if (!data || !data.pages || !data.systemGlobalPageId || !data.pages[SYSTEM_GLOBAL_PAGE_ID]) {
      data = createDefaultSeedData();
      await this.storage.set(this.storageKey, data);
    }

    this.cachedData = data;
    this.initialized = true;
    return this.clone(data);
  }

  private async ensureInitialized(): Promise<NotebookStorage> {
    if (!this.initialized || !this.cachedData) {
      await this.init();
    }
    return this.cachedData!;
  }

  private async persist(): Promise<void> {
    if (!this.cachedData) return;
    await this.storage.set(this.storageKey, this.cachedData);
  }

  private clone<T>(val: T): T {
    if (typeof structuredClone === 'function') {
      return structuredClone(val);
    }
    return JSON.parse(JSON.stringify(val));
  }

  private normalizePage(page: Page): Page {
    const cloned = this.clone(page);
    for (const sec of cloned.sections) {
      if (!sec.updatedAt) {
        sec.updatedAt = Math.max(
          sec.createdAt,
          ...sec.items.map((i) => i.updatedAt || i.createdAt || 0)
        );
      }
    }
    return cloned;
  }

  // ==========================================
  // Page Operations
  // ==========================================

  async getAllPages(): Promise<Page[]> {
    const data = await this.ensureInitialized();
    const globalPage = data.pages[data.systemGlobalPageId];
    const userPages = Object.values(data.pages).filter((p) => p.id !== data.systemGlobalPageId);
    return [this.normalizePage(globalPage), ...userPages.map((p) => this.normalizePage(p))];
  }

  async getPage(id: string): Promise<Page | undefined> {
    const data = await this.ensureInitialized();
    const page = data.pages[id];
    return page ? this.normalizePage(page) : undefined;
  }

  async getGlobalPage(): Promise<Page> {
    const data = await this.ensureInitialized();
    return this.normalizePage(data.pages[data.systemGlobalPageId]);
  }

  async createPage(params: {
    title: string;
    icon?: string;
    domains?: string[];
    isPrimary?: boolean;
  }): Promise<Page> {
    const data = await this.ensureInitialized();
    const now = Date.now();
    const id = generateId();

    const newPage: Page = {
      id,
      title: params.title.trim(),
      icon: params.icon?.trim() || undefined,
      domains: params.domains ? params.domains.map((d) => d.trim().toLowerCase()) : [],
      isPrimary: Boolean(params.isPrimary),
      isSystem: false,
      sections: [],
      createdAt: now,
      updatedAt: now,
    };

    data.pages[id] = newPage;
    await this.persist();
    return this.clone(newPage);
  }

  async updatePage(
    id: string,
    updates: Partial<Omit<Page, 'id' | 'createdAt'>>
  ): Promise<Page> {
    const data = await this.ensureInitialized();
    const page = data.pages[id];
    if (!page) {
      throw new Error(`Page not found: ${id}`);
    }

    if (page.isSystem) {
      if (updates.domains !== undefined || updates.isSystem === false) {
        throw new Error('Cannot alter domains or system status of system global page');
      }
    }

    if (updates.title !== undefined) {
      page.title = updates.title.trim();
    }
    if (updates.icon !== undefined) {
      page.icon = updates.icon ? updates.icon.trim() : undefined;
    }
    if (updates.domains !== undefined && !page.isSystem) {
      page.domains = updates.domains.map((d) => d.trim().toLowerCase());
    }
    if (updates.isPrimary !== undefined) {
      page.isPrimary = Boolean(updates.isPrimary);
    }

    page.updatedAt = Date.now();
    await this.persist();
    return this.clone(page);
  }

  async deletePage(id: string): Promise<void> {
    const data = await this.ensureInitialized();
    if (id === data.systemGlobalPageId || id === SYSTEM_GLOBAL_PAGE_ID) {
      throw new Error('Cannot delete system global page');
    }
    if (!data.pages[id]) {
      throw new Error(`Page not found: ${id}`);
    }

    delete data.pages[id];
    await this.persist();
  }

  /**
   * Persists the entire set of pages, preserving the system global page invariant.
   */
  async saveAllPages(pages: Page[]): Promise<void> {
    const data = await this.ensureInitialized();
    const newPagesRecord: Record<string, Page> = {};
    for (const page of pages) {
      newPagesRecord[page.id] = this.normalizePage(page);
    }
    if (!newPagesRecord[data.systemGlobalPageId] && data.pages[data.systemGlobalPageId]) {
      newPagesRecord[data.systemGlobalPageId] = data.pages[data.systemGlobalPageId];
    }
    data.pages = newPagesRecord;
    this.cachedData = data;
    await this.persist();
  }

  // ==========================================
  // Section Operations
  // ==========================================

  async createSection(
    pageId: string,
    params: { title: string; order?: number }
  ): Promise<Section> {
    const data = await this.ensureInitialized();
    const page = data.pages[pageId];
    if (!page) {
      throw new Error(`Page not found: ${pageId}`);
    }

    const now = Date.now();
    const id = generateId();
    const order = params.order !== undefined ? params.order : page.sections.length;

    const newSection: Section = {
      id,
      title: params.title.trim(),
      order,
      items: [],
      createdAt: now,
      updatedAt: now,
    };

    page.sections.push(newSection);
    page.updatedAt = now;
    await this.persist();
    return this.clone(newSection);
  }

  async updateSection(
    pageId: string,
    sectionId: string,
    updates: { title?: string; order?: number }
  ): Promise<Section> {
    const data = await this.ensureInitialized();
    const page = data.pages[pageId];
    if (!page) {
      throw new Error(`Page not found: ${pageId}`);
    }

    const section = page.sections.find((s) => s.id === sectionId);
    if (!section) {
      throw new Error(`Section not found: ${sectionId}`);
    }

    const now = Date.now();
    if (updates.title !== undefined) {
      section.title = updates.title.trim();
    }
    if (updates.order !== undefined) {
      section.order = updates.order;
    }
    section.updatedAt = now;
    page.updatedAt = now;

    await this.persist();
    return this.clone(section);
  }

  async deleteSection(pageId: string, sectionId: string): Promise<void> {
    const data = await this.ensureInitialized();
    const page = data.pages[pageId];
    if (!page) {
      throw new Error(`Page not found: ${pageId}`);
    }

    const index = page.sections.findIndex((s) => s.id === sectionId);
    if (index === -1) {
      throw new Error(`Section not found: ${sectionId}`);
    }

    page.sections.splice(index, 1);
    page.updatedAt = Date.now();
    await this.persist();
  }

  async reorderSections(pageId: string, sectionIds: string[]): Promise<Section[]> {
    const data = await this.ensureInitialized();
    const page = data.pages[pageId];
    if (!page) {
      throw new Error(`Page not found: ${pageId}`);
    }

    const sectionMap = new Map(page.sections.map((s) => [s.id, s]));
    const now = Date.now();
    const reordered: Section[] = [];

    sectionIds.forEach((id, index) => {
      const section = sectionMap.get(id);
      if (section) {
        section.order = index;
        section.updatedAt = now;
        reordered.push(section);
        sectionMap.delete(id);
      }
    });

    for (const remaining of sectionMap.values()) {
      remaining.order = reordered.length;
      remaining.updatedAt = now;
      reordered.push(remaining);
    }

    page.sections = reordered;
    page.updatedAt = now;
    await this.persist();
    return this.clone(reordered);
  }

  // ==========================================
  // Cell Operations (Unified Field & Jot)
  // ==========================================

  async createCell(
    pageId: string,
    sectionId: string,
    params: CreateCellInput
  ): Promise<Cell> {
    const data = await this.ensureInitialized();
    const page = data.pages[pageId];
    if (!page) {
      throw new Error(`Page not found: ${pageId}`);
    }

    const section = page.sections.find((s) => s.id === sectionId);
    if (!section) {
      throw new Error(`Section not found: ${sectionId}`);
    }

    const now = Date.now();
    const cell: Cell = {
      id: generateId(),
      key: params.key?.trim() ? params.key.trim() : undefined,
      value: params.value,
      createdAt: now,
      updatedAt: now,
      sourceUrl: params.sourceUrl,
      sourceTitle: params.sourceTitle,
    };

    section.items.push(cell);
    section.updatedAt = now;
    page.updatedAt = now;
    await this.persist();
    return this.clone(cell);
  }

  async updateCell(
    pageId: string,
    sectionId: string,
    cellId: string,
    updates: Partial<Omit<Cell, 'id' | 'createdAt'>>
  ): Promise<Cell> {
    const data = await this.ensureInitialized();
    const page = data.pages[pageId];
    if (!page) {
      throw new Error(`Page not found: ${pageId}`);
    }

    const section = page.sections.find((s) => s.id === sectionId);
    if (!section) {
      throw new Error(`Section not found: ${sectionId}`);
    }

    const cell = section.items.find((c) => c.id === cellId);
    if (!cell) {
      throw new Error(`Cell not found: ${cellId}`);
    }

    if (updates.key !== undefined) {
      cell.key = updates.key.trim() ? updates.key.trim() : undefined;
    }
    if (updates.value !== undefined) {
      cell.value = updates.value;
    }
    if (updates.sourceUrl !== undefined) {
      cell.sourceUrl = updates.sourceUrl;
    }
    if (updates.sourceTitle !== undefined) {
      cell.sourceTitle = updates.sourceTitle;
    }

    const now = Date.now();
    cell.updatedAt = now;
    section.updatedAt = now;
    page.updatedAt = now;
    await this.persist();
    return this.clone(cell);
  }

  async deleteCell(pageId: string, sectionId: string, cellId: string): Promise<void> {
    const data = await this.ensureInitialized();
    const page = data.pages[pageId];
    if (!page) {
      throw new Error(`Page not found: ${pageId}`);
    }

    const section = page.sections.find((s) => s.id === sectionId);
    if (!section) {
      throw new Error(`Section not found: ${sectionId}`);
    }

    const index = section.items.findIndex((c) => c.id === cellId);
    if (index === -1) {
      throw new Error(`Cell not found: ${cellId}`);
    }

    section.items.splice(index, 1);
    const now = Date.now();
    section.updatedAt = now;
    page.updatedAt = now;
    await this.persist();
  }

  async moveCell(params: MoveCellParams): Promise<Cell> {
    const data = await this.ensureInitialized();
    const sourcePage = data.pages[params.sourcePageId];
    if (!sourcePage) {
      throw new Error(`Source page not found: ${params.sourcePageId}`);
    }

    const targetPage = data.pages[params.targetPageId];
    if (!targetPage) {
      throw new Error(`Target page not found: ${params.targetPageId}`);
    }

    const sourceSection = sourcePage.sections.find((s) => s.id === params.sourceSectionId);
    if (!sourceSection) {
      throw new Error(`Source section not found: ${params.sourceSectionId}`);
    }

    const targetSection = targetPage.sections.find((s) => s.id === params.targetSectionId);
    if (!targetSection) {
      throw new Error(`Target section not found: ${params.targetSectionId}`);
    }

    const cellIndex = sourceSection.items.findIndex((c) => c.id === params.cellId);
    if (cellIndex === -1) {
      throw new Error(`Cell not found: ${params.cellId}`);
    }

    const [cell] = sourceSection.items.splice(cellIndex, 1);
    const insertIndex =
      params.targetIndex !== undefined ? params.targetIndex : targetSection.items.length;
    targetSection.items.splice(insertIndex, 0, cell);

    const now = Date.now();
    cell.updatedAt = now;
    sourceSection.updatedAt = now;
    targetSection.updatedAt = now;
    sourcePage.updatedAt = now;
    targetPage.updatedAt = now;

    await this.persist();
    return this.clone(cell);
  }

  /**
   * @deprecated Use moveCell instead.
   */
  async moveItem(params: MoveCellParams): Promise<void> {
    await this.moveCell(params);
  }

  // ==========================================
  // Domain Resolution Engine
  // ==========================================

  async resolveActivePage(urlOrHostname: string): Promise<Page> {
    const data = await this.ensureInitialized();
    const hostname = extractHostname(urlOrHostname);

    if (hostname) {
      const candidates = Object.values(data.pages).filter((page) => !page.isSystem);
      const matches = candidates.filter((page) =>
        page.domains.some((pattern) => matchDomain(hostname, pattern))
      );

      if (matches.length > 0) {
        // 1. Check if user previously selected a page for this domain in active session
        const sessionPageId = this.sessionActivePages.get(hostname);
        if (sessionPageId) {
          const sessionMatch = matches.find((p) => p.id === sessionPageId);
          if (sessionMatch) {
            return this.clone(sessionMatch);
          }
        }

        // 2. Prioritize isPrimary
        const primary = matches.find((p) => p.isPrimary);
        return this.clone(primary || matches[0]);
      }
    }

    // Fallback to SYSTEM_GLOBAL_PAGE
    const globalPage = data.pages[data.systemGlobalPageId] || data.pages[SYSTEM_GLOBAL_PAGE_ID];
    return this.clone(globalPage);
  }

  async bindDomainToPage(domain: string, pageId: string): Promise<Page> {
    const data = await this.ensureInitialized();
    if (pageId === data.systemGlobalPageId || pageId === SYSTEM_GLOBAL_PAGE_ID) {
      throw new Error('Cannot bind specific domains to system global page');
    }

    const page = data.pages[pageId];
    if (!page) {
      throw new Error(`Page not found: ${pageId}`);
    }

    const normalizedDomain = domain.trim().toLowerCase();
    if (!page.domains.includes(normalizedDomain)) {
      page.domains.push(normalizedDomain);
      page.updatedAt = Date.now();
      await this.persist();
    }

    return this.clone(page);
  }

  // ==========================================
  // Omni-Search Engine
  // ==========================================

  async search(query: string): Promise<SearchResult[]> {
    const data = await this.ensureInitialized();
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return [];
    }

    const results: SearchResult[] = [];

    for (const page of Object.values(data.pages)) {
      for (const section of page.sections) {
        for (const cell of section.items) {
          const keyMatch = cell.key ? cell.key.toLowerCase().includes(trimmed) : false;
          const valMatch = cell.value.toLowerCase().includes(trimmed);

          if (keyMatch || valMatch) {
            const isField = Boolean(cell.key);
            results.push({
              id: cell.id,
              type: isField ? 'field' : 'jot',
              pageId: page.id,
              pageTitle: page.title,
              sectionId: section.id,
              sectionTitle: section.title,
              title: cell.key || (cell.value.length > 30 ? cell.value.slice(0, 30) + '...' : cell.value),
              content: cell.value,
              sourcePath: `來自 [${page.title}] > [${section.title}]${cell.key ? ` ‧ ${cell.key}` : ''}`,
              sourceUrl: cell.sourceUrl,
              sourceTitle: cell.sourceTitle,
              matchedField: keyMatch ? 'key' : 'value',
            });
          }
        }
      }
    }

    return results;
  }

  // ==========================================
  // Progressive Refactoring
  // ==========================================

  async extractSectionToPage(
    sourcePageId: string,
    sectionId: string,
    newPageTitle?: string
  ): Promise<Page> {
    const data = await this.ensureInitialized();
    const sourcePage = data.pages[sourcePageId];
    if (!sourcePage) {
      throw new Error(`Source page not found: ${sourcePageId}`);
    }

    const sectionIndex = sourcePage.sections.findIndex((s) => s.id === sectionId);
    if (sectionIndex === -1) {
      throw new Error(`Section not found: ${sectionId}`);
    }

    const [extractedSection] = sourcePage.sections.splice(sectionIndex, 1);
    const now = Date.now();
    sourcePage.updatedAt = now;

    const newPageId = generateId();
    extractedSection.order = 0;
    extractedSection.updatedAt = now;

    const newPage: Page = {
      id: newPageId,
      title: (newPageTitle || extractedSection.title).trim(),
      domains: [],
      isPrimary: false,
      isSystem: false,
      sections: [extractedSection],
      createdAt: now,
      updatedAt: now,
    };

    data.pages[newPageId] = newPage;
    await this.persist();
    return this.clone(newPage);
  }

  // ==========================================
  // JSON Import & Export
  // ==========================================

  async exportNotebookAsJson(): Promise<string> {
    const data = await this.ensureInitialized();
    const normalizedPages: Record<string, Page> = {};
    for (const [id, page] of Object.entries(data.pages)) {
      normalizedPages[id] = this.normalizePage(page);
    }
    const exportData = {
      ...data,
      pages: normalizedPages,
    };
    return JSON.stringify(exportData, null, 2);
  }

  async exportPageAsJson(pageId: string): Promise<string> {
    const page = await this.getPage(pageId);
    if (!page) {
      throw new Error(`Page not found: ${pageId}`);
    }
    return JSON.stringify(page, null, 2);
  }

  async importNotebookFromJson(jsonStr: string): Promise<NotebookStorage> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      throw new Error('Invalid notebook JSON format: Malformed JSON syntax');
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Invalid notebook JSON format: Root must be an object');
    }

    const candidate = parsed as Record<string, unknown>;

    if (
      !candidate.systemGlobalPageId ||
      typeof candidate.systemGlobalPageId !== 'string' ||
      !candidate.pages ||
      typeof candidate.pages !== 'object' ||
      Array.isArray(candidate.pages)
    ) {
      throw new Error(
        'Invalid notebook JSON format: Missing systemGlobalPageId or pages dictionary'
      );
    }

    const pages = candidate.pages as Record<string, unknown>;
    if (!pages[candidate.systemGlobalPageId]) {
      throw new Error(
        `Invalid notebook JSON format: System page ${candidate.systemGlobalPageId} does not exist in pages`
      );
    }

    for (const [pageId, p] of Object.entries(pages)) {
      if (!p || typeof p !== 'object') {
        throw new Error(`Invalid notebook JSON format: Page ${pageId} is not an object`);
      }
      const page = p as Record<string, unknown>;
      if (!page.id || typeof page.id !== 'string') {
        throw new Error(`Invalid notebook JSON format: Page ${pageId} missing id string`);
      }
      if (!page.title || typeof page.title !== 'string') {
        throw new Error(`Invalid notebook JSON format: Page ${pageId} missing title string`);
      }
      if (!Array.isArray(page.domains)) {
        throw new Error(`Invalid notebook JSON format: Page ${pageId} domains must be an array`);
      }
      if (!Array.isArray(page.sections)) {
        throw new Error(`Invalid notebook JSON format: Page ${pageId} sections must be an array`);
      }

      for (const s of page.sections) {
        if (!s || typeof s !== 'object') {
          throw new Error(`Invalid notebook JSON format: Section in ${pageId} is not an object`);
        }
        const section = s as Record<string, unknown>;
        if (!section.id || typeof section.id !== 'string') {
          throw new Error(`Invalid notebook JSON format: Section missing id in ${pageId}`);
        }
        if (!section.title || typeof section.title !== 'string') {
          throw new Error(`Invalid notebook JSON format: Section missing title in ${pageId}`);
        }
        if (!Array.isArray(section.items)) {
          throw new Error(
            `Invalid notebook JSON format: items array missing in section ${section.id}`
          );
        }
      }
    }

    const validatedData = parsed as NotebookStorage;
    this.cachedData = validatedData;
    await this.persist();
    return this.clone(validatedData);
  }
}
