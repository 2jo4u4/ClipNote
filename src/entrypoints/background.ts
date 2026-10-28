import { createDefaultSeedData, DEFAULT_STORAGE_KEY } from '../core/notebook-service';
import { ChromeStorageAdapter } from '../core/storage';

export default defineBackground(() => {
  // 1. Configure Side Panel to automatically open when clicking the extension icon
  if (typeof chrome !== 'undefined' && chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((err) => console.warn('[Notebook] Failed to setPanelBehavior:', err));
  }

  // 2. Initialize Seed Data and Context Menus on Installation
  chrome.runtime.onInstalled.addListener(async () => {
    // Seed initial demo data if storage is empty
    const storageAdapter = new ChromeStorageAdapter();
    const existing = await storageAdapter.get(DEFAULT_STORAGE_KEY);
    if (!existing) {
      const seed = createDefaultSeedData();
      await storageAdapter.set(DEFAULT_STORAGE_KEY, seed);
      console.log('[Notebook] Initialized default seed data in storage.');
    }

    // Register Right-Click Context Menu for selected text
    chrome.contextMenus.create({
      id: 'notebook-capture-selection',
      title: '新增筆記',
      contexts: ['selection'],
    });
  });

  // 3. Handle Context Menu Click
  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'notebook-capture-selection' && tab?.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'OPEN_QUICK_CAPTURE',
          payload: {
            content: info.selectionText || '',
            sourceUrl: tab.url || '',
            sourceTitle: tab.title || '',
          },
        });
      } catch (err) {
        console.warn('[Notebook] Content script unreachable, attempting injection:', err);
      }
    }
  });

  // 4. Handle Keyboard Shortcuts / Commands
  chrome.commands.onCommand.addListener(async (command) => {
    if (command === 'open-quick-capture') {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (activeTab?.id) {
        try {
          await chrome.tabs.sendMessage(activeTab.id, {
            type: 'OPEN_QUICK_CAPTURE',
            payload: {
              content: '',
              sourceUrl: activeTab.url || '',
              sourceTitle: activeTab.title || '',
            },
          });
        } catch (err) {
          console.warn('[Notebook] Failed to send OPEN_QUICK_CAPTURE:', err);
        }
      }
    } else if (command === 'open-sidepanel') {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (activeTab?.windowId && chrome.sidePanel && chrome.sidePanel.open) {
        chrome.sidePanel.open({ windowId: activeTab.windowId }).catch((err) => {
          console.warn('[Notebook] Failed to open side panel via command:', err);
        });
      }
    }
  });
});
