import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Layers,
  Sparkles,
  Plus,
  ArrowUpRight,
  MoreVertical,
  Trash2,
  FolderUp,
  Download,
  FileEdit,
  CheckSquare,
  Square,
  GripVertical,
} from 'lucide-react';
import { cn } from '../utils';
import { Language, getTranslations } from '../i18n';

export interface SectionContainerProps {
  id: string;
  title: string;
  type?: 'fields' | 'jots' | 'mixed';
  itemCount: number;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  language?: Language;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (sectionId: string) => void;
  onRenameSection?: (sectionId: string) => void;
  onExtractToPage?: (sectionId: string) => void;
  onAddItem?: (sectionId: string) => void;
  onDeleteSection?: (sectionId: string) => void;
  onExportPage?: () => void;
  isDragging?: boolean;
  isCellDropTarget?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOverContainer?: (e: React.DragEvent) => void;
  onDragLeaveContainer?: (e: React.DragEvent) => void;
  onDropContainer?: (e: React.DragEvent) => void;
  onDragOverEmpty?: (e: React.DragEvent) => void;
  onDragLeaveEmpty?: (e: React.DragEvent) => void;
  onDropEmpty?: (e: React.DragEvent) => void;
  children: React.ReactNode;
  className?: string;
}

export const SectionContainer: React.FC<SectionContainerProps> = ({
  id,
  title,
  type = 'mixed',
  itemCount,
  isCollapsible = true,
  defaultExpanded = true,
  isExpanded: controlledExpanded,
  onToggleExpand,
  language = 'zh-TW',
  isSelectMode = false,
  isSelected = false,
  onToggleSelect,
  onRenameSection,
  onExtractToPage,
  onAddItem,
  onDeleteSection,
  onExportPage,
  isDragging = false,
  isCellDropTarget = false,
  onDragStart,
  onDragEnd,
  onDragOverContainer,
  onDragLeaveContainer,
  onDropContainer,
  onDragOverEmpty,
  onDragLeaveEmpty,
  onDropEmpty,
  children,
  className,
}) => {
  const t = getTranslations(language);
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isFields = type === 'fields';
  const isJots = type === 'jots';

  const handleContainerDragOver = onDragOverContainer;
  const handleContainerDragLeave = onDragLeaveContainer;
  const handleContainerDrop = onDropContainer;

  // Outside click listener for the action menu (No full-screen blocking backdrop)
  useEffect(() => {
    if (!showMenu) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showMenu]);

  return (
    <div
      onDragOver={handleContainerDragOver}
      onDragLeave={handleContainerDragLeave}
      onDrop={handleContainerDrop}
      className={cn(
        'group/section flex flex-col rounded-2xl border transition-all duration-300 ease-raycast',
        isDragging && 'opacity-40 scale-[0.99] border-2 border-dashed border-raycast-amber/60 bg-raycast-amber/5 dark:bg-raycast-amber/10 shadow-inner',
        isSelectMode && isSelected
          ? 'border-raycast-coral/40 bg-raycast-coral/[0.02] ring-1 ring-raycast-coral/30'
          : 'bg-raycast-light-surface/60 border-raycast-light-border shadow-[0_2px_8px_rgba(0,0,0,0.03)] dark:bg-raycast-dark-surface/50 dark:border-white/8 dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)]',
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
          if (isCollapsible) {
            if (onToggleExpand) {
              onToggleExpand();
            } else {
              setInternalExpanded(!isExpanded);
            }
          }
        }}
      >
        {/* Left: Checkbox (Select Mode) + Type Icon + Title + Count Badge */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Section Drag Handle (Hidden in select mode) */}
          {!isSelectMode && onDragStart && (
            <div
              draggable
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              title={t.sectionContainer.dragCategoryToReorder}
              className="opacity-0 group-hover/section:opacity-60 hover:!opacity-100 cursor-grab active:cursor-grabbing p-0.5 -ml-1 text-raycast-light-subtle dark:text-raycast-dark-subtle transition-opacity flex-shrink-0"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>
          )}

          {isSelectMode && (
            <div
              className="flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleSelect) onToggleSelect(id);
              }}
            >
              {isSelected ? (
                <CheckSquare className="w-4 h-4 text-raycast-coral" />
              ) : (
                <Square className="w-4 h-4 text-raycast-light-subtle dark:text-raycast-dark-subtle" />
              )}
            </div>
          )}

          <div
            className={cn(
              'flex items-center justify-center w-6 h-6 rounded-lg transition-colors flex-shrink-0',
              isFields
                ? 'bg-raycast-coral/10 text-raycast-coral border border-raycast-coral/20'
                : isJots
                ? 'bg-raycast-amber/10 text-raycast-amber border border-raycast-amber/20'
                : 'bg-raycast-amber/10 text-raycast-amber border border-raycast-amber/20'
            )}
            title="筆記分區"
          >
            {isJots ? <Sparkles className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-xs font-semibold tracking-wide text-raycast-light-text dark:text-raycast-dark-text truncate">
              {title}
            </h3>

            {/* Simple count badge, e.g. "4 筆" */}
            <span
              className={cn(
                'inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-mono border leading-tight flex-shrink-0',
                'bg-black/5 border-raycast-light-border text-raycast-light-muted',
                'dark:bg-white/5 dark:border-white/10 dark:text-raycast-dark-muted'
              )}
            >
              {t.sidePanel.itemCount(itemCount)}
            </span>
          </div>
        </div>

        {/* Right: Actions & Collapse Arrow */}
        <div
          className="flex items-center gap-1 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Add Item Quick Button */}
          {!isSelectMode && onAddItem && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddItem(id);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              title={t.sectionContainer.newNote}
              className={cn(
                'flex items-center gap-1 p-1 rounded-lg text-xs font-medium transition-all duration-150',
                'text-raycast-light-muted hover:text-raycast-light-text hover:bg-black/5',
                'dark:text-raycast-dark-muted dark:hover:text-raycast-dark-text dark:hover:bg-white/5 active:scale-95'
              )}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Section Action Menu */}
          {!isSelectMode && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu((prev) => !prev);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                title={t.common.moreActions}
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
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  className={cn(
                    'absolute right-0 top-full mt-1.5 z-50 w-52 py-1.5 rounded-xl shadow-xl border backdrop-blur-md',
                    'bg-raycast-light-surface/95 border-raycast-light-border text-raycast-light-text',
                    'dark:bg-raycast-dark-surface/95 dark:border-white/10 dark:text-raycast-dark-text animate-in fade-in zoom-in-95 duration-150'
                  )}
                >
                  {/* Add Item */}
                  {onAddItem && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onAddItem(id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-raycast-amber" />
                      <span>{t.sectionContainer.newNote}</span>
                    </button>
                  )}

                  {/* Rename Section */}
                  {onRenameSection && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onRenameSection(id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <FileEdit className="w-3.5 h-3.5 text-raycast-amber" />
                      <span>{t.sectionContainer.renameCategory}</span>
                    </button>
                  )}

                  {/* Extract Section to Page */}
                  {onExtractToPage && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onExtractToPage(id);
                      }}
                      className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors group/item"
                    >
                      <span className="flex items-center gap-2">
                        <FolderUp className="w-3.5 h-3.5 text-raycast-coral" />
                        <span>{t.sectionContainer.promoteToPage}</span>
                      </span>
                      <ArrowUpRight className="w-3 h-3 text-raycast-light-subtle dark:text-raycast-dark-subtle group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 transition-transform" />
                    </button>
                  )}

                  {/* Export Page JSON */}
                  {onExportPage && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onExportPage();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-raycast-light-subtle dark:text-raycast-dark-subtle" />
                      <span>{t.sidePanel.exportJson}</span>
                    </button>
                  )}

                  {/* Delete Section */}
                  {onDeleteSection && (
                    <div className="pt-1 mt-1 border-t border-raycast-light-border dark:border-white/10">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(false);
                          onDeleteSection(id);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left text-raycast-coral hover:bg-raycast-coral/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t.sectionContainer.deleteCategory}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Smooth Accordion Toggle Arrow */}
          {isCollapsible && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleExpand) {
                  onToggleExpand();
                } else {
                  setInternalExpanded(!isExpanded);
                }
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
          'grid transition-all duration-300 ease-raycast',
          isExpanded ? 'grid-rows-[1fr] opacity-100 overflow-visible' : 'grid-rows-[0fr] opacity-0 overflow-hidden'
        )}
      >
        <div className="min-h-0">
          <div className="p-3 pt-1 flex flex-col gap-2.5">
            {itemCount === 0 ? (
              <div
                onDragOver={onDragOverEmpty}
                onDragLeave={onDragLeaveEmpty}
                onDrop={onDropEmpty}
                className={cn(
                  'py-6 px-4 text-center rounded-xl border border-dashed text-xs transition-colors',
                  isCellDropTarget
                    ? 'border-raycast-amber bg-raycast-amber/10 text-raycast-amber font-semibold ring-1 ring-raycast-amber/40'
                    : 'border-raycast-light-border text-raycast-light-subtle dark:border-white/10 dark:text-raycast-dark-subtle'
                )}
              >
                {isCellDropTarget ? (
                  <span>{t.sectionContainer.dropNoteHere}</span>
                ) : (
                  <>
                    <span>{t.sidePanel.emptyCategoryPrompt}</span>
                    {onAddItem && (
                      <button
                        type="button"
                        onClick={() => onAddItem(id)}
                        className="block mx-auto mt-2 text-raycast-amber hover:underline font-medium"
                      >
                        + {t.sectionContainer.newNote}
                      </button>
                    )}
                  </>
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
