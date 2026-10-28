import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/globals.css';
import { QuickCaptureModal, QuickCapturePageOption, QuickCaptureSectionOption } from '../components/QuickCaptureModal';
import {
  NotebookService,
  extractHostname,
  matchDomain,
} from '../core/notebook-service';
import { ChromeStorageAdapter } from '../core/storage';
import { SearchResult, CreateCellInput } from '../types';
import { Page } from '../core/types';

interface InPageCaptureProps {
  initialContent?: string;
  sourceUrl: string;
  sourceTitle: string;
  onClose: () => void;
}

const storageAdapter = new ChromeStorageAdapter();
const notebookService = new NotebookService(storageAdapter);

function InPageQuickCaptureWrapper({
  initialContent = '',
  sourceUrl,
  sourceTitle,
  onClose,
}: InPageCaptureProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [pages, setPages] = useState<QuickCapturePageOption[]>([]);
  const [sections, setSections] = useState<QuickCaptureSectionOption[]>([]);
  const [activePageId, setActivePageId] = useState<string>('SYSTEM_GLOBAL_PAGE');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Load notebook pages and auto-resolve matching page for current hostname
  const loadData = useCallback(async () => {
    try {
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

      // Auto-resolve domain
      const host = extractHostname(sourceUrl || window.location.href);
      const matched = currentPages.find(
        (p: Page) =>
          p.domains &&
          p.domains.some((pattern: string) => matchDomain(host, pattern))
      );
      if (matched) {
        setActivePageId(matched.id);
      }
    } catch (err) {
      console.warn('[Notebook] Content script failed to load data:', err);
    }
  }, [sourceUrl]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      const allPages = await notebookService.getAllPages();
      const targetPage = allPages.find((p) => p.id === data.pageId);
      let targetSectionId = data.sectionId;

      if (!targetSectionId) {
        targetSectionId = targetPage?.sections[0]?.id;
      }
      if (!targetSectionId && targetPage) {
        const newSec = await notebookService.createSection(targetPage.id, { title: '預設分類' });
        targetSectionId = newSec.id;
      }

      if (targetSectionId) {
        await notebookService.createCell(data.pageId, targetSectionId, {
          key: data.key,
          value: data.value,
          sourceUrl: data.sourceUrl || sourceUrl || window.location.href,
          sourceTitle: data.sourceTitle || sourceTitle || document.title,
        });
      }
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

      currentUi = await createShadowRootUi(ctx, {
        name: 'notebook-quick-capture-host',
        position: 'overlay',
        anchor: 'body',
        zIndex: 2147483647,
        onMount(container) {
          const mountPoint = document.createElement('div');
          mountPoint.className = 'notebook-extension-root dark';
          container.appendChild(mountPoint);

          reactRoot = ReactDOM.createRoot(mountPoint);
          reactRoot.render(
            <React.StrictMode>
              <InPageQuickCaptureWrapper
                initialContent={content}
                sourceUrl={url || window.location.href}
                sourceTitle={title || document.title}
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
