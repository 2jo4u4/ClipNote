import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { OmniSearchBar } from './OmniSearchBar';
import { SearchResultItem } from '../types';

const sampleResults: SearchResultItem[] = [
  {
    id: 'res-1',
    type: 'field',
    pageId: 'page-104',
    pageTitle: '104 中文經歷',
    sectionId: 'sec-title',
    sectionTitle: '職稱經歷',
    title: '英文職稱 (Title)',
    content: 'Staff Frontend Engineer & System Architect',
  },
  {
    id: 'res-2',
    type: 'field',
    pageId: 'page-104',
    pageTitle: '104 中文經歷',
    sectionId: 'sec-summary',
    sectionTitle: '專業簡介',
    title: '架構設計成就',
    content: '主導設計高併發前端微服務，將模組載入時間優化至 200ms 以內。',
  },
  {
    id: 'res-3',
    type: 'jot',
    pageId: 'SYSTEM_GLOBAL_PAGE',
    pageTitle: '全域筆記頁',
    sectionId: 'sec-global-jots',
    sectionTitle: '隨筆收集箱',
    title: '靈感便簽',
    content: '推薦閱讀《Designing Data-Intensive Applications》第 5 章。',
    sourceUrl: 'https://news.ycombinator.com',
  },
  {
    id: 'res-4',
    type: 'field',
    pageId: 'page-social',
    pageTitle: '社交平台貼文',
    sectionId: 'sec-hashtags',
    sectionTitle: '常用標籤',
    title: 'AI 貼文標籤組',
    content: '#React #TypeScript #RaycastUI #TailwindCSS #Frontend2026',
  },
];

const meta: Meta<typeof OmniSearchBar> = {
  title: 'Raycast/OmniSearchBar',
  component: OmniSearchBar,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof OmniSearchBar>;

export const Default: Story = {
  render: () => {
    return (
      <div className="max-w-lg mx-auto p-4 bg-raycast-dark-bg rounded-xl border border-raycast-dark-border min-h-[300px]">
        <OmniSearchBar
          results={sampleResults}
          currentDomain="cake.me"
          onBindDomain={(pId) => alert(`觸發智慧網域綁定: 將 Page ${pId} 綁定至 cake.me`)}
        />
      </div>
    );
  },
};

export const InteractiveSearchAndKeyboard: Story = {
  render: () => {
    const [query, setQuery] = useState('經歷');
    const [lastCopied, setLastCopied] = useState<string | null>(null);

    const filtered = sampleResults.filter(
      (r) =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.content.toLowerCase().includes(query.toLowerCase()) ||
        r.pageTitle.toLowerCase().includes(query.toLowerCase())
    );

    return (
      <div className="max-w-lg mx-auto p-4 bg-raycast-dark-bg rounded-xl border border-raycast-dark-border min-h-[420px] flex flex-col gap-4">
        <div className="text-xs text-raycast-dark-muted">
          請在搜尋列輸入關鍵字，使用鍵盤 <kbd className="px-1 py-0.5 rounded border border-white/10 bg-white/5 font-mono text-[10px]">↑</kbd> <kbd className="px-1 py-0.5 rounded border border-white/10 bg-white/5 font-mono text-[10px]">↓</kbd> 移動游標，按 <kbd className="px-1 py-0.5 rounded border border-white/10 bg-white/5 font-mono text-[10px]">↵</kbd> 直接複製：
        </div>
        <OmniSearchBar
          results={filtered}
          onSearch={setQuery}
          currentDomain="linkedin.com"
          onSelectItem={(item) => setLastCopied(item.content)}
          onBindDomain={(pageId) => alert(`將 Page ${pageId} 綁定至 linkedin.com`)}
        />
        {lastCopied && (
          <div className="text-xs font-mono text-emerald-400 mt-auto">
            已一鍵複製: {lastCopied}
          </div>
        )}
      </div>
    );
  },
};

export const ExtremeManyResults: Story = {
  render: () => {
    const manyResults: SearchResultItem[] = Array.from({ length: 20 }, (_, i) => ({
      id: `extreme-res-${i + 1}`,
      type: i % 2 === 0 ? 'field' : 'jot',
      pageId: `page-${i}`,
      pageTitle: `分類檔案庫 ${i + 1}`,
      sectionId: `sec-${i}`,
      sectionTitle: `專案模組 #${i + 1}`,
      title: `測試金鑰與設定欄位 #${i + 1}`,
      content: `ACCESS_KEY_ID_PROD_${i + 1}=AKIAIOSFODNN7EXAMPLE_${i + 1}`,
    }));

    return (
      <div className="max-w-lg mx-auto p-4 bg-raycast-dark-bg rounded-xl border border-raycast-dark-border min-h-[460px] flex flex-col gap-2">
        <div className="text-xs text-raycast-dark-muted">
          極限狀態：20 筆搜尋結果，支援下拉捲動與鍵盤平滑高亮聚焦
        </div>
        <OmniSearchBar results={manyResults} />
      </div>
    );
  },
};

export const LightAndDarkComparison: Story = {
  render: () => {
    return (
      <div className="flex flex-col gap-8 max-w-xl mx-auto">
        {/* Dark Mode */}
        <div className="dark p-4 rounded-xl bg-[#18181b] border border-white/10 min-h-[260px] flex flex-col gap-2">
          <div className="text-xs font-semibold text-gray-400">🌙 Raycast Dark Mode</div>
          <OmniSearchBar results={sampleResults.slice(0, 2)} />
        </div>

        {/* Light Mode */}
        <div className="p-4 rounded-xl bg-[#faf9f6] border border-black/10 min-h-[260px] flex flex-col gap-2">
          <div className="text-xs font-semibold text-gray-600">☀️ Raycast Light Mode</div>
          <OmniSearchBar results={sampleResults.slice(0, 2)} />
        </div>
      </div>
    );
  },
};
