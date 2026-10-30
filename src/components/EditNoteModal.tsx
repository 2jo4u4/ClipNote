import React, { useState, useEffect, useRef } from 'react';
import { X, FileEdit, Check, Globe, RefreshCw } from 'lucide-react';
import { cn, focusNextOnEnter, detectActiveTabSource } from '../utils';
import { Language, getTranslations } from '../i18n';

export interface EditNoteModalProps {
  isOpen: boolean;
  cellId: string;
  initialKey?: string;
  initialValue: string;
  initialSourceUrl?: string;
  initialSourceTitle?: string;
  currentUrl?: string;
  currentTitle?: string;
  language?: Language;
  onClose: () => void;
  onSubmit: (
    cellId: string,
    updates: { key?: string; value: string; sourceUrl?: string; sourceTitle?: string }
  ) => void;
}

export const EditNoteModal: React.FC<EditNoteModalProps> = ({
  isOpen,
  cellId,
  initialKey = '',
  initialValue = '',
  initialSourceUrl = '',
  initialSourceTitle = '',
  currentUrl,
  currentTitle,
  language = 'zh-TW',
  onClose,
  onSubmit,
}) => {
  const t = getTranslations(language);
  const [key, setKey] = useState(initialKey);
  const [value, setValue] = useState(initialValue);
  const [sourceTitle, setSourceTitle] = useState(initialSourceTitle);
  const [sourceUrl, setSourceUrl] = useState(initialSourceUrl);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const keyInputRef = useRef<HTMLInputElement>(null);
  const sourceUrlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setKey(initialKey);
      setValue(initialValue);
      setSourceTitle(initialSourceTitle);
      setSourceUrl(initialSourceUrl);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          const autoHeight = Math.min(Math.max(textareaRef.current.scrollHeight, 100), 240);
          textareaRef.current.style.height = `${autoHeight}px`;
        }
        if (initialKey) {
          keyInputRef.current?.focus();
        } else {
          textareaRef.current?.focus();
        }
      }, 50);
    }
  }, [isOpen, initialKey, initialValue, initialSourceTitle, initialSourceUrl]);

  // Handle Ctrl+Enter to save, Esc to cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, key, value, sourceTitle, sourceUrl]);

  if (!isOpen) return null;

  const handleDetectCurrentTab = async () => {
    const detected = await detectActiveTabSource(currentUrl, currentTitle);
    setSourceUrl(detected.url);
    setSourceTitle(detected.title);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleanValue = value.trim();
    if (!cleanValue) return;

    onSubmit(cellId, {
      key: key.trim() || undefined,
      value: cleanValue,
      sourceUrl: sourceUrl.trim() || undefined,
      sourceTitle: sourceTitle.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={cn(
          'w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden select-none',
          'bg-raycast-light-bg border-raycast-light-border text-raycast-light-text',
          'dark:bg-raycast-dark-bg dark:border-white/10 dark:text-raycast-dark-text',
          'animate-in zoom-in-95 duration-150'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-raycast-light-border dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-raycast-coral/15 text-raycast-coral flex items-center justify-center">
              <FileEdit className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-semibold tracking-tight">{t.editNoteModal.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            title={t.common.cancel}
            aria-label={t.common.cancel}
            className="p-1 rounded-lg text-raycast-light-subtle hover:text-raycast-light-text dark:text-raycast-dark-subtle dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 space-y-3.5">
          {/* Key (Field Name) */}
          <div>
            <label className="block text-[11px] font-medium text-raycast-light-subtle dark:text-raycast-dark-subtle mb-1">
              {t.editNoteModal.keyLabel}
            </label>
            <input
              ref={keyInputRef}
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => focusNextOnEnter(e, textareaRef)}
              placeholder={t.editNoteModal.keyPlaceholder}
              className={cn(
                'w-full px-3 py-2 rounded-xl text-xs outline-none transition-all duration-150',
                'bg-raycast-light-surface border border-raycast-light-border text-raycast-light-text placeholder:text-raycast-light-subtle',
                'dark:bg-raycast-dark-surface dark:border-white/10 dark:text-raycast-dark-text dark:placeholder:text-raycast-dark-subtle',
                'focus:border-raycast-amber focus:ring-1 focus:ring-raycast-amber/30'
              )}
            />
          </div>

          {/* Value (Note Content) */}
          <div>
            <label className="block text-[11px] font-medium text-raycast-light-subtle dark:text-raycast-dark-subtle mb-1">
              {t.editNoteModal.contentLabel} <span className="text-raycast-coral">*</span>
            </label>
            <textarea
              ref={textareaRef}
              rows={5}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t.editNoteModal.contentPlaceholder}
              className={cn(
                'w-full p-3 rounded-xl text-xs outline-none transition-colors duration-150 resize-y min-h-[100px] max-h-[50vh] font-sans leading-relaxed',
                'bg-raycast-light-surface border border-raycast-light-border text-raycast-light-text placeholder:text-raycast-light-subtle',
                'dark:bg-raycast-dark-surface dark:border-white/10 dark:text-raycast-dark-text dark:placeholder:text-raycast-dark-subtle',
                'focus:border-raycast-amber focus:ring-1 focus:ring-raycast-amber/30'
              )}
            />
          </div>

          {/* Source Webpage (Editable Title & URL + Manual Detect Button) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-1 text-[11px] font-medium text-raycast-light-subtle dark:text-raycast-dark-subtle">
                <Globe className="w-3 h-3" />
                <span>{t.quickCapture.sourceLabel}</span>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleDetectCurrentTab}
                  title={t.quickCapture.detectCurrentTab}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium text-raycast-amber bg-raycast-amber/10 hover:bg-raycast-amber/20 transition-colors active:scale-95"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>{t.quickCapture.detectCurrentTab}</span>
                </button>
                {(sourceTitle || sourceUrl) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSourceTitle('');
                      setSourceUrl('');
                    }}
                    title={t.quickCapture.clearSource}
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] text-raycast-light-subtle dark:text-raycast-dark-subtle hover:text-raycast-coral hover:bg-raycast-coral/10 transition-colors"
                  >
                    <X className="w-2.5 h-2.5" />
                    <span>{t.quickCapture.clearSource}</span>
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <input
                type="text"
                value={sourceTitle}
                onChange={(e) => setSourceTitle(e.target.value)}
                onKeyDown={(e) => focusNextOnEnter(e, sourceUrlInputRef)}
                aria-label={t.quickCapture.sourceTitlePlaceholder}
                placeholder={t.quickCapture.sourceTitlePlaceholder}
                className={cn(
                  'w-full px-2.5 py-1.5 rounded-lg text-[11px] outline-none transition-all duration-150',
                  'bg-raycast-light-surface border border-raycast-light-border text-raycast-light-text placeholder:text-raycast-light-subtle',
                  'dark:bg-raycast-dark-surface dark:border-white/10 dark:text-raycast-dark-text dark:placeholder:text-raycast-dark-subtle',
                  'focus:border-raycast-amber focus:ring-1 focus:ring-raycast-amber/30'
                )}
              />
              <input
                ref={sourceUrlInputRef}
                type="text"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                aria-label={t.quickCapture.sourceUrlPlaceholder}
                placeholder={t.quickCapture.sourceUrlPlaceholder}
                className={cn(
                  'w-full px-2.5 py-1.5 rounded-lg text-[11px] font-mono outline-none transition-all duration-150',
                  'bg-raycast-light-surface border border-raycast-light-border text-raycast-light-text placeholder:text-raycast-light-subtle',
                  'dark:bg-raycast-dark-surface dark:border-white/10 dark:text-raycast-dark-text dark:placeholder:text-raycast-dark-subtle',
                  'focus:border-raycast-amber focus:ring-1 focus:ring-raycast-amber/30'
                )}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-raycast-light-border dark:border-white/10">
            <div className="text-[11px] text-raycast-light-subtle dark:text-raycast-dark-subtle flex items-center gap-1.5 font-mono whitespace-nowrap shrink-0">
              <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[10px]">Esc</kbd>
              <span>{t.common.cancel}</span>
              <span className="mx-1 text-black/20 dark:text-white/20">·</span>
              <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[10px]">Ctrl+Enter</kbd>
              <span>{t.common.confirm}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-raycast-light-muted dark:text-raycast-dark-muted hover:text-raycast-light-text dark:hover:text-raycast-dark-text transition-colors"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!value.trim()}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                  value.trim()
                    ? 'bg-raycast-amber text-raycast-dark-bg hover:brightness-110 active:scale-95 shadow-sm'
                    : 'bg-black/10 dark:bg-white/10 text-raycast-light-subtle dark:text-raycast-dark-subtle cursor-not-allowed'
                )}
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t.editNoteModal.submitBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
