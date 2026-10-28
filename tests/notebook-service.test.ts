import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  NotebookService,
  MemoryStorageAdapter,
  ChromeStorageAdapter,
  SYSTEM_GLOBAL_PAGE_ID,
  extractHostname,
  matchDomain,
} from '../src/core';
import type { FieldsSection, JotsSection } from '../src/core';

describe('Domain Helper Functions', () => {
  it('extractHostname correctly parses diverse URL schemes and formats', () => {
    expect(extractHostname('https://www.google.com/search?q=test')).toBe('www.google.com');
    expect(extractHostname('http://pda.104.com.tw/job/123')).toBe('pda.104.com.tw');
    expect(extractHostname('sub.domain.com:8080/path')).toBe('sub.domain.com');
    expect(extractHostname('github.com')).toBe('github.com');
    expect(extractHostname('')).toBe('');
  });

  it('matchDomain correctly handles exact, wildcard, and fallback rules', () => {
    expect(matchDomain('x.com', 'x.com')).toBe(true);
    expect(matchDomain('X.COM', 'x.com')).toBe(true);
    expect(matchDomain('threads.net', 'x.com')).toBe(false);

    // Wildcard matching
    expect(matchDomain('pda.104.com.tw', '*.104.com.tw')).toBe(true);
    expect(matchDomain('www.104.com.tw', '*.104.com.tw')).toBe(true);
    expect(matchDomain('104.com.tw', '*.104.com.tw')).toBe(true);
    expect(matchDomain('fake104.com.tw', '*.104.com.tw')).toBe(false);

    // Universal wildcard
    expect(matchDomain('any-site.org', '*')).toBe(true);
  });
});

describe('Storage Adapters', () => {
  describe('MemoryStorageAdapter', () => {
    it('sets, gets, removes, and clears data without reference leaking', async () => {
      const adapter = new MemoryStorageAdapter();
      const obj = { foo: 'bar', nested: { count: 1 } };

      await adapter.set('myKey', obj);
      const retrieved = await adapter.get<typeof obj>('myKey');

      expect(retrieved).toEqual(obj);
      expect(retrieved).not.toBe(obj); // Cloned

      // Mutating retrieved should not affect storage
      if (retrieved) retrieved.nested.count = 999;
      const reRetrieved = await adapter.get<typeof obj>('myKey');
      expect(reRetrieved?.nested.count).toBe(1);

      await adapter.remove('myKey');
      expect(await adapter.get('myKey')).toBeUndefined();

      await adapter.set('k1', 'v1');
      await adapter.set('k2', 'v2');
      await adapter.clear();
      expect(await adapter.get('k1')).toBeUndefined();
      expect(await adapter.get('k2')).toBeUndefined();
    });
  });

  describe('ChromeStorageAdapter', () => {
    it('interacts with mock chrome.storage.local API', async () => {
      const mockStore: Record<string, any> = {};
      const fakeChromeStorage = {
        get: vi.fn((keys: string[], cb: (res: any) => void) => {
          const res: Record<string, any> = {};
          keys.forEach((k) => {
            res[k] = mockStore[k];
          });
          cb(res);
        }),
        set: vi.fn((items: Record<string, any>, cb: () => void) => {
          Object.assign(mockStore, items);
          cb();
        }),
        remove: vi.fn((key: string, cb: () => void) => {
          delete mockStore[key];
          cb();
        }),
        clear: vi.fn((cb: () => void) => {
          for (const k in mockStore) delete mockStore[k];
          cb();
        }),
      } as unknown as typeof chrome.storage.local;

      const adapter = new ChromeStorageAdapter(fakeChromeStorage);

      await adapter.set('testKey', { a: 1 });
      expect(fakeChromeStorage.set).toHaveBeenCalled();

      const val = await adapter.get<{ a: number }>('testKey');
      expect(val).toEqual({ a: 1 });

      await adapter.remove('testKey');
      expect(fakeChromeStorage.remove).toHaveBeenCalled();

      await adapter.clear();
      expect(fakeChromeStorage.clear).toHaveBeenCalled();
    });

    it('falls back to in-memory adapter if chrome.storage is not present in environment', async () => {
      const adapter = new ChromeStorageAdapter(undefined);
      await adapter.set('fallbackKey', 'fallbackVal');
      const res = await adapter.get<string>('fallbackKey');
      expect(res).toBe('fallbackVal');
    });
  });
});

describe('NotebookService Core Business Logic', () => {
  let storage: MemoryStorageAdapter;
  let service: NotebookService;

  beforeEach(async () => {
    storage = new MemoryStorageAdapter();
    service = new NotebookService(storage);
    await service.init();
  });

  describe('Initialization & System Global Page Invariants', () => {
    it('creates SYSTEM_GLOBAL_PAGE with seed onboarding fields and jots on fresh initialization', async () => {
      const pages = await service.getAllPages();
      expect(pages.length).toBe(1);

      const globalPage = await service.getGlobalPage();
      expect(globalPage.id).toBe(SYSTEM_GLOBAL_PAGE_ID);
      expect(globalPage.title).toBe('全域筆記頁');
      expect(globalPage.isSystem).toBe(true);
      expect(globalPage.sections.length).toBe(2);

      // Verify onboarding FieldsSection
      const fieldsSec = globalPage.sections[0] as FieldsSection;
      expect(fieldsSec.type).toBe('fields');
      expect(fieldsSec.fields.length).toBe(3);
      expect(fieldsSec.fields.map((f) => f.key)).toContain('姓名');
      expect(fieldsSec.fields.map((f) => f.key)).toContain('Email');
      expect(fieldsSec.fields.map((f) => f.key)).toContain('電話');

      // Verify onboarding JotsSection
      const jotsSec = globalPage.sections[1] as JotsSection;
      expect(jotsSec.type).toBe('jots');
      expect(jotsSec.jots.length).toBe(2);
      expect(jotsSec.jots[0].content).toContain('Alt+N');
    });

    it('prohibits deleting SYSTEM_GLOBAL_PAGE', async () => {
      await expect(service.deletePage(SYSTEM_GLOBAL_PAGE_ID)).rejects.toThrow(
        'Cannot delete system global page'
      );
    });

    it('prohibits modifying domains or revoking system status of SYSTEM_GLOBAL_PAGE', async () => {
      await expect(
        service.updatePage(SYSTEM_GLOBAL_PAGE_ID, { domains: ['example.com'] })
      ).rejects.toThrow('Cannot alter domains or system status of system global page');

      await expect(
        service.updatePage(SYSTEM_GLOBAL_PAGE_ID, { isSystem: false })
      ).rejects.toThrow('Cannot alter domains or system status of system global page');
    });

    it('prohibits binding specific domains to SYSTEM_GLOBAL_PAGE', async () => {
      await expect(
        service.bindDomainToPage('example.com', SYSTEM_GLOBAL_PAGE_ID)
      ).rejects.toThrow('Cannot bind specific domains to system global page');
    });

    it('allows harmless title updates to SYSTEM_GLOBAL_PAGE', async () => {
      const updated = await service.updatePage(SYSTEM_GLOBAL_PAGE_ID, {
        title: '我的全域頁面',
      });
      expect(updated.title).toBe('我的全域頁面');
    });
  });

  describe('Page CRUD & Domain Binding', () => {
    it('creates and retrieves a new user page', async () => {
      const page = await service.createPage({
        title: '104 中文經歷',
        domains: ['*.104.com.tw', '104.com.tw'],
        isPrimary: true,
      });

      expect(page.id).toBeDefined();
      expect(page.title).toBe('104 中文經歷');
      expect(page.domains).toEqual(['*.104.com.tw', '104.com.tw']);
      expect(page.isPrimary).toBe(true);
      expect(page.isSystem).toBe(false);

      const retrieved = await service.getPage(page.id);
      expect(retrieved?.id).toBe(page.id);
    });

    it('updates page metadata and handles deletion', async () => {
      const page = await service.createPage({ title: '社交平台貼文', domains: ['x.com'] });

      const updated = await service.updatePage(page.id, {
        title: '社群貼文工作區',
        domains: ['x.com', 'threads.net', 'facebook.com'],
      });

      expect(updated.title).toBe('社群貼文工作區');
      expect(updated.domains).toContain('threads.net');

      await service.deletePage(page.id);
      const afterDelete = await service.getPage(page.id);
      expect(afterDelete).toBeUndefined();
    });

    it('throws error when updating or deleting non-existent page', async () => {
      await expect(service.updatePage('non-existent-id', { title: 'Test' })).rejects.toThrow(
        'Page not found'
      );
      await expect(service.deletePage('non-existent-id')).rejects.toThrow('Page not found');
    });
  });

  describe('Section CRUD & Ordering', () => {
    it('creates, updates, and deletes fields and jots sections', async () => {
      const page = await service.createPage({ title: '專案履歷' });

      // Create FieldsSection
      const fieldsSec = (await service.createSection(page.id, {
        title: '基本資訊',
        type: 'fields',
      })) as FieldsSection;

      expect(fieldsSec.id).toBeDefined();
      expect(fieldsSec.type).toBe('fields');
      expect(fieldsSec.order).toBe(0);

      // Create JotsSection
      const jotsSec = (await service.createSection(page.id, {
        title: '備忘草稿',
        type: 'jots',
      })) as JotsSection;

      expect(jotsSec.id).toBeDefined();
      expect(jotsSec.type).toBe('jots');
      expect(jotsSec.order).toBe(1);

      // Update Section
      const updatedSec = await service.updateSection(page.id, fieldsSec.id, {
        title: '個人基本資料',
      });
      expect(updatedSec.title).toBe('個人基本資料');

      // Delete Section
      await service.deleteSection(page.id, jotsSec.id);
      const updatedPage = await service.getPage(page.id);
      expect(updatedPage?.sections.length).toBe(1);
      expect(updatedPage?.sections[0].id).toBe(fieldsSec.id);
    });

    it('reorders sections accurately', async () => {
      const page = await service.createPage({ title: '測試排序' });
      const secA = await service.createSection(page.id, { title: 'A', type: 'fields' });
      const secB = await service.createSection(page.id, { title: 'B', type: 'fields' });
      const secC = await service.createSection(page.id, { title: 'C', type: 'fields' });

      const reordered = await service.reorderSections(page.id, [secC.id, secA.id, secB.id]);
      expect(reordered[0].id).toBe(secC.id);
      expect(reordered[0].order).toBe(0);
      expect(reordered[1].id).toBe(secA.id);
      expect(reordered[1].order).toBe(1);
      expect(reordered[2].id).toBe(secB.id);
      expect(reordered[2].order).toBe(2);
    });
  });

  describe('Field & Jot CRUD with Source Tracking', () => {
    it('creates, edits, and deletes fields within a FieldsSection', async () => {
      const page = await service.createPage({ title: '求職履歷' });
      const sec = (await service.createSection(page.id, {
        title: '工作經驗',
        type: 'fields',
      })) as FieldsSection;

      const field = await service.createField(page.id, sec.id, {
        key: '現任職稱',
        value: '資深前端架構師',
        sourceUrl: 'https://example.com/job',
        sourceTitle: '職缺詳情',
      });

      expect(field.id).toBeDefined();
      expect(field.key).toBe('現任職稱');
      expect(field.value).toBe('資深前端架構師');
      expect(field.sourceUrl).toBe('https://example.com/job');
      expect(field.sourceTitle).toBe('職缺詳情');

      // Update Field
      const updated = await service.updateField(page.id, sec.id, field.id, {
        value: '首席工程師',
      });
      expect(updated.value).toBe('首席工程師');

      // Delete Field
      await service.deleteField(page.id, sec.id, field.id);
      const pageAfter = await service.getPage(page.id);
      const secAfter = pageAfter?.sections.find((s) => s.id === sec.id) as FieldsSection;
      expect(secAfter.fields.length).toBe(0);
    });

    it('creates, edits, and deletes jots within a JotsSection', async () => {
      const page = await service.createPage({ title: '靈感隨手記' });
      const sec = (await service.createSection(page.id, {
        title: '靈感列表',
        type: 'jots',
      })) as JotsSection;

      const jot = await service.createJot(page.id, sec.id, {
        content: '記得研究 Vite 6 plugin 架構',
        sourceUrl: 'https://vitejs.dev',
      });

      expect(jot.id).toBeDefined();
      expect(jot.content).toBe('記得研究 Vite 6 plugin 架構');
      expect(jot.createdAt).toBeGreaterThan(0);

      // Update Jot
      const updatedJot = await service.updateJot(page.id, sec.id, jot.id, {
        content: '記得研究 Vite 6 與 WXT 架構',
      });
      expect(updatedJot.content).toBe('記得研究 Vite 6 與 WXT 架構');

      // Delete Jot
      await service.deleteJot(page.id, sec.id, jot.id);
      const pageAfter = await service.getPage(page.id);
      const secAfter = pageAfter?.sections.find((s) => s.id === sec.id) as JotsSection;
      expect(secAfter.jots.length).toBe(0);
    });

    it('rejects adding fields to jots sections and vice versa', async () => {
      const page = await service.createPage({ title: '型別隔離測試' });
      const fSec = await service.createSection(page.id, { title: '欄位區', type: 'fields' });
      const jSec = await service.createSection(page.id, { title: '隨筆區', type: 'jots' });

      await expect(
        service.createField(page.id, jSec.id, { key: 'K', value: 'V' })
      ).rejects.toThrow('is not a fields section');

      await expect(
        service.createJot(page.id, fSec.id, { content: 'C' })
      ).rejects.toThrow('is not a jots section');
    });
  });

  describe('Active Page Resolution Logic', () => {
    it('resolves exact domain matches', async () => {
      const page = await service.createPage({
        title: 'Twitter 貼文草稿',
        domains: ['x.com'],
      });

      const resolved = await service.resolveActivePage('https://x.com/home');
      expect(resolved.id).toBe(page.id);
    });

    it('resolves wildcard subdomain matches', async () => {
      const page = await service.createPage({
        title: '104 專用履歷',
        domains: ['*.104.com.tw'],
      });

      const pdaResolved = await service.resolveActivePage('https://pda.104.com.tw/job/123');
      expect(pdaResolved.id).toBe(page.id);

      const rootResolved = await service.resolveActivePage('https://104.com.tw/company');
      expect(rootResolved.id).toBe(page.id);
    });

    it('prioritizes isPrimary when multiple pages match the same domain', async () => {
      const secondaryPage = await service.createPage({
        title: '次要履歷頁',
        domains: ['cake.me'],
        isPrimary: false,
      });

      const primaryPage = await service.createPage({
        title: '主力履歷頁',
        domains: ['cake.me'],
        isPrimary: true,
      });

      const resolved = await service.resolveActivePage('https://cake.me/jobs');
      expect(resolved.id).toBe(primaryPage.id);

      // Session memory overrides isPrimary when user explicitly selects another page
      service.recordSessionActivePage('cake.me', secondaryPage.id);
      const sessionResolved = await service.resolveActivePage('https://cake.me/jobs');
      expect(sessionResolved.id).toBe(secondaryPage.id);
    });

    it('universally falls back to SYSTEM_GLOBAL_PAGE on unmatched domains', async () => {
      const resolved = await service.resolveActivePage('https://unmatched-domain-random.com/abc');
      expect(resolved.id).toBe(SYSTEM_GLOBAL_PAGE_ID);
      expect(resolved.isSystem).toBe(true);
    });
  });

  describe('Omni-Search Engine', () => {
    beforeEach(async () => {
      // Set up search corpus
      const page1 = await service.createPage({ title: '工程經歷與專案' });
      const sec1 = await service.createSection(page1.id, {
        title: '技術棧',
        type: 'fields',
      });
      await service.createField(page1.id, sec1.id, {
        key: '核心語言',
        value: 'TypeScript 與 React',
      });
      await service.createField(page1.id, sec1.id, {
        key: '專長說明',
        value: '專精微前端與性能優化',
      });

      const sec2 = await service.createSection(page1.id, {
        title: '雜記隨筆',
        type: 'jots',
      });
      await service.createJot(page1.id, sec2.id, {
        content: '記得準備明天下午兩點的面試',
      });
    });

    it('searches across Field Key, Field Value, and Jot content returning copyable flat items', async () => {
      // 1. Match Field Key
      const keyResults = await service.search('核心語言');
      expect(
        keyResults.some(
          (r) =>
            r.type === 'field' &&
            r.title === '核心語言' &&
            r.content === 'TypeScript 與 React' &&
            r.sourcePath === '來自 [工程經歷與專案] > [技術棧] ‧ 核心語言'
        )
      ).toBe(true);

      // 2. Match Field Value
      const valResults = await service.search('微前端');
      expect(
        valResults.some(
          (r) =>
            r.type === 'field' &&
            r.title === '專長說明' &&
            r.content === '專精微前端與性能優化' &&
            r.sourcePath === '來自 [工程經歷與專案] > [技術棧] ‧ 專長說明'
        )
      ).toBe(true);

      // 3. Match Jot content
      const jotResults = await service.search('面試');
      expect(
        jotResults.some(
          (r) =>
            r.type === 'jot' &&
            r.sourcePath === '來自 [工程經歷與專案] > [雜記隨筆]' &&
            r.content.includes('面試')
        )
      ).toBe(true);
    });

    it('returns empty array for empty or whitespace query', async () => {
      expect(await service.search('')).toEqual([]);
      expect(await service.search('   ')).toEqual([]);
    });
  });

  describe('Smart Domain Binding', () => {
    it('binds domain to an existing page and enables active resolution', async () => {
      const page = await service.createPage({ title: 'Cake 履歷頁' });

      // Initially unmatched -> fallback to global
      const beforeBinding = await service.resolveActivePage('https://cake.me/job/1');
      expect(beforeBinding.id).toBe(SYSTEM_GLOBAL_PAGE_ID);

      // Perform Smart Domain Binding
      const updatedPage = await service.bindDomainToPage('cake.me', page.id);
      expect(updatedPage.domains).toContain('cake.me');

      // Now matches
      const afterBinding = await service.resolveActivePage('https://cake.me/job/1');
      expect(afterBinding.id).toBe(page.id);
    });

    it('does not duplicate existing bound domains', async () => {
      const page = await service.createPage({ title: '重複綁定測試', domains: ['test.com'] });
      await service.bindDomainToPage('test.com', page.id);
      const fetched = await service.getPage(page.id);
      expect(fetched?.domains.filter((d) => d === 'test.com').length).toBe(1);
    });
  });

  describe('Progressive Refactoring (Section Extraction & Item Moving)', () => {
    it('extracts a section into an independent Page and removes it from the source Page', async () => {
      const globalPage = await service.getGlobalPage();
      const secToExtract = globalPage.sections[0]; // 'welcome-fields'

      const extractedPage = await service.extractSectionToPage(
        globalPage.id,
        secToExtract.id,
        '獨立常用資訊頁'
      );

      expect(extractedPage.id).toBeDefined();
      expect(extractedPage.title).toBe('獨立常用資訊頁');
      expect(extractedPage.sections.length).toBe(1);
      expect(extractedPage.sections[0].id).toBe(secToExtract.id);
      expect(extractedPage.sections[0].order).toBe(0);

      // Verify source global page no longer has this section
      const updatedGlobal = await service.getGlobalPage();
      expect(updatedGlobal.sections.some((s) => s.id === secToExtract.id)).toBe(false);
    });

    it('moves a field between compatible FieldsSections across pages', async () => {
      const page1 = await service.createPage({ title: 'Page 1' });
      const sec1 = (await service.createSection(page1.id, {
        title: 'Sec 1',
        type: 'fields',
      })) as FieldsSection;
      const field = await service.createField(page1.id, sec1.id, {
        key: 'GitHub',
        value: 'https://github.com/octocat',
      });

      const page2 = await service.createPage({ title: 'Page 2' });
      const sec2 = (await service.createSection(page2.id, {
        title: 'Sec 2',
        type: 'fields',
      })) as FieldsSection;

      // Move field from page1/sec1 to page2/sec2
      await service.moveItem({
        itemId: field.id,
        sourcePageId: page1.id,
        sourceSectionId: sec1.id,
        targetPageId: page2.id,
        targetSectionId: sec2.id,
      });

      const p1Updated = await service.getPage(page1.id);
      const s1 = p1Updated?.sections.find((s) => s.id === sec1.id) as FieldsSection;
      expect(s1.fields.length).toBe(0);

      const p2Updated = await service.getPage(page2.id);
      const s2 = p2Updated?.sections.find((s) => s.id === sec2.id) as FieldsSection;
      expect(s2.fields.length).toBe(1);
      expect(s2.fields[0].id).toBe(field.id);
      expect(s2.fields[0].key).toBe('GitHub');
    });

    it('moves a jot between compatible JotsSections', async () => {
      const page1 = await service.createPage({ title: 'Jot Page 1' });
      const sec1 = (await service.createSection(page1.id, {
        title: 'Jot Sec 1',
        type: 'jots',
      })) as JotsSection;
      const jot = await service.createJot(page1.id, sec1.id, { content: '重要通知' });

      const page2 = await service.createPage({ title: 'Jot Page 2' });
      const sec2 = (await service.createSection(page2.id, {
        title: 'Jot Sec 2',
        type: 'jots',
      })) as JotsSection;

      await service.moveItem({
        itemId: jot.id,
        sourcePageId: page1.id,
        sourceSectionId: sec1.id,
        targetPageId: page2.id,
        targetSectionId: sec2.id,
      });

      const p1Updated = await service.getPage(page1.id);
      const s1 = p1Updated?.sections.find((s) => s.id === sec1.id) as JotsSection;
      expect(s1.jots.length).toBe(0);

      const p2Updated = await service.getPage(page2.id);
      const s2 = p2Updated?.sections.find((s) => s.id === sec2.id) as JotsSection;
      expect(s2.jots.length).toBe(1);
      expect(s2.jots[0].content).toBe('重要通知');
    });

    it('rejects moving items between mismatched section types', async () => {
      const page = await service.createPage({ title: '跨型別防護' });
      const fSec = (await service.createSection(page.id, {
        title: 'F',
        type: 'fields',
      })) as FieldsSection;
      const jSec = (await service.createSection(page.id, {
        title: 'J',
        type: 'jots',
      })) as JotsSection;

      const field = await service.createField(page.id, fSec.id, { key: 'K', value: 'V' });

      await expect(
        service.moveItem({
          itemId: field.id,
          sourcePageId: page.id,
          sourceSectionId: fSec.id,
          targetPageId: page.id,
          targetSectionId: jSec.id,
        })
      ).rejects.toThrow('Cannot move item between mismatched section types');
    });
  });

  describe('JSON Export & Import', () => {
    it('exports and successfully re-imports notebook storage', async () => {
      await service.createPage({ title: '匯出測試頁', domains: ['export.io'] });

      const exportedJson = await service.exportNotebookAsJson();
      expect(typeof exportedJson).toBe('string');
      expect(exportedJson).toContain('匯出測試頁');
      expect(exportedJson).toContain(SYSTEM_GLOBAL_PAGE_ID);

      // Create a fresh new service instance with fresh storage
      const freshStorage = new MemoryStorageAdapter();
      const freshService = new NotebookService(freshStorage);

      const importedStorage = await freshService.importNotebookFromJson(exportedJson);
      expect(importedStorage.systemGlobalPageId).toBe(SYSTEM_GLOBAL_PAGE_ID);
      expect(Object.values(importedStorage.pages).some((p) => p.title === '匯出測試頁')).toBe(true);

      const retrievedPages = await freshService.getAllPages();
      expect(retrievedPages.some((p) => p.title === '匯出測試頁')).toBe(true);
    });

    it('exports a single Page as an independent JSON string', async () => {
      const page = await service.createPage({ title: '單頁匯出測試', domains: ['single.org'] });
      await service.createSection(page.id, { title: '測試區段', type: 'fields' });

      const pageJson = await service.exportPageAsJson(page.id);
      expect(typeof pageJson).toBe('string');
      const parsed = JSON.parse(pageJson);
      expect(parsed.id).toBe(page.id);
      expect(parsed.title).toBe('單頁匯出測試');
      expect(parsed.sections.length).toBe(1);

      await expect(service.exportPageAsJson('non-existent-page')).rejects.toThrow(
        'Page not found: non-existent-page'
      );
    });

    it('rejects invalid or malformed JSON payloads with descriptive errors', async () => {
      // 1. Syntax error
      await expect(service.importNotebookFromJson('{ malformed JSON')).rejects.toThrow(
        'Malformed JSON syntax'
      );

      // 2. Non-object
      await expect(service.importNotebookFromJson('["array"]')).rejects.toThrow(
        'Root must be an object'
      );

      // 3. Missing systemGlobalPageId
      await expect(service.importNotebookFromJson(JSON.stringify({ pages: {} }))).rejects.toThrow(
        'Missing systemGlobalPageId or pages dictionary'
      );

      // 4. systemGlobalPageId not present in pages
      await expect(
        service.importNotebookFromJson(
          JSON.stringify({ systemGlobalPageId: 'MISSING', pages: {} })
        )
      ).rejects.toThrow('System page MISSING does not exist in pages');

      // 5. Malformed page
      await expect(
        service.importNotebookFromJson(
          JSON.stringify({
            systemGlobalPageId: 'SYS',
            pages: {
              SYS: { id: 'SYS' }, // missing title, domains, sections
            },
          })
        )
      ).rejects.toThrow('missing title string');

      // 6. Malformed section
      await expect(
        service.importNotebookFromJson(
          JSON.stringify({
            systemGlobalPageId: 'SYS',
            pages: {
              SYS: {
                id: 'SYS',
                title: 'Global',
                domains: [],
                sections: [{ id: 's1', title: 'Sec', type: 'unknown_type' }],
              },
            },
          })
        )
      ).rejects.toThrow("Section type must be 'fields' or 'jots'");
    });
  });
});
