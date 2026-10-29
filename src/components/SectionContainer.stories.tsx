import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SectionContainer } from './SectionContainer';
import { CellCard } from './CellCard';

const meta: Meta<typeof SectionContainer> = {
  title: 'Raycast/SectionContainer',
  component: SectionContainer,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SectionContainer>;

export const MixedSectionDefault: Story = {
  render: () => {
    return (
      <div className="max-w-md mx-auto p-4 bg-raycast-dark-bg rounded-xl border border-raycast-dark-border">
        <SectionContainer
          id="sec-1"
          title="基本履歷與隨筆"
          itemCount={3}
          onExtractToPage={(id) => alert(`升格分區 ${id} 為獨立新筆記頁`)}
          onAddItem={(id) => alert(`新增單元項於分區 ${id}`)}
          onDeleteSection={(id) => alert(`刪除分區 ${id}`)}
        >
          <CellCard
            id="f1"
            cellKey="中文姓名"
            value="王大明 (David Wang)"
          />
          <CellCard
            id="f2"
            cellKey="聯絡信箱"
            value="david.wang@agent-cloud.io"
          />
          <CellCard
            id="j1"
            value="面試前請務必準備好架構重構的案例說明。"
            createdAt={Date.now() - 3600000}
          />
        </SectionContainer>
      </div>
    );
  },
};

export const JotsSectionInteractive: Story = {
  render: () => {
    const [cells, setCells] = useState<
      { id: string; cellKey?: string; value: string; createdAt?: number; sourceUrl?: string }[]
    >([
      {
        id: 'c-1',
        value: '閱讀了最新 Chrome MV3 SidePanel API 規範，確認支援跨分頁長連接。',
        createdAt: Date.now() - 1000 * 60 * 20,
        sourceUrl: 'https://developer.chrome.com/docs/extensions/reference/sidePanel',
      },
      {
        id: 'c-2',
        cellKey: '常駐網址',
        value: 'https://sample.org/trending',
        createdAt: Date.now() - 1000 * 60 * 120,
      },
    ]);

    const handleAdd = () => {
      const newCell = {
        id: `c-${Date.now()}`,
        value: '剛記錄了一筆即時靈感！點擊分區標題可測試平滑折疊收合。',
        createdAt: Date.now(),
      };
      setCells([newCell, ...cells]);
    };

    return (
      <div className="max-w-md mx-auto p-4 bg-raycast-dark-bg rounded-xl border border-raycast-dark-border flex flex-col gap-3">
        <div className="text-xs text-raycast-dark-muted">
          點擊分區標題測試平滑高度折疊（Smooth Height Transition），點擊選單測試「升格為獨立筆記頁」：
        </div>
        <SectionContainer
          id="sec-jots"
          title="日常靈感與備忘"
          itemCount={cells.length}
          onExtractToPage={(id) => alert(`觸發 Section Extraction: 將分區 ${id} 升格為獨立筆記頁`)}
          onAddItem={handleAdd}
          onDeleteSection={() => setCells([])}
        >
          {cells.map((cell) => (
            <CellCard
              key={cell.id}
              {...cell}
              onDelete={(id) => setCells(cells.filter((c) => c.id !== id))}
            />
          ))}
        </SectionContainer>
      </div>
    );
  },
};

export const EmptyState: Story = {
  render: () => {
    return (
      <div className="max-w-md mx-auto p-4 bg-raycast-dark-bg rounded-xl border border-raycast-dark-border">
        <SectionContainer
          id="sec-empty"
          title="空白分區"
          itemCount={0}
          onAddItem={(id) => alert(`點擊新增單元項: ${id}`)}
        >
          {null}
        </SectionContainer>
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
          <SectionContainer
            id="sec-dark"
            title="技術技能清單"
            itemCount={1}
            onExtractToPage={() => {}}
            onAddItem={() => {}}
          >
            <CellCard
              id="f-dark-1"
              cellKey="前端技術棧"
              value="React 18, TypeScript, Tailwind CSS, Vite, Zustand"
            />
          </SectionContainer>
        </div>

        {/* Light Mode */}
        <div className="p-4 rounded-xl bg-[#faf9f6] border border-black/10 flex flex-col gap-2">
          <div className="text-xs font-semibold text-gray-600">☀️ Raycast Light Mode</div>
          <SectionContainer
            id="sec-light"
            title="技術技能清單"
            itemCount={1}
            onExtractToPage={() => {}}
            onAddItem={() => {}}
          >
            <CellCard
              id="f-light-1"
              cellKey="前端技術棧"
              value="React 18, TypeScript, Tailwind CSS, Vite, Zustand"
            />
          </SectionContainer>
        </div>
      </div>
    );
  },
};
