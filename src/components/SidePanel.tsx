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
import { FieldCard } from './FieldCard';
import { JotCard } from './JotCard';
import { QuickCaptureModal } from './QuickCaptureModal';
import { NewPageModal, NewPageData } from './NewPageModal';
import type { Page, Field, Jot, FieldsSection, JotsSection, SearchResult } from '../types';

export interface SidePanelProps {
  currentDomain?: string;
  currentUrl?: string;
  initialPages?: Page[];
  initialActivePageId?: string;
  className?: string;
}

// Built-in rich demo dataset
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
        type: 'fields',
        order: 0,
        createdAt: Date.now() - 86400000 * 2,
        updatedAt: Date.now() - 3600000,
        fields: [
          { id: 'f-1', key: '全名', value: '王小明', createdAt: Date.now() - 86400000 * 2 },
          { id: 'f-2', key: 'Email', value: 'xiaoming.wang@example.com', createdAt: Date.now() - 86400000 * 2 },
          { id: 'f-3', key: '電話號碼', value: '0912-345-678', createdAt: Date.now() - 86400000 * 2 },
          { id: 'f-4', key: '個人作品集', value: 'https://github.com/xiaoming', createdAt: Date.now() - 86400000 },
        ],
      },
      {
        id: 'sec-global-jots',
        title: '全網通用備忘隨筆',
        type: 'jots',
        order: 1,
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 1800000,
        jots: [
          {
            id: 'j-1',
            content: '歡迎使用 Notebook 側邊欄！在此處點擊任何欄位即可一秒複製。使用右鍵或 Alt+N 可隨時快速捕獲。',
            createdAt: Date.now() - 7200000,
          },
          {
            id: 'j-2',
            content: '這個全域分頁在任何網頁皆可快速查閱，不會隨著網址切換而隱藏。',
            sourceUrl: 'https://google.com',
            sourceTitle: 'Google 首頁',
            createdAt: Date.now() - 3600000,
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
        title: '工作經驗欄位',
        type: 'fields',
        order: 0,
        createdAt: Date.now() - 86400000 * 2,
        updatedAt: Date.now() - 1200000,
        fields: [
          {
            id: 'f-104-1',
            key: '職稱',
            value: '資深前端架構工程師 (Senior Frontend Architect)',
            createdAt: Date.now() - 86400000,
          },
          {
            id: 'f-104-2',
            key: '任職公司',
            value: '極速科技有限公司 (Speedy Tech Co.)',
            createdAt: Date.now() - 86400000,
          },
          {
            id: 'f-104-3',
            key: '在職年資',
            value: '2021/03 ~ 至今 (4 年)',
            createdAt: Date.now() - 86400000,
          },
          {
            id: 'f-104-4',
            key: '核心技術棧',
            value: 'React, TypeScript, Next.js, Tailwind CSS, Chrome Extension, Vitest',
            createdAt: Date.now() - 43200000,
          },
        ],
      },
      {
        id: 'sec-104-intro-jots',
        title: '自傳與求職亮點隨筆',
        type: 'jots',
        order: 1,
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 600000,
        jots: [
          {
            id: 'j-104-1',
            content: '具備 6 年以上大型 Web 產品開發經驗，主導千萬級流量前端微服務架構重構，使頁面加載速度提升 42%，並建立無障礙規範與自動化 CI/CD 測試流程。',
            sourceUrl: 'https://104.com.tw/resume',
            sourceTitle: '104 人力銀行 - 我的履歷表',
            createdAt: Date.now() - 1800000,
          },
          {
            id: 'j-104-2',
            content: '擅長推動領域驅動設計 (DDD) 與深模組架構，將複雜狀態簡化，並指導 5 名工程師順利落地微前端生態。',
            createdAt: Date.now() - 600000,
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
        type: 'jots',
        order: 0,
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 7200000,
        jots: [
          {
            id: 'j-soc-1',
            content: '如何用 Raycast 式的極簡流暢動態打造讓人愛不釋手的 Chrome 擴充功能？重點在於細膩的過渡曲線與零多餘線條。',
            sourceUrl: 'https://x.com/design_gems',
            sourceTitle: 'X / Design Gems',
            createdAt: Date.now() - 7200000,
          },
        ],
      },
    ],
  },
  {
    id: 'page-cake',
    title: 'CakeResume 英文檔案',
    icon: '📝',
    domains: ['cakeresume.com'],
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000,
    sections: [
      {
        id: 'sec-cake-fields',
        title: 'English Profile Summary',
        type: 'fields',
        order: 0,
        createdAt: Date.now() - 86400000 * 4,
        updatedAt: Date.now() - 86400000,
        fields: [
          {
            id: 'f-ck-1',
            key: 'English Name',
            value: 'Jay Wang',
            createdAt: Date.now() - 86400000 * 4,
          },
          {
            id: 'f-ck-2',
            key: 'Headline',
            value: 'Senior Frontend Architect & Developer Experience Enthusiast',
            createdAt: Date.now() - 86400000 * 4,
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
    // Auto-match current domain
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
        if (sec.type === 'fields') {
          for (const field of sec.fields) {
            list.push({
              id: field.id,
              type: 'field',
              title: field.key,
              content: field.value,
              pageId: page.id,
              pageTitle: page.title,
              sectionId: sec.id,
              sectionTitle: sec.title,
              sourcePath: `${page.title} > ${sec.title}`,
            });
          }
        } else {
          for (const jot of sec.jots) {
            list.push({
              id: jot.id,
              type: 'jot',
              title: jot.content.slice(0, 24),
              content: jot.content,
              pageId: page.id,
              pageTitle: page.title,
              sectionId: sec.id,
              sectionTitle: sec.title,
              sourcePath: `${page.title} > ${sec.title}`,
              sourceUrl: jot.sourceUrl,
              sourceTitle: jot.sourceTitle,
            });
          }
        }
      }
    }
    return list;
  }, [pages]);

  // Page tabs conversion
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

  // Action handlers
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
          id: `sec-${Date.now()}-fields`,
          title: '常用欄位',
          type: 'fields',
          order: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          fields: [],
        },
        {
          id: `sec-${Date.now()}-jots`,
          title: '備忘隨筆',
          type: 'jots',
          order: 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          jots: [],
        },
      ],
    };
    setPages((prev) => [...prev, newPage]);
    setActivePageId(newId);
    showToast(`已建立筆記頁「${data.title}」`);
  };

  const handleCopy = (content: string, label: string) => {
    navigator.clipboard.writeText(content).catch(() => {});
    showToast(`已複製「${label}」`);
  };

  const handleDeleteField = (pageId: string, sectionId: string, fieldId: string) => {
    setPages((prev) =>
      prev.map((p) => {
        if (p.id !== pageId) return p;
        return {
          ...p,
          sections: p.sections.map((s) => {
            if (s.id !== sectionId || s.type !== 'fields') return s;
            return {
              ...s,
              fields: (s as FieldsSection).fields.filter((f) => f.id !== fieldId),
            };
          }),
        };
      })
    );
    showToast('已刪除欄位');
  };

  const handleDeleteJot = (pageId: string, sectionId: string, jotId: string) => {
    setPages((prev) =>
      prev.map((p) => {
        if (p.id !== pageId) return p;
        return {
          ...p,
          sections: p.sections.map((s) => {
            if (s.id !== sectionId || s.type !== 'jots') return s;
            return {
              ...s,
              jots: (s as JotsSection).jots.filter((j) => j.id !== jotId),
            };
          }),
        };
      })
    );
    showToast('已刪除隨筆');
  };

  const handleQuickSaveJot = (data: {
    pageId: string;
    sectionId?: string;
    content: string;
    sourceUrl?: string;
    sourceTitle?: string;
  }) => {
    setPages((prev) =>
      prev.map((p) => {
        if (p.id !== data.pageId) return p;
        // Find existing jots section or first jots section
        let secIndex = p.sections.findIndex(
          (s) => s.id === data.sectionId || s.type === 'jots'
        );
        const newJot: Jot = {
          id: `j-${Date.now()}`,
          content: data.content,
          sourceUrl: data.sourceUrl,
          sourceTitle: data.sourceTitle,
          createdAt: Date.now(),
        };

        if (secIndex === -1) {
          const newSec: JotsSection = {
            id: `sec-${Date.now()}-jots`,
            title: '隨筆記要',
            type: 'jots',
            order: p.sections.length,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            jots: [newJot],
          };
          return { ...p, sections: [...p.sections, newSec] };
        }

        const updatedSections = [...p.sections];
        const targetSec = updatedSections[secIndex] as JotsSection;
        updatedSections[secIndex] = {
          ...targetSec,
          jots: [newJot, ...targetSec.jots],
        };
        return { ...p, sections: updatedSections };
      })
    );
    showToast('已儲存隨筆！');
  };

  const handleQuickSaveField = (data: {
    pageId: string;
    sectionId?: string;
    key: string;
    value: string;
    sourceUrl?: string;
    sourceTitle?: string;
  }) => {
    setPages((prev) =>
      prev.map((p) => {
        if (p.id !== data.pageId) return p;
        let secIndex = p.sections.findIndex(
          (s) => s.id === data.sectionId || s.type === 'fields'
        );
        const newField: Field = {
          id: `f-${Date.now()}`,
          key: data.key,
          value: data.value,
          createdAt: Date.now(),
        };

        if (secIndex === -1) {
          const newSec: FieldsSection = {
            id: `sec-${Date.now()}-fields`,
            title: '常用欄位',
            type: 'fields',
            order: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            fields: [newField],
          };
          return { ...p, sections: [newSec, ...p.sections] };
        }

        const updatedSections = [...p.sections];
        const targetSec = updatedSections[secIndex] as FieldsSection;
        updatedSections[secIndex] = {
          ...targetSec,
          fields: [...targetSec.fields, newField],
        };
        return { ...p, sections: updatedSections };
      })
    );
    showToast(`已儲存欄位「${data.key}」！`);
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
    showToast('已匯出分頁 JSON');
  };

  // Convert pages for quick capture modal dropdowns
  const quickCapturePages = useMemo(() => {
    return pages.map((p) => ({
      id: p.id,
      title: `${p.icon ? p.icon + ' ' : ''}${p.title}`,
      isSystem: p.isSystem,
      sections: p.sections.map((s) => ({
        id: s.id,
        title: s.title,
        type: s.type,
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
        {/* ========================================================= */}
        {/* Top Header: App Branding + Current Domain + Utility Icons */}
        {/* ========================================================= */}
        <header
          className={cn(
            'flex items-center justify-between px-3.5 py-2.5 border-b flex-shrink-0',
            'bg-raycast-light-surface/70 border-raycast-light-border/80 backdrop-blur-md',
            'dark:bg-raycast-dark-surface/60 dark:border-white/10'
          )}
        >
          {/* Brand & Active Domain */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded-md bg-raycast-amber flex items-center justify-center text-raycast-dark-bg font-black text-[11px] shadow-sm flex-shrink-0">
              N
            </div>
            <span className="font-semibold text-xs tracking-tight text-raycast-light-text dark:text-raycast-dark-text flex-shrink-0">
              筆記本
            </span>

            {/* Current Domain Pill */}
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

          {/* Quick Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Quick Capture Button */}
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

            {/* Export JSON Button */}
            <button
              onClick={handleExportJson}
              title="匯出此分頁 JSON"
              className={cn(
                'p-1.5 rounded-lg text-raycast-light-muted dark:text-raycast-dark-muted',
                'hover:text-raycast-light-text dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5',
                'transition-colors duration-150'
              )}
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Dark / Light Toggle */}
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

        {/* ========================================================= */}
        {/* Omni-Search Bar */}
        {/* ========================================================= */}
        <div className="p-3 border-b border-raycast-light-border dark:border-raycast-dark-border flex-shrink-0">
          <OmniSearchBar
            results={allSearchResults}
            currentDomain={currentDomain}
            onSelectItem={(item) => {
              setActivePageId(item.pageId);
              showToast(`已複製並定位至「${item.title}」`);
            }}
          />
        </div>

        {/* ========================================================= */}
        {/* PageTabs Bar (with custom icons & add button) */}
        {/* ========================================================= */}
        <div className="flex-shrink-0">
          <PageTabs
            pages={pageTabItems}
            activePageId={activePageId}
            onSelectPage={setActivePageId}
            onAddPage={() => setIsNewPageModalOpen(true)}
          />
        </div>

        {/* ========================================================= */}
        {/* Active Page Body (Scrollable Sections) */}
        {/* ========================================================= */}
        <main className="flex-1 overflow-y-auto p-3.5 space-y-3.5 no-scrollbar">
          {/* Active Page Header Banner */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base select-none">{activePage.icon || '📄'}</span>
              <h2 className="text-sm font-semibold text-raycast-light-text dark:text-raycast-dark-text">
                {activePage.title}
              </h2>
            </div>
            {activePage.domains && activePage.domains.length > 0 && !activePage.isSystem && (
              <span className="text-[11px] font-mono text-raycast-light-subtle dark:text-raycast-dark-subtle">
                已綁定: {activePage.domains.join(', ')}
              </span>
            )}
          </div>

          {/* Page Sections */}
          {activePage.sections && activePage.sections.length > 0 ? (
            activePage.sections.map((section) => {
              if (section.type === 'fields') {
                const fieldsSec = section as FieldsSection;
                return (
                  <SectionContainer
                    key={fieldsSec.id}
                    id={fieldsSec.id}
                    title={fieldsSec.title}
                    type="fields"
                    itemCount={fieldsSec.fields.length}
                    onAddItem={() => setIsQuickCaptureOpen(true)}
                    onExportPage={handleExportJson}
                  >
                    {fieldsSec.fields.length > 0 ? (
                      <div className="space-y-2">
                        {fieldsSec.fields.map((field) => (
                          <FieldCard
                            key={field.id}
                            id={field.id}
                            fieldKey={field.key}
                            value={field.value}
                            createdAt={field.createdAt}
                            sourceUrl={field.sourceUrl}
                            onCopy={() => handleCopy(field.value, field.key)}
                            onDelete={() =>
                              handleDeleteField(activePage.id, fieldsSec.id, field.id)
                            }
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-raycast-light-subtle dark:text-raycast-dark-subtle">
                        尚無欄位，點擊「快速捕獲」或右上角「+」新增
                      </div>
                    )}
                  </SectionContainer>
                );
              } else {
                const jotsSec = section as JotsSection;
                return (
                  <SectionContainer
                    key={jotsSec.id}
                    id={jotsSec.id}
                    title={jotsSec.title}
                    type="jots"
                    itemCount={jotsSec.jots.length}
                    onAddItem={() => setIsQuickCaptureOpen(true)}
                    onExportPage={handleExportJson}
                  >
                    {jotsSec.jots.length > 0 ? (
                      <div className="space-y-2">
                        {jotsSec.jots.map((jot) => (
                          <JotCard
                            key={jot.id}
                            id={jot.id}
                            content={jot.content}
                            createdAt={jot.createdAt}
                            sourceUrl={jot.sourceUrl}
                            sourceTitle={jot.sourceTitle}
                            onCopy={() => handleCopy(jot.content, '隨筆')}
                            onDelete={() =>
                              handleDeleteJot(activePage.id, jotsSec.id, jot.id)
                            }
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-raycast-light-subtle dark:text-raycast-dark-subtle">
                        尚無隨筆，選取網頁文字後右鍵即可存入此處
                      </div>
                    )}
                  </SectionContainer>
                );
              }
            })
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
                  點擊快速捕獲立即新增欄位或隨筆
                </p>
              </div>
              <button
                onClick={() => setIsQuickCaptureOpen(true)}
                className="mt-1 px-3 py-1.5 rounded-lg text-xs bg-raycast-amber text-raycast-dark-bg font-medium"
              >
                + 新增第一筆內容
              </button>
            </div>
          )}
        </main>

        {/* ========================================================= */}
        {/* Bottom Status Bar */}
        {/* ========================================================= */}
        <footer
          className={cn(
            'flex items-center justify-between px-3 py-1.5 text-[11px] border-t flex-shrink-0 select-none',
            'border-raycast-light-border bg-raycast-light-surface/50 text-raycast-light-subtle',
            'dark:border-white/5 dark:bg-raycast-dark-surface/40 dark:text-raycast-dark-subtle'
          )}
        >
          <div className="flex items-center gap-2">
            <span>
              總計 {pages.length} 個分頁 · {allSearchResults.length} 筆資料
            </span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 font-mono text-[10px]">
              Alt+N
            </kbd>
            <span>快速捕獲</span>
          </div>
        </footer>

        {/* ========================================================= */}
        {/* Floating Toast Notification */}
        {/* ========================================================= */}
        {toastMessage && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-raycast-dark-surface border border-white/15 text-raycast-dark-text text-xs shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            <Check className="w-3.5 h-3.5 text-raycast-emerald" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* Modals: Quick Capture & New Page */}
        {/* ========================================================= */}
        <QuickCaptureModal
          isOpen={isQuickCaptureOpen}
          onClose={() => setIsQuickCaptureOpen(false)}
          pages={quickCapturePages}
          activePageId={activePageId}
          sourceUrl={currentUrl}
          sourceTitle="當前瀏覽網頁"
          searchResults={allSearchResults}
          onSaveJot={handleQuickSaveJot}
          onSaveField={handleQuickSaveField}
          onCopySearchResult={(item) => {
            handleCopy(item.content, item.title);
          }}
        />

        <NewPageModal
          isOpen={isNewPageModalOpen}
          onClose={() => setIsNewPageModalOpen(false)}
          onSubmit={handleCreatePage}
        />
      </div>
    </div>
  );
};
