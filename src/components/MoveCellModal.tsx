import React, { useState, useEffect } from 'react';
import { FolderUp, X, Check } from 'lucide-react';
import { cn } from '../utils';
import { Page, Cell } from '../core/types';
import { Dropdown } from './Dropdown';
import { Language, getTranslations } from '../i18n';

export interface MoveCellModalProps {
  isOpen: boolean;
  cell: Cell | null;
  sourcePageId: string;
  sourceSectionId: string;
  pages: Page[];
  language?: Language;
  onClose: () => void;
  onConfirm: (targetPageId: string, targetSectionId: string) => void;
  className?: string;
}

export const MoveCellModal: React.FC<MoveCellModalProps> = ({
  isOpen,
  cell,
  sourcePageId,
  sourceSectionId,
  pages,
  language = 'zh-TW',
  onClose,
  onConfirm,
  className,
}) => {
  const t = getTranslations(language);
  const [targetPageId, setTargetPageId] = useState(sourcePageId);
  const [targetSectionId, setTargetSectionId] = useState(sourceSectionId);

  // Initialize target selections when modal opens with a new cell
  useEffect(() => {
    if (isOpen) {
      setTargetPageId(sourcePageId);
      const curPage = pages.find((p) => p.id === sourcePageId);
      const fallbackSection = curPage?.sections.find((s) => s.id !== sourceSectionId);
      setTargetSectionId(fallbackSection?.id || sourceSectionId);
    }
  }, [isOpen, sourcePageId, sourceSectionId, pages]);

  if (!isOpen || !cell) return null;

  const selectedPage = pages.find((p) => p.id === targetPageId) || pages[0];
  const availableSections = selectedPage?.sections || [];

  const handlePageChange = (newPageId: string) => {
    setTargetPageId(newPageId);
    const targetPage = pages.find((page) => page.id === newPageId);
    if (targetPage && targetPage.sections.length > 0) {
      setTargetSectionId(targetPage.sections[0].id);
    } else {
      setTargetSectionId(''); // Clear stale section ID from previous page
    }
  };

  const isTargetSectionValid = availableSections.some((s) => s.id === targetSectionId);
  const isCurrentLocation =
    targetPageId === sourcePageId && targetSectionId === sourceSectionId;
  const canConfirm = Boolean(targetSectionId) && isTargetSectionValid && !isCurrentLocation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div
        className={cn(
          'relative w-full max-w-sm rounded-2xl shadow-2xl border overflow-hidden flex flex-col',
          'bg-raycast-light-bg border-raycast-light-border text-raycast-light-text',
          'dark:bg-raycast-dark-bg dark:border-raycast-dark-border dark:text-raycast-dark-text',
          'animate-in zoom-in-95 duration-200 ease-raycast',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-raycast-light-border dark:border-raycast-dark-border">
          <div className="flex items-center gap-2">
            <FolderUp className="w-4 h-4 text-raycast-amber" />
            <h3 className="font-semibold text-sm">{t.moveModal.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-raycast-light-subtle dark:text-raycast-dark-subtle hover:text-raycast-light-text dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 text-xs">
          {/* Cell Preview */}
          <div className="p-2.5 rounded-xl border border-raycast-light-border bg-black/[0.02] dark:bg-white/[0.03] space-y-1">
            <span className="text-[10px] font-mono text-raycast-light-subtle dark:text-raycast-dark-subtle">
              {t.moveModal.currentNote}
            </span>
            <div className="font-medium text-raycast-light-text dark:text-raycast-dark-text truncate">
              {cell.key ? `${cell.key}: ${cell.value}` : cell.value}
            </div>
          </div>

          {/* Target Page Selector */}
          <div className="space-y-1.5">
            <label className="text-raycast-light-muted dark:text-raycast-dark-muted font-medium">
              {t.moveModal.targetPage}
            </label>
            <Dropdown
              options={pages.map((p) => ({
                id: p.id,
                label: p.title,
                icon: p.icon || (p.isSystem ? '🌐' : '📄'),
              }))}
              value={targetPageId}
              onChange={handlePageChange}
            />
          </div>

          {/* Target Section Selector */}
          <div className="space-y-1.5">
            <label className="text-raycast-light-muted dark:text-raycast-dark-muted font-medium">
              {t.moveModal.targetCategory}
            </label>
            {availableSections.length > 0 ? (
              <Dropdown
                options={availableSections.map((s) => ({
                  id: s.id,
                  label: s.title,
                }))}
                value={targetSectionId}
                onChange={setTargetSectionId}
              />
            ) : (
              <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 text-raycast-light-subtle dark:text-raycast-dark-subtle">
                {t.moveModal.noCategories}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-raycast-light-border dark:border-raycast-dark-border bg-black/[0.02] dark:bg-white/[0.02]">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg font-medium text-xs text-raycast-light-muted dark:text-raycast-dark-muted hover:text-raycast-light-text dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            {t.common.cancel}
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() => onConfirm(targetPageId, targetSectionId)}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium text-xs transition-all duration-150',
              !canConfirm
                ? 'opacity-40 cursor-not-allowed bg-raycast-amber/20 text-raycast-amber'
                : 'bg-raycast-amber text-black hover:bg-raycast-amber/90 active:scale-95 shadow-sm'
            )}
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{t.moveModal.confirmMove}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
