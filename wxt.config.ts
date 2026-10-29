import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  imports: {
    dirsScanOptions: {
      fileFilter: (file) => !file.includes('.stories.') && !file.includes('.test.'),
    },
  },
  manifest: {
    name: 'ClipNote',
    description: 'Lightweight, domain-aware scratchpad and quick form-filling notepad for Chrome.',
    version: '1.0.0',
    permissions: [
      'storage',
      'sidePanel',
      'contextMenus',
      'tabs',
      'activeTab',
    ],
    commands: {
      'open-sidepanel': {
        suggested_key: {
          default: 'Alt+S',
          mac: 'Alt+S',
        },
        description: 'Open ClipNote side panel',
      },
      'open-quick-capture': {
        suggested_key: {
          default: 'Alt+N',
          mac: 'Alt+N',
        },
        description: 'New note / Search notes',
      },
    },
    action: {
      default_title: 'Open ClipNote',
    },
    icons: {
      16: 'icons/icon-16.png',
      48: 'icons/icon-48.png',
      128: 'icons/icon-128.png',
    },
  },
});
