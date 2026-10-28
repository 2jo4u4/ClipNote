import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Notebook 筆記本',
    description: '輕量、感知網域的個人備忘與快速填表 Chrome 擴充功能 (Notebook Browser Extension)',
    version: '0.1.0',
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
        description: '開啟筆記本側邊欄',
      },
      'open-quick-capture': {
        suggested_key: {
          default: 'Alt+N',
          mac: 'Alt+N',
        },
        description: '快速捕獲筆記 / 全域搜尋',
      },
    },
    action: {
      default_title: '開啟筆記本',
    },
    icons: {
      16: 'icons/icon-16.png',
      48: 'icons/icon-48.png',
      128: 'icons/icon-128.png',
    },
  },
});
