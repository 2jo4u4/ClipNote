import React, { useState, useRef, useEffect } from 'react';
import {
  Copy,
  Check,
  Clock,
  ExternalLink,
  MoreVertical,
  Trash2,
  FolderUp,
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
  onCopy?: (content: string) => void;
  onDelete?: (id: string) => void;
  onMove?: (id: string) => void;
  className?: string;
}

export const CellCard: React.FC<CellCardProps> = ({
  id,
  cellKey,
  value,
  createdAt,
  updatedAt,
  sourceUrl,
  sourceTitle,
  language = 'zh-TW',
  onCopy,
  onDelete,
  onMove,
  className,
}) => {
  const t = getTranslations(language);
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
      onClick={handleCopy}
      title={t.common.clickToCopy}
      className={cn(
        'group relative flex flex-col p-3 rounded-xl border select-none cursor-pointer',
        'transition-all duration-200 ease-raycast active:scale-[0.98]',
        'bg-raycast-light-surface border-raycast-light-border hover:border-raycast-amber/50 hover:shadow-sm',
        'dark:bg-raycast-dark-surface/50 dark:border-white/10 dark:hover:border-raycast-amber/40 dark:hover:bg-raycast-dark-surface/80',
        copied &&
          'border-raycast-emerald bg-raycast-emerald/5 ring-1 ring-raycast-emerald/40 dark:border-raycast-emerald dark:bg-raycast-emerald/10',
        className
      )}
    >
      {/* Header: Key & Timestamp on Left, Copy & Actions on Right */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          {/* Key name if Field */}
          {isField && (
            <span
              className={cn(
                'text-xs font-semibold tracking-tight truncate max-w-[160px]',
                'text-raycast-light-text dark:text-raycast-dark-text'
              )}
            >
              {cellKey}
            </span>
          )}

          {/* Timestamp */}
          <div
            title={
              updatedAt && createdAt && updatedAt > createdAt + 1000
                ? `建立時間: ${new Date(createdAt).toLocaleString()}\n更新時間: ${new Date(updatedAt).toLocaleString()}`
                : `建立時間: ${new Date(createdAt || Date.now()).toLocaleString()}`
            }
            className="flex items-center gap-1 text-[11px] text-raycast-light-subtle dark:text-raycast-dark-subtle font-mono"
          >
            <Clock className="w-2.5 h-2.5 opacity-60" />
            <span>
              {formatRelativeTime(
                updatedAt && updatedAt > (createdAt || 0) ? updatedAt : createdAt || Date.now()
              )}
            </span>
          </div>
        </div>

        {/* Hover / Direct Actions with isolated event propagation */}
        <div
          className="flex items-center gap-1 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy(e);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            title={copied ? t.common.copied : t.common.clickToCopy}
            className={cn(
              'flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium transition-all duration-150',
              copied
                ? 'bg-raycast-emerald/15 text-raycast-emerald border border-raycast-emerald/30'
                : 'text-raycast-light-subtle dark:text-raycast-dark-subtle hover:text-raycast-light-text dark:hover:text-raycast-dark-text opacity-0 group-hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
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
          {(onDelete || onMove) && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
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
                  className="absolute right-0 top-full mt-1 w-32 rounded-lg border shadow-lg z-50 py-1 bg-raycast-light-surface border-raycast-light-border dark:bg-raycast-dark-surface dark:border-raycast-dark-border animate-in fade-in zoom-in-95 duration-100"
                >
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
      </div>

      {/* Body: Direct clean value text (Click to copy) */}
      <div
        className={cn(
          'text-xs leading-relaxed font-sans select-text whitespace-pre-wrap break-words transition-colors',
          'text-raycast-light-text/90 dark:text-raycast-dark-text/90 group-hover:text-raycast-light-text dark:group-hover:text-raycast-dark-text'
        )}
      >
        {value}
      </div>

      {/* Footer: Source URL link chip */}
      {sourceUrl && (
        <div className="mt-2.5 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title={sourceTitle ? `${sourceTitle}\n${sourceUrl}` : sourceUrl}
            className={cn(
              'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono transition-colors max-w-[240px] truncate',
              'bg-black/[0.03] dark:bg-white/[0.04] text-raycast-light-subtle dark:text-raycast-dark-subtle',
              'hover:text-raycast-amber hover:bg-raycast-amber/10 border border-transparent hover:border-raycast-amber/20'
            )}
          >
            <span className="truncate">{sourceTitle || getDomainFromUrl(sourceUrl)}</span>
            <ExternalLink className="w-2.5 h-2.5 flex-shrink-0 opacity-70" />
          </a>
        </div>
      )}
    </div>
  );
};
