import React, { useEffect, useState, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import '../../styles/globals.css';
import { SidePanel } from '../../components/SidePanel';
import {
  NotebookService,
  extractHostname,
  DEFAULT_STORAGE_KEY,
} from '../../core/notebook-service';
import { ChromeStorageAdapter } from '../../core/storage';
import { Page, NotebookStorage } from '../../core/types';

const storageAdapter = new ChromeStorageAdapter();
const notebookService = new NotebookService(storageAdapter);

function ExtensionSidePanelApp() {
  const [pages, setPages] = useState<Page[]>([]);
  const [currentDomain, setCurrentDomain] = useState<string>('');
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Initial load from NotebookService
  const loadNotebookData = useCallback(async (freshData?: NotebookStorage) => {
    try {
      await notebookService.reload(freshData);
      const allPages = await notebookService.getAllPages();
      setPages(allPages);
    } catch (err) {
      console.warn('[Notebook] Failed to load data:', err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 2. Resolve Active Tab Domain & URL
  const updateActiveTabInfo = useCallback(async () => {
    if (typeof chrome === 'undefined' || !chrome.tabs) return;

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.url) {
        setCurrentUrl(tab.url);
        const host = extractHostname(tab.url);
        setCurrentDomain(host);
      }
    } catch (err) {
      console.warn('[Notebook] Failed to query active tab:', err);
    }
  }, []);

  useEffect(() => {
    loadNotebookData();
    updateActiveTabInfo();

    if (typeof chrome === 'undefined') return;

    // Listen to tab switches in Chrome
    const handleTabActivated = () => {
      updateActiveTabInfo();
    };

    const handleTabUpdated = (_tabId: number, changeInfo: { url?: string }, tab: chrome.tabs.Tab) => {
      if (changeInfo.url || tab.url) {
        updateActiveTabInfo();
      }
    };

    if (chrome.tabs?.onActivated) {
      chrome.tabs.onActivated.addListener(handleTabActivated);
    }
    if (chrome.tabs?.onUpdated) {
      chrome.tabs.onUpdated.addListener(handleTabUpdated);
    }

    // Listen to storage changes from Content Script or other contexts
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && changes[DEFAULT_STORAGE_KEY]) {
        const fresh = changes[DEFAULT_STORAGE_KEY].newValue as NotebookStorage | undefined;
        loadNotebookData(fresh);
      }
    };

    if (chrome.storage?.onChanged) {
      chrome.storage.onChanged.addListener(handleStorageChange);
    }

    return () => {
      if (chrome.tabs?.onActivated) {
        chrome.tabs.onActivated.removeListener(handleTabActivated);
      }
      if (chrome.tabs?.onUpdated) {
        chrome.tabs.onUpdated.removeListener(handleTabUpdated);
      }
      if (chrome.storage?.onChanged) {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      }
    };
  }, [loadNotebookData, updateActiveTabInfo]);

  // Handle updates made in SidePanel UI
  const handlePagesChange = async (newPages: Page[]) => {
    setPages(newPages);
    try {
      await notebookService.saveAllPages(newPages);
    } catch (err) {
      console.warn('[Notebook] Failed to persist pages:', err);
    }
  };

  const handleActivePageChange = (pageId: string) => {
    if (currentDomain) {
      notebookService.recordSessionActivePage(currentDomain, pageId);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-raycast-light-bg dark:bg-raycast-dark-bg text-raycast-amber text-xs font-mono">
        載入筆記本中...
      </div>
    );
  }

  return (
    <SidePanel
      pages={pages}
      currentDomain={currentDomain}
      currentUrl={currentUrl}
      onPagesChange={handlePagesChange}
      onActivePageChange={handleActivePageChange}
      className="h-full w-full"
    />
  );
}

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <ExtensionSidePanelApp />
    </React.StrictMode>
  );
}
