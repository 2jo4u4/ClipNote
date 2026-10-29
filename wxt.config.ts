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
    description: '輕量、感知網域的個人備忘與快速填表 Chrome 擴充功能 (ClipNote)',
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
        description: '開啟 ClipNote 側邊欄',
      },
      'open-quick-capture': {
        suggested_key: {
          default: 'Alt+N',
          mac: 'Alt+N',
        },
        description: '新增筆記 / 全域搜尋',
      },
    },
    action: {
      default_title: '開啟 ClipNote',
    },
    icons: {
      16: 'icons/icon-16.png',
      48: 'icons/icon-48.png',
      128: 'icons/icon-128.png',
    },
  },
});
