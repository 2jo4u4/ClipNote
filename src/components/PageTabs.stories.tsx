import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PageTabs, PageItem } from './PageTabs';
import { NewPageModal, NewPageData } from './NewPageModal';

const samplePages: PageItem[] = [
  { id: 'SYSTEM_GLOBAL_PAGE', title: '全域筆記頁', icon: '🌐', isSystem: true },
  { id: 'p1', title: '求職中文經歷', icon: '💼', domains: ['example.com'] },
  { id: 'p2', title: '社交平台貼文', icon: '💬', domains: ['sample.org', 'social.example.net'] },
  { id: 'p3', title: '英文履歷檔案', icon: '📝', domains: ['resume.example.org'] },
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
          onAddPage={() => alert('點擊了新增頁面 (+)')}
        />
      </div>
    );
  },
};

export const WithNewPageCreationModal: Story = {
  render: () => {
    const [pages, setPages] = useState<PageItem[]>(samplePages);
    const [activeId, setActiveId] = useState('p1');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreatePage = (data: NewPageData) => {
      const newId = `page-${Date.now()}`;
      const newPage: PageItem = {
        id: newId,
        title: data.title,
        icon: data.icon,
        domains: data.domains,
      };
      setPages([...pages, newPage]);
      setActiveId(newId);
    };

    return (
      <div className="max-w-2xl mx-auto p-4 rounded-xl bg-raycast-dark-bg border border-raycast-dark-border flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-raycast-dark-muted">
            點擊右側的 <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px] text-raycast-amber">+</kbd> 按鈕開啟新增筆記頁彈窗：
          </span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs px-2.5 py-1 rounded-lg bg-raycast-amber/10 border border-raycast-amber/30 text-raycast-amber hover:bg-raycast-amber/20 transition-colors"
          >
            直接開啟彈窗
          </button>
        </div>

        <PageTabs
          pages={pages}
          activePageId={activeId}
          onSelectPage={setActiveId}
          onAddPage={() => setIsModalOpen(true)}
        />

        <div className="text-xs font-mono text-raycast-amber">
          當前作用中筆記頁: {pages.find((p) => p.id === activeId)?.icon} {pages.find((p) => p.id === activeId)?.title} ({activeId})
        </div>

        <NewPageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreatePage}
        />
      </div>
    );
  },
};

export const ExtremeManyPages: Story = {
  render: () => {
    const [activeId, setActiveId] = useState('p-extreme-8');
    const manyPages: PageItem[] = [
      { id: 'SYSTEM_GLOBAL_PAGE', title: '全域筆記頁', icon: '🌐', isSystem: true },
      ...Array.from({ length: 15 }, (_, i) => ({
        id: `p-extreme-${i + 1}`,
        title: `長專案主題頁籤 ${i + 1}`,
        icon: i % 3 === 0 ? '💼' : i % 3 === 1 ? '🚀' : '💡',
        domains: i % 2 === 0 ? [`site-${i + 1}.com`] : undefined,
      })),
    ];

    return (
      <div className="max-w-xl mx-auto p-4 rounded-xl bg-raycast-dark-bg border border-raycast-dark-border flex flex-col gap-2">
        <div className="text-xs text-raycast-dark-subtle">
          水平滾動列（自訂 Emoji 與滑動指示器）：
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
