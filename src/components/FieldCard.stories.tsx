import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FieldCard } from './FieldCard';

const meta: Meta<typeof FieldCard> = {
  title: 'Raycast/FieldCard',
  component: FieldCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FieldCard>;

export const Default: Story = {
  args: {
    id: 'f1',
    fieldKey: '專案架構師職稱',
    value: 'Senior Frontend Architect & Agent Systems Lead',
    createdAt: Date.now() - 15 * 60 * 1000, // 15 分鐘前
    sourceUrl: 'https://104.com.tw/job/12345',
    sourceTitle: '104 人力銀行 - 架構師應徵頁',
  },
  render: (args) => (
    <div className="max-w-md mx-auto p-4 bg-raycast-dark-bg rounded-xl border border-raycast-dark-border">
      <FieldCard {...args} />
    </div>
  ),
};

export const InteractiveCopy: Story = {
  render: () => {
    const [copiedValue, setCopiedValue] = useState<string | null>(null);

    return (
      <div className="max-w-md mx-auto p-4 bg-raycast-dark-bg rounded-xl border border-raycast-dark-border flex flex-col gap-4">
        <div className="text-xs text-raycast-dark-muted">
          點擊下方卡片，觀察物理微縮放（`active:scale-[0.98]`）、柔和翡翠綠微光（`ring-emerald-500/25`）與圖示平滑翻轉為打勾 `✓`（持續 1.2 秒）：
        </div>
        <FieldCard
          id="f-interact"
          fieldKey="常用測試密碼"
          value="P@ssw0rd!#2026_SecureKey"
          createdAt={Date.now() - 5 * 60 * 1000} // 5 分鐘前
          onCopy={(val) => setCopiedValue(val)}
          onEdit={(id) => alert(`編輯欄位: ${id}`)}
          onDelete={(id) => alert(`刪除欄位: ${id}`)}
        />
        {copiedValue && (
          <div className="text-xs font-mono text-emerald-400">
            剛剛複製成功: {copiedValue}
          </div>
        )}
      </div>
    );
  },
};

export const LongTextFolding: Story = {
  render: () => {
    const longValue = `主導全公司微前端 (Micro-Frontend) 與 Chrome Manifest V3 擴充套件架構重構。
採用 TypeScript, Vite, React 18 與 Tailwind CSS，達成冷啟動時間降低 65%，打包體積減少 42%。
建立跨專案共用 Design System 與 Storybook 元件庫，提升團隊開發迭代速度 3 倍。
深度整合瀏覽器原生 Side Panel API 與 Shadow DOM 隔離機制，確保在任何複雜宿主頁面上皆能流暢運作且不引發 CSS 污染。`;

    return (
      <div className="max-w-md mx-auto p-4 bg-raycast-dark-bg rounded-xl border border-raycast-dark-border flex flex-col gap-3">
        <div className="text-xs text-raycast-dark-muted">
          極限長文狀態：預設 3 行折疊 (`line-clamp-3`)，可點擊「展開完整內容」，點擊本體依然一鍵複製完整內文：
        </div>
        <FieldCard
          id="f-long"
          fieldKey="104 工作成就摘要 (長文)"
          value={longValue}
          sourceUrl="https://cakeresume.com/me/architect"
          sourceTitle="CakeResume 經歷表"
          onCopy={(val) => console.log('Copied length:', val.length)}
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
          <FieldCard
            id="f-dark"
            fieldKey="GITHUB PROFILE"
            value="https://github.com/developer/antigravity-suite"
            sourceUrl="https://github.com"
          />
        </div>

        {/* Light Mode */}
        <div className="p-4 rounded-xl bg-[#faf9f6] border border-black/10 flex flex-col gap-2">
          <div className="text-xs font-semibold text-gray-600">☀️ Raycast Light Mode</div>
          <FieldCard
            id="f-light"
            fieldKey="GITHUB PROFILE"
            value="https://github.com/developer/antigravity-suite"
            sourceUrl="https://github.com"
          />
        </div>
      </div>
    );
  },
};
