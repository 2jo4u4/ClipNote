import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { MoveCellModal } from './MoveCellModal';
import { Page, Cell } from '../core/types';

const samplePages: Page[] = [
  {
    id: 'SYSTEM_GLOBAL_PAGE',
    title: '全域筆記頁',
    icon: '🌐',
    isSystem: true,
    domains: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    sections: [
      {
        id: 'sec-global-1',
        title: '常用填表資訊',
        order: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        items: [],
      },
      {
        id: 'sec-global-2',
        title: '隨想備忘',
        order: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        items: [],
      },
    ],
  },
  {
    id: 'p-resume',
    title: '求職中文經歷',
    icon: '💼',
    domains: ['example.com'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    sections: [
      {
        id: 'sec-resume-exp',
        title: '工作經驗',
        order: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        items: [],
      },
      {
        id: 'sec-resume-bio',
        title: '自傳與自述',
        order: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        items: [],
      },
    ],
  },
];

const sampleCell: Cell = {
  id: 'cell-demo-1',
  key: '專案架構經驗',
  value: '負責帶領 5 人團隊重構前端應用，導入 TypeScript 與單元測試體系。',
  createdAt: Date.now() - 3600000,
  updatedAt: Date.now() - 600000,
};

const meta: Meta<typeof MoveCellModal> = {
  title: 'Components/MoveCellModal',
  component: MoveCellModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MoveCellModal>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);
    const [lastMoved, setLastMoved] = useState<string | null>(null);

    return (
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 rounded-xl bg-raycast-amber text-black font-medium text-xs shadow-md"
        >
          開啟移動單元項 Modal
        </button>

        {lastMoved && (
          <div className="text-xs font-mono text-emerald-500">
            {lastMoved}
          </div>
        )}

        <MoveCellModal
          isOpen={isOpen}
          cell={sampleCell}
          sourcePageId="p-resume"
          sourceSectionId="sec-resume-exp"
          pages={samplePages}
          onClose={() => setIsOpen(false)}
          onConfirm={(targetPageId, targetSectionId) => {
            const page = samplePages.find((p) => p.id === targetPageId);
            const sec = page?.sections.find((s) => s.id === targetSectionId);
            setLastMoved(`已成功將單元項移至「${page?.title} > ${sec?.title}」`);
            setIsOpen(false);
          }}
        />
      </div>
    );
  },
};
