import React, { useEffect, useRef, useState } from 'react';
import { Globe, Plus, Hash } from 'lucide-react';
import { cn } from '../utils';

export interface TabItem {
  id: string;
  title: string;
  isSystem?: boolean;
  domains?: string[];
  isPrimary?: boolean;
}

export interface PageTabsProps {
  tabs: TabItem[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onAddPage?: () => void;
  className?: string;
}

export const PageTabs: React.FC<PageTabsProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onAddPage,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
    opacity: number;
  }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  // Ensure Global Page is sorted or pinned first if present
  const globalTab = tabs.find((t) => t.isSystem || t.id === 'SYSTEM_GLOBAL_PAGE');
  const otherTabs = tabs.filter((t) => t !== globalTab);
  const sortedTabs = globalTab ? [globalTab, ...otherTabs] : tabs;

  useEffect(() => {
    const activeEl = tabRefs.current.get(activeTabId);
    const container = containerRef.current;

    if (activeEl && container) {
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();

      setIndicatorStyle({
        left: activeRect.left - containerRect.left + container.scrollLeft,
        width: activeRect.width,
        opacity: 1,
      });

      // Auto-scroll active tab into view gently
      activeEl.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [activeTabId, tabs]);

  return (
    <div
      className={cn(
        'relative flex items-center gap-1.5 p-1.5 border-b select-none transition-colors duration-200',
        'border-raycast-light-border bg-raycast-light-bg/80 backdrop-blur-sm',
        'dark:border-raycast-dark-border dark:bg-raycast-dark-bg/80',
        className
      )}
    >
      <div
        ref={containerRef}
        className="relative flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-0.5"
      >
        {/* Sliding Tab Indicator Pill */}
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

        {/* Tab Buttons */}
        {sortedTabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isGlobal = tab.isSystem || tab.id === 'SYSTEM_GLOBAL_PAGE';

          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current.set(tab.id, el);
                else tabRefs.current.delete(tab.id);
              }}
              onClick={() => onSelectTab(tab.id)}
              className={cn(
                'relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap outline-none',
                'transition-all duration-200 ease-raycast active:scale-[0.98]',
                isActive
                  ? 'text-raycast-light-text dark:text-raycast-dark-text font-semibold'
                  : 'text-raycast-light-muted dark:text-raycast-dark-muted hover:text-raycast-light-text dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5'
              )}
            >
              {isGlobal ? (
                <Globe
                  className={cn(
                    'w-3.5 h-3.5 transition-colors',
                    isActive
                      ? 'text-raycast-coral dark:text-raycast-coral'
                      : 'text-raycast-light-subtle dark:text-raycast-dark-subtle'
                  )}
                />
              ) : (
                <Hash
                  className={cn(
                    'w-3 h-3 transition-colors',
                    isActive
                      ? 'text-raycast-amber dark:text-raycast-amber'
                      : 'text-raycast-light-subtle dark:text-raycast-dark-subtle'
                  )}
                />
              )}
              <span>{tab.title}</span>

              {tab.domains && tab.domains.length > 0 && !isGlobal && (
                <span
                  className={cn(
                    'ml-0.5 text-[10px] px-1.5 py-0.2 rounded-full border leading-tight font-mono',
                    isActive
                      ? 'border-raycast-amber/30 bg-raycast-amber/10 text-raycast-amber'
                      : 'border-transparent text-raycast-light-subtle dark:text-raycast-dark-subtle'
                  )}
                >
                  {tab.domains[0]}
                  {tab.domains.length > 1 ? ` +${tab.domains.length - 1}` : ''}
                </span>
              )}
            </button>
          );
        })}
      </div>

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
