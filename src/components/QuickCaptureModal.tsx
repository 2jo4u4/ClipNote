import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Layers,
  Search,
  X,
  CornerDownLeft,
  Check,
  Globe,
} from 'lucide-react';
import { cn } from '../utils';
import { SearchResultItem } from '../types';

export interface QuickCapturePageOption {
  id: string;
  title: string;
  isSystem?: boolean;
}

export interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages?: QuickCapturePageOption[];
  activePageId?: string;
  defaultContent?: string;
  sourceUrl?: string;
  sourceTitle?: string;
  searchResults?: SearchResultItem[];
  onSaveJot?: (data: { pageId: string; content: string; sourceUrl?: string; sourceTitle?: string }) => void;
  onSaveField?: (data: { pageId: string; key: string; value: string; sourceUrl?: string; sourceTitle?: string }) => void;
  onSearchQueryChange?: (query: string) => void;
  onCopySearchResult?: (item: SearchResultItem) => void;
  className?: string;
}

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({
  isOpen,
  onClose,
  pages = [
    { id: 'SYSTEM_GLOBAL_PAGE', title: '全域筆記頁', isSystem: true },
    { id: 'p1', title: '104 中文經歷' },
    { id: 'p2', title: '社交平台貼文' },
  ],
  activePageId = 'SYSTEM_GLOBAL_PAGE',
  defaultContent = '',
  sourceUrl,
  sourceTitle,
  searchResults = [],
  onSaveJot,
  onSaveField,
  onSearchQueryChange,
  onCopySearchResult,
  className,
}) => {
  // Mode: 'capture' | 'search'
  const [mode, setMode] = useState<'capture' | 'search'>('capture');
  // Capture Subtype: 'jot' | 'field'
  const [captureType, setCaptureType] = useState<'jot' | 'field'>('jot');

  // Fields state
  const [selectedPageId, setSelectedPageId] = useState(activePageId);
  const [fieldKey, setFieldKey] = useState('');
  const [content, setContent] = useState(defaultContent);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchIndex, setSearchIndex] = useState(0);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync defaultContent when modal opens
  useEffect(() => {
    if (isOpen) {
      setContent(defaultContent);
      setFieldKey('');
      setSavedSuccess(false);
      setSearchQuery('');
      setSearchIndex(0);
      setSelectedPageId(activePageId);

      // Focus appropriate input on open
      setTimeout(() => {
        if (mode === 'capture') {
          if (captureType === 'field') {
            inputRef.current?.focus();
          } else {
            textareaRef.current?.focus();
          }
        }
      }, 50);
    }
  }, [isOpen, defaultContent, activePageId, mode, captureType]);

  // Global keyboard shortcuts within the modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape closes modal
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Tab toggles mode (capture <-> search) if not in multiline textarea
      if (e.key === 'Tab' && !e.shiftKey) {
        // Prevent tab from shifting focus wildly, toggle mode smoothly
        if (e.target !== textareaRef.current || e.ctrlKey || e.altKey) {
          e.preventDefault();
          setMode((prev) => (prev === 'capture' ? 'search' : 'capture'));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!content.trim()) return;

    if (captureType === 'jot') {
      if (onSaveJot) {
        onSaveJot({
          pageId: selectedPageId,
          content: content.trim(),
          sourceUrl,
          sourceTitle,
        });
      }
    } else {
      if (!fieldKey.trim()) return;
      if (onSaveField) {
        onSaveField({
          pageId: selectedPageId,
          key: fieldKey.trim(),
          value: content.trim(),
          sourceUrl,
          sourceTitle,
        });
      }
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSearchIndex((prev) => (prev + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSearchIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = searchResults[searchIndex];
      if (item) {
        if (onCopySearchResult) onCopySearchResult(item);
        navigator.clipboard?.writeText(item.content);
        setSavedSuccess(true);
        setTimeout(() => {
          onClose();
        }, 500);
      }
    }
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'bg-black/60 backdrop-blur-md animate-in fade-in duration-200'
      )}
      onClick={onClose}
    >
      {/* Modal Dialog Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'relative w-full max-w-lg rounded-2xl shadow-2xl border flex flex-col overflow-hidden outline-none',
          'transition-all duration-300 ease-raycast animate-in zoom-in-95',
          'bg-raycast-light-surface/95 border-raycast-light-border text-raycast-light-text',
          'dark:bg-raycast-dark-surface/95 dark:border-white/10 dark:text-raycast-dark-text',
          className
        )}
      >
        {/* Top Header & Mode Switcher */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/8">
          {/* Segmented Mode Control */}
          <div className="flex items-center p-0.5 rounded-xl bg-black/5 dark:bg-white/5 border border-raycast-light-border dark:border-white/5">
            <button
              type="button"
              onClick={() => setMode('capture')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ease-raycast',
                mode === 'capture'
                  ? 'bg-raycast-light-surface dark:bg-raycast-dark-surface text-raycast-light-text dark:text-raycast-dark-text shadow-sm'
                  : 'text-raycast-light-muted dark:text-raycast-dark-muted hover:text-raycast-light-text dark:hover:text-raycast-dark-text'
              )}
            >
              <Sparkles className="w-3.5 h-3.5 text-raycast-coral" />
              <span>快速記錄 (Capture)</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('search')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ease-raycast',
                mode === 'search'
                  ? 'bg-raycast-light-surface dark:bg-raycast-dark-surface text-raycast-light-text dark:text-raycast-dark-text shadow-sm'
                  : 'text-raycast-light-muted dark:text-raycast-dark-muted hover:text-raycast-light-text dark:hover:text-raycast-dark-text'
              )}
            >
              <Search className="w-3.5 h-3.5 text-raycast-amber" />
              <span>全域搜尋 (Search)</span>
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-raycast-light-subtle hover:text-raycast-light-text dark:text-raycast-dark-subtle dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode 1: Quick Capture */}
        {mode === 'capture' ? (
          <div className="p-4 flex flex-col gap-3">
            {/* Target Page Selector & Capture Type Toggle */}
            <div className="flex items-center justify-between gap-3">
              {/* Type pill: Jot vs Field */}
              <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setCaptureType('jot')}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-[11px] font-medium transition-all',
                    captureType === 'jot'
                      ? 'bg-raycast-light-surface dark:bg-raycast-dark-surface shadow-xs text-raycast-light-text dark:text-raycast-dark-text font-semibold'
                      : 'text-raycast-light-muted dark:text-raycast-dark-muted'
                  )}
                >
                  隨筆 (Jot)
                </button>
                <button
                  type="button"
                  onClick={() => setCaptureType('field')}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-[11px] font-medium transition-all',
                    captureType === 'field'
                      ? 'bg-raycast-light-surface dark:bg-raycast-dark-surface shadow-xs text-raycast-light-text dark:text-raycast-dark-text font-semibold'
                      : 'text-raycast-light-muted dark:text-raycast-dark-muted'
                  )}
                >
                  欄位 (Key-Value)
                </button>
              </div>

              {/* Destination Page Selector */}
              <div className="flex items-center gap-1.5 text-xs text-raycast-light-muted dark:text-raycast-dark-muted">
                <span>存入:</span>
                <select
                  value={selectedPageId}
                  onChange={(e) => setSelectedPageId(e.target.value)}
                  className={cn(
                    'px-2 py-1 rounded-lg border text-xs font-medium outline-none cursor-pointer',
                    'bg-raycast-light-bg border-raycast-light-border text-raycast-light-text',
                    'dark:bg-raycast-dark-surface dark:border-white/10 dark:text-raycast-dark-text'
                  )}
                >
                  {pages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.isSystem ? '🌍 ' : ''}
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Field Key (if Field mode) */}
            {captureType === 'field' && (
              <div className="flex flex-col gap-1 animate-in fade-in duration-150">
                <label className="text-[11px] font-semibold tracking-wider uppercase text-raycast-light-subtle dark:text-raycast-dark-subtle">
                  欄位名稱 (Key)
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={fieldKey}
                  onChange={(e) => setFieldKey(e.target.value)}
                  placeholder="例如：專案描述、英文職稱、推薦信..."
                  className={cn(
                    'w-full px-3 py-2 rounded-xl border text-xs outline-none transition-all duration-150',
                    'bg-black/[0.02] dark:bg-white/[0.03] border-raycast-light-border dark:border-white/10',
                    'focus:ring-2 focus:ring-raycast-coral/30 focus:border-raycast-coral/50'
                  )}
                />
              </div>
            )}

            {/* Content / Value Textarea */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold tracking-wider uppercase text-raycast-light-subtle dark:text-raycast-dark-subtle">
                {captureType === 'field' ? '欄位內容 (Value)' : '隨筆內容 (Content)'}
              </label>
              <textarea
                ref={textareaRef}
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleSave();
                  }
                }}
                placeholder={
                  captureType === 'field'
                    ? '輸入欲一鍵複製的內容...'
                    : '快速記錄想法、網頁地址、備忘記事... (支援 Cmd/Ctrl+Enter 儲存)'
                }
                className={cn(
                  'w-full px-3 py-2.5 rounded-xl border text-xs font-mono outline-none resize-none transition-all duration-150 leading-relaxed',
                  'bg-black/[0.02] dark:bg-white/[0.03] border-raycast-light-border dark:border-white/10',
                  'focus:ring-2 focus:ring-raycast-coral/30 focus:border-raycast-coral/50'
                )}
              />
            </div>

            {/* Source preview badge if available */}
            {sourceUrl && (
              <div className="flex items-center gap-1.5 text-[11px] text-raycast-light-subtle dark:text-raycast-dark-subtle truncate">
                <Globe className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">來源: {sourceTitle || sourceUrl}</span>
              </div>
            )}
          </div>
        ) : (
          /* Mode 2: Search */
          <div className="p-4 flex flex-col gap-3">
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl border',
                'bg-black/[0.02] dark:bg-white/[0.03] border-raycast-light-border dark:border-white/10',
                'focus-within:ring-2 focus-within:ring-raycast-amber/30 focus-within:border-raycast-amber/50'
              )}
            >
              <Search className="w-4 h-4 text-raycast-light-subtle dark:text-raycast-dark-subtle flex-shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchIndex(0);
                  if (onSearchQueryChange) onSearchQueryChange(e.target.value);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="輸入關鍵字即時跨頁搜尋..."
                className="w-full bg-transparent text-xs outline-none text-raycast-light-text dark:text-raycast-dark-text"
              />
            </div>

            {/* Search Results list */}
            <div className="max-h-60 overflow-y-auto flex flex-col gap-1.5 pr-1">
              {searchResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-raycast-light-subtle dark:text-raycast-dark-subtle">
                  {searchQuery ? '無相符結果' : '輸入關鍵字開始搜尋'}
                </div>
              ) : (
                searchResults.map((item, idx) => {
                  const isSelected = idx === searchIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (onCopySearchResult) onCopySearchResult(item);
                        navigator.clipboard?.writeText(item.content);
                        setSavedSuccess(true);
                        setTimeout(() => onClose(), 500);
                      }}
                      className={cn(
                        'flex flex-col gap-1 p-2.5 rounded-xl cursor-pointer transition-all duration-150',
                        isSelected
                          ? 'bg-black/5 dark:bg-white/10 shadow-sm'
                          : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                      )}
                    >
                      <div className="flex items-center justify-between text-[10px] text-raycast-light-muted dark:text-raycast-dark-muted">
                        <span className="flex items-center gap-1">
                          {item.type === 'field' ? (
                            <Layers className="w-3 h-3 text-raycast-coral" />
                          ) : (
                            <Sparkles className="w-3 h-3 text-raycast-amber" />
                          )}
                          <span>
                            {item.pageTitle} &gt; {item.sectionTitle}
                          </span>
                        </span>
                        <span className="font-mono text-[9px] text-raycast-light-subtle">
                          ↵ 複製
                        </span>
                      </div>
                      <div className="text-xs font-mono text-raycast-light-text dark:text-raycast-dark-text truncate">
                        {item.title ? `${item.title}: ` : ''}
                        {item.content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Modal Footer with Actions and Keyboard Shortcuts */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/5 dark:border-white/8 text-[11px]">
          {/* Shortcuts Legend */}
          <div className="flex items-center gap-3 text-raycast-light-subtle dark:text-raycast-dark-subtle">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border text-[10px] font-mono bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10">
                ↵
              </kbd>
              <span>{mode === 'capture' ? '儲存' : '複製'}</span>
            </span>

            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border text-[10px] font-mono bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10">
                Tab
              </kbd>
              <span>切換模式</span>
            </span>

            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border text-[10px] font-mono bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10">
                Esc
              </kbd>
              <span>關閉</span>
            </span>
          </div>

          {/* Action buttons (in Capture mode) */}
          {mode === 'capture' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-raycast-light-muted hover:text-raycast-light-text dark:text-raycast-dark-muted dark:hover:text-raycast-dark-text transition-colors"
              >
                取消
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={!content.trim() || (captureType === 'field' && !fieldKey.trim())}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium shadow-sm transition-all duration-200 ease-raycast active:scale-95',
                  content.trim() && (captureType === 'jot' || fieldKey.trim())
                    ? 'bg-raycast-coral text-white hover:bg-raycast-coral/90 cursor-pointer'
                    : 'bg-black/10 dark:bg-white/10 text-raycast-light-subtle dark:text-raycast-dark-subtle cursor-not-allowed',
                  savedSuccess && 'bg-emerald-500 text-white'
                )}
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>已儲存!</span>
                  </>
                ) : (
                  <>
                    <span>儲存</span>
                    <CornerDownLeft className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
