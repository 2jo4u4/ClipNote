import React, { useState, useEffect } from 'react';
import { X, Lock, Trash2, CheckSquare, Square, Globe, Edit2, Check } from 'lucide-react';
import { cn } from '../utils';
import { Page } from '../types';
import { Language, getTranslations } from '../i18n';
import { ConfirmModal } from './ConfirmModal';

export interface ManagePagesModalProps {
  isOpen: boolean;
  pages: Page[];
  activePageId?: string;
  language?: Language;
  onClose: () => void;
  onDeletePages: (pageIds: string[]) => void;
  onRenamePage?: (pageId: string, newTitle: string) => void;
  onEditPage?: (page: Page) => void;
}

export const ManagePagesModal: React.FC<ManagePagesModalProps> = ({
  isOpen,
  pages,
  activePageId,
  language = 'zh-TW',
  onClose,
  onDeletePages,
  onRenamePage,
  onEditPage,
}) => {
  const t = getTranslations(language);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingTitleInput, setEditingTitleInput] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || showConfirm || editingPageId !== null) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showConfirm, editingPageId, onClose]);

  if (!isOpen) return null;

  const isSolePage = pages.length <= 1;
  const anchorPageId = activePageId || pages[0]?.id;
  const selectablePages = pages.length > 1 ? pages.filter((p) => p.id !== anchorPageId) : [];
  const allSelectableChosen =
    selectablePages.length > 0 && selectedIds.length === selectablePages.length;

  const toggleSelectAll = () => {
    if (allSelectableChosen) {
      setSelectedIds([]);
    } else {
      setSelectedIds(selectablePages.map((p) => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (isSolePage || id === anchorPageId) return;
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      // Never allow selecting 100% of all pages to prevent 0-page state
      if (prev.length + 1 >= pages.length) {
        return prev;
      }
      return [...prev, id];
    });
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
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div
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
            const isAnchorPage = page.id === anchorPageId;
            const isRowProtected = isSolePage || isAnchorPage;
            const isSelected = selectedIds.includes(page.id);
            const totalNotes = page.sections.reduce((acc, s) => acc + s.items.length, 0);

            return (
              <div
                key={page.id}
                onClick={() => {
                  if (!isRowProtected) toggleSelect(page.id);
                }}
                className={cn(
                  'flex items-center justify-between p-3 rounded-xl border transition-all duration-150 select-none',
                  isRowProtected
                    ? 'border-raycast-light-border/60 bg-black/[0.02] dark:border-white/5 dark:bg-white/[0.02] opacity-80 cursor-default'
                    : isSelected
                    ? 'border-raycast-coral bg-raycast-coral/5 ring-1 ring-raycast-coral/30 cursor-pointer'
                    : 'border-raycast-light-border bg-raycast-light-surface/60 hover:border-raycast-amber/40 dark:border-white/8 dark:bg-raycast-dark-surface/40 dark:hover:border-white/20 cursor-pointer'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Checkbox or Lock */}
                  <div className="flex-shrink-0">
                    {isRowProtected ? (
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
                          {(onEditPage || onRenamePage) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onEditPage) {
                                  onEditPage(page);
                                } else if (onRenamePage) {
                                  handleStartRename(e, page);
                                }
                              }}
                              title={t.managePagesModal.editPageTooltip}
                              className="p-0.5 rounded opacity-0 group-hover/rename:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 text-raycast-light-muted dark:text-raycast-dark-muted transition-opacity"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                          {isRowProtected && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-black/5 dark:bg-white/10 text-raycast-light-subtle dark:text-raycast-dark-subtle font-mono">
                              {isSolePage ? t.managePagesModal.lastPageBadge : t.managePagesModal.anchorBadge}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-raycast-light-subtle dark:text-raycast-dark-subtle font-mono">
                      <span>{t.managePagesModal.noteCountBadge(totalNotes)}</span>
                      {page.domains && page.domains.length > 0 && (
                        <span className="flex items-center gap-1 truncate max-w-[160px]">
                          <Globe className="w-2.5 h-2.5 flex-shrink-0" />
                          <span className="truncate">{t.managePagesModal.domainBadge(page.domains.join(', '))}</span>
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
          {!isSolePage ? (
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 text-xs text-raycast-light-muted dark:text-raycast-dark-muted hover:text-raycast-light-text dark:hover:text-raycast-dark-text transition-colors whitespace-nowrap shrink-0"
            >
              {allSelectableChosen ? (
                <CheckSquare className="w-3.5 h-3.5 text-raycast-coral" />
              ) : (
                <Square className="w-3.5 h-3.5" />
              )}
              <span>{t.managePagesModal.selectAll}</span>
            </button>
          ) : (
            <span
              title={t.managePagesModal.cannotDeleteLastPage}
              className="text-[11px] text-raycast-light-subtle dark:text-raycast-dark-subtle truncate min-w-0 flex-1 mr-2"
            >
              {t.managePagesModal.cannotDeleteLastPage}
            </span>
          )}

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-raycast-light-border dark:border-white/10 text-raycast-light-muted dark:text-raycast-dark-muted hover:text-raycast-light-text dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5 transition-all whitespace-nowrap shrink-0 active:scale-95"
            >
              {t.common.cancel}
            </button>
            {!isSolePage && (
              <button
                type="button"
                disabled={selectedIds.length === 0 || selectedIds.length >= pages.length}
                onClick={() => setShowConfirm(true)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap shrink-0 active:scale-95',
                  selectedIds.length > 0 && selectedIds.length < pages.length
                    ? 'bg-raycast-coral hover:brightness-110 text-white shadow-sm'
                    : 'bg-black/5 dark:bg-white/5 text-raycast-light-subtle dark:text-raycast-dark-subtle cursor-not-allowed'
                )}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.managePagesModal.deleteSelected(selectedIds.length)}</span>
              </button>
            )}
          </div>
        </div>

        {/* Delete confirmation dialog */}
        <ConfirmModal
          isOpen={showConfirm}
          language={language}
          title={`${t.common.confirm} ${t.common.delete}`}
          description={t.managePagesModal.confirmDelete(selectedIds.length)}
          confirmText={t.common.delete}
          cancelText={t.common.cancel}
          isDestructive={true}
          onConfirm={handleConfirmDelete}
          onClose={() => setShowConfirm(false)}
        />
      </div>
    </div>
  );
};
