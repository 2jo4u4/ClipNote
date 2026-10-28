import React, { useState } from 'react';
import { X, Lock, Trash2, CheckSquare, Square, Globe, Edit2, Check } from 'lucide-react';
import { cn } from '../utils';
import { Page, SYSTEM_GLOBAL_PAGE_ID } from '../types';
import { Language, getTranslations } from '../i18n';

export interface ManagePagesModalProps {
  isOpen: boolean;
  pages: Page[];
  language?: Language;
  onClose: () => void;
  onDeletePages: (pageIds: string[]) => void;
  onRenamePage?: (pageId: string, newTitle: string) => void;
}

export const ManagePagesModal: React.FC<ManagePagesModalProps> = ({
  isOpen,
  pages,
  language = 'zh-TW',
  onClose,
  onDeletePages,
  onRenamePage,
}) => {
  const t = getTranslations(language);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingTitleInput, setEditingTitleInput] = useState('');

  if (!isOpen) return null;

  const customPages = pages.filter((p) => !p.isSystem && p.id !== SYSTEM_GLOBAL_PAGE_ID);
  const allCustomSelected = customPages.length > 0 && selectedIds.length === customPages.length;

  const toggleSelectAll = () => {
    if (allCustomSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(customPages.map((p) => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleStartRename = (e: React.MouseEvent, page: Page) => {
    e.stopPropagation();
    setEditingPageId(page.id);
    setEditingTitleInput(page.title);
  };

  const handleSaveRename = (e: React.MouseEvent | React.KeyboardEvent, pageId: string) => {
    e.stopPropagation();
    const trimmed = editingTitleInput.trim();
    if (trimmed && onRenamePage) {
      onRenamePage(pageId, trimmed);
    }
    setEditingPageId(null);
  };

  const handleConfirmDelete = () => {
    if (selectedIds.length === 0) return;
    onDeletePages(selectedIds);
    setSelectedIds([]);
    setShowConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={cn(
          'w-full max-w-md max-h-[85vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden select-none',
          'bg-raycast-light-bg border-raycast-light-border text-raycast-light-text',
          'dark:bg-raycast-dark-bg dark:border-white/10 dark:text-raycast-dark-text',
          'animate-in zoom-in-95 duration-150'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-raycast-light-border dark:border-white/10 flex-shrink-0">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">{t.managePagesModal.title}</h2>
            <p className="text-[11px] text-raycast-light-subtle dark:text-raycast-dark-subtle mt-0.5">
              {t.managePagesModal.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-raycast-light-subtle hover:text-raycast-light-text dark:text-raycast-dark-subtle dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
          {pages.map((page) => {
            const isSystem = Boolean(page.isSystem || page.id === SYSTEM_GLOBAL_PAGE_ID);
            const isSelected = selectedIds.includes(page.id);
            const totalNotes = page.sections.reduce((acc, s) => acc + s.items.length, 0);

            return (
              <div
                key={page.id}
                onClick={() => {
                  if (!isSystem) toggleSelect(page.id);
                }}
                className={cn(
                  'flex items-center justify-between p-3 rounded-xl border transition-all duration-150 select-none',
                  isSystem
                    ? 'border-raycast-light-border/60 bg-black/[0.02] dark:border-white/5 dark:bg-white/[0.02] opacity-80 cursor-default'
                    : isSelected
                    ? 'border-raycast-coral bg-raycast-coral/5 ring-1 ring-raycast-coral/30 cursor-pointer'
                    : 'border-raycast-light-border bg-raycast-light-surface/60 hover:border-raycast-amber/40 dark:border-white/8 dark:bg-raycast-dark-surface/40 dark:hover:border-white/20 cursor-pointer'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Checkbox or Lock */}
                  <div className="flex-shrink-0">
                    {isSystem ? (
                      <div className="w-4 h-4 rounded text-raycast-light-subtle dark:text-raycast-dark-subtle flex items-center justify-center">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                    ) : isSelected ? (
                      <CheckSquare className="w-4 h-4 text-raycast-coral" />
                    ) : (
                      <Square className="w-4 h-4 text-raycast-light-subtle dark:text-raycast-dark-subtle" />
                    )}
                  </div>

                  <span className="text-base select-none flex-shrink-0">{page.icon || '📄'}</span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {editingPageId === page.id ? (
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editingTitleInput}
                            autoFocus
                            onChange={(e) => setEditingTitleInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(e, page.id);
                              if (e.key === 'Escape') setEditingPageId(null);
                            }}
                            className="text-xs font-semibold px-2 py-0.5 rounded border border-raycast-amber bg-raycast-light-surface dark:bg-raycast-dark-surface outline-none text-raycast-light-text dark:text-raycast-dark-text"
                          />
                          <button
                            type="button"
                            onClick={(e) => handleSaveRename(e, page.id)}
                            className="p-1 rounded text-raycast-emerald hover:bg-black/5 dark:hover:bg-white/10"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPageId(null);
                            }}
                            className="p-1 rounded text-raycast-light-muted dark:text-raycast-dark-muted hover:bg-black/5 dark:hover:bg-white/10"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 group/rename">
                          <span className="text-xs font-semibold text-raycast-light-text dark:text-raycast-dark-text truncate">
                            {page.title}
                          </span>
                          {onRenamePage && (
                            <button
                              type="button"
                              onClick={(e) => handleStartRename(e, page)}
                              title="重新命名此頁"
                              className="p-0.5 rounded opacity-0 group-hover/rename:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 text-raycast-light-muted dark:text-raycast-dark-muted transition-opacity"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                          {isSystem && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-black/5 dark:bg-white/10 text-raycast-light-subtle dark:text-raycast-dark-subtle font-mono">
                              {t.managePagesModal.lockedBadge}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-raycast-light-subtle dark:text-raycast-dark-subtle font-mono">
                      <span>{t.managePagesModal.noteCountBadge(totalNotes)}</span>
                      {page.domains && page.domains.length > 0 && !isSystem && (
                        <span className="flex items-center gap-1 truncate max-w-[160px]">
                          <Globe className="w-2.5 h-2.5 flex-shrink-0" />
                          <span className="truncate">{page.domains.join(', ')}</span>
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
        <div className="p-3 border-t border-raycast-light-border dark:border-white/10 bg-raycast-light-surface/40 dark:bg-raycast-dark-surface/40 flex items-center justify-between gap-2 flex-shrink-0">
          {customPages.length > 0 ? (
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 text-xs text-raycast-light-muted dark:text-raycast-dark-muted hover:text-raycast-light-text dark:hover:text-raycast-dark-text transition-colors"
            >
              {allCustomSelected ? (
                <CheckSquare className="w-3.5 h-3.5 text-raycast-coral" />
              ) : (
                <Square className="w-3.5 h-3.5" />
              )}
              <span>{t.managePagesModal.selectAll}</span>
            </button>
          ) : (
            <span className="text-xs text-raycast-light-subtle dark:text-raycast-dark-subtle">
              {t.managePagesModal.emptyCustomPages}
            </span>
          )}

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
              disabled={selectedIds.length === 0}
              onClick={() => setShowConfirm(true)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                selectedIds.length > 0
                  ? 'bg-raycast-coral text-white hover:brightness-110 active:scale-95 shadow-sm'
                  : 'bg-black/10 dark:bg-white/10 text-raycast-light-subtle dark:text-raycast-dark-subtle cursor-not-allowed'
              )}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.managePagesModal.deleteSelected(selectedIds.length)}</span>
            </button>
          </div>
        </div>

        {/* Delete confirmation sub-modal */}
        {showConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-100">
            <div className="w-full max-w-xs p-4 rounded-xl border bg-raycast-light-bg dark:bg-raycast-dark-bg border-raycast-light-border dark:border-white/15 text-raycast-light-text dark:text-raycast-dark-text shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-raycast-coral flex items-center gap-1.5">
                <Trash2 className="w-4 h-4" />
                <span>{t.common.confirm} {t.common.delete}</span>
              </h3>
              <p className="text-xs leading-relaxed text-raycast-light-subtle dark:text-raycast-dark-subtle">
                {t.managePagesModal.confirmDelete(selectedIds.length)}
              </p>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-raycast-light-border dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-raycast-light-muted dark:text-raycast-dark-muted hover:text-raycast-light-text dark:hover:text-raycast-dark-text"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-raycast-coral text-white hover:brightness-110 active:scale-95 shadow-sm"
                >
                  {t.common.confirm}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
