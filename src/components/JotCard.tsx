import React, { useState } from 'react';
import { Copy, Check, Clock, ExternalLink, Trash2, Edit2, MoreHorizontal } from 'lucide-react';
import { cn, formatRelativeTime } from '../utils';

export interface JotCardProps {
  id: string;
  content: string;
  createdAt: number;
  sourceUrl?: string;
  sourceTitle?: string;
  onCopy?: (content: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  className?: string;
}

export const JotCard: React.FC<JotCardProps> = ({
  id,
  content,
  createdAt,
  sourceUrl,
  sourceTitle,
  onCopy,
  onDelete,
  onEdit,
  className,
}) => {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleCopy = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      // Fallback
    }
    if (onCopy) onCopy(content);

    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1200);
  };

  const getDomainFromUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col gap-2 p-3 rounded-xl border transition-all duration-200 ease-raycast',
        'bg-raycast-light-surface/90 border-raycast-light-border hover:border-black/15 shadow-sm',
        'dark:bg-raycast-dark-surface/90 dark:border-white/8 dark:hover:border-white/20',
        copied && 'ring-2 ring-emerald-500/25 border-emerald-500/40 dark:border-emerald-500/40',
        className
      )}
    >
      {/* Top Meta: Relative Time & Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-raycast-light-subtle dark:text-raycast-dark-subtle">
          <Clock className="w-3 h-3" />
          <span>{formatRelativeTime(createdAt)}</span>
        </div>

        {/* Hover Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={handleCopy}
            title="複製內容"
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium outline-none transition-all duration-150',
              'text-raycast-light-muted hover:text-raycast-light-text hover:bg-black/5',
              'dark:text-raycast-dark-muted dark:hover:text-raycast-dark-text dark:hover:bg-white/5 active:scale-95'
            )}
          >
            {copied ? (
              <span className="flex items-center gap-1 text-emerald-500">
                <Check className="w-3 h-3" />
                <span className="text-[10px]">已複製</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Copy className="w-3 h-3" />
                <span className="text-[10px]">複製</span>
              </span>
            )}
          </button>

          {(onEdit || onDelete) && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1 rounded text-raycast-light-subtle hover:text-raycast-light-text dark:text-raycast-dark-subtle dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>

              {showMenu && (
                <div
                  className={cn(
                    'absolute right-0 top-full mt-1 z-20 w-24 py-1 rounded-lg shadow-xl border backdrop-blur-md',
                    'bg-raycast-light-surface border-raycast-light-border dark:bg-raycast-dark-surface dark:border-white/10'
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  {onEdit && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEdit(id);
                      }}
                      className="w-full flex items-center gap-1.5 px-2.5 py-1 text-xs text-raycast-light-text dark:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>編輯</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(id);
                      }}
                      className="w-full flex items-center gap-1.5 px-2.5 py-1 text-xs text-raycast-coral hover:bg-raycast-coral/10 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>刪除</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content: Formatted text */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleCopy}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCopy();
          }
        }}
        title="點擊複製隨筆"
        className={cn(
          'text-xs text-raycast-light-text dark:text-raycast-dark-text break-words whitespace-pre-wrap leading-relaxed cursor-pointer',
          'p-1.5 -mx-1.5 rounded-lg transition-all duration-150 active:scale-[0.99] hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
        )}
      >
        {content}
      </div>

      {/* Bottom Source URL Capsule Tag */}
      {sourceUrl && (
        <div className="pt-1 flex items-center">
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            title={sourceTitle || sourceUrl}
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono border transition-all duration-200',
              'text-raycast-light-muted hover:text-raycast-coral hover:border-raycast-coral/30 border-raycast-light-border bg-black/[0.02]',
              'dark:text-raycast-dark-muted dark:hover:text-raycast-coral dark:hover:border-raycast-coral/30 dark:border-white/8 dark:bg-white/[0.02]'
            )}
          >
            <span>🔗 {getDomainFromUrl(sourceUrl)}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>
        </div>
      )}
    </div>
  );
};
