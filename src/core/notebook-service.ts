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
  CellTarget,
  SearchResult,
  MoveCellParams,
  SYSTEM_GLOBAL_PAGE_ID,
  TUTORIAL_EN_PAGE_ID,
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
  const zhTutorialPage: Page = {
    id: SYSTEM_GLOBAL_PAGE_ID,
    title: '使用教學',
    icon: '💡',
    domains: [],
    isPrimary: false,
    createdAt: now,
    updatedAt: now,
    sections: [
      {
        id: 'sec-zh-shortcuts',
        title: '⌨️ 快捷鍵與即時操作',
        order: 0,
        createdAt: now,
        updatedAt: now,
        items: [
          {
            id: 'cell-zh-1',
            value: '使用快捷鍵 Alt+N 可隨時喚起快速筆記與即時搜尋視窗。',
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'cell-zh-2',
            value: '反白網頁任何文字後，點擊右鍵「存為全域隨筆」可直接保存，並自動記錄來源網址與網頁標題。',
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'cell-zh-3',
            value: '點擊任意筆記卡片即可直接將內容複製到剪貼簿。',
            createdAt: now,
            updatedAt: now,
          },
        ],
      },
      {
        id: 'sec-zh-crud',
        title: '📝 筆記與分類操作 (CRUD)',
        order: 1,
        createdAt: now,
        updatedAt: now,
        items: [
          {
            id: 'cell-zh-4',
            key: '姓名',
            value: '王小明',
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'cell-zh-5',
            key: 'Email',
            value: 'xiaoming@example.com',
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'cell-zh-6',
            value: '雙擊卡片或點擊右側鉛筆圖示進入編輯；點擊垃圾桶圖示可刪除該筆記。',
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'cell-zh-7',
            value: '點擊右上角「+」可新增筆記；點擊右上角「批次管理」可進行批次移動或刪除。',
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'cell-zh-8',
            value: '雙擊分類標題可重新命名；點擊分類右側選單可展開/收合或刪除分類。',
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'cell-zh-9',
            value: '💡 提示：本教學頁為一般筆記，您熟悉所有功能後可隨時修改或整頁刪除。',
            createdAt: now,
            updatedAt: now,
          },
        ],
      },
      {
        id: 'sec-zh-domains',
        title: '🌐 適用網站自動切換',
        order: 2,
        createdAt: now,
        updatedAt: now,
        items: [
          {
            id: 'cell-zh-10',
            value: '在新增或編輯頁面時設定「適用網站」（例如 104.com.tw、github.com），當瀏覽該網頁時，側邊欄會自動切換為對應的專屬筆記頁。',
            createdAt: now,
            updatedAt: now,
          },
        ],
      },
    ],
  };

  const enTutorialPage: Page = {
    id: TUTORIAL_EN_PAGE_ID,
    title: 'Getting Started',
    icon: '💡',
    domains: [],
    isPrimary: false,
    createdAt: now,
    updatedAt: now,
    sections: [
      {
        id: 'sec-en-shortcuts',
        title: '⌨️ Shortcuts & Instant Actions',
        order: 0,
        createdAt: now,
        updatedAt: now,
        items: [
          {
            id: 'cell-en-1',
            value: 'Press Alt+N anywhere to summon the Quick Capture and omni-search modal.',
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'cell-en-2',
            value: 'Select any text on a webpage, right-click and choose "Save to Global Note" to capture text along with source URL and page title.',
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'cell-en-3',
            value: 'Click any note card to instantly copy its value to the clipboard.',
            createdAt: now,
            updatedAt: now,
          },
        ],
      },
      {
        id: 'sec-en-crud',
        title: '📝 Note & Category Management (CRUD)',
        order: 1,
        createdAt: now,
        updatedAt: now,
        items: [
          {
            id: 'cell-en-4',
            key: 'Name',
            value: 'Alex Wang',
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'cell-en-5',
            key: 'Email',
            value: 'alex.wang@example.com',
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'cell-en-6',
            value: 'Double-click a note or click the pencil icon to edit; click the trash icon to delete.',
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'cell-en-7',
            value: 'Click "+" at the top right to add notes; use batch select to move or delete multiple notes.',
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'cell-en-8',
            value: 'Double-click a category title to rename; click the category menu to collapse or delete.',
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'cell-en-9',
            value: "💡 Tip: This guide is a standard notebook page. Feel free to edit or delete it once you're familiar with the app.",
            createdAt: now,
            updatedAt: now,
          },
        ],
      },
      {
        id: 'sec-en-domains',
        title: '🌐 Applicable Websites Auto-Switch',
        order: 2,
        createdAt: now,
        updatedAt: now,
        items: [
          {
            id: 'cell-en-10',
            value: 'Assign applicable websites (e.g., github.com, 104.com.tw) to a page, and Notebook will switch to it automatically as you browse.',
            createdAt: now,
            updatedAt: now,
          },
        ],
      },
    ],
  };

  return {
    pages: {
      [SYSTEM_GLOBAL_PAGE_ID]: zhTutorialPage,
      [TUTORIAL_EN_PAGE_ID]: enTutorialPage,
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

    const pageKeys = data?.pages ? Object.keys(data.pages) : [];
    if (!data || !data.pages || pageKeys.length === 0) {
      data = createDefaultSeedData();
      await this.storage.set(this.storageKey, data);
    } else if (!data.systemGlobalPageId || !data.pages[data.systemGlobalPageId]) {
      data.systemGlobalPageId = pageKeys[0];
      await this.storage.set(this.storageKey, data);
    }

    this.cachedData = data;
    this.initialized = true;
    return this.clone(data);
  }

  /**
   * Invalidates memory cache. Next access will re-fetch from underlying storage.
   */
  invalidateCache(): void {
    this.initialized = false;
    this.cachedData = null;
  }

  /**
   * Reloads data from underlying storage or takes incoming storage payload.
   */
  async reload(freshData?: NotebookStorage): Promise<NotebookStorage> {
    if (freshData && freshData.pages && freshData.systemGlobalPageId) {
      this.cachedData = this.clone(freshData);
      this.initialized = true;
      return this.clone(freshData);
    }
    this.initialized = false;
    this.cachedData = null;
    return this.init();
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

    if (updates.title !== undefined) {
      page.title = updates.title.trim();
    }
    if (updates.icon !== undefined) {
      page.icon = updates.icon ? updates.icon.trim() : undefined;
    }
    if (updates.domains !== undefined) {
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
    if (!data.pages[id]) {
      throw new Error(`Page not found: ${id}`);
    }
    const pageKeys = Object.keys(data.pages);
    if (pageKeys.length <= 1) {
      throw new Error('Cannot delete the last remaining page');
    }

    delete data.pages[id];
    if (data.systemGlobalPageId === id) {
      data.systemGlobalPageId = Object.keys(data.pages)[0];
    }
    await this.persist();
  }

  async deletePages(ids: string[]): Promise<void> {
    await this.reload();
    const data = await this.ensureInitialized();
    const pageKeys = Object.keys(data.pages);
    const toDelete = ids.filter((id) => data.pages[id]);

    // Always preserve at least 1 page
    if (toDelete.length >= pageKeys.length) {
      const retainId = pageKeys[0];
      const validDelete = toDelete.filter((id) => id !== retainId);
      for (const id of validDelete) {
        delete data.pages[id];
      }
      data.systemGlobalPageId = retainId;
    } else {
      for (const id of toDelete) {
        delete data.pages[id];
      }
      if (!data.pages[data.systemGlobalPageId]) {
        data.systemGlobalPageId = Object.keys(data.pages)[0];
      }
    }
    await this.persist();
  }

  /**
   * Persists the entire set of pages, preserving the system global page invariant.
   */
  async saveAllPages(pages: Page[]): Promise<void> {
    if (pages.length === 0) {
      throw new Error('Cannot delete the last remaining page');
    }
    await this.reload();
    const data = await this.ensureInitialized();
    const newPagesRecord: Record<string, Page> = {};
    for (const page of pages) {
      newPagesRecord[page.id] = this.normalizePage(page);
    }
    if (!newPagesRecord[data.systemGlobalPageId]) {
      data.systemGlobalPageId = pages[0].id;
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

  async deleteSections(pageId: string, sectionIds: string[]): Promise<void> {
    await this.reload();
    const data = await this.ensureInitialized();
    const page = data.pages[pageId];
    if (!page) {
      throw new Error(`Page not found: ${pageId}`);
    }

    const idSet = new Set(sectionIds);
    page.sections = page.sections.filter((s) => !idSet.has(s.id));
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
    sectionId: string | undefined,
    params: CreateCellInput
  ): Promise<Cell> {
    await this.reload();
    const data = await this.ensureInitialized();
    const page = data.pages[pageId];
    if (!page) {
      throw new Error(`Page not found: ${pageId}`);
    }

    let section = sectionId ? page.sections.find((s) => s.id === sectionId) : undefined;
    if (!section && page.sections.length > 0) {
      section = page.sections[0];
    }
    if (!section) {
      const now = Date.now();
      section = {
        id: generateId(),
        title: '預設分類',
        items: [],
        order: 0,
        createdAt: now,
        updatedAt: now,
      };
      page.sections.push(section);
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

  async deleteCells(
    pageId: string,
    targets: CellTarget[]
  ): Promise<void> {
    await this.reload();
    const data = await this.ensureInitialized();
    const page = data.pages[pageId];
    if (!page) {
      throw new Error(`Page not found: ${pageId}`);
    }

    const now = Date.now();
    const targetsBySection = new Map<string, Set<string>>();
    for (const t of targets) {
      if (!targetsBySection.has(t.sectionId)) {
        targetsBySection.set(t.sectionId, new Set());
      }
      targetsBySection.get(t.sectionId)!.add(t.cellId);
    }

    for (const [secId, cellIdSet] of targetsBySection.entries()) {
      const section = page.sections.find((s) => s.id === secId);
      if (section) {
        section.items = section.items.filter((c) => !cellIdSet.has(c.id));
        section.updatedAt = now;
      }
    }
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

  async resolveActivePage(urlOrHostname: string, preferredLocale?: string): Promise<Page> {
    const data = await this.ensureInitialized();
    const hostname = extractHostname(urlOrHostname);

    if (hostname) {
      const candidates = Object.values(data.pages).filter(
        (page) => page.domains && page.domains.some((d) => d !== '*')
      );
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

    // Fallback: check effective locale (preferredLocale or navigator.language)
    const effectiveLocale =
      preferredLocale ||
      (typeof navigator !== 'undefined' && navigator.language ? navigator.language : undefined);

    if (effectiveLocale) {
      if (effectiveLocale.toLowerCase().startsWith('zh')) {
        const zhPage = Object.values(data.pages).find(
          (p) => p.id === SYSTEM_GLOBAL_PAGE_ID
        );
        if (zhPage) return this.clone(zhPage);
      } else {
        // Any non-Chinese locale (English, Japanese, French, etc.) falls back to Getting Started (en)
        const enPage = Object.values(data.pages).find(
          (p) => p.id === TUTORIAL_EN_PAGE_ID
        );
        if (enPage) return this.clone(enPage);
      }
    }

    // Fallback to SYSTEM_GLOBAL_PAGE or first existing page
    const globalPage =
      data.pages[data.systemGlobalPageId] ||
      data.pages[SYSTEM_GLOBAL_PAGE_ID] ||
      Object.values(data.pages)[0];
    return this.clone(globalPage);
  }

  async bindDomainToPage(domain: string, pageId: string): Promise<Page> {
    const data = await this.ensureInitialized();
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
