import React, { useState, useEffect, useRef } from 'react';
import { X, CornerDownLeft, Globe } from 'lucide-react';
import { cn } from '../utils';

export interface NewPageData {
  title: string;
  icon?: string;
  domains: string[];
}

export interface NewPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewPageData) => void;
  className?: string;
}

const PRESET_EMOJIS = ['💼', '📝', '💬', '🌐', '🚀', '💡', '🎯', '📌', '💻', '🔖', '📄', '✨'];

export const NewPageModal: React.FC<NewPageModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  className,
}) => {
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('📝');
  const [domainsInput, setDomainsInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setIcon('📝');
      setDomainsInput('');
      setTimeout(() => {
        inputRef.current?.focus();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
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
            <span className="text-lg">{icon || '📄'}</span>
            <div>
              <h3 className="text-sm font-semibold text-raycast-light-text dark:text-raycast-dark-text">
                新增筆記頁
              </h3>
              <p className="text-[11px] text-raycast-light-subtle dark:text-raycast-dark-subtle">
                建立專屬的分頁以分類管理結構化欄位或隨筆
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-raycast-light-muted dark:text-raycast-dark-muted hover:text-raycast-light-text dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* Page Title */}
          <div>
            <label className="block text-xs font-medium text-raycast-light-muted dark:text-raycast-dark-muted mb-1.5">
              筆記頁名稱 <span className="text-raycast-coral">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：104 中文經歷、CakeResume、社群文案..."
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
            <label className="block text-xs font-medium text-raycast-light-muted dark:text-raycast-dark-muted mb-1.5 flex items-center justify-between">
              <span>頁籤圖示 (Emoji)</span>
              <span className="text-[11px] font-normal text-raycast-light-subtle dark:text-raycast-dark-subtle">
                可點擊下方常用圖示或自行輸入
              </span>
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={icon}
                maxLength={4}
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
              <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar flex-1">
                {PRESET_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className={cn(
                      'w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg text-sm transition-all duration-150',
                      icon === emoji
                        ? 'bg-raycast-amber/20 border border-raycast-amber text-raycast-amber scale-105'
                        : 'bg-raycast-light-surface dark:bg-raycast-dark-surface border border-transparent hover:border-raycast-light-border dark:hover:border-raycast-dark-border opacity-80 hover:opacity-100'
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bound Domains */}
          <div>
            <label className="block text-xs font-medium text-raycast-light-muted dark:text-raycast-dark-muted mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-raycast-light-subtle dark:text-raycast-dark-subtle" />
              <span>綁定網域 (可選)</span>
            </label>
            <input
              type="text"
              value={domainsInput}
              onChange={(e) => setDomainsInput(e.target.value)}
              placeholder="例如：104.com.tw, cakeresume.com"
              className={cn(
                'w-full px-3 py-2 rounded-lg text-sm outline-none transition-all duration-200 font-mono text-xs',
                'bg-raycast-light-surface border border-raycast-light-border text-raycast-light-text placeholder:text-raycast-light-subtle',
                'dark:bg-raycast-dark-surface dark:border-raycast-dark-border dark:text-raycast-dark-text dark:placeholder:text-raycast-dark-subtle',
                'focus:border-raycast-amber focus:ring-1 focus:ring-raycast-amber/50'
              )}
            />
            <p className="mt-1 text-[11px] text-raycast-light-subtle dark:text-raycast-dark-subtle">
              開啟符合的網頁時，擴充功能將自動切換並優先展示此筆記頁。多個網域請用逗號隔開。
            </p>
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-between pt-3 mt-1 border-t border-raycast-light-border dark:border-raycast-dark-border">
            <div className="text-[11px] text-raycast-light-subtle dark:text-raycast-dark-subtle flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-[10px]">
                Esc
              </kbd>
              <span>取消</span>
              <span className="mx-1">·</span>
              <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-[10px]">
                Enter
              </kbd>
              <span>建立</span>
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
                取消
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
                <span>建立筆記頁</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
