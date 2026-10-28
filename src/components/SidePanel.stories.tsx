import type { Meta, StoryObj } from '@storybook/react';
import { SidePanel } from './SidePanel';
import { ArrowLeft, ArrowRight, RotateCw, PanelRight, Lock } from 'lucide-react';

const meta: Meta<typeof SidePanel> = {
  title: 'Raycast/SidePanel (完整側邊欄)',
  component: SidePanel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SidePanel>;

/**
 * 模擬 Chrome 瀏覽器視窗與右側擴充功能 Side Panel
 */
export const InBrowserSidePanel: Story = {
  render: () => {
    const url = 'https://www.104.com.tw/job/7xyz8';

    return (
      <div className="flex flex-col w-[960px] h-[720px] rounded-2xl overflow-hidden border border-zinc-700/60 shadow-2xl bg-zinc-900 select-none">
        {/* Browser Title Bar / Tabs */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-zinc-950 border-b border-zinc-800 text-xs">
          {/* Window Buttons */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
            <div className="ml-3 px-3 py-1 rounded-t-lg bg-zinc-800 text-zinc-300 text-xs flex items-center gap-1.5 border-t border-x border-zinc-700">
              <span className="w-2 h-2 rounded-full bg-raycast-amber" />
              <span>104 人力銀行 - 資深前端架構師</span>
            </div>
          </div>

          <div className="text-zinc-500 text-[11px] font-mono">
            Chrome 瀏覽器側邊欄視圖 (380px Side Panel)
          </div>
        </div>

        {/* Browser Omnibox URL Bar */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400">
          <div className="flex items-center gap-1">
            <button className="p-1 hover:text-zinc-200 rounded">
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 hover:text-zinc-200 rounded">
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 hover:text-zinc-200 rounded">
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* URL Pill */}
          <div className="flex-1 flex items-center gap-2 px-3 py-1 bg-zinc-950 rounded-full border border-zinc-700/60 text-zinc-300 font-mono text-[11px]">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span className="text-zinc-400">https://</span>
            <span className="text-zinc-100 font-semibold">www.104.com.tw</span>
            <span className="text-zinc-500">/job/7xyz8</span>
          </div>

          <div className="flex items-center gap-2 text-zinc-400">
            <PanelRight className="w-4 h-4 text-raycast-amber" />
          </div>
        </div>

        {/* Browser Main Body: Web Page on Left (Flexible) + Extension SidePanel on Right (380px) */}
        <div className="flex flex-1 overflow-hidden">
          {/* Simulated Left Web Page Content */}
          <div className="flex-1 bg-zinc-900/40 p-6 overflow-y-auto flex flex-col gap-4 border-r border-zinc-800 text-zinc-400">
            <div className="p-4 rounded-xl bg-zinc-800/40 border border-zinc-700/40">
              <span className="text-[10px] uppercase font-mono tracking-wider text-raycast-amber bg-raycast-amber/10 px-2 py-0.5 rounded-full border border-raycast-amber/20">
                104 人力銀行應徵頁面
              </span>
              <h1 className="text-lg font-bold text-zinc-100 mt-2">
                資深前端架構工程師 (Senior Frontend Architect)
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                台北市信義區 · 全職 · 月薪 120,000 ~ 180,000 元
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/30 text-xs space-y-2">
              <div className="font-semibold text-zinc-300">應徵職缺所需欄位表單：</div>
              <p className="text-zinc-500 text-[11px]">
                💡 試著在右側側邊欄點選「工作經驗欄位」或「常用填表資訊」，點擊任一欄位立即一秒複製，即可貼到本頁面！
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                  <div className="text-[10px] text-zinc-500">應徵者全名</div>
                  <div className="text-xs text-zinc-300 font-mono mt-0.5">點選右側欄位複製後貼上</div>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                  <div className="text-[10px] text-zinc-500">主要技術棧</div>
                  <div className="text-xs text-zinc-300 font-mono mt-0.5">點選右側技術棧複製後貼上</div>
                </div>
              </div>
            </div>

            <div className="mt-auto p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 text-[11px] text-zinc-500 flex items-center justify-between">
              <span>側邊欄依據網域自動聚焦於 💼 104 中文經歷</span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px]">
                Domain: 104.com.tw
              </kbd>
            </div>
          </div>

          {/* Right SidePanel: Exactly 380px wide */}
          <div className="w-[380px] h-full flex-shrink-0 shadow-[-8px_0_24px_rgba(0,0,0,0.3)]">
            <SidePanel
              currentDomain="104.com.tw"
              currentUrl={url}
            />
          </div>
        </div>
      </div>
    );
  },
};

/**
 * 獨立側邊欄 (Standalone 380px)
 */
export const Standalone: Story = {
  render: () => {
    return (
      <div className="w-[380px] h-[680px] rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
        <SidePanel
          currentDomain="104.com.tw"
          currentUrl="https://www.104.com.tw/job/7xyz8"
        />
      </div>
    );
  },
};

/**
 * 全域未綁定網域狀態（預設聚焦於 🌐 全域筆記頁）
 */
export const UnboundDomainGlobalPage: Story = {
  render: () => {
    return (
      <div className="w-[380px] h-[680px] rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
        <SidePanel
          currentDomain="github.com"
          currentUrl="https://github.com/trending"
          initialActivePageId="SYSTEM_GLOBAL_PAGE"
        />
      </div>
    );
  },
};
