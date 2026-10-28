import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '../utils';
import { Language, getTranslations } from '../i18n';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  language?: Language;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmText,
  cancelText,
  isDestructive = true,
  language = 'zh-TW',
  onConfirm,
  onClose,
}) => {
  const t = getTranslations(language);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        cancelBtnRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className={cn(
          'w-full max-w-sm rounded-2xl border p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150',
          'bg-raycast-light-surface border-raycast-light-border text-raycast-light-text',
          'dark:bg-raycast-dark-surface dark:border-white/10 dark:text-raycast-dark-text'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5',
              isDestructive
                ? 'bg-rose-500/10 border border-rose-500/20 text-rose-500'
                : 'bg-raycast-amber/10 border border-raycast-amber/20 text-raycast-amber'
            )}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-raycast-light-text dark:text-raycast-dark-text leading-snug">
              {title}
            </h3>
            <p className="text-xs text-raycast-light-muted dark:text-raycast-dark-muted mt-1 leading-relaxed">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-raycast-light-subtle dark:text-raycast-dark-subtle hover:text-raycast-light-text dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors -mr-1 -mt-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl text-xs font-medium border border-black/10 dark:border-white/10 text-raycast-light-text dark:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5 transition-all whitespace-nowrap active:scale-95"
          >
            {cancelText || t.common.cancel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn(
              'px-4 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all whitespace-nowrap active:scale-95',
              isDestructive
                ? 'bg-rose-500 hover:bg-rose-600 text-white'
                : 'bg-raycast-amber hover:brightness-110 text-raycast-dark-bg'
            )}
          >
            {confirmText || (isDestructive ? t.common.delete : t.common.confirm)}
          </button>
        </div>
      </div>
    </div>
  );
};
