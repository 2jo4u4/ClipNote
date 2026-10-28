import { useState, useMemo } from 'react';
import {
  Globe,
  Plus,
  Moon,
  Sun,
  FileText,
  Download,
  Check,
} from 'lucide-react';
import { cn } from '../utils';
import { PageTabs, PageItem } from './PageTabs';
import { OmniSearchBar } from './OmniSearchBar';
import { SectionContainer } from './SectionContainer';
import { CellCard } from './CellCard';
import { QuickCaptureModal } from './QuickCaptureModal';
import { NewPageModal, NewPageData } from './NewPageModal';
import { MoveCellModal } from './MoveCellModal';
import type { Page, Section, Cell, SearchResult, CreateCellInput } from '../types';

export interface SidePanelProps {
  currentDomain?: string;
  currentUrl?: string;
  initialPages?: Page[];
  initialActivePageId?: string;
  className?: string;
}

// Built-in rich demo dataset using unified Cell and Section
const defaultDemoPages: Page[] = [
  {
    id: 'SYSTEM_GLOBAL_PAGE',
    title: '全域筆記頁',
    icon: '🌐',
    domains: ['*'],
    isSystem: true,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 3600000,
    sections: [
      {
        id: 'sec-global-fields',
        title: '常用填表資訊',
        order: 0,
        createdAt: Date.now() - 86400000 * 2,
        updatedAt: Date.now() - 3600000,
        items: [
          { id: 'f-1', key: '全名', value: '王小明', createdAt: Date.now() - 86400000 * 2, updatedAt: Date.now() - 86400000 * 2 },
          { id: 'f-2', key: 'Email', value: 'xiaoming.wang@example.com', createdAt: Date.now() - 86400000 * 2, updatedAt: Date.now() - 86400000 * 2 },
          { id: 'f-3', key: '電話號碼', value: '0912-345-678', createdAt: Date.now() - 86400000 * 2, updatedAt: Date.now() - 86400000 * 2 },
          { id: 'f-4', key: '個人作品集', value: 'https://github.com/xiaoming', createdAt: Date.now() - 86400000, updatedAt: Date.now() - 86400000 },
        ],
      },
      {
        id: 'sec-global-jots',
        title: '全網通用備忘隨筆',
        order: 1,
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 1800000,
        items: [
          {
            id: 'j-1',
            value: '歡迎使用 Notebook 側邊欄！在此處點擊任何欄位即可一秒複製。使用右鍵或 Alt+N 可隨時快速捕獲。',
            createdAt: Date.now() - 7200000,
            updatedAt: Date.now() - 7200000,
          },
          {
            id: 'j-2',
            value: '這個全域筆記頁在任何網頁皆可快速查閱，不會隨著網址切換而隱藏。',
            sourceUrl: 'https://google.com',
            sourceTitle: 'Google 首頁',
            createdAt: Date.now() - 3600000,
            updatedAt: Date.now() - 3600000,
          },
        ],
      },
    ],
  },
  {
    id: 'page-104',
    title: '104 中文經歷',
    icon: '💼',
    domains: ['104.com.tw', '*.104.com.tw'],
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 1200000,
    sections: [
      {
        id: 'sec-104-job-fields',
        title: '工作經驗與技能',
        order: 0,
        createdAt: Date.now() - 86400000 * 2,
        updatedAt: Date.now() - 1200000,
        items: [
          {
            id: 'f-104-1',
            key: '職稱',
            value: '資深前端架構工程師 (Senior Frontend Architect)',
            createdAt: Date.now() - 86400000,
            updatedAt: Date.now() - 86400000,
          },
          {
            id: 'f-104-2',
            key: '任職公司',
            value: '極速科技有限公司 (Speedy Tech Co.)',
            createdAt: Date.now() - 86400000,
            updatedAt: Date.now() - 86400000,
          },
          {
            id: 'f-104-3',
            key: '核心技術棧',
            value: 'React, TypeScript, Next.js, Tailwind CSS, Chrome Extension, Vitest',
            createdAt: Date.now() - 43200000,
            updatedAt: Date.now() - 43200000,
          },
          {
            id: 'j-104-1',
            value: '具備 6 年以上大型 Web 產品開發經驗，主導千萬級流量前端微服務架構重構，使頁面加載速度提升 42%，並建立自動化 CI/CD 流程。',
            sourceUrl: 'https://104.com.tw/resume',
            sourceTitle: '104 人力銀行 - 我的履歷表',
            createdAt: Date.now() - 1800000,
            updatedAt: Date.now() - 1800000,
          },
        ],
      },
    ],
  },
  {
    id: 'page-social',
    title: '社交貼文靈感',
    icon: '💬',
    domains: ['threads.net', 'x.com', 'facebook.com'],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 7200000,
    sections: [
      {
        id: 'sec-social-jots',
        title: '短影音與社群靈感',
        order: 0,
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 7200000,
        items: [
          {
            id: 'j-soc-1',
            value: '如何用 Raycast 式的極簡流暢動態打造讓人愛不釋手的 Chrome 擴充功能？重點在於細膩的過渡曲線與零多餘線條。',
            sourceUrl: 'https://x.com/design_gems',
            sourceTitle: 'X / Design Gems',
            createdAt: Date.now() - 7200000,
            updatedAt: Date.now() - 7200000,
          },
        ],
      },
    ],
  },
];

export const SidePanel: React.FC<SidePanelProps> = ({
  currentDomain = '104.com.tw',
  currentUrl = 'https://www.104.com.tw/job/7xyz8',
  initialPages = defaultDemoPages,
  initialActivePageId,
  className,
}) => {
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [activePageId, setActivePageId] = useState<string>(() => {
    if (initialActivePageId) return initialActivePageId;
    const matched = initialPages.find(
      (p) =>
        p.domains &&
        p.domains.some((d) => d === currentDomain || currentDomain.endsWith(d.replace('*.', '')))
    );
    return matched ? matched.id : initialPages[0]?.id || 'SYSTEM_GLOBAL_PAGE';
  });

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isNewPageModalOpen, setIsNewPageModalOpen] = useState(false);
  const [movingCellTarget, setMovingCellTarget] = useState<{
    cell: Cell;
    sourcePageId: string;
    sourceSectionId: string;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 2000);
  };

  const activePage = useMemo(() => {
    return pages.find((p) => p.id === activePageId) || pages[0];
  }, [pages, activePageId]);

  // Flattened search items across all pages
  const allSearchResults: SearchResult[] = useMemo(() => {
    const list: SearchResult[] = [];
    for (const page of pages) {
      for (const sec of page.sections) {
        for (const cell of sec.items) {
          const isField = Boolean(cell.key);
          list.push({
            id: cell.id,
            type: isField ? 'field' : 'jot',
            title: cell.key || (cell.value.length > 24 ? cell.value.slice(0, 24) + '...' : cell.value),
            content: cell.value,
            pageId: page.id,
            pageTitle: page.title,
            sectionId: sec.id,
            sectionTitle: sec.title,
            sourcePath: `${page.title} > ${sec.title}${cell.key ? ` ‧ ${cell.key}` : ''}`,
            sourceUrl: cell.sourceUrl,
            sourceTitle: cell.sourceTitle,
          });
        }
      }
    }
    return list;
  }, [pages]);

  const pageTabItems: PageItem[] = useMemo(() => {
    return pages.map((p) => ({
      id: p.id,
      title: p.title,
      icon: p.icon,
      isSystem: p.isSystem,
      domains: p.domains,
      isPrimary: p.isPrimary,
    }));
  }, [pages]);

  const handleCreatePage = (data: NewPageData) => {
    const newId = `page-${Date.now()}`;
    const newPage: Page = {
      id: newId,
      title: data.title,
      icon: data.icon,
      domains: data.domains,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      sections: [
        {
          id: `sec-${Date.now()}-default`,
          title: '常用筆記分區',
          order: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          items: [],
        },
      ],
    };
    setPages((prev) => [...prev, newPage]);
    setActivePageId(newId);
    showToast(`已建立筆記頁「${data.title}」`);
  };

  const handleAddSection = () => {
    const title = window.prompt('請輸入新分區名稱：', '新分區');
    if (!title || !title.trim()) return;

    const newSec: Section = {
      id: `sec-${Date.now()}`,
      title: title.trim(),
      order: activePage.sections.length,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      items: [],
    };

    setPages((prev) =>
      prev.map((p) => {
        if (p.id !== activePage.id) return p;
        return {
          ...p,
          sections: [...p.sections, newSec],
          updatedAt: Date.now(),
        };
      })
    );
    showToast(`已新增分區「${title.trim()}」`);
  };

  const handleExtractSectionToPage = (sectionId: string) => {
    const targetSec = activePage.sections.find((s) => s.id === sectionId);
    if (!targetSec) return;

    const newPageId = `page-${Date.now()}`;
    const newPage: Page = {
      id: newPageId,
      title: targetSec.title,
      icon: '📄',
      domains: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      sections: [{ ...targetSec, order: 0 }],
    };

    setPages((prev) => [
      ...prev.map((p) => {
        if (p.id !== activePage.id) return p;
        return {
          ...p,
          sections: p.sections.filter((s) => s.id !== sectionId),
          updatedAt: Date.now(),
        };
      }),
      newPage,
    ]);

    setActivePageId(newPageId);
    showToast(`已升格為獨立筆記頁「${targetSec.title}」`);
  };

  const handleOpenMoveModal = (cell: Cell, sourcePageId: string, sourceSectionId: string) => {
    setMovingCellTarget({ cell, sourcePageId, sourceSectionId });
  };

  const handleConfirmMoveCell = (targetPageId: string, targetSectionId: string) => {
    if (!movingCellTarget) return;
    const { cell, sourcePageId, sourceSectionId } = movingCellTarget;

    setPages((prev) => {
      let movedCell: Cell | null = null;
      const removed = prev.map((p) => {
        if (p.id !== sourcePageId) return p;
        return {
          ...p,
          sections: p.sections.map((s) => {
            if (s.id !== sourceSectionId) return s;
            const idx = s.items.findIndex((c) => c.id === cell.id);
            if (idx !== -1) {
              movedCell = s.items[idx];
              return {
                ...s,
                items: s.items.filter((c) => c.id !== cell.id),
                updatedAt: Date.now(),
              };
            }
            return s;
          }),
          updatedAt: Date.now(),
        };
      });

      if (!movedCell) return prev;

      return removed.map((p) => {
        if (p.id !== targetPageId) return p;
        return {
          ...p,
          sections: p.sections.map((s) => {
            if (s.id !== targetSectionId) return s;
            return {
              ...s,
              items: [...s.items, { ...movedCell!, updatedAt: Date.now() }],
              updatedAt: Date.now(),
            };
          }),
          updatedAt: Date.now(),
        };
      });
    });

    const targetPage = pages.find((p) => p.id === targetPageId);
    const targetSection = targetPage?.sections.find((s) => s.id === targetSectionId);
    showToast(`已移動至「${targetPage?.title || ''} > ${targetSection?.title || ''}」`);
    setMovingCellTarget(null);
  };

  const handleBindDomain = (pageId: string) => {
    if (!currentDomain) return;
    setPages((prev) =>
      prev.map((p) => {
        if (p.id !== pageId) return p;
        if (p.domains.includes(currentDomain)) return p;
        return {
          ...p,
          domains: [...p.domains, currentDomain],
          updatedAt: Date.now(),
        };
      })
    );
    showToast(`已綁定「${currentDomain}」至該筆記頁`);
  };

  const handleCopy = (content: string, label: string) => {
    navigator.clipboard.writeText(content).catch(() => {});
    showToast(`已複製「${label}」`);
  };

  const handleDeleteCell = (pageId: string, sectionId: string, cellId: string) => {
    setPages((prev) =>
      prev.map((p) => {
        if (p.id !== pageId) return p;
        return {
          ...p,
          sections: p.sections.map((s) => {
            if (s.id !== sectionId) return s;
            return {
              ...s,
              items: s.items.filter((c) => c.id !== cellId),
              updatedAt: Date.now(),
            };
          }),
          updatedAt: Date.now(),
        };
      })
    );
    showToast('已刪除單元項');
  };

  const handleQuickSaveCell = (
    data: CreateCellInput & { pageId: string; sectionId?: string }
  ) => {
    const now = Date.now();
    const newCell: Cell = {
      id: `c-${Date.now()}`,
      key: data.key,
      value: data.value,
      sourceUrl: data.sourceUrl,
      sourceTitle: data.sourceTitle,
      createdAt: now,
      updatedAt: now,
    };

    setPages((prev) =>
      prev.map((p) => {
        if (p.id !== data.pageId) return p;

        let secIndex = p.sections.findIndex((s) => s.id === data.sectionId);
        if (secIndex === -1 && p.sections.length > 0) {
          secIndex = 0;
        }

        if (secIndex === -1) {
          const newSec: Section = {
            id: `sec-${Date.now()}`,
            title: '預設分區',
            order: 0,
            createdAt: now,
            updatedAt: now,
            items: [newCell],
          };
          return { ...p, sections: [newSec], updatedAt: now };
        }

        const updatedSections = [...p.sections];
        const targetSec = updatedSections[secIndex];
        updatedSections[secIndex] = {
          ...targetSec,
          items: [newCell, ...targetSec.items],
          updatedAt: now,
        };
        return { ...p, sections: updatedSections, updatedAt: now };
      })
    );

    showToast(data.key ? `已儲存欄位「${data.key}」！` : '已儲存隨筆！');
  };

  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(activePage, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${activePage.title}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('已匯出筆記頁 JSON');
  };

  const quickCapturePages = useMemo(() => {
    return pages.map((p) => ({
      id: p.id,
      title: `${p.icon ? p.icon + ' ' : ''}${p.title}`,
      isSystem: p.isSystem,
      sections: p.sections.map((s) => ({
        id: s.id,
        title: s.title,
        pageId: p.id,
      })),
    }));
  }, [pages]);

  return (
    <div
      className={cn(
        isDarkMode ? 'dark' : '',
        'relative flex flex-col h-full w-full select-none overflow-hidden font-sans',
        className
      )}
    >
      <div
        className={cn(
          'relative flex flex-col h-full w-full border overflow-hidden',
          'bg-raycast-light-bg text-raycast-light-text border-raycast-light-border',
          'dark:bg-raycast-dark-bg dark:text-raycast-dark-text dark:border-raycast-dark-border'
        )}
      >
        {/* Header */}
        <header
          className={cn(
            'flex items-center justify-between px-3.5 py-2.5 border-b flex-shrink-0',
            'bg-raycast-light-surface/70 border-raycast-light-border backdrop-blur-md',
            'dark:bg-raycast-dark-surface/60 dark:border-white/10'
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded-md bg-raycast-amber flex items-center justify-center text-raycast-dark-bg font-black text-[11px] shadow-sm flex-shrink-0">
              N
            </div>
            <span className="font-semibold text-xs tracking-tight text-raycast-light-text dark:text-raycast-dark-text flex-shrink-0">
              筆記本
            </span>

            {currentDomain && (
              <span
                title={`目前頁面網域: ${currentDomain}`}
                className={cn(
                  'flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full border truncate',
                  'border-raycast-amber/30 bg-raycast-amber/10 text-raycast-amber'
                )}
              >
                <Globe className="w-2.5 h-2.5 flex-shrink-0" />
                <span className="truncate max-w-[130px]">{currentDomain}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setIsQuickCaptureOpen(true)}
              title="快速輸入備忘 (Alt+N)"
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200',
                'bg-raycast-amber text-raycast-dark-bg hover:brightness-110 active:scale-95 shadow-sm'
              )}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>快速捕獲</span>
            </button>

            <button
              onClick={handleExportJson}
              title="匯出此筆記頁 JSON"
              className={cn(
                'p-1.5 rounded-lg text-raycast-light-muted dark:text-raycast-dark-muted',
                'hover:text-raycast-light-text dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5',
                'transition-colors duration-150'
              )}
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? '切換為亮色主題' : '切換為深色主題'}
              className={cn(
                'p-1.5 rounded-lg text-raycast-light-muted dark:text-raycast-dark-muted',
                'hover:text-raycast-light-text dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5',
                'transition-colors duration-150'
              )}
            >
              {isDarkMode ? (
                <Sun className="w-3.5 h-3.5 text-raycast-amber" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-raycast-light-muted" />
              )}
            </button>
          </div>
        </header>

        {/* Omni-Search Bar */}
        <div className="p-3 border-b border-raycast-light-border dark:border-raycast-dark-border flex-shrink-0">
          <OmniSearchBar
            results={allSearchResults}
            currentDomain={currentDomain}
            onBindDomain={handleBindDomain}
            onSelectItem={(item) => {
              setActivePageId(item.pageId);
              showToast(`已複製並定位至「${item.title}」`);
            }}
          />
        </div>

        {/* PageTabs */}
        <div className="flex-shrink-0">
          <PageTabs
            pages={pageTabItems}
            activePageId={activePageId}
            onSelectPage={setActivePageId}
            onAddPage={() => setIsNewPageModalOpen(true)}
          />
        </div>

        {/* Active Page Body */}
        <main className="flex-1 overflow-y-auto p-3.5 space-y-3.5 no-scrollbar">
          {/* Active Page Header Banner with Add Section Button on the Right */}
          <div className="flex items-center justify-between pb-1 gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-base select-none">{activePage.icon || '📄'}</span>
              <h2 className="text-sm font-semibold text-raycast-light-text dark:text-raycast-dark-text truncate">
                {activePage.title}
              </h2>
              {activePage.domains && activePage.domains.length > 0 && !activePage.isSystem && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full border border-raycast-amber/30 bg-raycast-amber/10 text-raycast-amber truncate max-w-[130px]">
                  {activePage.domains.join(', ')}
                </span>
              )}
            </div>

            {/* Q1: Add Section Button directly on the right side of the Page header! */}
            <button
              type="button"
              onClick={handleAddSection}
              title="在此筆記頁新增分區"
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0 transition-all duration-150',
                'bg-raycast-amber/10 hover:bg-raycast-amber/20 text-raycast-amber border border-raycast-amber/30 active:scale-95'
              )}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增分區</span>
            </button>
          </div>

          {activePage.sections && activePage.sections.length > 0 ? (
            activePage.sections.map((section) => (
              <SectionContainer
                key={section.id}
                id={section.id}
                title={section.title}
                type="mixed"
                itemCount={section.items.length}
                onAddItem={() => setIsQuickCaptureOpen(true)}
                onExtractToPage={handleExtractSectionToPage}
                onExportPage={handleExportJson}
                onDeleteSection={(secId) => {
                  setPages((prev) =>
                    prev.map((p) => {
                      if (p.id !== activePage.id) return p;
                      return {
                        ...p,
                        sections: p.sections.filter((s) => s.id !== secId),
                        updatedAt: Date.now(),
                      };
                    })
                  );
                  showToast('已刪除分區');
                }}
              >
                {section.items.length > 0 ? (
                  <div className="space-y-2">
                    {section.items.map((cell) => (
                      <CellCard
                        key={cell.id}
                        id={cell.id}
                        cellKey={cell.key}
                        value={cell.value}
                        createdAt={cell.createdAt}
                        updatedAt={cell.updatedAt}
                        sourceUrl={cell.sourceUrl}
                        sourceTitle={cell.sourceTitle}
                        onCopy={() => handleCopy(cell.value, cell.key || '隨筆')}
                        onMove={() => handleOpenMoveModal(cell, activePage.id, section.id)}
                        onDelete={() =>
                          handleDeleteCell(activePage.id, section.id, cell.id)
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-raycast-light-subtle dark:text-raycast-dark-subtle">
                    分區尚無單元項，點擊右上角「+」或快速捕獲新增
                  </div>
                )}
              </SectionContainer>
            ))
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-raycast-amber/10 border border-raycast-amber/30 flex items-center justify-center text-raycast-amber">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-raycast-light-text dark:text-raycast-dark-text">
                  此筆記頁目前空空如也
                </p>
                <p className="text-[11px] text-raycast-light-subtle dark:text-raycast-dark-subtle mt-0.5">
                  點擊快速捕獲或右上角「新增分區」開始記錄
                </p>
              </div>
              <button
                onClick={handleAddSection}
                className="mt-1 px-3 py-1.5 rounded-lg text-xs bg-raycast-amber text-raycast-dark-bg font-medium"
              >
                + 新增第一筆分區
              </button>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer
          className={cn(
            'flex items-center justify-between px-3 py-1.5 text-[11px] border-t flex-shrink-0 select-none',
            'border-raycast-light-border bg-raycast-light-surface/50 text-raycast-light-subtle',
            'dark:border-white/5 dark:bg-raycast-dark-surface/40 dark:text-raycast-dark-subtle'
          )}
        >
          <div className="flex items-center gap-2">
            <span>
              總計 {pages.length} 個筆記頁 · {allSearchResults.length} 筆資料
            </span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 font-mono text-[10px]">
              Alt+N
            </kbd>
            <span>快速捕獲</span>
          </div>
        </footer>

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-raycast-dark-surface border border-white/15 text-raycast-dark-text text-xs shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            <Check className="w-3.5 h-3.5 text-raycast-emerald" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Quick Capture Modal */}
        <QuickCaptureModal
          isOpen={isQuickCaptureOpen}
          onClose={() => setIsQuickCaptureOpen(false)}
          pages={quickCapturePages}
          activePageId={activePageId}
          sourceUrl={currentUrl}
          sourceTitle="當前瀏覽網頁"
          searchResults={allSearchResults}
          onSaveCell={handleQuickSaveCell}
          onCopySearchResult={(item) => {
            handleCopy(item.content, item.title);
          }}
        />

        <NewPageModal
          isOpen={isNewPageModalOpen}
          onClose={() => setIsNewPageModalOpen(false)}
          onSubmit={handleCreatePage}
        />

        <MoveCellModal
          isOpen={Boolean(movingCellTarget)}
          cell={movingCellTarget?.cell || null}
          sourcePageId={movingCellTarget?.sourcePageId || ''}
          sourceSectionId={movingCellTarget?.sourceSectionId || ''}
          pages={pages}
          onClose={() => setMovingCellTarget(null)}
          onConfirm={handleConfirmMoveCell}
        />
      </div>
    </div>
  );
};
