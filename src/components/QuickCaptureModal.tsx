import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  Search,
  CornerDownLeft,
  Check,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { cn } from '../utils';
import type { SearchResult } from '../types';
import { Dropdown } from './Dropdown';

export interface QuickCaptureSectionOption {
  id: string;
  title: string;
  type: 'fields' | 'jots';
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
    { id: 'SYSTEM_GLOBAL_PAGE', title: '全域筆記頁', isSystem: true },
    { id: 'p1', title: '104 中文經歷' },
    { id: 'p2', title: '社交平台貼文' },
  ],
  sections = [
    { id: 's-global-jots', title: '隨手記事', type: 'jots', pageId: 'SYSTEM_GLOBAL_PAGE' },
    { id: 's-global-fields', title: '常用資料', type: 'fields', pageId: 'SYSTEM_GLOBAL_PAGE' },
    { id: 's-104-fields', title: '經歷資料', type: 'fields', pageId: 'p1' },
    { id: 's-social-jots', title: '靈感草稿', type: 'jots', pageId: 'p2' },
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
  // Capture Type: 'jot' | 'field'
  const [captureType, setCaptureType] = useState<'jot' | 'field'>('jot');

  // Form state
  const [selectedPageId, setSelectedPageId] = useState(activePageId);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [fieldKey, setFieldKey] = useState('');
  const [content, setContent] = useState(defaultContent);
  const [searchIndex, setSearchIndex] = useState(-1); // -1 means focus is in input
  const [savedSuccess, setSavedSuccess] = useState(false);

  const inputKeyRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Available sections for the current page and capture type
  const targetType = captureType === 'jot' ? 'jots' : 'fields';
  const availableSections = sections.filter(
    (s) => s.pageId === selectedPageId && s.type === targetType
  );

  // Auto-select first matching section whenever page or capture type changes
  useEffect(() => {
    if (availableSections.length > 0) {
      setSelectedSectionId(availableSections[0].id);
    } else {
      setSelectedSectionId('');
    }
  }, [selectedPageId, captureType]);

  // Sync defaultContent when modal opens
  useEffect(() => {
    if (isOpen) {
      setContent(defaultContent);
      setFieldKey('');
      setSavedSuccess(false);
      setSearchIndex(-1);
      setSelectedPageId(activePageId);

      setTimeout(() => {
        if (captureType === 'field') {
          inputKeyRef.current?.focus();
        } else {
          textareaRef.current?.focus();
        }
      }, 50);
    }
  }, [isOpen, defaultContent, activePageId, captureType]);

  // Trigger search whenever text changes
  const handleContentChange = (text: string) => {
    setContent(text);
    if (onSearchQueryChange) {
      onSearchQueryChange(text.trim());
    }
  };

  const handleKeyChange = (text: string) => {
    setFieldKey(text);
    if (onSearchQueryChange) {
      onSearchQueryChange(text.trim());
    }
  };

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

      // Tab toggles between Jot and Field modes
      if (e.key === 'Tab' && !e.shiftKey) {
        if (e.target !== textareaRef.current || e.ctrlKey || e.altKey) {
          e.preventDefault();
          setCaptureType((prev) => (prev === 'jot' ? 'field' : 'jot'));
        }
      }

      // Navigation into search results
      if (searchResults.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSearchIndex((prev) => (prev + 1 >= searchResults.length ? 0 : prev + 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSearchIndex((prev) => (prev <= 0 ? searchResults.length - 1 : prev - 1));
        } else if (e.key === 'Enter' && searchIndex >= 0 && searchIndex < searchResults.length) {
          e.preventDefault();
          const item = searchResults[searchIndex];
          handleCopySearchResult(item);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, searchResults, searchIndex]);

  if (!isOpen) return null;

  const handleCopySearchResult = (item: SearchResult) => {
    if (onCopySearchResult) onCopySearchResult(item);
    try {
      navigator.clipboard?.writeText(item.content);
    } catch {
      // Fallback
    }
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleSave = () => {
    if (!content.trim()) return;

    if (captureType === 'jot') {
      if (onSaveJot) {
        onSaveJot({
          pageId: selectedPageId,
          sectionId: selectedSectionId || undefined,
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
          sectionId: selectedSectionId || undefined,
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
    }, 400);
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
        {/* Top Header: Target Page & Mode Switcher */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/8">
          {/* Target Page Pill & Section Selector */}
          <div className="flex items-center gap-2">
            <Dropdown
              value={selectedPageId}
              options={pages.map((p) => ({
                id: p.id,
                label: p.title,
                icon: <Globe className="w-3.5 h-3.5 text-raycast-coral" />,
              }))}
              onChange={(id) => setSelectedPageId(id)}
              icon={<Globe className="w-3.5 h-3.5 text-raycast-coral" />}
            />

            {/* Target Section (if any available) */}
            {availableSections.length > 0 && (
              <Dropdown
                value={selectedSectionId}
                options={availableSections.map((s) => ({
                  id: s.id,
                  label: s.title,
                  icon: <Layers className="w-3 h-3 text-raycast-amber" />,
                }))}
                onChange={(id) => setSelectedSectionId(id)}
                icon={<Layers className="w-3 h-3 text-raycast-amber" />}
              />
            )}
          </div>

          {/* Mode Pill Toggle: Jot vs Field */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-black/5 dark:bg-white/5 border border-raycast-light-border dark:border-white/5 text-xs">
            <button
              type="button"
              onClick={() => setCaptureType('jot')}
              className={cn(
                'px-2.5 py-1 rounded-lg font-medium transition-all duration-200 ease-raycast',
                captureType === 'jot'
                  ? 'bg-raycast-light-surface dark:bg-raycast-dark-surface text-raycast-light-text dark:text-raycast-dark-text shadow-sm'
                  : 'text-raycast-light-muted dark:text-raycast-dark-muted hover:text-raycast-light-text dark:hover:text-raycast-dark-text'
              )}
            >
              隨筆 (Jot)
            </button>
            <button
              type="button"
              onClick={() => setCaptureType('field')}
              className={cn(
                'px-2.5 py-1 rounded-lg font-medium transition-all duration-200 ease-raycast',
                captureType === 'field'
                  ? 'bg-raycast-light-surface dark:bg-raycast-dark-surface text-raycast-light-text dark:text-raycast-dark-text shadow-sm'
                  : 'text-raycast-light-muted dark:text-raycast-dark-muted hover:text-raycast-light-text dark:hover:text-raycast-dark-text'
              )}
            >
              欄位 (Field)
            </button>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 flex flex-col gap-3">
          {captureType === 'field' && (
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-raycast-light-subtle dark:text-raycast-dark-subtle">
                欄位名稱 (Key)
              </label>
              <input
                ref={inputKeyRef}
                type="text"
                value={fieldKey}
                onChange={(e) => handleKeyChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && searchIndex === -1) {
                    e.preventDefault();
                    textareaRef.current?.focus();
                  }
                }}
                placeholder="例如：現職職稱、常用 Email、帳號代碼..."
                className={cn(
                  'w-full px-3 py-2 rounded-xl text-xs outline-none transition-all duration-200',
                  'bg-black/5 border border-raycast-light-border focus:border-raycast-amber focus:ring-2 focus:ring-raycast-amber/20',
                  'dark:bg-white/5 dark:border-white/10 dark:focus:border-raycast-amber dark:focus:ring-raycast-amber/20'
                )}
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-raycast-light-subtle dark:text-raycast-dark-subtle">
                {captureType === 'field' ? '欄位內容 (Value)' : '隨筆內容 (打字即時搜尋既有筆記)'}
              </label>
              {sourceUrl && (
                <span className="text-[10px] text-raycast-light-subtle dark:text-raycast-dark-subtle flex items-center gap-1 font-mono">
                  <ExternalLink className="w-2.5 h-2.5" />
                  來源將自動記錄
                </span>
              )}
            </div>
            <textarea
              ref={textareaRef}
              rows={3}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              onKeyDown={(e) => {
                // Ctrl+Enter or Cmd+Enter directly saves
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleSave();
                } else if (e.key === 'Enter' && !e.shiftKey && captureType === 'jot' && searchIndex === -1) {
                  // Direct Enter in jot saves
                  e.preventDefault();
                  handleSave();
                }
              }}
              placeholder={
                captureType === 'field'
                  ? '輸入欄位內容（點擊即可一鍵複製）...'
                  : '輸入隨手靈感、備忘或網址，打字可即時搜尋匹配既有筆記...'
              }
              className={cn(
                'w-full p-3 rounded-xl text-xs outline-none resize-none transition-all duration-200',
                'bg-black/5 border border-raycast-light-border focus:border-raycast-coral focus:ring-2 focus:ring-raycast-coral/20',
                'dark:bg-white/5 dark:border-white/10 dark:focus:border-raycast-coral dark:focus:ring-raycast-coral/20'
              )}
            />
          </div>

          {/* Real-time Spotlight Search Matches (ADR-0003 & Spec L139) */}
          {searchResults.length > 0 && (
            <div className="flex flex-col gap-1.5 pt-2 border-t border-black/5 dark:border-white/8">
              <div className="flex items-center justify-between text-[11px] text-raycast-light-subtle dark:text-raycast-dark-subtle font-medium">
                <span className="flex items-center gap-1">
                  <Search className="w-3 h-3 text-raycast-amber" />
                  找到 {searchResults.length} 項既有筆記 (按 ↑↓ 選擇，↵ 複製)：
                </span>
              </div>

              <div className="max-h-36 overflow-y-auto no-scrollbar flex flex-col gap-1">
                {searchResults.map((item, idx) => {
                  const isHighlighted = idx === searchIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleCopySearchResult(item)}
                      className={cn(
                        'flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all duration-150 ease-raycast',
                        isHighlighted
                          ? 'bg-raycast-amber/15 text-raycast-amber border border-raycast-amber/30'
                          : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                      )}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 text-[11px] text-raycast-light-subtle dark:text-raycast-dark-subtle truncate">
                          <span>{item.sourcePath}</span>
                        </div>
                        <span className="font-medium truncate text-raycast-light-text dark:text-raycast-dark-text">
                          {item.title}: {item.content}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 flex-shrink-0">
                        <CornerDownLeft className="w-2.5 h-2.5" />
                        複製
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-raycast-light-subtle dark:text-raycast-dark-subtle font-mono">
              Tab 切換模式 ‧ Esc 關閉
            </span>

            <button
              type="button"
              onClick={handleSave}
              disabled={!content.trim() || (captureType === 'field' && !fieldKey.trim())}
              className={cn(
                'flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ease-raycast active:scale-95 outline-none',
                savedSuccess
                  ? 'bg-raycast-emerald text-white'
                  : 'bg-raycast-coral hover:bg-raycast-coral/90 text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed'
              )}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>已儲存!</span>
                </>
              ) : (
                <>
                  <CornerDownLeft className="w-3.5 h-3.5" />
                  <span>儲存至筆記</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
