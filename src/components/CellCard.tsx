import React, { useState, useRef, useEffect } from 'react';
import {
  Copy,
  Check,
  Clock,
  ExternalLink,
  MoreVertical,
  Trash2,
  FolderUp,
  FileEdit,
  CheckSquare,
  Square,
  GripVertical,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn, formatRelativeTime, getDomainFromUrl } from '../utils';
import { Language, getTranslations } from '../i18n';

export interface CellCardProps {
  id: string;
  cellKey?: string; // Optional key: if provided, renders as a Field; otherwise as a Jot
  value: string;
  createdAt?: number;
  updatedAt?: number;
  sourceUrl?: string;
  sourceTitle?: string;
  language?: Language;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onCopy?: (content: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMove?: (id: string) => void;
  isDragging?: boolean;
  dropPosition?: 'top' | 'bottom' | null;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  className?: string;
}

const MENU_FLIP_HEIGHT_THRESHOLD = 150;

export const CellCard: React.FC<CellCardProps> = ({
  id,
  cellKey,
  value,
  createdAt: _createdAt,
  updatedAt,
  sourceUrl,
  sourceTitle,
  language = 'zh-TW',
  isSelectMode = false,
  isSelected = false,
  onToggleSelect,
  onCopy,
  onEdit,
  onDelete,
  onMove,
  isDragging = false,
  dropPosition = null,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  className,
}) => {
  const t = getTranslations(language);
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const el = contentRef.current;
    if (el) {
      setIsOverflowing(el.scrollHeight > 120);
    }
  }, [value]);

  const isField = Boolean(cellKey?.trim());

  // Close menu gracefully when clicking outside without full-screen backdrops
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

  const handleClick = (e?: React.MouseEvent) => {
    if (isSelectMode) {
      e?.stopPropagation();
      if (onToggleSelect) onToggleSelect(id);
      return;
    }
    handleCopy(e);
  };

  const handleCopy = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      navigator.clipboard.writeText(value);
    } catch {
      // Fallback
    }

    setCopied(true);
    if (onCopy) onCopy(value);

    setTimeout(() => {
      setCopied(false);
    }, 1200);
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      title={isSelectMode ? (isSelected ? '取消選取' : '選取筆記') : t.common.clickToCopy}
      className={cn(
        'group relative flex flex-col p-3 rounded-xl border select-none cursor-pointer',
        'transition-all duration-200 ease-raycast active:scale-[0.98]',
        isDragging && 'opacity-40 scale-[0.98] border-2 border-dashed border-raycast-amber/60 bg-raycast-amber/5 dark:bg-raycast-amber/10 shadow-inner',
        dropPosition === 'top' && 'border-t-2 !border-t-raycast-amber',
        dropPosition === 'bottom' && 'border-b-2 !border-b-raycast-amber',
        isSelectMode && isSelected
          ? 'border-raycast-coral bg-raycast-coral/5 ring-1 ring-raycast-coral/40 dark:border-raycast-coral dark:bg-raycast-coral/10'
          : copied
          ? 'border-raycast-emerald bg-raycast-emerald/5 ring-1 ring-raycast-emerald/40 dark:border-raycast-emerald dark:bg-raycast-emerald/10'
          : 'bg-raycast-light-surface border-raycast-light-border hover:border-raycast-amber/50 hover:shadow-sm dark:bg-raycast-dark-surface/50 dark:border-white/10 dark:hover:border-raycast-amber/40 dark:hover:bg-raycast-dark-surface/80',
        className
      )}
    >
      {/* Header: Key & Timestamp on Left, Copy & Actions on Right */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Drag Handle (Hidden in select mode) */}
          {!isSelectMode && onDragStart && (
            <div
              draggable
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              title={t.cellCard.dragToReorder}
              className="opacity-0 group-hover:opacity-60 hover:!opacity-100 cursor-grab active:cursor-grabbing p-0.5 -ml-1 text-raycast-light-subtle dark:text-raycast-dark-subtle transition-opacity flex-shrink-0"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>
          )}

          {/* Select Mode Checkbox */}
          {isSelectMode && (
            <div
              className="flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleSelect) onToggleSelect(id);
              }}
            >
              {isSelected ? (
                <CheckSquare className="w-3.5 h-3.5 text-raycast-coral" />
              ) : (
                <Square className="w-3.5 h-3.5 text-raycast-light-subtle dark:text-raycast-dark-subtle" />
              )}
            </div>
          )}

          {/* Key name if Field */}
          {isField && (
            <span
              className={cn(
                'inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold tracking-tight border truncate max-w-[150px]',
                'bg-raycast-coral/10 border-raycast-coral/20 text-raycast-coral dark:bg-raycast-coral/15 dark:border-raycast-coral/30'
              )}
            >
              {cellKey}
            </span>
          )}

          {/* Timestamp */}
          {updatedAt && (
            <span
              title={`最後修改於: ${new Date(updatedAt).toLocaleString()}`}
              className="flex items-center gap-1 text-[10px] text-raycast-light-subtle dark:text-raycast-dark-subtle font-mono flex-shrink-0"
            >
              <Clock className="w-2.5 h-2.5" />
              <span>{formatRelativeTime(updatedAt)}</span>
            </span>
          )}
        </div>

        {/* Right Action Icons (Copy, Edit & More Popover) */}
        {!isSelectMode && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Quick Edit icon on hover */}
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(id);
                }}
                title={t.cellCard.editNote}
                className="p-1 rounded text-raycast-light-subtle dark:text-raycast-dark-subtle opacity-0 group-hover:opacity-100 hover:text-raycast-light-text dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5 transition-opacity"
              >
                <FileEdit className="w-3 h-3" />
              </button>
            )}

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                'flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono transition-all duration-150',
                copied
                  ? 'text-raycast-emerald font-semibold'
                  : 'text-raycast-light-subtle dark:text-raycast-dark-subtle hover:text-raycast-light-text dark:hover:text-raycast-dark-text opacity-0 group-hover:opacity-100'
              )}
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-raycast-emerald stroke-[2.5]" />
                  <span className="text-[10px]">{t.common.copied}</span>
                </>
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>

            {/* Action Popover Menu (Without full-screen blocking backdrop) */}
            {(onEdit || onDelete || onMove) && (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!showMenu && menuRef.current) {
                      const rect = menuRef.current.getBoundingClientRect();
                      const spaceBelow = window.innerHeight - rect.bottom;
                      setOpenUpward(spaceBelow < MENU_FLIP_HEIGHT_THRESHOLD);
                    }
                    setShowMenu((prev) => !prev);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  title={t.common.moreActions}
                  className="p-1 rounded text-raycast-light-subtle dark:text-raycast-dark-subtle opacity-0 group-hover:opacity-100 hover:text-raycast-light-text dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5 transition-opacity"
                >
                  <MoreVertical className="w-3 h-3" />
                </button>

                {showMenu && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className={cn(
                      'absolute right-0 w-32 rounded-lg border shadow-lg z-50 py-1',
                      'bg-raycast-light-surface border-raycast-light-border dark:bg-raycast-dark-surface dark:border-raycast-dark-border animate-in fade-in zoom-in-95 duration-100',
                      openUpward ? 'bottom-full mb-1' : 'top-full mt-1'
                    )}
                  >
                    {onEdit && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(false);
                          onEdit(id);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-raycast-light-text dark:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <FileEdit className="w-3.5 h-3.5 text-raycast-amber" />
                        <span>{t.cellCard.editNote}</span>
                      </button>
                    )}
                    {onMove && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(false);
                          onMove(id);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-raycast-light-text dark:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <FolderUp className="w-3.5 h-3.5 text-raycast-amber" />
                        <span>{t.moveModal.title}...</span>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(false);
                          onDelete(id);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-raycast-coral hover:bg-raycast-coral/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t.common.delete}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Body: Direct clean value text (Click to copy) */}
      <div className="relative">
        <div
          ref={contentRef}
          className={cn(
            'text-xs leading-relaxed font-sans select-text whitespace-pre-wrap break-words transition-all duration-200',
            'text-raycast-light-text/90 dark:text-raycast-dark-text/90 group-hover:text-raycast-light-text dark:group-hover:text-raycast-dark-text',
            isOverflowing && !isExpanded && 'max-h-[120px] overflow-hidden'
          )}
        >
          {value}
        </div>

        {/* Gradient Fade Overlay when collapsed */}
        {isOverflowing && !isExpanded && (
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-raycast-light-surface via-raycast-light-surface/80 to-transparent dark:from-raycast-dark-surface dark:via-raycast-dark-surface/80 dark:to-transparent pointer-events-none" />
        )}
      </div>

      {/* Expand / Collapse Button */}
      {isOverflowing && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-raycast-amber hover:brightness-110 active:opacity-80 transition-all w-fit"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-3 h-3" />
              <span>{t.cellCard.showLess}</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              <span>{t.cellCard.showMore}</span>
            </>
          )}
        </button>
      )}

      {/* Source URL Pill */}
      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'mt-2 pt-1.5 border-t border-black/5 dark:border-white/5 flex items-center gap-1.5 text-[10px] font-mono',
            'text-raycast-light-subtle dark:text-raycast-dark-subtle hover:text-raycast-amber transition-colors truncate'
          )}
        >
          <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="truncate">
            {sourceTitle || getDomainFromUrl(sourceUrl)}
          </span>
        </a>
      )}
    </div>
  );
};
