import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PageTabs, TabItem } from './PageTabs';

const sampleTabs: TabItem[] = [
  { id: 'SYSTEM_GLOBAL_PAGE', title: '全域筆記頁', isSystem: true },
  { id: 'p1', title: '104 中文經歷', domains: ['104.com.tw'] },
  { id: 'p2', title: '社交平台貼文', domains: ['x.com', 'threads.net', 'facebook.com'] },
  { id: 'p3', title: 'CakeResume 英文檔案', domains: ['cakeresume.com'] },
];

const meta: Meta<typeof PageTabs> = {
  title: 'Raycast/PageTabs',
  component: PageTabs,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PageTabs>;

export const Default: Story = {
  render: () => {
    const [activeId, setActiveId] = useState('SYSTEM_GLOBAL_PAGE');
    return (
      <div className="max-w-xl mx-auto p-4 rounded-xl bg-raycast-dark-bg border border-raycast-dark-border">
        <PageTabs
          tabs={sampleTabs}
          activeTabId={activeId}
          onSelectTab={setActiveId}
          onAddPage={() => alert('新增頁面點擊')}
        />
      </div>
    );
  },
};

export const Interactive: Story = {
  render: () => {
    const [tabs, setTabs] = useState<TabItem[]>(sampleTabs);
    const [activeId, setActiveId] = useState('p1');

    const handleAdd = () => {
      const newId = `page-${Date.now()}`;
      const newPage: TabItem = {
        id: newId,
        title: `新筆記頁 ${tabs.length}`,
        domains: ['example.com'],
      };
      setTabs([...tabs, newPage]);
      setActiveId(newId);
    };

    return (
      <div className="max-w-2xl mx-auto p-4 rounded-xl bg-raycast-dark-bg border border-raycast-dark-border flex flex-col gap-4">
        <div className="text-xs text-raycast-dark-muted">
          點擊頁籤觀察 Raycast 磁吸滑動膠囊底塊（Sliding Tab Indicator）平滑位移：
        </div>
        <PageTabs
          tabs={tabs}
          activeTabId={activeId}
          onSelectTab={setActiveId}
          onAddPage={handleAdd}
        />
        <div className="text-xs font-mono text-raycast-amber">
          當前作用中筆記頁: {tabs.find((t) => t.id === activeId)?.title} ({activeId})
        </div>
      </div>
    );
  },
};

export const ExtremeManyTabs: Story = {
  render: () => {
    const [activeId, setActiveId] = useState('p-extreme-8');
    const manyTabs: TabItem[] = [
      { id: 'SYSTEM_GLOBAL_PAGE', title: '全域筆記頁', isSystem: true },
      ...Array.from({ length: 15 }, (_, i) => ({
        id: `p-extreme-${i + 1}`,
        title: `專案主題 ${i + 1} - 深度技術研究`,
        domains: i % 2 === 0 ? [`domain${i}.org`, `sub${i}.io`] : undefined,
      })),
    ];

    return (
      <div className="max-w-xl mx-auto p-4 rounded-xl bg-raycast-dark-bg border border-raycast-dark-border flex flex-col gap-2">
        <div className="text-xs text-raycast-dark-muted">
          極限狀態：16 個長標籤頁，支援水平滑動、自動滾動選取錨定
        </div>
        <PageTabs
          tabs={manyTabs}
          activeTabId={activeId}
          onSelectTab={setActiveId}
          onAddPage={() => {}}
        />
      </div>
    );
  },
};

export const LightAndDarkComparison: Story = {
  render: () => {
    const [activeId, setActiveId] = useState('p2');

    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        {/* Dark Mode */}
        <div className="dark flex flex-col gap-2 p-4 rounded-xl bg-[#18181b] border border-white/10 text-white">
          <div className="text-xs font-semibold text-gray-400">🌙 Raycast Dark Mode</div>
          <PageTabs
            tabs={sampleTabs}
            activeTabId={activeId}
            onSelectTab={setActiveId}
            onAddPage={() => {}}
          />
        </div>

        {/* Light Mode */}
        <div className="flex flex-col gap-2 p-4 rounded-xl bg-[#faf9f6] border border-black/10 text-black">
          <div className="text-xs font-semibold text-gray-600">☀️ Raycast Light Mode</div>
          <PageTabs
            tabs={sampleTabs}
            activeTabId={activeId}
            onSelectTab={setActiveId}
            onAddPage={() => {}}
          />
        </div>
      </div>
    );
  },
};
