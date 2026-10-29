import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  NotebookService,
  matchDomain,
  extractHostname,
} from '../src/core/notebook-service';
import { MemoryStorageAdapter, ChromeStorageAdapter } from '../src/core/storage';
import { SYSTEM_GLOBAL_PAGE_ID, TUTORIAL_EN_PAGE_ID } from '../src/core/types';

describe('Domain Utility Functions', () => {
  describe('extractHostname', () => {
    it('extracts hostnames from standard URLs', () => {
      expect(extractHostname('https://www.104.com.tw/job/123')).toBe('www.104.com.tw');
      expect(extractHostname('http://threads.net/@user/post')).toBe('threads.net');
      expect(extractHostname('https://sub.domain.co.uk:8080/path?q=1')).toBe('sub.domain.co.uk');
    });

    it('handles naked domains and domain strings with leading whitespace', () => {
      expect(extractHostname('   104.com.tw   ')).toBe('104.com.tw');
      expect(extractHostname('x.com/explore')).toBe('x.com');
    });

    it('returns empty string on empty input', () => {
      expect(extractHostname('')).toBe('');
      expect(extractHostname('   ')).toBe('');
    });
  });

  describe('matchDomain', () => {
    it('matches universal wildcard *', () => {
      expect(matchDomain('anything.com', '*')).toBe(true);
      expect(matchDomain('localhost', '*')).toBe(true);
    });

    it('matches exact hostnames', () => {
      expect(matchDomain('104.com.tw', '104.com.tw')).toBe(true);
      expect(matchDomain('www.104.com.tw', '104.com.tw')).toBe(false);
    });

    it('matches wildcard root and subdomains (*.example.com)', () => {
      expect(matchDomain('example.com', '*.example.com')).toBe(true);
      expect(matchDomain('sub.example.com', '*.example.com')).toBe(true);
      expect(matchDomain('deep.sub.example.com', '*.example.com')).toBe(true);
      expect(matchDomain('notexample.com', '*.example.com')).toBe(false);
    });
  });
});

describe('Storage Adapters', () => {
  describe('MemoryStorageAdapter', () => {
    it('sets, gets, removes, and isolates mutated data via structuredClone', async () => {
      const adapter = new MemoryStorageAdapter();
      const obj = { nested: { count: 1 } };

      await adapter.set('key1', obj);
      obj.nested.count = 999; // mutate local

      const retrieved = await adapter.get<{ nested: { count: number } }>('key1');
      expect(retrieved?.nested.count).toBe(1);

      await adapter.remove('key1');
      expect(await adapter.get('key1')).toBeUndefined();

      await adapter.set('k1', 1);
      await adapter.set('k2', 2);
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

describe('NotebookService Core Business Logic (Unified Cell & Flexible Section)', () => {
  let storage: MemoryStorageAdapter;
  let service: NotebookService;

  beforeEach(async () => {
    storage = new MemoryStorageAdapter();
    service = new NotebookService(storage);
    await service.init();
  });

  describe('Initialization & System Global Page Invariants', () => {
    it('creates two bilingual onboarding tutorial pages on fresh initialization', async () => {
      const pages = await service.getAllPages();
      expect(pages.length).toBe(2);

      const zhPage = await service.getPage(SYSTEM_GLOBAL_PAGE_ID);
      expect(zhPage).toBeDefined();
      expect(zhPage?.title).toBe('使用教學');
      expect(zhPage?.icon).toBe('💡');
      expect(zhPage?.sections.length).toBe(3);

      // Section 1: Shortcuts
      const zhSec1 = zhPage!.sections[0];
      expect(zhSec1.title).toContain('快捷鍵與即時操作');
      expect(zhSec1.items.length).toBe(3);
      expect(zhSec1.items[0].value).toContain('Alt+N');

      // Section 2: CRUD & Key-Value Demo
      const zhSec2 = zhPage!.sections[1];
      expect(zhSec2.title).toContain('筆記與分類操作');
      expect(zhSec2.items.find((c) => c.key === '姓名')?.value).toBe('王小明');
      expect(zhSec2.items.find((c) => c.key === 'Email')?.value).toBe('xiaoming@example.com');
      expect(zhSec2.items.some((c) => c.value.includes('提示'))).toBe(true);

      // Section 3: Applicable Websites
      const zhSec3 = zhPage!.sections[2];
      expect(zhSec3.title).toContain('適用網站自動切換');
      expect(zhSec3.items.length).toBeGreaterThanOrEqual(1);

      // English Tutorial Page
      const enPage = await service.getPage(TUTORIAL_EN_PAGE_ID);
      expect(enPage).toBeDefined();
      expect(enPage?.title).toBe('Getting Started');
      expect(enPage?.icon).toBe('💡');
      expect(enPage?.sections.length).toBe(3);

      const enSec1 = enPage!.sections[0];
      expect(enSec1.title).toContain('Shortcuts & Instant Actions');
      expect(enSec1.items.length).toBe(3);
      expect(enSec1.items[0].value).toContain('Alt+N');

      const enSec2 = enPage!.sections[1];
      expect(enSec2.title).toContain('Note & Category Management');
      expect(enSec2.items.find((c) => c.key === 'Name')?.value).toBe('Alex Wang');
      expect(enSec2.items.find((c) => c.key === 'Email')?.value).toBe('alex.wang@example.com');
      expect(enSec2.items.some((c) => c.value.includes('Tip:'))).toBe(true);

      const enSec3 = enPage!.sections[2];
      expect(enSec3.title).toContain('Applicable Websites Auto-Switch');
      expect(enSec3.items.length).toBeGreaterThanOrEqual(1);
    });

    it('allows deleting either tutorial page immediately on fresh install', async () => {
      // Initially 2 pages exist
      const initialPages = await service.getAllPages();
      expect(initialPages.length).toBe(2);

      // Delete the English page immediately
      await service.deletePage(TUTORIAL_EN_PAGE_ID);
      expect(await service.getPage(TUTORIAL_EN_PAGE_ID)).toBeUndefined();
      expect(await service.getPage(SYSTEM_GLOBAL_PAGE_ID)).toBeDefined();

      const remainingPages = await service.getAllPages();
      expect(remainingPages.length).toBe(1);

      // Now with only 1 page left, deleting the last page is prohibited
      await expect(service.deletePage(SYSTEM_GLOBAL_PAGE_ID)).rejects.toThrow(
        'Cannot delete the last remaining page'
      );
    });

    it('allows deleting SYSTEM_GLOBAL_PAGE if other pages exist', async () => {
      const page1 = await service.createPage({ title: 'New Secondary Page' });
      await service.deletePage(SYSTEM_GLOBAL_PAGE_ID);
      expect(await service.getPage(SYSTEM_GLOBAL_PAGE_ID)).toBeUndefined();
      expect(await service.getPage(page1.id)).toBeDefined();
    });

    it('preserves surviving pages on re-initialization and reload after SYSTEM_GLOBAL_PAGE has been deleted', async () => {
      const page1 = await service.createPage({ title: 'My Surviving Custom Page' });
      await service.deletePage(SYSTEM_GLOBAL_PAGE_ID);

      // Re-initialize a new service instance with same storage
      const newService = new NotebookService(storage);
      await newService.init();

      expect(await newService.getPage(page1.id)).toBeDefined();
      expect((await newService.getPage(page1.id))?.title).toBe('My Surviving Custom Page');
      expect(await newService.getPage(SYSTEM_GLOBAL_PAGE_ID)).toBeUndefined();
    });

    it('allows modifying domains on SYSTEM_GLOBAL_PAGE', async () => {
      const updated = await service.updatePage(SYSTEM_GLOBAL_PAGE_ID, { domains: ['example.com'] });
      expect(updated.domains).toEqual(['example.com']);
    });

    it('allows binding specific domains to SYSTEM_GLOBAL_PAGE', async () => {
      const bound = await service.bindDomainToPage('github.com', SYSTEM_GLOBAL_PAGE_ID);
      expect(bound.domains).toContain('github.com');
    });

    it('allows title updates to SYSTEM_GLOBAL_PAGE', async () => {
      const updated = await service.updatePage(SYSTEM_GLOBAL_PAGE_ID, {
        title: '我的全域頁面',
      });
      expect(updated.title).toBe('我的全域頁面');
    });
  });

  describe('Page CRUD & Domain Binding', () => {
    it('creates and retrieves a new user page with custom icon', async () => {
      const page = await service.createPage({
        title: '104 中文經歷',
        icon: '💼',
        domains: ['*.104.com.tw', '104.com.tw'],
        isPrimary: true,
      });

      expect(page.id).toBeDefined();
      expect(page.title).toBe('104 中文經歷');
      expect(page.icon).toBe('💼');
      expect(page.domains).toEqual(['*.104.com.tw', '104.com.tw']);
      expect(page.isPrimary).toBe(true);
      expect(page.isSystem).toBe(false);

      const retrieved = await service.getPage(page.id);
      expect(retrieved?.id).toBe(page.id);
      expect(retrieved?.icon).toBe('💼');
    });

    it('updates page metadata including custom icon and handles deletion', async () => {
      const page = await service.createPage({ title: '社交平台貼文', icon: '📝', domains: ['x.com'] });

      const updated = await service.updatePage(page.id, {
        title: '社群貼文工作區',
        icon: '💬',
        domains: ['x.com', 'threads.net', 'facebook.com'],
      });

      expect(updated.title).toBe('社群貼文工作區');
      expect(updated.icon).toBe('💬');
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

  describe('Section Operations & Mixed Item Support', () => {
    it('creates, updates, reorders, and deletes sections without rigid type segregation', async () => {
      const page = await service.createPage({ title: '履歷總表' });

      const sec1 = await service.createSection(page.id, { title: '個人資訊' });
      const sec2 = await service.createSection(page.id, { title: '自傳摘要' });

      expect(sec1.id).toBeDefined();
      expect(sec1.title).toBe('個人資訊');
      expect(sec1.items).toEqual([]);

      const updatedSec1 = await service.updateSection(page.id, sec1.id, { title: '基本背景' });
      expect(updatedSec1.title).toBe('基本背景');

      const reordered = await service.reorderSections(page.id, [sec2.id, sec1.id]);
      expect(reordered[0].id).toBe(sec2.id);
      expect(reordered[1].id).toBe(sec1.id);

      await service.deleteSection(page.id, sec1.id);
      const updatedPage = await service.getPage(page.id);
      expect(updatedPage?.sections.length).toBe(1);
      expect(updatedPage?.sections[0].id).toBe(sec2.id);
    });

    it('allows a section to hold both Fields and Jots simultaneously', async () => {
      const page = await service.createPage({ title: '專案工作區' });
      const section = await service.createSection(page.id, { title: '架構設計' });

      // Add a Field (has key)
      const fieldCell = await service.createCell(page.id, section.id, {
        key: '技術架構',
        value: 'React + TypeScript + Tailwind',
      });
      expect(fieldCell.key).toBe('技術架構');
      expect(fieldCell.value).toBe('React + TypeScript + Tailwind');

      // Add a Jot (no key)
      const jotCell = await service.createCell(page.id, section.id, {
        value: '需注意 Safari 瀏覽器在彈窗模糊特效上的效能瓶頸。',
      });
      expect(jotCell.key).toBeUndefined();
      expect(jotCell.value).toContain('Safari');

      const fetchedPage = await service.getPage(page.id);
      const fetchedSection = fetchedPage?.sections.find((s) => s.id === section.id);
      expect(fetchedSection?.items.length).toBe(2);
      expect(fetchedSection?.items[0].key).toBe('技術架構');
      expect(fetchedSection?.items[1].key).toBeUndefined();
    });
  });

  describe('Cell Operations & Timestamps', () => {
    it('creates, updates, and deletes Cells while synchronizing section and page updatedAt', async () => {
      const page = await service.createPage({ title: '測試分頁' });
      const section = await service.createSection(page.id, { title: '測試區塊' });
      const initialSectionUpdatedAt = section.updatedAt;

      // Small delay to verify timestamp tick
      await new Promise((r) => setTimeout(r, 10));

      // Create Cell
      const cell = await service.createCell(page.id, section.id, {
        key: 'Email',
        value: 'test@example.com',
        sourceUrl: 'https://example.com',
      });
      expect(cell.id).toBeDefined();
      expect(cell.createdAt).toBeDefined();
      expect(cell.updatedAt).toBe(cell.createdAt);

      const pageAfterCreate = await service.getPage(page.id);
      const secAfterCreate = pageAfterCreate?.sections[0];
      expect(secAfterCreate?.updatedAt).toBeGreaterThanOrEqual(initialSectionUpdatedAt);

      // Update Cell
      await new Promise((r) => setTimeout(r, 10));
      const updatedCell = await service.updateCell(page.id, section.id, cell.id, {
        value: 'updated@example.com',
      });
      expect(updatedCell.value).toBe('updated@example.com');
      expect(updatedCell.updatedAt).toBeGreaterThan(cell.createdAt);

      // Delete Cell
      await service.deleteCell(page.id, section.id, cell.id);
      const pageAfterDelete = await service.getPage(page.id);
      expect(pageAfterDelete?.sections[0].items.length).toBe(0);
    });

    it('moves Cells across sections and pages', async () => {
      const pageA = await service.createPage({ title: 'Page A' });
      const secA = await service.createSection(pageA.id, { title: 'Sec A' });

      const pageB = await service.createPage({ title: 'Page B' });
      const secB = await service.createSection(pageB.id, { title: 'Sec B' });

      const cell1 = await service.createCell(pageA.id, secA.id, { key: 'K1', value: 'V1' });
      const cell2 = await service.createCell(pageA.id, secA.id, { key: 'K2', value: 'V2' });

      // Move cell1 from pageA/secA to pageB/secB
      const moved = await service.moveCell({
        cellId: cell1.id,
        sourcePageId: pageA.id,
        sourceSectionId: secA.id,
        targetPageId: pageB.id,
        targetSectionId: secB.id,
      });

      expect(moved.id).toBe(cell1.id);

      const pA = await service.getPage(pageA.id);
      expect(pA?.sections[0].items.length).toBe(1);
      expect(pA?.sections[0].items[0].id).toBe(cell2.id);

      const pB = await service.getPage(pageB.id);
      expect(pB?.sections[0].items.length).toBe(1);
      expect(pB?.sections[0].items[0].id).toBe(cell1.id);
    });
  });

  describe('Domain Resolution Engine', () => {
    it('matches exact and wildcard domains and defaults to SYSTEM_GLOBAL_PAGE', async () => {
      const p104 = await service.createPage({
        title: '104 中文經歷',
        domains: ['*.104.com.tw', '104.com.tw'],
        isPrimary: true,
      });

      const matched1 = await service.resolveActivePage('https://www.104.com.tw/job/123');
      expect(matched1.id).toBe(p104.id);

      const matched2 = await service.resolveActivePage('https://sub.deep.104.com.tw/profile');
      expect(matched2.id).toBe(p104.id);

      const fallback = await service.resolveActivePage('https://unrelated-domain.com');
      expect(fallback.id).toBe(SYSTEM_GLOBAL_PAGE_ID);
    });

    it('supports locale-aware fallback when no domain matches', async () => {
      const enResolved = await service.resolveActivePage('https://random.com', 'en');
      expect(enResolved.id).toBe(TUTORIAL_EN_PAGE_ID);
      expect(enResolved.title).toBe('Getting Started');

      const zhResolved = await service.resolveActivePage('https://random.com', 'zh-TW');
      expect(zhResolved.id).toBe(SYSTEM_GLOBAL_PAGE_ID);
      expect(zhResolved.title).toBe('使用教學');
    });

    it('prioritizes session memory over isPrimary if user selected another page in current session', async () => {
      const primaryPage = await service.createPage({
        title: 'Primary 104',
        domains: ['104.com.tw'],
        isPrimary: true,
      });

      const secondaryPage = await service.createPage({
        title: 'Secondary 104',
        domains: ['104.com.tw'],
        isPrimary: false,
      });

      // Default before session selection: primary
      expect((await service.resolveActivePage('104.com.tw')).id).toBe(primaryPage.id);

      // User selects secondary page in active session
      service.recordSessionActivePage('104.com.tw', secondaryPage.id);
      expect((await service.resolveActivePage('104.com.tw')).id).toBe(secondaryPage.id);
    });
  });

  describe('Omni-Search Engine', () => {
    it('searches across all cells, matching key or value, and indicates dynamic type', async () => {
      const page = await service.createPage({ title: '工作履歷' });
      const sec = await service.createSection(page.id, { title: '重要資訊' });

      await service.createCell(page.id, sec.id, { key: '私人專線', value: '0988-123-456' });
      await service.createCell(page.id, sec.id, { value: '記得在下週二前撥打私人專線聯絡人資。' });

      // Search by key
      const results1 = await service.search('私人專線');
      expect(results1.length).toBe(2);
      expect(results1.map((r) => r.type)).toContain('field');
      expect(results1.map((r) => r.type)).toContain('jot');
      expect(results1[0].sourcePath).toContain('來自 [工作履歷] > [重要資訊]');

      // Search by value across field
      const results2 = await service.search('0988-123-456');
      expect(results2.length).toBe(1);
      expect(results2[0].type).toBe('field');
      expect(results2[0].sourcePath).toContain('來自 [工作履歷] > [重要資訊]');

      // Empty query returns empty array
      expect(await service.search('')).toEqual([]);
      expect(await service.search('   ')).toEqual([]);
    });
  });

  describe('Section Extraction & JSON Import/Export', () => {
    it('extracts a section into a new independent page', async () => {
      const sourcePage = await service.createPage({ title: '雜記總簿' });
      const sec = await service.createSection(sourcePage.id, { title: '專案構想' });
      await service.createCell(sourcePage.id, sec.id, { value: '構想 1' });

      const newPage = await service.extractSectionToPage(sourcePage.id, sec.id, '專案構想獨立頁');
      expect(newPage.id).toBeDefined();
      expect(newPage.title).toBe('專案構想獨立頁');
      expect(newPage.sections.length).toBe(1);
      expect(newPage.sections[0].items.length).toBe(1);

      const srcPageAfter = await service.getPage(sourcePage.id);
      expect(srcPageAfter?.sections.length).toBe(0);
    });

    it('exports and imports valid notebook JSON accurately', async () => {
      const page = await service.createPage({ title: 'Export Test', icon: '🚀' });
      const sec = await service.createSection(page.id, { title: 'Sec' });
      await service.createCell(page.id, sec.id, { key: 'K', value: 'V' });

      const json = await service.exportNotebookAsJson();
      expect(json).toContain('Export Test');
      expect(json).toContain('🚀');

      const newStorage = new MemoryStorageAdapter();
      const newService = new NotebookService(newStorage);
      await newService.importNotebookFromJson(json);

      const importedPage = await newService.getPage(page.id);
      expect(importedPage?.title).toBe('Export Test');
      expect(importedPage?.icon).toBe('🚀');
      expect(importedPage?.sections[0].items[0].value).toBe('V');
    });

    it('rejects malformed or invalid notebook JSON', async () => {
      await expect(service.importNotebookFromJson('not a json')).rejects.toThrow(
        'Malformed JSON syntax'
      );
      await expect(service.importNotebookFromJson('[]')).rejects.toThrow('Root must be an object');
      await expect(service.importNotebookFromJson('{}')).rejects.toThrow(
        'Missing systemGlobalPageId or pages dictionary'
      );
    });

    it('reloads fresh data across multiple service instances sharing underlying storage', async () => {
      // Simulate two separate extension contexts sharing the same storage
      const sharedStorage = new MemoryStorageAdapter();
      const serviceA = new NotebookService(sharedStorage);
      const serviceB = new NotebookService(sharedStorage);

      await serviceA.init();
      await serviceB.init();

      // serviceA creates a new page
      const newPage = await serviceA.createPage({ title: 'Context A Page' });

      // serviceB's cache would be stale without reload()
      await serviceB.reload();
      const pageFromB = await serviceB.getPage(newPage.id);
      expect(pageFromB?.title).toBe('Context A Page');
    });

    it('falls back to first section if sectionId is undefined or omitted in createCell', async () => {
      const page = await service.createPage({ title: 'Fallback Page' });
      await service.createSection(page.id, { title: 'First Section' });
      await service.createSection(page.id, { title: 'Second Section' });

      const cell = await service.createCell(page.id, undefined, { value: 'Auto Section Cell' });
      expect(cell.value).toBe('Auto Section Cell');

      const pageAfter = await service.getPage(page.id);
      expect(pageAfter?.sections[0].items[0].id).toBe(cell.id);
    });

    it('auto-creates a default section titled 預設分類 if target page has no sections', async () => {
      const page = await service.createPage({ title: 'Empty Sections Page' });
      // page currently has 0 sections
      expect(page.sections.length).toBe(0);

      const cell = await service.createCell(page.id, undefined, { value: 'No Section Cell' });
      expect(cell.value).toBe('No Section Cell');

      const pageAfter = await service.getPage(page.id);
      expect(pageAfter?.sections.length).toBe(1);
      expect(pageAfter?.sections[0].title).toBe('預設分類');
      expect(pageAfter?.sections[0].items[0].id).toBe(cell.id);
    });

    it('batch deletes custom pages while preserving at least one page', async () => {
      const page1 = await service.createPage({ title: 'Page 1' });
      const page2 = await service.createPage({ title: 'Page 2' });
      const page3 = await service.createPage({ title: 'Page 3' });

      // Attempt to batch delete Page 1, Page 2 and SYSTEM_GLOBAL_PAGE
      await service.deletePages([page1.id, page2.id, SYSTEM_GLOBAL_PAGE_ID]);

      expect(await service.getPage(page1.id)).toBeUndefined();
      expect(await service.getPage(page2.id)).toBeUndefined();
      expect(await service.getPage(page3.id)).toBeDefined();
    });

    it('batch deletes sections within a page', async () => {
      const page = await service.createPage({ title: 'Batch Sections Page' });
      const secA = await service.createSection(page.id, { title: 'Sec A' });
      const secB = await service.createSection(page.id, { title: 'Sec B' });
      const secC = await service.createSection(page.id, { title: 'Sec C' });

      await service.deleteSections(page.id, [secA.id, secC.id]);
      const pageAfter = await service.getPage(page.id);
      expect(pageAfter?.sections.length).toBe(1);
      expect(pageAfter?.sections[0].id).toBe(secB.id);
    });

    it('batch deletes cells across multiple sections of a page', async () => {
      const page = await service.createPage({ title: 'Batch Cells Page' });
      const sec1 = await service.createSection(page.id, { title: 'Sec 1' });
      const sec2 = await service.createSection(page.id, { title: 'Sec 2' });

      const c1 = await service.createCell(page.id, sec1.id, { value: 'Cell 1' });
      const c2 = await service.createCell(page.id, sec1.id, { value: 'Cell 2' });
      const c3 = await service.createCell(page.id, sec2.id, { value: 'Cell 3' });
      const c4 = await service.createCell(page.id, sec2.id, { value: 'Cell 4' });

      await service.deleteCells(page.id, [
        { sectionId: sec1.id, cellId: c1.id },
        { sectionId: sec2.id, cellId: c4.id },
      ]);

      const pageAfter = await service.getPage(page.id);
      expect(pageAfter?.sections[0].items.map((i) => i.id)).toEqual([c2.id]);
      expect(pageAfter?.sections[1].items.map((i) => i.id)).toEqual([c3.id]);
    });
  });
});
