import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { QuickCaptureModal } from './QuickCaptureModal';
import { SearchResultItem } from '../types';

const sampleSearchHits: SearchResultItem[] = [
  {
    id: 's-1',
    type: 'field',
    pageId: 'p-104',
    pageTitle: '104 中文經歷',
    sectionId: 'sec-title',
    sectionTitle: '基本資料',
    title: '目前職稱',
    content: '資深前端架構師 (Staff Frontend Engineer)',
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
          defaultContent="https://github.com/developer/raycast-design"
          sourceUrl="https://github.com"
          sourceTitle="GitHub - Raycast Design Exploration"
          onSaveJot={(data) => {
            alert(`儲存隨筆: ${JSON.stringify(data)}`);
            setIsOpen(false);
          }}
          onSaveField={(data) => {
            alert(`儲存欄位: ${JSON.stringify(data)}`);
            setIsOpen(false);
          }}
        />
      </div>
    );
  },
};

export const InteractiveDualMode: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);
    const [capturedList, setCapturedList] = useState<string[]>([]);
    const [query, setQuery] = useState('');

    const searchResults = sampleSearchHits.filter(
      (h) => h.title.includes(query) || h.content.includes(query)
    );

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
            提示：可使用 <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Tab</kbd> 切換「快速記錄」與「全域搜尋」雙模，使用 <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Esc</kbd> 關閉。
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
          onSaveJot={(data) => {
            setCapturedList((prev) => [...prev, `[隨筆] ${data.content}`]);
            setIsOpen(false);
          }}
          onSaveField={(data) => {
            setCapturedList((prev) => [...prev, `[欄位] ${data.key}: ${data.value}`]);
            setIsOpen(false);
          }}
          onCopySearchResult={(item) => {
            setCapturedList((prev) => [...prev, `[複製] ${item.content}`]);
            setIsOpen(false);
          }}
        />
      </div>
    );
  },
};

export const LongPreFilledText: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);
    const longText = `這是一段從 Instagram 貼文選取後透過右鍵選單自動預填入的長文字。
包含多行換行：
- 推薦必點：黑糖肉桂捲
- 營業時間：13:00 - 19:00
- 交通資訊：捷運忠孝新生站 5 號出口步行 3 分鐘。`;

    return (
      <div className="min-h-[500px] p-8 bg-[#18181b] flex flex-col items-center justify-center">
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 rounded-xl bg-raycast-coral text-white text-xs font-semibold"
        >
          開啟預選文字狀態
        </button>

        <QuickCaptureModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          defaultContent={longText}
          sourceUrl="https://instagram.com/p/cinnamon_cafe"
          sourceTitle="肉桂捲咖啡廳 IG 推薦文"
          onSaveJot={() => setIsOpen(false)}
          onSaveField={() => setIsOpen(false)}
        />
      </div>
    );
  },
};

export const LightModeShowcase: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <div className="min-h-[500px] p-8 bg-[#faf9f6] flex flex-col items-center justify-center">
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 rounded-xl bg-black text-white text-xs font-semibold"
        >
          開啟淺色主題 Modal
        </button>

        {isOpen && (
          <div className="light">
            <QuickCaptureModal
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
              defaultContent="簡潔流暢的淺色模式快速擷取測試。"
              sourceUrl="https://news.ycombinator.com"
              sourceTitle="Hacker News"
              onSaveJot={() => setIsOpen(false)}
            />
          </div>
        )}
      </div>
    );
  },
};
