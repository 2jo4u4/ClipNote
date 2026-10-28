import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { JotCard } from './JotCard';

const meta: Meta<typeof JotCard> = {
  title: 'Raycast/JotCard',
  component: JotCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof JotCard>;

export const Default: Story = {
  args: {
    id: 'j1',
    content: '大安捷運站旁法式甜點店，週三公休，推薦香草千層酥與西西里咖啡 🍰☕️',
    createdAt: Date.now() - 1000 * 60 * 15, // 15 mins ago
    sourceUrl: 'https://instagram.com/p/C3x918L',
    sourceTitle: 'Instagram 貼文',
  },
  render: (args) => (
    <div className="max-w-md mx-auto p-4 bg-raycast-dark-bg rounded-xl border border-raycast-dark-border">
      <JotCard {...args} />
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [copiedContent, setCopiedContent] = useState<string | null>(null);

    return (
      <div className="max-w-md mx-auto p-4 bg-raycast-dark-bg rounded-xl border border-raycast-dark-border flex flex-col gap-4">
        <div className="text-xs text-raycast-dark-muted">
          滑鼠懸停 (Hover) 觀察右上角浮現之複製與功能按鈕，點擊可直接複製：
        </div>
        <JotCard
          id="j-hover"
          content="Prompt Engineering 經驗總結：在 System Prompt 注入 Few-Shot 範例能讓結構化輸出穩定度提高 40%。"
          createdAt={Date.now() - 1000 * 60 * 3}
          sourceUrl="https://twitter.com/ai_researcher/status/987654321"
          sourceTitle="X / Twitter"
          onCopy={(val) => setCopiedContent(val)}
          onEdit={(id) => alert(`編輯隨筆 ${id}`)}
          onDelete={(id) => alert(`刪除隨筆 ${id}`)}
        />
        {copiedContent && (
          <div className="text-xs font-mono text-emerald-400">
            剛剛複製成功: {copiedContent}
          </div>
        )}
      </div>
    );
  },
};

export const ExtremeMultiLineSnippet: Story = {
  render: () => {
    const complexJot = `React 18 Concurrent 特性觀察與注意事項：
1. useTransition 降低非緊急渲染優先權
2. 避免在 startTransition 內部觸發同步 DOM 測量
3. 測試指令：
   $ pnpm test -- --coverage
4. 追蹤 issue: https://github.com/facebook/react/issues/24000
備註：週五前需確認是否在擴充套件 Side Panel 啟用該優化。`;

    return (
      <div className="max-w-md mx-auto p-4 bg-raycast-dark-bg rounded-xl border border-raycast-dark-border flex flex-col gap-3">
        <div className="text-xs text-raycast-dark-muted">
          極限多行排版與換行保留 (`whitespace-pre-wrap`、程式碼塊)：
        </div>
        <JotCard
          id="j-extreme"
          content={complexJot}
          createdAt={Date.now() - 1000 * 60 * 60 * 48}
          sourceUrl="https://github.com/facebook/react"
          sourceTitle="React 官方儲存庫"
        />
      </div>
    );
  },
};

export const LightAndDarkComparison: Story = {
  render: () => {
    return (
      <div className="flex flex-col gap-6 max-w-xl mx-auto">
        {/* Dark Mode */}
        <div className="dark p-4 rounded-xl bg-[#18181b] border border-white/10 flex flex-col gap-2">
          <div className="text-xs font-semibold text-gray-400">🌙 Raycast Dark Mode</div>
          <JotCard
            id="j-dark"
            content="今日靈感：設計應如隱形羽毛，提供極致流暢之響應而不搶奪注意力。"
            createdAt={Date.now() - 1000 * 60 * 5}
            sourceUrl="https://news.ycombinator.com"
          />
        </div>

        {/* Light Mode */}
        <div className="p-4 rounded-xl bg-[#faf9f6] border border-black/10 flex flex-col gap-2">
          <div className="text-xs font-semibold text-gray-600">☀️ Raycast Light Mode</div>
          <JotCard
            id="j-light"
            content="今日靈感：設計應如隱形羽毛，提供極致流暢之響應而不搶奪注意力。"
            createdAt={Date.now() - 1000 * 60 * 5}
            sourceUrl="https://news.ycombinator.com"
          />
        </div>
      </div>
    );
  },
};
