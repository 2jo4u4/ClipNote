import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp, ExternalLink, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { cn } from '../utils';

export interface FieldCardProps {
  id: string;
  fieldKey: string;
  value: string;
  sourceUrl?: string;
  sourceTitle?: string;
  onCopy?: (value: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export const FieldCard: React.FC<FieldCardProps> = ({
  id,
  fieldKey,
  value,
  sourceUrl,
  sourceTitle,
  onCopy,
  onEdit,
  onDelete,
  className,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Check if text is long enough to benefit from clamping (> 90 characters or multi-line)
  const isLongText = value.length > 90 || value.includes('\n');

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Fallback
    }
    if (onCopy) onCopy(value);

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
        'group relative flex flex-col gap-1.5 p-2.5 rounded-xl border transition-all duration-200 ease-raycast',
        'bg-raycast-light-surface/90 border-raycast-light-border hover:border-black/15 shadow-sm',
        'dark:bg-raycast-dark-surface/90 dark:border-white/8 dark:hover:border-white/20',
        copied && 'ring-2 ring-emerald-500/25 border-emerald-500/40 dark:border-emerald-500/40',
        className
      )}
    >
      {/* Header: Key Label & Actions */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'text-[11px] font-semibold tracking-wider uppercase select-none transition-colors duration-150',
            'text-raycast-light-subtle dark:text-raycast-dark-subtle'
          )}
        >
          {fieldKey}
        </span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              title={sourceTitle || sourceUrl}
              className={cn(
                'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors',
                'text-raycast-light-muted hover:text-raycast-coral bg-black/5 dark:bg-white/5 dark:text-raycast-dark-muted dark:hover:text-raycast-coral'
              )}
            >
              <span>{getDomainFromUrl(sourceUrl)}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}

          {(onEdit || onDelete) && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1 rounded text-raycast-light-subtle hover:text-raycast-light-text dark:text-raycast-dark-subtle dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <MoreVertical className="w-3 h-3" />
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

      {/* Tactile Card: Value Area with One-Click Copy */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleCopy}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCopy(e as unknown as React.MouseEvent);
          }
        }}
        title="點擊複製內容"
        className={cn(
          'relative p-2.5 rounded-lg border text-left cursor-pointer outline-none select-text',
          'transition-all duration-200 ease-raycast active:scale-[0.98]',
          'bg-black/[0.02] hover:bg-black/[0.04] border-black/5',
          'dark:bg-white/[0.03] dark:hover:bg-white/[0.06] dark:border-white/5',
          copied && 'bg-emerald-500/[0.08] dark:bg-emerald-500/[0.1] border-emerald-500/30'
        )}
      >
        <div className="flex items-start justify-between gap-2.5">
          {/* Value Content */}
          <p
            className={cn(
              'text-xs font-mono text-raycast-light-text dark:text-raycast-dark-text break-words whitespace-pre-wrap leading-relaxed flex-1',
              !isExpanded && isLongText && 'line-clamp-3'
            )}
          >
            {value}
          </p>

          {/* Copy Icon Feedback Flip */}
          <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
            {copied ? (
              <div className="flex items-center gap-1 text-emerald-500 text-[11px] font-sans font-medium animate-in fade-in zoom-in duration-200">
                <span>已複製!</span>
                <Check className="w-3.5 h-3.5" />
              </div>
            ) : (
              <span className="text-raycast-light-subtle dark:text-raycast-dark-subtle group-hover:text-raycast-light-muted dark:group-hover:text-raycast-dark-muted transition-colors">
                <Copy className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>

        {/* Long Text Expand/Collapse Toggle Button */}
        {isLongText && (
          <div className="mt-2 pt-1 border-t border-black/5 dark:border-white/5 flex justify-end">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className={cn(
                'inline-flex items-center gap-1 text-[11px] font-sans transition-colors',
                'text-raycast-light-muted hover:text-raycast-light-text dark:text-raycast-dark-muted dark:hover:text-raycast-dark-text'
              )}
            >
              <span>{isExpanded ? '收合' : '展開完整內容'}</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
