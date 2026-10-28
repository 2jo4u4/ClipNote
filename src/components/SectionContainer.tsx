import React, { useState } from 'react';
import {
  ChevronDown,
  Layers,
  Sparkles,
  Plus,
  ArrowUpRight,
  MoreVertical,
  Trash2,
  FolderUp,
} from 'lucide-react';
import { cn } from '../utils';

export interface SectionContainerProps {
  id: string;
  title: string;
  type: 'fields' | 'jots';
  itemCount: number;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
  onExtractToPage?: (sectionId: string) => void;
  onAddItem?: (sectionId: string) => void;
  onDeleteSection?: (sectionId: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const SectionContainer: React.FC<SectionContainerProps> = ({
  id,
  title,
  type,
  itemCount,
  isCollapsible = true,
  defaultExpanded = true,
  onExtractToPage,
  onAddItem,
  onDeleteSection,
  children,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showMenu, setShowMenu] = useState(false);

  const isFields = type === 'fields';

  return (
    <div
      className={cn(
        'group/section flex flex-col rounded-2xl border transition-all duration-300 ease-raycast',
        'bg-raycast-light-surface/60 border-raycast-light-border/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)]',
        'dark:bg-raycast-dark-surface/50 dark:border-white/8 dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)]',
        className
      )}
    >
      {/* Section Header */}
      <div
        className={cn(
          'flex items-center justify-between gap-3 px-3.5 py-2.5 select-none transition-colors duration-150',
          isCollapsible && 'cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] rounded-t-2xl',
          !isExpanded && 'rounded-b-2xl'
        )}
        onClick={() => {
          if (isCollapsible) setIsExpanded(!isExpanded);
        }}
      >
        {/* Left: Type Icon + Title + Count Badge */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Section Type Icon Badge */}
          <div
            className={cn(
              'flex items-center justify-center w-6 h-6 rounded-lg transition-colors flex-shrink-0',
              isFields
                ? 'bg-raycast-coral/10 text-raycast-coral border border-raycast-coral/20'
                : 'bg-raycast-amber/10 text-raycast-amber border border-raycast-amber/20'
            )}
            title={isFields ? '欄位分區 (結構化鍵值對)' : '隨筆分區 (時間軸記事)'}
          >
            {isFields ? <Layers className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-xs font-semibold tracking-wide text-raycast-light-text dark:text-raycast-dark-text truncate">
              {title}
            </h3>

            {/* Type & Item Count Badge */}
            <span
              className={cn(
                'inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-mono border leading-tight flex-shrink-0',
                'bg-black/5 border-raycast-light-border text-raycast-light-muted',
                'dark:bg-white/5 dark:border-white/10 dark:text-raycast-dark-muted'
              )}
            >
              {isFields ? '欄位' : '隨筆'} · {itemCount}
            </span>
          </div>
        </div>

        {/* Right: Actions & Collapse Arrow */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {/* Add Item Quick Button */}
          {onAddItem && (
            <button
              onClick={() => onAddItem(id)}
              title={isFields ? '新增欄位' : '新增隨筆'}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-150',
                'text-raycast-light-muted hover:text-raycast-light-text hover:bg-black/5',
                'dark:text-raycast-dark-muted dark:hover:text-raycast-dark-text dark:hover:bg-white/5 active:scale-95'
              )}
            >
              <Plus className="w-3 h-3" />
              <span className="hidden sm:inline text-[11px]">{isFields ? '欄位' : '隨筆'}</span>
            </button>
          )}

          {/* Section Action Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              title="分區操作"
              className={cn(
                'p-1.5 rounded-lg text-raycast-light-subtle hover:text-raycast-light-text',
                'dark:text-raycast-dark-subtle dark:hover:text-raycast-dark-text',
                'hover:bg-black/5 dark:hover:bg-white/5 transition-colors'
              )}
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <div
                className={cn(
                  'absolute right-0 top-full mt-1.5 z-30 w-56 py-1.5 rounded-xl shadow-xl border backdrop-blur-md',
                  'bg-raycast-light-surface/95 border-raycast-light-border text-raycast-light-text',
                  'dark:bg-raycast-dark-surface/95 dark:border-white/10 dark:text-raycast-dark-text animate-in fade-in zoom-in-95 duration-150'
                )}
              >
                {/* Extract Section to Page */}
                {onExtractToPage && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onExtractToPage(id);
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors group/item"
                  >
                    <span className="flex items-center gap-2">
                      <FolderUp className="w-3.5 h-3.5 text-raycast-coral" />
                      <span>升格為獨立筆記頁</span>
                    </span>
                    <ArrowUpRight className="w-3 h-3 text-raycast-light-subtle dark:text-raycast-dark-subtle group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 transition-transform" />
                  </button>
                )}

                {/* Add Item */}
                {onAddItem && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onAddItem(id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-raycast-light-muted dark:text-raycast-dark-muted" />
                    <span>{isFields ? '新增欄位' : '新增隨筆'}</span>
                  </button>
                )}

                {/* Delete Section */}
                {onDeleteSection && (
                  <div className="pt-1 mt-1 border-t border-raycast-light-border dark:border-white/10">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDeleteSection(id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left text-raycast-coral hover:bg-raycast-coral/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>刪除此分區</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Smooth Accordion Toggle Arrow */}
          {isCollapsible && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-1 rounded-md text-raycast-light-subtle hover:text-raycast-light-text dark:text-raycast-dark-subtle dark:hover:text-raycast-dark-text transition-colors"
            >
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 transition-transform duration-300 ease-raycast',
                  isExpanded ? 'transform rotate-180' : ''
                )}
              />
            </button>
          )}
        </div>
      </div>

      {/* Smooth Height Transition Content Accordion */}
      <div
        className={cn(
          'grid transition-all duration-300 ease-raycast overflow-hidden',
          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="min-h-0">
          <div className="p-3 pt-1 flex flex-col gap-2.5">
            {itemCount === 0 ? (
              <div
                className={cn(
                  'py-6 px-4 text-center rounded-xl border border-dashed text-xs',
                  'border-raycast-light-border text-raycast-light-subtle',
                  'dark:border-white/10 dark:text-raycast-dark-subtle'
                )}
              >
                <span>尚未加入任何{isFields ? '欄位' : '隨筆'}內容</span>
                {onAddItem && (
                  <button
                    onClick={() => onAddItem(id)}
                    className="block mx-auto mt-2 text-raycast-coral hover:underline font-medium"
                  >
                    ＋ 立即新增
                  </button>
                )}
              </div>
            ) : (
              children
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
