import React, { useState } from 'react';
import {
  Copy,
  Check,
  Clock,
  ExternalLink,
  MoreVertical,
  Trash2,
  FolderUp,
} from 'lucide-react';
import { cn } from '../utils';

export interface CellCardProps {
  id: string;
  cellKey?: string; // Optional key: if provided, renders as a Field; otherwise as a Jot
  value: string;
  createdAt?: number;
  sourceUrl?: string;
  sourceTitle?: string;
  onCopy?: (content: string) => void;
  onDelete?: (id: string) => void;
  onMove?: (id: string) => void;
  className?: string;
}

function formatRelativeTime(timestamp?: number): string {
  if (!timestamp) return '剛剛';
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - timestamp) / 1000));

  if (diffSec < 60) return '剛剛';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} 分鐘前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} 小時前`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay} 天前`;
  return new Date(timestamp).toLocaleDateString('zh-TW', {
    month: 'short',
    day: 'numeric',
  });
}

function getDisplayDomain(url?: string): string {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url.split('/')[0];
  }
}

export const CellCard: React.FC<CellCardProps> = ({
  id,
  cellKey,
  value,
  createdAt,
  sourceUrl,
  sourceTitle,
  onCopy,
  onDelete,
  onMove,
  className,
}) => {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isField = Boolean(cellKey?.trim());

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
      title="點擊一秒複製內容"
      className={cn(
        'group relative flex flex-col p-3 rounded-xl border select-none cursor-pointer',
        'transition-all duration-200 ease-raycast active:scale-[0.98]',
        'bg-raycast-light-surface/60 border-raycast-light-border/70 hover:border-raycast-amber/50 hover:shadow-sm',
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
          <div className="flex items-center gap-1 text-[11px] text-raycast-light-subtle dark:text-raycast-dark-subtle font-mono">
            <Clock className="w-2.5 h-2.5 opacity-60" />
            <span>{formatRelativeTime(createdAt)}</span>
          </div>
        </div>

        {/* Hover / Direct Actions */}
        <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleCopy}
            title={copied ? '已複製！' : '複製內容'}
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
                <span className="text-[10px]">已複製</span>
              </>
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>

          {/* Action Popover Menu */}
          {(onDelete || onMove) && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded text-raycast-light-subtle dark:text-raycast-dark-subtle opacity-0 group-hover:opacity-100 hover:text-raycast-light-text dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5 transition-opacity"
              >
                <MoreVertical className="w-3 h-3" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-32 rounded-lg border shadow-lg z-50 py-1 bg-raycast-light-surface border-raycast-light-border dark:bg-raycast-dark-surface dark:border-raycast-dark-border animate-in fade-in zoom-in-95 duration-100">
                    {onMove && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onMove(id);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-raycast-light-text dark:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <FolderUp className="w-3.5 h-3.5 text-raycast-amber" />
                        <span>移動至...</span>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onDelete(id);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-raycast-coral hover:bg-raycast-coral/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>刪除</span>
                      </button>
                    )}
                  </div>
                </>
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
        <div className="mt-2.5 pt-2 border-t border-raycast-light-border/40 dark:border-white/5 flex items-center justify-between">
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
            <span className="truncate">{sourceTitle || getDisplayDomain(sourceUrl)}</span>
            <ExternalLink className="w-2.5 h-2.5 flex-shrink-0 opacity-70" />
          </a>
        </div>
      )}
    </div>
  );
};
