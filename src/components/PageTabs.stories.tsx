import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PageTabs, PageItem } from './PageTabs';

const samplePages: PageItem[] = [
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
          pages={samplePages}
          activePageId={activeId}
          onSelectPage={setActiveId}
          onAddPage={() => alert('新增頁面點擊')}
        />
      </div>
    );
  },
};

export const Interactive: Story = {
  render: () => {
    const [pages, setPages] = useState<PageItem[]>(samplePages);
    const [activeId, setActiveId] = useState('p1');

    const handleAdd = () => {
      const newId = `page-${Date.now()}`;
      const newPage: PageItem = {
        id: newId,
        title: `新筆記頁 ${pages.length}`,
        domains: ['example.com'],
      };
      setPages([...pages, newPage]);
      setActiveId(newId);
    };

    return (
      <div className="max-w-2xl mx-auto p-4 rounded-xl bg-raycast-dark-bg border border-raycast-dark-border flex flex-col gap-4">
        <div className="text-xs text-raycast-dark-muted">
          點擊頁籤觀察 Raycast 磁吸滑動膠囊底塊（Sliding Tab Indicator）平滑位移：
        </div>
        <PageTabs
          pages={pages}
          activePageId={activeId}
          onSelectPage={setActiveId}
          onAddPage={handleAdd}
        />
        <div className="text-xs font-mono text-raycast-amber">
          當前作用中筆記頁: {pages.find((p) => p.id === activeId)?.title} ({activeId})
        </div>
      </div>
    );
  },
};

export const ExtremeManyPages: Story = {
  render: () => {
    const [activeId, setActiveId] = useState('p-extreme-8');
    const manyPages: PageItem[] = [
      { id: 'SYSTEM_GLOBAL_PAGE', title: '全域筆記頁', isSystem: true },
      ...Array.from({ length: 15 }, (_, i) => ({
        id: `p-extreme-${i + 1}`,
        title: `長專案主題頁籤 ${i + 1}`,
        domains: i % 2 === 0 ? [`site-${i + 1}.com`] : undefined,
      })),
    ];

    return (
      <div className="max-w-xl mx-auto p-4 rounded-xl bg-raycast-dark-bg border border-raycast-dark-border flex flex-col gap-2">
        <div className="text-xs text-raycast-dark-subtle">
          水平滾動列（可滑鼠滾輪或觸控板水平平移）：
        </div>
        <PageTabs
          pages={manyPages}
          activePageId={activeId}
          onSelectPage={setActiveId}
        />
      </div>
    );
  },
};

export const LightAndDarkComparison: Story = {
  render: () => {
    const [darkActiveId, setDarkActiveId] = useState('p1');
    const [lightActiveId, setLightActiveId] = useState('p2');

    return (
      <div className="flex flex-col gap-6 max-w-xl mx-auto">
        {/* Dark Mode */}
        <div className="p-4 rounded-xl bg-raycast-dark-bg border border-raycast-dark-border">
          <div className="text-xs text-raycast-dark-subtle mb-2 font-mono">Raycast Dark</div>
          <PageTabs
            pages={samplePages}
            activePageId={darkActiveId}
            onSelectPage={setDarkActiveId}
          />
        </div>

        {/* Light Mode */}
        <div className="p-4 rounded-xl bg-raycast-light-bg border border-raycast-light-border">
          <div className="text-xs text-raycast-light-subtle mb-2 font-mono">Raycast Light (Ivory)</div>
          <PageTabs
            pages={samplePages}
            activePageId={lightActiveId}
            onSelectPage={setLightActiveId}
          />
        </div>
      </div>
    );
  },
};
