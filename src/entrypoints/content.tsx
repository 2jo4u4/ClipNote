import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/globals.css';
import { QuickCaptureModal, QuickCapturePageOption, QuickCaptureSectionOption } from '../components/QuickCaptureModal';
import {
  NotebookService,
  DEFAULT_STORAGE_KEY,
} from '../core/notebook-service';
import { ChromeStorageAdapter } from '../core/storage';
import { SearchResult, CreateCellInput } from '../types';
import { Page } from '../core/types';
import type { Language } from '../i18n';
import {
  LANGUAGE_STORAGE_KEY,
  THEME_STORAGE_KEY,
  Theme,
  isLanguage,
  isTheme,
  resolveStoredPreferences,
} from '../core/theme';

interface InPageCaptureProps {
  initialContent?: string;
  sourceUrl: string;
  sourceTitle: string;
  initialLanguage: Language;
  onThemeChange: (theme: Theme) => void;
  onClose: () => void;
}

const storageAdapter = new ChromeStorageAdapter();
const notebookService = new NotebookService(storageAdapter);

function InPageQuickCaptureWrapper({
  initialContent = '',
  sourceUrl,
  sourceTitle,
  initialLanguage,
  onThemeChange,
  onClose,
}: InPageCaptureProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [pages, setPages] = useState<QuickCapturePageOption[]>([]);
  const [sections, setSections] = useState<QuickCaptureSectionOption[]>([]);
  const [activePageId, setActivePageId] = useState<string>('SYSTEM_GLOBAL_PAGE');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Load notebook pages and auto-resolve matching page for current hostname
  const loadData = useCallback(async (preferredLocale?: Language) => {
    try {
      await notebookService.reload();
      const currentPages = await notebookService.getAllPages();

      const pageOptions: QuickCapturePageOption[] = currentPages.map((p: Page) => ({
        id: p.id,
        title: `${p.icon ? p.icon + ' ' : ''}${p.title}`,
        isSystem: p.isSystem,
      }));

      const sectionOptions: QuickCaptureSectionOption[] = [];
      for (const p of currentPages) {
        for (const s of p.sections) {
          sectionOptions.push({
            id: s.id,
            title: s.title,
            pageId: p.id,
          });
        }
      }

      setPages(pageOptions);
      setSections(sectionOptions);

      // Auto-resolve active page with prioritization
      const targetUrl = sourceUrl || window.location.href;
      const resolved = await notebookService.resolveActivePage(
        targetUrl,
        preferredLocale || language
      );
      setActivePageId(resolved.id);
    } catch (err) {
      console.warn('[Notebook] Content script failed to load data:', err);
    }
  }, [sourceUrl, language]);

  useEffect(() => {
    loadData(language);
  }, [loadData, language]);

  // Listen for live language, theme, and notebook storage updates from SidePanel
  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.storage?.onChanged) return;

    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName !== 'local') return;

      if (changes[LANGUAGE_STORAGE_KEY]) {
        const nextLang = changes[LANGUAGE_STORAGE_KEY].newValue;
        if (isLanguage(nextLang)) {
          setLanguage(nextLang);
        }
      }

      if (changes[THEME_STORAGE_KEY]) {
        const nextTheme = changes[THEME_STORAGE_KEY].newValue;
        if (isTheme(nextTheme)) {
          onThemeChange(nextTheme);
        }
      }

      if (changes[DEFAULT_STORAGE_KEY]) {
        loadData();
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [loadData, onThemeChange]);

  const handleSearchQueryChange = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await notebookService.search(query);
      setSearchResults(results);
    } catch (err) {
      console.warn('[Notebook] Search failed:', err);
    }
  };

  const handleSaveCell = async (
    data: CreateCellInput & { pageId: string; sectionId?: string }
  ) => {
    try {
      await notebookService.createCell(data.pageId, data.sectionId, {
        key: data.key,
        value: data.value,
        sourceUrl: data.sourceUrl || sourceUrl || window.location.href,
        sourceTitle: data.sourceTitle || sourceTitle || document.title,
      });
    } catch (err) {
      console.warn('[Notebook] Failed to create cell:', err);
    }
    setIsOpen(false);
    onClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    <QuickCaptureModal
      isOpen={isOpen}
      language={language}
      onClose={handleClose}
      pages={pages}
      sections={sections}
      activePageId={activePageId}
      defaultContent={initialContent}
      sourceUrl={sourceUrl || window.location.href}
      sourceTitle={sourceTitle || document.title}
      searchResults={searchResults}
      onSearchQueryChange={handleSearchQueryChange}
      onSaveCell={handleSaveCell}
    />
  );
}

export default defineContentScript({
  matches: ['<all_urls>'],
  cssInjectionMode: 'ui',
  async main(ctx) {
    let currentUi: any = null;
    let reactRoot: ReactDOM.Root | null = null;

    const summonModal = async (content = '', url = '', title = '') => {
      // Remove previous UI if already mounted
      if (currentUi) {
        if (reactRoot) {
          reactRoot.unmount();
          reactRoot = null;
        }
        currentUi.remove();
        currentUi = null;
      }

      const { language: initialLanguage, theme: initialTheme } =
        await resolveStoredPreferences();

      currentUi = await createShadowRootUi(ctx, {
        name: 'notebook-quick-capture-host',
        position: 'modal',
        anchor: 'html',
        zIndex: 2147483647,
        css: ':host { position: fixed !important; inset: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 2147483647 !important; pointer-events: auto !important; display: block !important; }',
        onMount(container) {
          const mountPoint = document.createElement('div');
          mountPoint.className =
            initialTheme === 'light'
              ? 'notebook-extension-root'
              : 'notebook-extension-root dark';
          container.appendChild(mountPoint);

          reactRoot = ReactDOM.createRoot(mountPoint);
          reactRoot.render(
            <React.StrictMode>
              <InPageQuickCaptureWrapper
                initialContent={content}
                sourceUrl={url || window.location.href}
                sourceTitle={title || document.title}
                initialLanguage={initialLanguage}
                onThemeChange={(nextTheme) => {
                  mountPoint.classList.toggle('dark', nextTheme === 'dark');
                }}
                onClose={() => {
                  if (reactRoot) {
                    reactRoot.unmount();
                    reactRoot = null;
                  }
                  if (currentUi) {
                    currentUi.remove();
                    currentUi = null;
                  }
                }}
              />
            </React.StrictMode>
          );
        },
        onRemove() {
          if (reactRoot) {
            reactRoot.unmount();
            reactRoot = null;
          }
        },
      });

      currentUi.mount();
    };

    // Listen for background messages (Context Menu & Commands: Alt+N)
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'OPEN_QUICK_CAPTURE') {
        const payload = message.payload || {};
        const selectedText = payload.content || window.getSelection()?.toString() || '';
        summonModal(selectedText, payload.sourceUrl || window.location.href, payload.sourceTitle || document.title);
        sendResponse({ success: true });
      }
    });
  },
});
