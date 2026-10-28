import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SectionContainer } from './SectionContainer';
import { FieldCard } from './FieldCard';
import { JotCard } from './JotCard';

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

export const FieldsSectionDefault: Story = {
  render: () => {
    return (
      <div className="max-w-md mx-auto p-4 bg-raycast-dark-bg rounded-xl border border-raycast-dark-border">
        <SectionContainer
          id="sec-1"
          title="基本履歷欄位"
          type="fields"
          itemCount={2}
          onExtractToPage={(id) => alert(`升格分區 ${id} 為獨立新筆記頁`)}
          onAddItem={(id) => alert(`新增欄位於分區 ${id}`)}
          onDeleteSection={(id) => alert(`刪除分區 ${id}`)}
        >
          <FieldCard
            id="f1"
            fieldKey="中文姓名"
            value="王大明 (David Wang)"
          />
          <FieldCard
            id="f2"
            fieldKey="聯絡信箱"
            value="david.wang@agent-cloud.io"
          />
        </SectionContainer>
      </div>
    );
  },
};

export const JotsSectionInteractive: Story = {
  render: () => {
    const [jots, setJots] = useState([
      {
        id: 'j-1',
        content: '閱讀了最新 Chrome MV3 SidePanel API 規範，確認支援跨分頁長連接。',
        createdAt: Date.now() - 1000 * 60 * 20,
        sourceUrl: 'https://developer.chrome.com/docs/extensions/reference/sidePanel',
      },
      {
        id: 'j-2',
        content: '中午吃了八方雲集招牌鍋貼 10 顆 + 豆漿 🥟🥤',
        createdAt: Date.now() - 1000 * 60 * 120,
      },
    ]);

    const handleAddJot = () => {
      const newJot = {
        id: `j-${Date.now()}`,
        content: '剛記錄了一筆即時靈感！點擊分區標題可測試平滑折疊收合。',
        createdAt: Date.now(),
      };
      setJots([newJot, ...jots]);
    };

    return (
      <div className="max-w-md mx-auto p-4 bg-raycast-dark-bg rounded-xl border border-raycast-dark-border flex flex-col gap-3">
        <div className="text-xs text-raycast-dark-muted">
          點擊分區標題測試平滑高度折疊（Smooth Height Transition），點擊選單測試「升格為獨立筆記頁」：
        </div>
        <SectionContainer
          id="sec-jots"
          title="日常靈感與備忘"
          type="jots"
          itemCount={jots.length}
          onExtractToPage={(id) => alert(`觸發 Section Extraction: 將分區 ${id} 升格為獨立 Page`)}
          onAddItem={handleAddJot}
          onDeleteSection={() => setJots([])}
        >
          {jots.map((jot) => (
            <JotCard
              key={jot.id}
              {...jot}
              onDelete={(id) => setJots(jots.filter((j) => j.id !== id))}
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
          title="空白欄位分區"
          type="fields"
          itemCount={0}
          onAddItem={(id) => alert(`點擊新增欄位: ${id}`)}
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
            type="fields"
            itemCount={1}
            onExtractToPage={() => {}}
            onAddItem={() => {}}
          >
            <FieldCard
              id="f-dark-1"
              fieldKey="前端技術棧"
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
            type="fields"
            itemCount={1}
            onExtractToPage={() => {}}
            onAddItem={() => {}}
          >
            <FieldCard
              id="f-light-1"
              fieldKey="前端技術棧"
              value="React 18, TypeScript, Tailwind CSS, Vite, Zustand"
            />
          </SectionContainer>
        </div>
      </div>
    );
  },
};
