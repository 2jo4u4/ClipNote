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
    default_locale: 'en',
    name: '__MSG_extName__',
    description: '__MSG_extDescription__',
    version: '1.0.1',
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
        description: '__MSG_commandOpenSidepanel__',
      },
      'open-quick-capture': {
        suggested_key: {
          default: 'Alt+N',
          mac: 'Alt+N',
        },
        description: '__MSG_commandOpenQuickCapture__',
      },
    },
    action: {
      default_title: '__MSG_actionTitle__',
    },
    icons: {
      16: 'icons/icon-16.png',
      48: 'icons/icon-48.png',
      128: 'icons/icon-128.png',
    },
  },
});
