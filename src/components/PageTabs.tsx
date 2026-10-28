import React, { useEffect, useRef, useState } from 'react';
import { Globe, Plus, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../utils';

export interface PageItem {
  id: string;
  title: string;
  icon?: string | React.ReactNode;
  isSystem?: boolean;
  domains?: string[];
  isPrimary?: boolean;
}

// Deprecated alias for backwards compatibility
export type TabItem = PageItem;

export interface PageTabsProps {
  pages?: PageItem[];
  activePageId?: string;
  onSelectPage?: (pageId: string) => void;
  onAddPage?: () => void;
  showDomains?: boolean; // Default false to keep tabs clean and compact
  className?: string;

  // Deprecated props supported for transitional compatibility
  tabs?: PageItem[];
  activeTabId?: string;
  onSelectTab?: (tabId: string) => void;
}

export const PageTabs: React.FC<PageTabsProps> = ({
  pages: directPages,
  activePageId: directActivePageId,
  onSelectPage: directOnSelectPage,
  onAddPage,
  showDomains = false,
  className,
  tabs,
  activeTabId,
  onSelectTab,
}) => {
  const pages = directPages || tabs || [];
  const activePageId = directActivePageId || activeTabId || '';
  const onSelectPage = directOnSelectPage || onSelectTab || (() => {});

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
    opacity: number;
  }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  // Ensure Global Page is pinned first
  const globalPage = pages.find((p) => p.isSystem || p.id === 'SYSTEM_GLOBAL_PAGE');
  const otherPages = pages.filter((p) => p !== globalPage);
  const sortedPages = globalPage ? [globalPage, ...otherPages] : pages;

  const checkScrollable = () => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  };

  const updateIndicator = () => {
    const activeEl = pageRefs.current.get(activePageId);
    if (activeEl) {
      setIndicatorStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
        opacity: 1,
      });
    }
  };

  // Wheel-to-horizontal-scroll listener for mouse users
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 || e.deltaX !== 0) {
        // Prevent default vertical window scroll when mouse is hovering the tabs
        e.preventDefault();
        const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
        el.scrollLeft += delta;
        checkScrollable();
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('scroll', checkScrollable);
    window.addEventListener('resize', checkScrollable);

    const observer = new ResizeObserver(() => {
      checkScrollable();
      updateIndicator();
    });
    observer.observe(el);

    checkScrollable();
    updateIndicator();

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('scroll', checkScrollable);
      window.removeEventListener('resize', checkScrollable);
      observer.disconnect();
    };
  }, [sortedPages]);

  // Recalculate indicator position and auto-scroll active tab into view
  useEffect(() => {
    updateIndicator();
    const activeEl = pageRefs.current.get(activePageId);
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
    checkScrollable();
  }, [activePageId, pages]);

  const scrollByAmount = (amount: number) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <div
      className={cn(
        'relative flex items-center gap-1 p-1.5 border-b select-none transition-colors duration-200',
        'border-raycast-light-border bg-raycast-light-bg/80 backdrop-blur-sm',
        'dark:border-raycast-dark-border dark:bg-raycast-dark-bg/80',
        className
      )}
    >
      {/* Scroll Left Button */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByAmount(-130)}
          title="向左滾動筆記頁"
          className="flex items-center justify-center p-1 rounded-md text-raycast-light-muted dark:text-raycast-dark-muted hover:text-raycast-light-text dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5 flex-shrink-0 transition-all duration-150 active:scale-95"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Horizontal Tabs Scroll Container */}
      <div
        ref={containerRef}
        className="relative flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-0.5"
      >
        {/* Sliding Page Indicator Pill */}
        <div
          className="absolute top-0.5 bottom-0.5 rounded-lg pointer-events-none transition-all duration-300 ease-raycast"
          style={{
            transform: `translateX(${indicatorStyle.left}px)`,
            width: `${indicatorStyle.width}px`,
            opacity: indicatorStyle.opacity,
          }}
        >
          <div
            className={cn(
              'w-full h-full rounded-lg shadow-sm',
              'bg-raycast-light-surface border border-raycast-light-border text-raycast-light-text',
              'dark:bg-raycast-dark-surface dark:border-white/10 dark:text-raycast-dark-text'
            )}
          />
        </div>

        {/* Page Buttons */}
        {sortedPages.map((page) => {
          const isActive = page.id === activePageId;
          const isGlobal = page.isSystem || page.id === 'SYSTEM_GLOBAL_PAGE';

          return (
            <button
              key={page.id}
              ref={(el) => {
                if (el) pageRefs.current.set(page.id, el);
                else pageRefs.current.delete(page.id);
              }}
              onClick={() => onSelectPage(page.id)}
              className={cn(
                'relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap outline-none',
                'transition-all duration-200 ease-raycast active:scale-[0.98]',
                isActive
                  ? 'text-raycast-light-text dark:text-raycast-dark-text font-semibold'
                  : 'text-raycast-light-muted dark:text-raycast-dark-muted hover:text-raycast-light-text dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5'
              )}
            >
              {/* Page Icon / Emoji */}
              {page.icon ? (
                typeof page.icon === 'string' ? (
                  <span className="text-sm leading-none flex items-center justify-center select-none">
                    {page.icon}
                  </span>
                ) : (
                  page.icon
                )
              ) : isGlobal ? (
                <Globe
                  className={cn(
                    'w-3.5 h-3.5 transition-colors',
                    isActive
                      ? 'text-raycast-coral dark:text-raycast-coral'
                      : 'text-raycast-light-subtle dark:text-raycast-dark-subtle'
                  )}
                />
              ) : (
                <FileText
                  className={cn(
                    'w-3.5 h-3.5 transition-colors',
                    isActive
                      ? 'text-raycast-amber dark:text-raycast-amber'
                      : 'text-raycast-light-subtle dark:text-raycast-dark-subtle'
                  )}
                />
              )}
              <span>{page.title}</span>

              {/* Optional domain tags (Hidden by default to keep tabs clean) */}
              {showDomains && page.domains && page.domains.length > 0 && !isGlobal && (
                <span
                  className={cn(
                    'ml-0.5 text-[10px] px-1.5 py-0.2 rounded-full border leading-tight font-mono',
                    isActive
                      ? 'border-raycast-amber/30 bg-raycast-amber/10 text-raycast-amber'
                      : 'border-transparent text-raycast-light-subtle dark:text-raycast-dark-subtle'
                  )}
                >
                  {page.domains[0]}
                  {page.domains.length > 1 ? ` +${page.domains.length - 1}` : ''}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByAmount(130)}
          title="向右滾動筆記頁"
          className="flex items-center justify-center p-1 rounded-md text-raycast-light-muted dark:text-raycast-dark-muted hover:text-raycast-light-text dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5 flex-shrink-0 transition-all duration-150 active:scale-95"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Add Page Action Button */}
      {onAddPage && (
        <button
          onClick={onAddPage}
          title="新增筆記頁"
          className={cn(
            'flex items-center justify-center p-1.5 rounded-lg text-xs outline-none flex-shrink-0',
            'text-raycast-light-muted dark:text-raycast-dark-muted hover:text-raycast-light-text dark:hover:text-raycast-dark-text',
            'hover:bg-raycast-light-hover dark:hover:bg-raycast-dark-hover transition-all duration-200 ease-raycast active:scale-95'
          )}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
