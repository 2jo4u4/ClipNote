import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { QuickCaptureModal } from './QuickCaptureModal';
import type { SearchResult } from '../types';

const sampleSearchHits: SearchResult[] = [
  {
    id: 's-1',
    type: 'field',
    pageId: 'p-resume',
    pageTitle: '求職中文經歷',
    sectionId: 'sec-title',
    sectionTitle: '基本資料',
    title: '目前職稱',
    content: '資深前端架構師 (Staff Frontend Engineer)',
    sourcePath: '來自 [求職中文經歷] > [基本資料] ‧ 目前職稱',
  },
  {
    id: 's-2',
    type: 'jot',
    pageId: 'SYSTEM_GLOBAL_PAGE',
    pageTitle: '全域筆記頁',
    sectionId: 'sec-jots',
    sectionTitle: '隨筆記事',
    title: '備忘',
    content: '面試時強調 MV3 架構設計與 Storybook 元件庫規範。',
    sourcePath: '來自 [全域筆記頁] > [隨筆記事]',
  },
];

const meta: Meta<typeof QuickCaptureModal> = {
  title: 'Raycast/QuickCaptureModal',
  component: QuickCaptureModal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof QuickCaptureModal>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <div className="min-h-[500px] p-8 bg-raycast-dark-bg text-raycast-dark-text flex flex-col items-center justify-center">
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 rounded-xl bg-raycast-coral text-white text-xs font-semibold shadow-md active:scale-95 transition-transform"
        >
          喚醒 Quick Capture Modal (快捷鍵模擬)
        </button>

        <QuickCaptureModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          defaultContent="https://example.com/notes/sample-doc"
          sourceUrl="https://example.com"
          sourceTitle="Example Portal - Sample Notes"
          onSaveCell={(data) => {
            alert(`儲存單元項: ${JSON.stringify(data)}`);
            setIsOpen(false);
          }}
        />
      </div>
    );
  },
};

export const InteractiveSpotlightSearch: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);
    const [capturedList, setCapturedList] = useState<string[]>([]);
    const [query, setQuery] = useState('');

    const searchResults = query
      ? sampleSearchHits.filter(
          (h) => h.title.includes(query) || h.content.includes(query)
        )
      : [];

    return (
      <div className="min-h-[500px] p-8 bg-[#18181b] text-white flex flex-col items-center justify-center gap-4">
        <div className="text-center">
          <button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 rounded-xl bg-raycast-amber text-black text-xs font-semibold shadow-md active:scale-95 transition-transform"
          >
            開啟快速擷取框 (Alt+N)
          </button>
          <p className="text-xs text-gray-400 mt-2">
            打字時會即時檢索既有筆記；使用 <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">↑↓</kbd> 選中並按 <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">↵</kbd> 可快速複製！按 <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Tab</kbd> 切換隨筆/欄位。
          </p>
        </div>

        {capturedList.length > 0 && (
          <div className="max-w-md w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
            <span className="font-semibold text-emerald-400">已成功擷取紀錄：</span>
            <ul className="list-disc list-inside mt-1 space-y-1">
              {capturedList.map((item, idx) => (
                <li key={idx} className="font-mono truncate">{item}</li>
              ))}
            </ul>
          </div>
        )}

        <QuickCaptureModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          searchResults={searchResults}
          onSearchQueryChange={setQuery}
          onCopySearchResult={(item) => {
            setCapturedList((prev) => [...prev, `[已複製] ${item.title}: ${item.content}`]);
          }}
          onSaveCell={(data) => {
            setCapturedList((prev) => [
              ...prev,
              `[已儲存] ${data.key ? `[${data.key}] ` : ''}${data.value}`,
            ]);
            setIsOpen(false);
          }}
        />
      </div>
    );
  },
};

export const LightAndDarkComparison: Story = {
  render: () => {
    const [darkOpen, setDarkOpen] = useState(false);
    const [lightOpen, setLightOpen] = useState(false);

    return (
      <div className="flex gap-4 p-8 items-center justify-center min-h-[400px] bg-neutral-900">
        <button
          onClick={() => setDarkOpen(true)}
          className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 text-xs font-medium"
        >
          查看 Dark Mode Modal
        </button>
        <button
          onClick={() => setLightOpen(true)}
          className="px-4 py-2 rounded-xl bg-white text-black hover:bg-white/90 text-xs font-medium"
        >
          查看 Light Mode Modal
        </button>

        {darkOpen && (
          <div className="dark">
            <QuickCaptureModal
              isOpen={darkOpen}
              onClose={() => setDarkOpen(false)}
              defaultContent="深色模式測試內容"
            />
          </div>
        )}

        {lightOpen && (
          <div>
            <QuickCaptureModal
              isOpen={lightOpen}
              onClose={() => setLightOpen(false)}
              defaultContent="淺色象牙米白模式測試內容"
            />
          </div>
        )}
      </div>
    );
  },
};
