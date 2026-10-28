import {
  Field,
  Jot,
  Section,
  Page,
  NotebookStorage,
  SearchResult,
  MoveItemParams,
  SYSTEM_GLOBAL_PAGE_ID,
} from './types';
import { StorageAdapter, MemoryStorageAdapter } from './storage';

export const DEFAULT_STORAGE_KEY = 'notebook_storage';

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function extractHostname(urlOrHost: string): string {
  if (!urlOrHost || typeof urlOrHost !== 'string') return '';
  const trimmed = urlOrHost.trim().toLowerCase();
  try {
    if (trimmed.includes('://')) {
      return new URL(trimmed).hostname;
    }
    const slashIdx = trimmed.indexOf('/');
    const hostWithPort = slashIdx !== -1 ? trimmed.slice(0, slashIdx) : trimmed;
    const colonIdx = hostWithPort.indexOf(':');
    return colonIdx !== -1 ? hostWithPort.slice(0, colonIdx) : hostWithPort;
  } catch {
    return trimmed;
  }
}

export function matchDomain(hostname: string, pattern: string): boolean {
  if (!hostname || !pattern) return false;
  hostname = hostname.toLowerCase();
  pattern = pattern.toLowerCase();

  if (pattern === '*') return true;
  if (pattern === hostname) return true;

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
    domains: ['*'],
    isPrimary: false,
    isSystem: true,
    createdAt: now,
    updatedAt: now,
    sections: [
      {
        id: 'welcome-fields',
        title: '常用快速填表 (點擊即複製)',
        type: 'fields',
        order: 0,
        createdAt: now,
        updatedAt: now,
        fields: [
          {
            id: 'field-1',
            key: '姓名',
            value: '王小明',
          },
          {
            id: 'field-2',
            key: 'Email',
            value: 'xiaoming@example.com',
          },
          {
            id: 'field-3',
            key: '電話',
            value: '0912-345-678',
          },
        ],
      },
      {
        id: 'welcome-jots',
        title: '快速隨筆 (全網通用備忘)',
        type: 'jots',
        order: 1,
        createdAt: now,
        updatedAt: now,
        jots: [
          {
            id: 'jot-1',
            content: '歡迎使用 Notebook 擴充功能！使用 Alt+N 可以隨時喚起快速輸入與搜尋。',
            createdAt: now,
          },
          {
            id: 'jot-2',
            content: '反白網頁文字後，右鍵「存為全域隨筆」可直接保存，並記錄來源網址。',
            createdAt: now,
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

  constructor(storage?: StorageAdapter, storageKey = DEFAULT_STORAGE_KEY) {
    this.storage = storage || new MemoryStorageAdapter();
    this.storageKey = storageKey;
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
      return this.init();
    }
    return this.cachedData;
  }

  private async persist(): Promise<void> {
    if (this.cachedData) {
      await this.storage.set(this.storageKey, this.cachedData);
    }
  }

  private clone<T>(val: T): T {
    return JSON.parse(JSON.stringify(val));
  }

  // ==========================================
  // Page Operations
  // ==========================================

  async getAllPages(): Promise<Page[]> {
    const data = await this.ensureInitialized();
    return Object.values(data.pages).map((p) => this.clone(p));
  }

  async getPage(id: string): Promise<Page | undefined> {
    const data = await this.ensureInitialized();
    const page = data.pages[id];
    return page ? this.clone(page) : undefined;
  }

  async getGlobalPage(): Promise<Page> {
    const data = await this.ensureInitialized();
    return this.clone(data.pages[data.systemGlobalPageId]);
  }

  async createPage(params: {
    title: string;
    domains?: string[];
    isPrimary?: boolean;
  }): Promise<Page> {
    const data = await this.ensureInitialized();
    const now = Date.now();
    const id = generateId();

    const newPage: Page = {
      id,
      title: params.title.trim(),
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

  // ==========================================
  // Section Operations
  // ==========================================

  async createSection(
    pageId: string,
    params: { title: string; type: 'fields' | 'jots'; order?: number }
  ): Promise<Section> {
    const data = await this.ensureInitialized();
    const page = data.pages[pageId];
    if (!page) {
      throw new Error(`Page not found: ${pageId}`);
    }

    const now = Date.now();
    const id = generateId();
    const order = params.order !== undefined ? params.order : page.sections.length;

    let newSection: Section;
    if (params.type === 'fields') {
      newSection = {
        id,
        title: params.title.trim(),
        type: 'fields',
        order,
        fields: [],
        createdAt: now,
        updatedAt: now,
      };
    } else {
      newSection = {
        id,
        title: params.title.trim(),
        type: 'jots',
        order,
        jots: [],
        createdAt: now,
        updatedAt: now,
      };
    }

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

    // Append any remaining sections that were not in sectionIds list
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
  // Field Operations
  // ==========================================

  async createField(
    pageId: string,
    sectionId: string,
    params: { key: string; value: string; sourceUrl?: string; sourceTitle?: string }
  ): Promise<Field> {
    const data = await this.ensureInitialized();
    const page = data.pages[pageId];
    if (!page) {
      throw new Error(`Page not found: ${pageId}`);
    }

    const section = page.sections.find((s) => s.id === sectionId);
    if (!section) {
      throw new Error(`Section not found: ${sectionId}`);
    }
    if (section.type !== 'fields') {
      throw new Error(`Section ${sectionId} is not a fields section`);
    }

    const now = Date.now();
    const field: Field = {
      id: generateId(),
      key: params.key.trim(),
      value: params.value,
      sourceUrl: params.sourceUrl,
      sourceTitle: params.sourceTitle,
    };

    section.fields.push(field);
    section.updatedAt = now;
    page.updatedAt = now;
    await this.persist();
    return this.clone(field);
  }

  async updateField(
    pageId: string,
    sectionId: string,
    fieldId: string,
    updates: Partial<Omit<Field, 'id'>>
  ): Promise<Field> {
    const data = await this.ensureInitialized();
    const page = data.pages[pageId];
    if (!page) {
      throw new Error(`Page not found: ${pageId}`);
    }

    const section = page.sections.find((s) => s.id === sectionId);
    if (!section || section.type !== 'fields') {
      throw new Error(`Fields section not found: ${sectionId}`);
    }

    const field = section.fields.find((f) => f.id === fieldId);
    if (!field) {
      throw new Error(`Field not found: ${fieldId}`);
    }

    if (updates.key !== undefined) field.key = updates.key.trim();
    if (updates.value !== undefined) field.value = updates.value;
    if (updates.sourceUrl !== undefined) field.sourceUrl = updates.sourceUrl;
    if (updates.sourceTitle !== undefined) field.sourceTitle = updates.sourceTitle;

    const now = Date.now();
    section.updatedAt = now;
    page.updatedAt = now;
    await this.persist();
    return this.clone(field);
  }

  async deleteField(pageId: string, sectionId: string, fieldId: string): Promise<void> {
    const data = await this.ensureInitialized();
    const page = data.pages[pageId];
    if (!page) {
      throw new Error(`Page not found: ${pageId}`);
    }

    const section = page.sections.find((s) => s.id === sectionId);
    if (!section || section.type !== 'fields') {
      throw new Error(`Fields section not found: ${sectionId}`);
    }

    const index = section.fields.findIndex((f) => f.id === fieldId);
    if (index === -1) {
      throw new Error(`Field not found: ${fieldId}`);
    }

    section.fields.splice(index, 1);
    const now = Date.now();
    section.updatedAt = now;
    page.updatedAt = now;
    await this.persist();
  }

  // ==========================================
  // Jot Operations
  // ==========================================

  async createJot(
    pageId: string,
    sectionId: string,
    params: { content: string; sourceUrl?: string; sourceTitle?: string }
  ): Promise<Jot> {
    const data = await this.ensureInitialized();
    const page = data.pages[pageId];
    if (!page) {
      throw new Error(`Page not found: ${pageId}`);
    }

    const section = page.sections.find((s) => s.id === sectionId);
    if (!section) {
      throw new Error(`Section not found: ${sectionId}`);
    }
    if (section.type !== 'jots') {
      throw new Error(`Section ${sectionId} is not a jots section`);
    }

    const now = Date.now();
    const jot: Jot = {
      id: generateId(),
      content: params.content,
      createdAt: now,
      sourceUrl: params.sourceUrl,
      sourceTitle: params.sourceTitle,
    };

    section.jots.push(jot);
    section.updatedAt = now;
    page.updatedAt = now;
    await this.persist();
    return this.clone(jot);
  }

  async updateJot(
    pageId: string,
    sectionId: string,
    jotId: string,
    updates: Partial<Omit<Jot, 'id' | 'createdAt'>>
  ): Promise<Jot> {
    const data = await this.ensureInitialized();
    const page = data.pages[pageId];
    if (!page) {
      throw new Error(`Page not found: ${pageId}`);
    }

    const section = page.sections.find((s) => s.id === sectionId);
    if (!section || section.type !== 'jots') {
      throw new Error(`Jots section not found: ${sectionId}`);
    }

    const jot = section.jots.find((j) => j.id === jotId);
    if (!jot) {
      throw new Error(`Jot not found: ${jotId}`);
    }

    if (updates.content !== undefined) jot.content = updates.content;
    if (updates.sourceUrl !== undefined) jot.sourceUrl = updates.sourceUrl;
    if (updates.sourceTitle !== undefined) jot.sourceTitle = updates.sourceTitle;

    const now = Date.now();
    section.updatedAt = now;
    page.updatedAt = now;
    await this.persist();
    return this.clone(jot);
  }

  async deleteJot(pageId: string, sectionId: string, jotId: string): Promise<void> {
    const data = await this.ensureInitialized();
    const page = data.pages[pageId];
    if (!page) {
      throw new Error(`Page not found: ${pageId}`);
    }

    const section = page.sections.find((s) => s.id === sectionId);
    if (!section || section.type !== 'jots') {
      throw new Error(`Jots section not found: ${sectionId}`);
    }

    const index = section.jots.findIndex((j) => j.id === jotId);
    if (index === -1) {
      throw new Error(`Jot not found: ${jotId}`);
    }

    section.jots.splice(index, 1);
    const now = Date.now();
    section.updatedAt = now;
    page.updatedAt = now;
    await this.persist();
  }

  // ==========================================
  // Domain Resolution Engine
  // ==========================================

  /**
   * Resolves the active Page for a given URL or hostname.
   * Matches against domain bindings (exact or wildcard).
   * Prioritizes isPrimary if multiple matches exist.
   * Universally falls back to SYSTEM_GLOBAL_PAGE if no match is found.
   */
  async resolveActivePage(urlOrHostname: string): Promise<Page> {
    const data = await this.ensureInitialized();
    const hostname = extractHostname(urlOrHostname);

    if (hostname) {
      const candidates = Object.values(data.pages).filter((page) => !page.isSystem);
      const matches = candidates.filter((page) =>
        page.domains.some((pattern) => matchDomain(hostname, pattern))
      );

      if (matches.length > 0) {
        // Multi-match resolution: prioritize isPrimary
        const primary = matches.find((p) => p.isPrimary);
        return this.clone(primary || matches[0]);
      }
    }

    // Fallback to SYSTEM_GLOBAL_PAGE
    const globalPage = data.pages[data.systemGlobalPageId] || data.pages[SYSTEM_GLOBAL_PAGE_ID];
    return this.clone(globalPage);
  }

  // ==========================================
  // Smart Domain Binding
  // ==========================================

  /**
   * Associates a domain to a target Page.
   */
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

  /**
   * Searches across all Pages, Sections, Fields (Key/Value), and Jots.
   * Returns formatted sourcePath: `[Page] > [Section] ‧ Key` or `[Page] > [Section]`
   */
  async search(query: string): Promise<SearchResult[]> {
    const data = await this.ensureInitialized();
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return [];
    }

    const results: SearchResult[] = [];

    for (const page of Object.values(data.pages)) {
      // 1. Check Page Title
      if (page.title.toLowerCase().includes(trimmed)) {
        results.push({
          type: 'page',
          pageId: page.id,
          pageTitle: page.title,
          item: this.clone(page),
          matchedField: 'title',
          content: page.title,
          sourcePath: `[${page.title}]`,
        });
      }

      // Check Sections
      for (const section of page.sections) {
        // 2. Check Section Title
        if (section.title.toLowerCase().includes(trimmed)) {
          results.push({
            type: 'section',
            pageId: page.id,
            pageTitle: page.title,
            sectionId: section.id,
            sectionTitle: section.title,
            item: this.clone(section),
            matchedField: 'title',
            content: section.title,
            sourcePath: `[${page.title}] > [${section.title}]`,
          });
        }

        // 3. Check Fields
        if (section.type === 'fields') {
          for (const field of section.fields) {
            const keyMatch = field.key.toLowerCase().includes(trimmed);
            const valMatch = field.value.toLowerCase().includes(trimmed);

            if (keyMatch || valMatch) {
              results.push({
                type: 'field',
                pageId: page.id,
                pageTitle: page.title,
                sectionId: section.id,
                sectionTitle: section.title,
                item: this.clone(field),
                matchedField: keyMatch ? 'key' : 'value',
                content: field.value,
                sourcePath: `[${page.title}] > [${section.title}] ‧ ${field.key}`,
              });
            }
          }
        }

        // 4. Check Jots
        if (section.type === 'jots') {
          for (const jot of section.jots) {
            if (jot.content.toLowerCase().includes(trimmed)) {
              results.push({
                type: 'jot',
                pageId: page.id,
                pageTitle: page.title,
                sectionId: section.id,
                sectionTitle: section.title,
                item: this.clone(jot),
                matchedField: 'content',
                content: jot.content,
                sourcePath: `[${page.title}] > [${section.title}]`,
              });
            }
          }
        }
      }
    }

    return results;
  }

  // ==========================================
  // Progressive Refactoring
  // ==========================================

  /**
   * Promotes an existing section directly into a new independent Page.
   * Removes the section from the source Page.
   */
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

  /**
   * Moves a Field or Jot across Pages or Sections.
   */
  async moveItem(params: MoveItemParams): Promise<void> {
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

    if (sourceSection.type !== targetSection.type) {
      throw new Error(
        `Cannot move item between mismatched section types (${sourceSection.type} -> ${targetSection.type})`
      );
    }

    const now = Date.now();

    if (sourceSection.type === 'fields' && targetSection.type === 'fields') {
      const fieldIndex = sourceSection.fields.findIndex((f) => f.id === params.itemId);
      if (fieldIndex === -1) {
        throw new Error(`Field not found: ${params.itemId}`);
      }
      const [field] = sourceSection.fields.splice(fieldIndex, 1);
      const insertIndex =
        params.targetIndex !== undefined ? params.targetIndex : targetSection.fields.length;
      targetSection.fields.splice(insertIndex, 0, field);
    } else if (sourceSection.type === 'jots' && targetSection.type === 'jots') {
      const jotIndex = sourceSection.jots.findIndex((j) => j.id === params.itemId);
      if (jotIndex === -1) {
        throw new Error(`Jot not found: ${params.itemId}`);
      }
      const [jot] = sourceSection.jots.splice(jotIndex, 1);
      const insertIndex =
        params.targetIndex !== undefined ? params.targetIndex : targetSection.jots.length;
      targetSection.jots.splice(insertIndex, 0, jot);
    }

    sourceSection.updatedAt = now;
    targetSection.updatedAt = now;
    sourcePage.updatedAt = now;
    targetPage.updatedAt = now;

    await this.persist();
  }

  // ==========================================
  // JSON Import & Export
  // ==========================================

  async exportNotebookAsJson(): Promise<string> {
    const data = await this.ensureInitialized();
    return JSON.stringify(data, null, 2);
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

    // Validate each page and section structure
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
        if (section.type !== 'fields' && section.type !== 'jots') {
          throw new Error(
            `Invalid notebook JSON format: Section type must be 'fields' or 'jots' in ${pageId}`
          );
        }
        if (section.type === 'fields' && !Array.isArray(section.fields)) {
          throw new Error(
            `Invalid notebook JSON format: fields array missing in section ${section.id}`
          );
        }
        if (section.type === 'jots' && !Array.isArray(section.jots)) {
          throw new Error(
            `Invalid notebook JSON format: jots array missing in section ${section.id}`
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
