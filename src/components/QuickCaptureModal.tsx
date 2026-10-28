import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  Search,
  CornerDownLeft,
  Check,
  Globe,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { cn } from '../utils';
import type { SearchResult, CreateCellInput } from '../types';
import { Dropdown } from './Dropdown';
import { CellTypeBadge } from './CellTypeBadge';
import { Language, getTranslations } from '../i18n';

export interface QuickCaptureSectionOption {
  id: string;
  title: string;
  pageId: string;
}

export interface QuickCapturePageOption {
  id: string;
  title: string;
  isSystem?: boolean;
  sections?: QuickCaptureSectionOption[];
}

export interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages?: QuickCapturePageOption[];
  sections?: QuickCaptureSectionOption[];
  activePageId?: string;
  defaultContent?: string;
  sourceUrl?: string;
  sourceTitle?: string;
  searchResults?: SearchResult[];
  language?: Language;
  onSaveCell?: (data: CreateCellInput & { pageId: string; sectionId?: string }) => void;
  onSaveJot?: (data: {
    pageId: string;
    sectionId?: string;
    content: string;
    sourceUrl?: string;
    sourceTitle?: string;
  }) => void;
  onSaveField?: (data: {
    pageId: string;
    sectionId?: string;
    key: string;
    value: string;
    sourceUrl?: string;
    sourceTitle?: string;
  }) => void;
  onSearchQueryChange?: (query: string) => void;
  onCopySearchResult?: (item: SearchResult) => void;
  className?: string;
}

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({
  isOpen,
  onClose,
  pages = [
    { id: 'SYSTEM_GLOBAL_PAGE', title: '第一頁', isSystem: true },
    { id: 'p1', title: '104 中文經歷' },
    { id: 'p2', title: '社交平台貼文' },
  ],
  sections = [
    { id: 's-global-jots', title: '隨手記事', pageId: 'SYSTEM_GLOBAL_PAGE' },
    { id: 's-global-fields', title: '常用資料', pageId: 'SYSTEM_GLOBAL_PAGE' },
    { id: 's-104-fields', title: '經歷資料', pageId: 'p1' },
    { id: 's-social-jots', title: '靈感草稿', pageId: 'p2' },
  ],
  activePageId = 'SYSTEM_GLOBAL_PAGE',
  defaultContent = '',
  sourceUrl,
  sourceTitle,
  searchResults = [],
  language = 'zh-TW',
  onSaveCell,
  onSaveJot,
  onSaveField,
  onSearchQueryChange,
  onCopySearchResult,
  className,
}) => {
  const t = getTranslations(language);
  // Form state
  const [selectedPageId, setSelectedPageId] = useState(activePageId);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [cellKey, setCellKey] = useState('');
  const [value, setValue] = useState(defaultContent);

  // Search state
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Synchronize active page on open
  useEffect(() => {
    if (isOpen) {
      setSelectedPageId(activePageId);
      setValue(defaultContent);
      setCellKey('');
      setIsSearching(false);
      setSearchQuery('');
      setTimeout(() => {
        if (defaultContent) {
          textareaRef.current?.focus();
        } else {
          inputRef.current?.focus();
        }
      }, 50);
    }
  }, [isOpen, activePageId, defaultContent]);

  // Update available sections when selected page changes
  const availableSections = sections.filter((s) => s.pageId === selectedPageId);

  useEffect(() => {
    if (availableSections.length > 0) {
      const match = availableSections.find((s) => s.id === selectedSectionId);
      if (!match) {
        setSelectedSectionId(availableSections[0].id);
      }
    } else {
      setSelectedSectionId('');
    }
  }, [selectedPageId, sections]);

  // Keyboard navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // In search mode, handle Up/Down/Enter
      if (isSearching && searchResults.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedSearchIndex((prev) => (prev + 1) % searchResults.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedSearchIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const target = searchResults[selectedSearchIndex];
          if (target) {
            handleCopySearchResult(target);
          }
        }
      } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        // Ctrl+Enter or Cmd+Enter to save immediately
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSearching, searchResults, selectedSearchIndex, value, cellKey]);

  if (!isOpen) return null;

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setSelectedSearchIndex(0);
    const hasQuery = val.trim().length > 0;
    setIsSearching(hasQuery);
    if (onSearchQueryChange) onSearchQueryChange(val);
  };

  const handleCopySearchResult = async (item: SearchResult) => {
    try {
      await navigator.clipboard.writeText(item.content);
    } catch {
      // Fallback
    }
    setCopiedId(item.id);
    if (onCopySearchResult) onCopySearchResult(item);

    setTimeout(() => {
      setCopiedId(null);
      onClose();
    }, 600);
  };

  const handleSave = () => {
    const cleanVal = value.trim();
    if (!cleanVal) return;

    const key = cellKey.trim() || undefined;

    if (onSaveCell) {
      onSaveCell({
        pageId: selectedPageId,
        sectionId: selectedSectionId || undefined,
        key,
        value: cleanVal,
        sourceUrl,
        sourceTitle,
      });
    } else if (key && onSaveField) {
      onSaveField({
        pageId: selectedPageId,
        sectionId: selectedSectionId || undefined,
        key,
        value: cleanVal,
        sourceUrl,
        sourceTitle,
      });
    } else if (onSaveJot) {
      onSaveJot({
        pageId: selectedPageId,
        sectionId: selectedSectionId || undefined,
        content: cleanVal,
        sourceUrl,
        sourceTitle,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div
        className={cn(
          'relative w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden flex flex-col',
          'bg-raycast-light-bg border-raycast-light-border text-raycast-light-text',
          'dark:bg-raycast-dark-bg dark:border-raycast-dark-border dark:text-raycast-dark-text',
          'animate-in zoom-in-95 duration-200 ease-raycast',
          className
        )}
      >
        {/* Top Header / Omnibox Input */}
        <div className="relative flex items-center px-4 py-3 border-b border-raycast-light-border dark:border-raycast-dark-border gap-2.5">
          <Search className="w-4 h-4 text-raycast-amber flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t.quickCapture.searchPlaceholder}
            className={cn(
              'w-full bg-transparent text-sm outline-none placeholder:text-raycast-light-subtle dark:placeholder:text-raycast-dark-subtle',
              'text-raycast-light-text dark:text-raycast-dark-text'
            )}
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="text-xs text-raycast-light-subtle dark:text-raycast-dark-subtle hover:text-raycast-light-text dark:hover:text-raycast-dark-text px-1"
            >
              {t.common.clear}
            </button>
          )}
        </div>

        {/* Dynamic Body: Search Results OR Capture Form */}
        {isSearching ? (
          <div className="max-h-[320px] overflow-y-auto p-2 space-y-1 no-scrollbar">
            {searchResults.length > 0 ? (
              searchResults.map((item, idx) => {
                const isSelected = idx === selectedSearchIndex;
                const isCopied = copiedId === item.id;
                const isField = item.type === 'field';

                return (
                  <div
                    key={item.id}
                    onClick={() => handleCopySearchResult(item)}
                    onMouseEnter={() => setSelectedSearchIndex(idx)}
                    className={cn(
                      'flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-xs transition-all duration-150',
                      isSelected
                        ? 'bg-raycast-light-surface text-raycast-light-text border border-raycast-light-border shadow-sm dark:bg-raycast-dark-surface dark:text-raycast-dark-text dark:border-white/10'
                        : 'text-raycast-light-muted dark:text-raycast-dark-muted hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={cn(
                          'p-1.5 rounded-lg flex-shrink-0',
                          isField
                            ? 'bg-raycast-amber/10 text-raycast-amber'
                            : 'bg-raycast-coral/10 text-raycast-coral'
                        )}
                      >
                        {isField ? <Layers className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <CellTypeBadge type={item.type} language={language} />
                          <span className="font-semibold text-raycast-light-text dark:text-raycast-dark-text truncate">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-raycast-light-subtle dark:text-raycast-dark-subtle font-mono">
                            {item.sourcePath}
                          </span>
                        </div>
                        <div className="text-[11px] text-raycast-light-subtle dark:text-raycast-dark-subtle truncate mt-0.5">
                          {item.content}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {isCopied ? (
                        <span className="flex items-center gap-1 text-[11px] text-raycast-emerald font-medium">
                          <Check className="w-3.5 h-3.5" />
                          {t.common.copied}
                        </span>
                      ) : (
                        isSelected && (
                          <span className="flex items-center gap-1 text-[10px] text-raycast-light-subtle dark:text-raycast-dark-subtle font-mono">
                            <CornerDownLeft className="w-3 h-3" />
                            {t.common.copy}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-raycast-light-subtle dark:text-raycast-dark-subtle">
                {t.sidePanel.searchNoResults}
              </div>
            )}
          </div>
        ) : (
          /* Capture Form */
          <div className="p-4 flex flex-col gap-3.5">
            {/* Target Selectors: Page & Section */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-raycast-light-subtle dark:text-raycast-dark-subtle mb-1">
                  {t.quickCapture.targetPage}
                </label>
                <Dropdown
                  value={selectedPageId}
                  onChange={(val) => setSelectedPageId(val)}
                  options={pages.map((p) => ({
                    id: p.id,
                    label: p.title,
                  }))}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-raycast-light-subtle dark:text-raycast-dark-subtle mb-1">
                  {t.quickCapture.targetCategory}
                </label>
                <Dropdown
                  value={selectedSectionId}
                  onChange={(val) => setSelectedSectionId(val)}
                  options={
                    availableSections.length > 0
                      ? availableSections.map((s) => ({
                          id: s.id,
                          label: s.title,
                        }))
                      : [{ id: '', label: t.sidePanel.defaultCategoryName }]
                  }
                />
              </div>
            </div>

            {/* Optional Key Input */}
            <div>
              <label className="block text-[11px] font-medium text-raycast-light-subtle dark:text-raycast-dark-subtle mb-1 flex items-center justify-between">
                <span>{t.quickCapture.keyLabel}</span>
                <span className="text-[10px] text-raycast-light-subtle dark:text-raycast-dark-subtle font-normal">
                  {t.quickCapture.keyHint}
                </span>
              </label>
              <input
                type="text"
                value={cellKey}
                onChange={(e) => setCellKey(e.target.value)}
                placeholder={t.quickCapture.titlePlaceholder}
                className={cn(
                  'w-full px-3 py-2 rounded-lg text-xs outline-none transition-all duration-150',
                  'bg-raycast-light-surface border border-raycast-light-border text-raycast-light-text placeholder:text-raycast-light-subtle',
                  'dark:bg-raycast-dark-surface dark:border-white/10 dark:text-raycast-dark-text dark:placeholder:text-raycast-dark-subtle',
                  'focus:border-raycast-amber'
                )}
              />
            </div>

            {/* Content Payload (Value) */}
            <div>
              <label className="block text-[11px] font-medium text-raycast-light-subtle dark:text-raycast-dark-subtle mb-1">
                {t.quickCapture.contentLabel} <span className="text-raycast-coral">*</span>
              </label>
              <textarea
                ref={textareaRef}
                rows={3}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={t.quickCapture.contentPlaceholder}
                className={cn(
                  'w-full p-3 rounded-lg text-xs outline-none transition-all duration-150 resize-none font-sans leading-relaxed',
                  'bg-raycast-light-surface border border-raycast-light-border text-raycast-light-text placeholder:text-raycast-light-subtle',
                  'dark:bg-raycast-dark-surface dark:border-white/10 dark:text-raycast-dark-text dark:placeholder:text-raycast-dark-subtle',
                  'focus:border-raycast-amber'
                )}
              />
            </div>

            {/* Source URL Pill */}
            {sourceUrl && (
              <div className="flex items-center gap-1.5 text-[11px] text-raycast-light-subtle dark:text-raycast-dark-subtle font-mono truncate">
                <Globe className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{t.quickCapture.sourcePrefix}{sourceTitle || sourceUrl}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60 flex-shrink-0" />
              </div>
            )}
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-t border-raycast-light-border dark:border-raycast-dark-border bg-raycast-light-surface/40 dark:bg-raycast-dark-surface/40 select-none">
          <div className="text-[11px] text-raycast-light-subtle dark:text-raycast-dark-subtle flex items-center gap-1.5 font-mono whitespace-nowrap shrink-0">
            <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[10px]">Esc</kbd>
            <span className="hidden sm:inline">{t.common.cancel}</span>
            <span className="hidden sm:inline mx-1 text-black/20 dark:text-white/20">·</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[10px]">Ctrl+Enter</kbd>
            <span className="hidden sm:inline">{t.common.confirm}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-raycast-light-muted dark:text-raycast-dark-muted hover:text-raycast-light-text dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5 transition-all whitespace-nowrap"
            >
              {t.common.cancel}
            </button>
            <button
              onClick={handleSave}
              disabled={!value.trim()}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap',
                value.trim()
                  ? 'bg-raycast-amber text-raycast-dark-bg hover:brightness-110 active:scale-95 shadow-sm'
                  : 'bg-black/10 dark:bg-white/10 text-raycast-light-subtle dark:text-raycast-dark-subtle cursor-not-allowed'
              )}
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
              <span>{t.quickCapture.submitBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
