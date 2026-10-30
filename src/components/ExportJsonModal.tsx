import React, { useState, useEffect } from 'react';
import { X, Download, CheckSquare, Square, Globe } from 'lucide-react';
import { cn } from '../utils';
import { Page } from '../types';
import { Language, getTranslations } from '../i18n';

export interface ExportJsonModalProps {
  isOpen: boolean;
  pages: Page[];
  activePageId?: string;
  language?: Language;
  onClose: () => void;
  onConfirmExport: (selectedPages: Page[]) => void;
}

export const ExportJsonModal: React.FC<ExportJsonModalProps> = ({
  isOpen,
  pages,
  activePageId,
  language = 'zh-TW',
  onClose,
  onConfirmExport,
}) => {
  const t = getTranslations(language);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      const defaultId = activePageId || pages[0]?.id;
      setSelectedIds(defaultId ? [defaultId] : []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleConfirm = () => {
    if (selectedIds.length === 0) return;
    const selectedPages = pages.filter((p) => selectedIds.includes(p.id));
    if (selectedPages.length === 0) return;
    onConfirmExport(selectedPages);
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!isOpen) return null;

  const allChosen = pages.length > 0 && selectedIds.length === pages.length;

  const toggleSelectAll = () => {
    if (allChosen) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pages.map((p) => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-json-modal-title"
        aria-describedby="export-json-modal-desc"
        className={cn(
          'relative w-full max-w-md max-h-[85vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden select-none',
          'bg-raycast-light-bg border-raycast-light-border text-raycast-light-text',
          'dark:bg-raycast-dark-bg dark:border-white/10 dark:text-raycast-dark-text',
          'animate-in zoom-in-95 duration-150'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-raycast-light-border dark:border-white/10 flex-shrink-0">
          <div>
            <h2 id="export-json-modal-title" className="text-sm font-semibold tracking-tight">
              {t.exportJsonModal.title}
            </h2>
            <p
              id="export-json-modal-desc"
              className="text-[11px] text-raycast-light-subtle dark:text-raycast-dark-subtle mt-0.5"
            >
              {t.exportJsonModal.subtitle}
            </p>
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

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
          {pages.map((page) => {
            const isActivePage = page.id === activePageId;
            const isSelected = selectedIds.includes(page.id);
            const totalNotes = page.sections.reduce((acc, s) => acc + s.items.length, 0);

            return (
              <div
                key={page.id}
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => toggleSelect(page.id)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    toggleSelect(page.id);
                  }
                }}
                className={cn(
                  'flex items-center justify-between p-3 rounded-xl border transition-all duration-150 select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-raycast-amber',
                  isSelected
                    ? 'border-raycast-amber bg-raycast-amber/5 ring-1 ring-raycast-amber/30'
                    : 'border-raycast-light-border bg-raycast-light-surface/60 hover:border-raycast-amber/40 dark:border-white/10 dark:bg-raycast-dark-surface/40 dark:hover:border-white/20'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-raycast-amber" />
                    ) : (
                      <Square className="w-4 h-4 text-raycast-light-subtle dark:text-raycast-dark-subtle" />
                    )}
                  </div>

                  <span className="text-base select-none flex-shrink-0">{page.icon || '📄'}</span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-raycast-light-text dark:text-raycast-dark-text truncate">
                        {page.title}
                      </span>
                      {isActivePage && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-raycast-amber/15 text-raycast-amber font-mono">
                          {t.exportJsonModal.activePageBadge}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-raycast-light-subtle dark:text-raycast-dark-subtle font-mono">
                      <span>{t.exportJsonModal.noteCountBadge(totalNotes)}</span>
                      {page.domains && page.domains.length > 0 && (
                        <span className="flex items-center gap-1 truncate max-w-[160px]">
                          <Globe className="w-2.5 h-2.5 flex-shrink-0" />
                          <span className="truncate">
                            {t.exportJsonModal.domainBadge(page.domains.join(', '))}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer toolbar */}
        <div className="p-3 border-t border-raycast-light-border dark:border-white/10 bg-raycast-light-surface/40 dark:bg-raycast-dark-surface/40 flex items-center justify-between gap-2 flex-shrink-0 select-none">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="flex items-center gap-1.5 text-xs text-raycast-light-muted dark:text-raycast-dark-muted hover:text-raycast-light-text dark:hover:text-raycast-dark-text transition-colors whitespace-nowrap shrink-0"
          >
            {allChosen ? (
              <CheckSquare className="w-3.5 h-3.5 text-raycast-amber" />
            ) : (
              <Square className="w-3.5 h-3.5" />
            )}
            <span>
              {allChosen ? t.exportJsonModal.deselectAll : t.exportJsonModal.selectAll}
            </span>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-raycast-light-border dark:border-white/10 text-raycast-light-muted dark:text-raycast-dark-muted hover:text-raycast-light-text dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5 transition-all whitespace-nowrap shrink-0 active:scale-95"
            >
              {t.common.cancel}
            </button>
            <button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={handleConfirm}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap shrink-0 active:scale-95',
                selectedIds.length > 0
                  ? 'bg-raycast-amber hover:brightness-105 text-neutral-900 shadow-sm'
                  : 'bg-black/5 dark:bg-white/5 text-raycast-light-subtle dark:text-raycast-dark-subtle cursor-not-allowed'
              )}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.exportJsonModal.submitExport(selectedIds.length)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
