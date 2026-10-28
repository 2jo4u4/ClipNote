import type { Meta, StoryObj } from '@storybook/react';
import { CellCard } from './CellCard';

const meta: Meta<typeof CellCard> = {
  title: 'Raycast/CellCard (單元項卡片)',
  component: CellCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CellCard>;

export const FieldVariant: Story = {
  args: {
    id: 'cell-f-1',
    cellKey: '職稱',
    value: '資深前端架構工程師 (Senior Frontend Architect)',
    createdAt: Date.now() - 1000 * 60 * 15,
    sourceUrl: 'https://104.com.tw/job/7xyz8',
    sourceTitle: '104 人力銀行 - 我的履歷',
    onCopy: (content) => alert(`已複製: ${content}`),
    onDelete: (id) => alert(`刪除: ${id}`),
    onMove: (id) => alert(`移動: ${id}`),
  },
  render: (args) => (
    <div className="w-[360px] p-4 rounded-2xl bg-raycast-dark-bg border border-raycast-dark-border">
      <div className="text-xs text-raycast-dark-subtle mb-2 font-mono">
        Field 樣式（有指定欄位名稱）：
      </div>
      <CellCard {...args} />
    </div>
  ),
};

export const JotVariant: Story = {
  args: {
    id: 'cell-j-1',
    value:
      '具備 6 年以上大型 Web 產品開發經驗，主導千萬級流量前端微服務架構重構，使頁面加載速度提升 42%，並建立無障礙規範與自動化 CI/CD 測試流程。',
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
    sourceUrl: 'https://github.com/trending',
    sourceTitle: 'GitHub Trending',
    onCopy: (content) => alert(`已複製: ${content}`),
    onDelete: (id) => alert(`刪除: ${id}`),
  },
  render: (args) => (
    <div className="w-[360px] p-4 rounded-2xl bg-raycast-dark-bg border border-raycast-dark-border">
      <div className="text-xs text-raycast-dark-subtle mb-2 font-mono">
        Jot 樣式（無欄位名稱，自由隨筆）：
      </div>
      <CellCard {...args} />
    </div>
  ),
};

export const MixedList: Story = {
  render: () => {
    return (
      <div className="w-[380px] p-4 rounded-2xl bg-raycast-dark-bg border border-raycast-dark-border flex flex-col gap-2.5">
        <div className="text-xs text-raycast-dark-muted font-medium mb-1">
          同一個 Section 混合收納 Field 與 Jot：
        </div>
        <CellCard
          id="c-1"
          cellKey="全名"
          value="王小明"
          createdAt={Date.now() - 600000}
        />
        <CellCard
          id="c-2"
          cellKey="核心技術棧"
          value="React, TypeScript, Next.js, Tailwind CSS"
          createdAt={Date.now() - 3600000}
        />
        <CellCard
          id="c-3"
          value="面試前記得複習瀏覽器 Event Loop 與微前端狀態隔離機制。"
          createdAt={Date.now() - 7200000}
          sourceUrl="https://developer.mozilla.org"
          sourceTitle="MDN Web Docs"
        />
      </div>
    );
  },
};
