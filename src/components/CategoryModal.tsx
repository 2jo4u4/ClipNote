import React, { useState, useEffect, useRef } from 'react';
import { X, Layers, Check } from 'lucide-react';
import { cn } from '../utils';
import { Language, getTranslations } from '../i18n';

export interface CategoryModalProps {
  isOpen: boolean;
  mode: 'create' | 'rename';
  initialTitle?: string;
  language?: Language;
  onClose: () => void;
  onSubmit: (title: string) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  mode,
  initialTitle = '',
  language = 'zh-TW',
  onClose,
  onSubmit,
}) => {
  const t = getTranslations(language);
  const [title, setTitle] = useState(initialTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, initialTitle]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const clean = title.trim();
    if (!clean) return;
    onSubmit(clean);
    onClose();
  };

  const isCreate = mode === 'create';
  const modalTitle = isCreate
    ? t.categoryModal.createTitle
    : t.categoryModal.renameTitle;
  const submitText = isCreate
    ? t.categoryModal.submitCreate
    : t.categoryModal.submitRename;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={cn(
          'w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden select-none',
          'bg-raycast-light-bg border-raycast-light-border text-raycast-light-text',
          'dark:bg-raycast-dark-bg dark:border-white/10 dark:text-raycast-dark-text',
          'animate-in zoom-in-95 duration-150'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-raycast-light-border dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-raycast-amber/15 text-raycast-amber flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-semibold tracking-tight">{modalTitle}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-raycast-light-subtle hover:text-raycast-light-text dark:text-raycast-dark-subtle dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-raycast-light-subtle dark:text-raycast-dark-subtle mb-1.5">
              {t.categoryModal.nameLabel} <span className="text-raycast-coral">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.categoryModal.namePlaceholder}
              className={cn(
                'w-full px-3 py-2 rounded-xl text-xs outline-none transition-all duration-150',
                'bg-raycast-light-surface border border-raycast-light-border text-raycast-light-text placeholder:text-raycast-light-subtle',
                'dark:bg-raycast-dark-surface dark:border-white/10 dark:text-raycast-dark-text dark:placeholder:text-raycast-dark-subtle',
                'focus:border-raycast-amber focus:ring-1 focus:ring-raycast-amber/30'
              )}
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-raycast-light-border dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-raycast-light-muted dark:text-raycast-dark-muted hover:text-raycast-light-text dark:hover:text-raycast-dark-text transition-colors"
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
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{submitText}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
