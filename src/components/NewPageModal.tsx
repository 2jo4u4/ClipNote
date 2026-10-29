import React, { useState, useEffect, useRef } from 'react';
import { X, CornerDownLeft, Globe } from 'lucide-react';
import { cn } from '../utils';
import { Language, getTranslations } from '../i18n';

export interface PageModalData {
  title: string;
  icon?: string;
  domains: string[];
}

export type NewPageData = PageModalData;

export interface NewPageModalProps {
  isOpen: boolean;
  mode?: 'create' | 'edit';
  initialData?: PageModalData;
  language?: Language;
  onClose: () => void;
  onSubmit: (data: PageModalData) => void;
  className?: string;
}

const PRESET_EMOJIS = ['💼', '📝', '💬', '🌐', '🚀', '💡', '🎯', '📌', '💻', '🔖', '📄', '✨'];

const PRESET_EMOJI_LABELS: Record<string, { 'zh-TW': string; en: string }> = {
  '💼': { 'zh-TW': '公事包', en: 'Briefcase' },
  '📝': { 'zh-TW': '筆記', en: 'Note' },
  '💬': { 'zh-TW': '對話', en: 'Chat' },
  '🌐': { 'zh-TW': '網站', en: 'Website' },
  '🚀': { 'zh-TW': '火箭', en: 'Rocket' },
  '💡': { 'zh-TW': '靈感', en: 'Lightbulb' },
  '🎯': { 'zh-TW': '目標', en: 'Target' },
  '📌': { 'zh-TW': '圖釘', en: 'Pin' },
  '💻': { 'zh-TW': '電腦', en: 'Laptop' },
  '🔖': { 'zh-TW': '書籤', en: 'Bookmark' },
  '📄': { 'zh-TW': '文件', en: 'Document' },
  '✨': { 'zh-TW': '亮點', en: 'Sparkles' },
};

export const NewPageModal: React.FC<NewPageModalProps> = ({
  isOpen,
  mode = 'create',
  initialData,
  language = 'zh-TW',
  onClose,
  onSubmit,
  className,
}) => {
  const t = getTranslations(language);
  const isEdit = mode === 'edit';
  const [title, setTitle] = useState(initialData?.title || '');
  const [icon, setIcon] = useState(initialData?.icon || '📝');
  const [domainsInput, setDomainsInput] = useState(
    initialData?.domains ? initialData.domains.join(', ') : ''
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;
      if (initialData) {
        setTitle(initialData.title || '');
        setIcon(initialData.icon || '📝');
        setDomainsInput(initialData.domains ? initialData.domains.join(', ') : '');
      } else {
        setTitle('');
        setIcon('📝');
        setDomainsInput('');
      }
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      if (previouslyFocusedElementRef.current) {
        previouslyFocusedElementRef.current.focus();
        previouslyFocusedElementRef.current = null;
      }
    }
  }, [isOpen, initialData]);

  // Focus trap and Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (!modalRef.current) return;
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    const domains = domainsInput
      .split(/[,，\s]+/)
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean);

    onSubmit({
      title: cleanTitle,
      icon: icon.trim() || undefined,
      domains,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-page-modal-title"
        aria-describedby="new-page-modal-desc"
        className={cn(
          'relative w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden flex flex-col',
          'bg-raycast-light-bg border-raycast-light-border text-raycast-light-text',
          'dark:bg-raycast-dark-bg dark:border-raycast-dark-border dark:text-raycast-dark-text',
          'animate-in zoom-in-95 duration-200 ease-raycast',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-raycast-light-border dark:border-raycast-dark-border">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">{icon || '📄'}</span>
            <div>
              <h3 id="new-page-modal-title" className="text-sm font-semibold text-raycast-light-text dark:text-raycast-dark-text">
                {isEdit ? t.newPageModal.editTitle : t.newPageModal.title}
              </h3>
              <p id="new-page-modal-desc" className="text-[11px] text-raycast-light-subtle dark:text-raycast-dark-subtle">
                {isEdit ? t.newPageModal.editDescription : t.newPageModal.description}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.cancel}
            className="p-1 rounded-lg text-raycast-light-muted dark:text-raycast-dark-muted hover:text-raycast-light-text dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* Page Title */}
          <div>
            <label
              htmlFor="new-page-title-input"
              className="block text-xs font-medium text-raycast-light-muted dark:text-raycast-dark-muted mb-1.5"
            >
              {t.newPageModal.nameLabel} <span className="text-raycast-coral">*</span>
            </label>
            <input
              id="new-page-title-input"
              ref={inputRef}
              type="text"
              required
              aria-required="true"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.newPageModal.namePlaceholder}
              className={cn(
                'w-full px-3 py-2 rounded-lg text-sm outline-none transition-all duration-200',
                'bg-raycast-light-surface border border-raycast-light-border text-raycast-light-text placeholder:text-raycast-light-subtle',
                'dark:bg-raycast-dark-surface dark:border-raycast-dark-border dark:text-raycast-dark-text dark:placeholder:text-raycast-dark-subtle',
                'focus:border-raycast-amber focus:ring-1 focus:ring-raycast-amber/50'
              )}
            />
          </div>

          {/* Icon / Emoji Selection */}
          <div>
            <label
              htmlFor="new-page-icon-input"
              className="block text-xs font-medium text-raycast-light-muted dark:text-raycast-dark-muted mb-1.5 flex items-center justify-between"
            >
              <span>{t.newPageModal.iconLabel}</span>
              <span className="text-[11px] font-normal text-raycast-light-subtle dark:text-raycast-dark-subtle">
                {t.newPageModal.iconHint}
              </span>
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                id="new-page-icon-input"
                type="text"
                value={icon}
                maxLength={4}
                aria-label={t.newPageModal.iconLabel}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="圖示"
                className={cn(
                  'w-14 px-2 py-1.5 text-center text-base rounded-lg outline-none transition-all duration-200',
                  'bg-raycast-light-surface border border-raycast-light-border text-raycast-light-text',
                  'dark:bg-raycast-dark-surface dark:border-raycast-dark-border dark:text-raycast-dark-text',
                  'focus:border-raycast-amber focus:ring-1 focus:ring-raycast-amber/50'
                )}
              />
              {/* Preset Chips */}
              <div
                role="group"
                aria-label={t.newPageModal.iconLabel}
                className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar flex-1"
              >
                {PRESET_EMOJIS.map((emoji) => {
                  const emojiLabel = PRESET_EMOJI_LABELS[emoji]?.[language] || emoji;
                  return (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcon(emoji)}
                      aria-label={emojiLabel}
                      aria-pressed={icon === emoji}
                      className={cn(
                        'w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg text-sm transition-all duration-150',
                        icon === emoji
                          ? 'bg-raycast-amber/20 border border-raycast-amber text-raycast-amber scale-105'
                          : 'bg-raycast-light-surface dark:bg-raycast-dark-surface border border-transparent hover:border-raycast-light-border dark:hover:border-raycast-dark-border opacity-80 hover:opacity-100'
                      )}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bound Domains */}
          <div>
            <label
              htmlFor="new-page-domains-input"
              className="block text-xs font-medium text-raycast-light-muted dark:text-raycast-dark-muted mb-1.5 flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-raycast-light-subtle dark:text-raycast-dark-subtle" />
              <span>{t.newPageModal.domainLabel}</span>
            </label>
            <input
              id="new-page-domains-input"
              type="text"
              value={domainsInput}
              aria-describedby="new-page-domains-hint"
              onChange={(e) => setDomainsInput(e.target.value)}
              placeholder={t.newPageModal.domainPlaceholder}
              className={cn(
                'w-full px-3 py-2 rounded-lg text-sm outline-none transition-all duration-200 font-mono text-xs',
                'bg-raycast-light-surface border border-raycast-light-border text-raycast-light-text placeholder:text-raycast-light-subtle',
                'dark:bg-raycast-dark-surface dark:border-raycast-dark-border dark:text-raycast-dark-text dark:placeholder:text-raycast-dark-subtle',
                'focus:border-raycast-amber focus:ring-1 focus:ring-raycast-amber/50'
              )}
            />
            <p id="new-page-domains-hint" className="mt-1 text-[11px] text-raycast-light-subtle dark:text-raycast-dark-subtle">
              {t.newPageModal.domainHint}
            </p>
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-between pt-3 mt-1 border-t border-raycast-light-border dark:border-raycast-dark-border">
            <div aria-hidden="true" className="text-[11px] text-raycast-light-subtle dark:text-raycast-dark-subtle flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-[10px]">
                Esc
              </kbd>
              <span>{t.common.cancel}</span>
              <span className="mx-1">·</span>
              <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-[10px]">
                Enter
              </kbd>
              <span>{t.common.confirm}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  'text-raycast-light-muted dark:text-raycast-dark-muted hover:text-raycast-light-text dark:hover:text-raycast-dark-text',
                  'hover:bg-black/5 dark:hover:bg-white/5'
                )}
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                  title.trim()
                    ? 'bg-raycast-amber text-raycast-dark-bg hover:brightness-110 active:scale-95 shadow-sm'
                    : 'bg-black/10 dark:bg-white/10 text-raycast-light-subtle dark:text-raycast-dark-subtle cursor-not-allowed'
                )}
              >
                <CornerDownLeft className="w-3.5 h-3.5" />
                <span>{isEdit ? t.newPageModal.saveChangesBtn : t.newPageModal.submitBtn}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
