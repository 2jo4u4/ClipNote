import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Check, Globe, CornerDownLeft, ExternalLink } from 'lucide-react';
import { cn, isEventInsideNode, filterSearchResults } from '../utils';
import type { SearchResult } from '../types';
import { Language, getTranslations } from '../i18n';

export interface OmniSearchBarProps {
  onSearch?: (query: string) => void;
  results?: SearchResult[];
  onSelectItem?: (item: SearchResult) => void;
  onBindDomain?: (pageId: string) => void;
  currentDomain?: string;
  placeholder?: string;
  language?: Language;
  className?: string;
}

export const OmniSearchBar: React.FC<OmniSearchBarProps> = ({
  onSearch,
  results = [],
  onSelectItem,
  onBindDomain,
  currentDomain,
  placeholder,
  language = 'zh-TW',
  className,
}) => {
  const t = getTranslations(language);
  const resolvedPlaceholder = placeholder || t.sidePanel.searchPlaceholder;
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredResults = useMemo(
    () => filterSearchResults(results, query),
    [results, query]
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !isEventInsideNode(e, containerRef.current)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedIndex(0);
    setIsOpen(val.trim().length > 0);
    if (onSearch) onSearch(val);
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(0);
    if (onSearch) onSearch('');
    inputRef.current?.focus();
  };

  const handleCopyItem = async (item: SearchResult) => {
    try {
      await navigator.clipboard.writeText(item.content);
    } catch {
      // Fallback
    }
    setCopiedId(item.id);
    if (onSelectItem) onSelectItem(item);

    setTimeout(() => {
      setCopiedId(null);
      setIsOpen(false);
    }, 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    if (filteredResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % filteredResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = filteredResults[selectedIndex];
      if (current) {
        handleCopyItem(current);
      }
    }
  };

  // Scroll selected item into view smoothly
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement | undefined;
      if (activeEl) {
        activeEl.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [selectedIndex]);

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Search Input Bar */}
      <div
        className={cn(
          'relative flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 ease-raycast',
          'bg-raycast-light-surface/90 border-raycast-light-border shadow-sm',
          'dark:bg-raycast-dark-surface/90 dark:border-white/8',
          isOpen && 'ring-2 ring-raycast-coral/30 border-raycast-coral/40'
        )}
      >
        <Search className="w-4 h-4 text-raycast-light-subtle dark:text-raycast-dark-subtle flex-shrink-0" />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim().length > 0) setIsOpen(true);
          }}
          placeholder={resolvedPlaceholder}
          className={cn(
            'w-full bg-transparent text-xs font-sans outline-none',
            'text-raycast-light-text placeholder-raycast-light-subtle',
            'dark:text-raycast-dark-text dark:placeholder-raycast-dark-subtle'
          )}
        />

        {query && (
          <button
            onClick={handleClear}
            className="p-1 rounded-md text-raycast-light-subtle hover:text-raycast-light-text dark:text-raycast-dark-subtle dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Instant Dropdown Results */}
      {isOpen && (
        <div
          className={cn(
            'absolute left-0 right-0 top-full mt-2 z-40 max-h-96 overflow-y-auto rounded-2xl border shadow-2xl backdrop-blur-xl',
            'bg-raycast-light-surface/95 border-raycast-light-border divide-y divide-black/5',
            'dark:bg-raycast-dark-surface/95 dark:border-white/10 dark:divide-white/5 animate-in fade-in zoom-in-95 duration-150'
          )}
        >
          {filteredResults.length === 0 ? (
            <div className="py-8 text-center text-xs text-raycast-light-subtle dark:text-raycast-dark-subtle">
              {t.sidePanel.searchNoResults}
            </div>
          ) : (
            <div ref={listRef} className="p-1.5 flex flex-col gap-1">
              {filteredResults.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const isCopied = copiedId === item.id;
                const isField = item.type === 'field';

                return (
                  <div
                    key={item.id}
                    onClick={() => handleCopyItem(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      'group relative flex flex-col gap-1.5 p-2.5 rounded-xl cursor-pointer transition-all duration-150 ease-raycast',
                      isSelected
                        ? 'bg-black/5 dark:bg-white/10 shadow-sm'
                        : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04]',
                      isCopied && 'ring-2 ring-emerald-500/25 bg-emerald-500/10 dark:bg-emerald-500/10'
                    )}
                  >
                    {/* Origin Path & Action badges */}
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5 text-raycast-light-muted dark:text-raycast-dark-muted font-sans truncate">
                        <span className="truncate font-mono text-[10px]">
                          {item.sourcePath}
                        </span>
                      </div>

                      {/* Right shortcut pill */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {isCopied ? (
                          <span className="flex items-center gap-1 text-emerald-500 font-medium">
                            <Check className="w-3 h-3" />
                            <span>{t.common.copied}</span>
                          </span>
                        ) : (
                          <span
                            className={cn(
                              'flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border transition-opacity',
                              isSelected
                                ? 'opacity-100 bg-black/10 dark:bg-white/10 border-black/10 dark:border-white/15 text-raycast-light-text dark:text-raycast-dark-text'
                                : 'opacity-0 group-hover:opacity-100 text-raycast-light-muted dark:text-raycast-dark-muted border-transparent'
                            )}
                          >
                            <span>{t.common.copy}</span>
                            <CornerDownLeft className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Result Content */}
                    <div className="flex flex-col gap-0.5">
                      {isField && (
                        <span className="text-[11px] font-semibold tracking-wider uppercase text-raycast-light-subtle dark:text-raycast-dark-subtle">
                          {item.title}
                        </span>
                      )}
                      <p className="text-xs font-mono text-raycast-light-text dark:text-raycast-dark-text line-clamp-2 break-words">
                        {item.content}
                      </p>
                    </div>

                    {/* Smart Domain Binding Option if applicable */}
                    {onBindDomain && currentDomain && (
                      <div className="pt-1 mt-0.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[10px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onBindDomain(item.pageId);
                          }}
                          className="inline-flex items-center gap-1 text-raycast-coral hover:underline"
                        >
                          <Globe className="w-2.5 h-2.5" />
                          <span>{t.sidePanel.bindDomainToCurrent(item.pageTitle, currentDomain)}</span>
                        </button>

                        {item.sourceUrl && (
                          <span className="inline-flex items-center gap-1 text-raycast-light-subtle dark:text-raycast-dark-subtle">
                            <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
