import { useState, useMemo, useEffect, useRef, Fragment } from 'react';
import {
  Globe,
  Plus,
  Moon,
  Sun,
  FileText,
  Download,
  Upload,
  Check,
  Edit2,
  Trash2,
  CheckSquare,
  ChevronsDownUp,
  ChevronsUpDown,
} from 'lucide-react';
import { cn } from '../utils';
import { PageTabs, PageItem } from './PageTabs';
import { OmniSearchBar } from './OmniSearchBar';
import { SectionContainer } from './SectionContainer';
import { CellCard } from './CellCard';
import { DropSlot } from './DropSlot';
import { QuickCaptureModal } from './QuickCaptureModal';
import { NewPageModal, PageModalData } from './NewPageModal';
import { MoveCellModal } from './MoveCellModal';
import { CategoryModal } from './CategoryModal';
import { EditNoteModal } from './EditNoteModal';
import { ManagePagesModal } from './ManagePagesModal';
import { ExportJsonModal } from './ExportJsonModal';
import { ConfirmModal } from './ConfirmModal';
import type { Page, Section, Cell, CellTarget, SearchResult, CreateCellInput } from '../types';
import { SYSTEM_GLOBAL_PAGE_ID, TUTORIAL_EN_PAGE_ID } from '../types';
import { Language, getTranslations } from '../i18n';
import {
  extractHostname,
  findBestMatchingPage,
  createDefaultSeedData,
  reorderArray,
  moveCellInPage,
  serializePagesForExport,
  parseImportedPagesFromJson,
  formatExportTimestamp,
} from '../core/notebook-service';
import {
  applyTheme,
  getStoredTheme,
  setStoredTheme,
  setStoredLanguage,
  getDefaultBrowserLanguage,
  LANGUAGE_STORAGE_KEY,
} from '../core/theme';

export interface MovingCellTarget {
  cell: Cell;
  sourcePageId: string;
  sourceSectionId: string;
}

export interface SidePanelProps {
  currentDomain?: string;
  currentUrl?: string;
  currentTitle?: string;
  pages?: Page[];
  initialPages?: Page[];
  initialActivePageId?: string;
  onPagesChange?: (pages: Page[]) => void;
  onActivePageChange?: (pageId: string) => void;
  language?: Language;
  initialLanguage?: Language;
  onLanguageChange?: (language: Language) => void;
  defaultDarkMode?: boolean;
  className?: string;
}

// Built-in seed onboarding dataset using unified Cell and Section
const defaultDemoPages: Page[] = Object.values(createDefaultSeedData().pages);

const getInitialLanguage = (controlled?: Language, initial?: Language): Language => {
  if (controlled) return controlled;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
      if (saved === 'zh-TW' || saved === 'en') return saved;
    }
  } catch {
    // Ignore storage errors
  }
  if (initial) return initial;
  return getDefaultBrowserLanguage();
};

export const SidePanel: React.FC<SidePanelProps> = ({
  currentDomain = 'example.com',
  currentUrl = 'https://www.example.com',
  currentTitle,
  pages: controlledPages,
  initialPages = defaultDemoPages,
  initialActivePageId,
  onPagesChange,
  onActivePageChange,
  language: controlledLanguage,
  initialLanguage,
  onLanguageChange,
  defaultDarkMode,
  className,
}) => {
  const [internalLanguage, setInternalLanguage] = useState<Language>(() =>
    getInitialLanguage(controlledLanguage, initialLanguage)
  );
  const language = controlledLanguage || internalLanguage;
  const t = getTranslations(language);

  useEffect(() => {
    setStoredLanguage(language);
  }, [language]);

  const handleToggleLanguage = () => {
    const nextLang: Language = language === 'zh-TW' ? 'en' : 'zh-TW';
    setInternalLanguage(nextLang);
    onLanguageChange?.(nextLang);
    setStoredLanguage(nextLang);
  };

  const [pagesState, setPagesState] = useState<Page[]>(controlledPages || initialPages);
  const pages = controlledPages || pagesState;

  useEffect(() => {
    if (controlledPages) {
      setPagesState(controlledPages);
    }
  }, [controlledPages]);

  const setPages = (updater: Page[] | ((prev: Page[]) => Page[])) => {
    setPagesState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (onPagesChange) {
        onPagesChange(next);
      }
      return next;
    });
  };

  const sessionPagesRef = useRef<Record<string, string>>({});

  const [activePageId, setActivePageId] = useState<string>(() => {
    if (initialActivePageId) return initialActivePageId;
    const basePages = controlledPages || initialPages;
    const matched = findBestMatchingPage(basePages, currentDomain);
    if (matched) return matched.id;

    // Language-aware fallback for tutorial onboarding pages
    if (language === 'zh-TW') {
      const zhPage = basePages.find((p) => p.id === SYSTEM_GLOBAL_PAGE_ID);
      if (zhPage) return zhPage.id;
    } else {
      const enPage = basePages.find((p) => p.id === TUTORIAL_EN_PAGE_ID);
      if (enPage) return enPage.id;
    }

    return basePages[0]?.id || SYSTEM_GLOBAL_PAGE_ID;
  });

  const handleSelectPage = (pageId: string) => {
    setActivePageId(pageId);
    const normHost = extractHostname(currentDomain);
    if (normHost) {
      sessionPagesRef.current[normHost] = pageId;
    }
    if (onActivePageChange) {
      onActivePageChange(pageId);
    }
  };

  // Automatically focus matching page when user switches tab domain in browser
  useEffect(() => {
    if (!currentDomain) return;
    const normHost = extractHostname(currentDomain);
    const sessionPageId = normHost ? sessionPagesRef.current[normHost] : undefined;
    const matched = findBestMatchingPage(pages, currentDomain, sessionPageId);
    if (matched) {
      setActivePageId(matched.id);
    }
  }, [currentDomain]);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (defaultDarkMode !== undefined) return defaultDarkMode;
    return getStoredTheme() === 'dark';
  });

  useEffect(() => {
    applyTheme(isDarkMode ? 'dark' : 'light');
    setStoredTheme(isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [quickCaptureInitialSectionId, setQuickCaptureInitialSectionId] = useState<string | undefined>(undefined);
  const [pageModalState, setPageModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    page?: Page;
  }>({
    isOpen: false,
    mode: 'create',
  });
  const [isManagePagesModalOpen, setIsManagePagesModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const [movingCellTarget, setMovingCellTarget] = useState<MovingCellTarget | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Category Modal state (create or rename)
  const [categoryModalState, setCategoryModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'rename';
    sectionId?: string;
    initialTitle?: string;
  }>({
    isOpen: false,
    mode: 'create',
  });

  // Edit Note Modal state
  const [editNoteModalState, setEditNoteModalState] = useState<{
    isOpen: boolean;
    cell?: Cell;
    sectionId?: string;
  }>({
    isOpen: false,
  });

  // Batch Select Mode
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);
  const [selectedCellTargets, setSelectedCellTargets] = useState<CellTarget[]>([]);
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);
  const [showDeletePageConfirm, setShowDeletePageConfirm] = useState(false);
  const [pendingDeleteSection, setPendingDeleteSection] = useState<Section | null>(null);
  const [pendingDeleteCell, setPendingDeleteCell] = useState<{
    pageId: string;
    sectionId: string;
    cell: Cell;
  } | null>(null);

  // Drag and Drop State
  const [draggedCell, setDraggedCell] = useState<CellTarget | null>(null);
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [cellDropTarget, setCellDropTarget] = useState<{
    sectionId: string;
    index: number;
  } | null>(null);
  const [sectionDropTarget, setSectionDropTarget] = useState<{
    index: number;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 2000);
  };

  const activePage = useMemo(() => {
    return pages.find((p) => p.id === activePageId) || pages[0];
  }, [pages, activePageId]);

  // Collapsed sections tracking
  const [collapsedSectionIds, setCollapsedSectionIds] = useState<Set<string>>(new Set());

  const allSectionsCollapsed = useMemo(() => {
    if (!activePage?.sections || activePage.sections.length === 0) return false;
    return activePage.sections.every((s) => collapsedSectionIds.has(s.id));
  }, [activePage?.sections, collapsedSectionIds]);

  const handleToggleAllSections = () => {
    if (!activePage?.sections || activePage.sections.length === 0) return;
    setCollapsedSectionIds((prev) => {
      const next = new Set(prev);
      activePage.sections.forEach((s) => {
        if (allSectionsCollapsed) {
          next.delete(s.id);
        } else {
          next.add(s.id);
        }
      });
      return next;
    });
  };

  const handleToggleSectionCollapse = (sectionId: string) => {
    setCollapsedSectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  // Flattened search items across all pages
  const allSearchResults: SearchResult[] = useMemo(() => {
    const list: SearchResult[] = [];
    for (const page of pages) {
      for (const sec of page.sections) {
        for (const cell of sec.items) {
          const isField = Boolean(cell.key);
          list.push({
            id: cell.id,
            type: isField ? 'field' : 'jot',
            title: cell.key || (cell.value.length > 24 ? cell.value.slice(0, 24) + '...' : cell.value),
            content: cell.value,
            pageId: page.id,
            pageTitle: page.title,
            sectionId: sec.id,
            sectionTitle: sec.title,
            sourcePath: t.common.sourceFrom(page.title, sec.title, cell.key),
            sourceUrl: cell.sourceUrl,
            sourceTitle: cell.sourceTitle,
          });
        }
      }
    }
    return list;
  }, [pages, t]);

  const pageTabItems: PageItem[] = useMemo(() => {
    return pages.map((p) => ({
      id: p.id,
      title: p.title,
      icon: p.icon,
      isSystem: p.isSystem,
      domains: p.domains,
      isPrimary: p.isPrimary,
    }));
  }, [pages]);

  const handleOpenCreatePage = () => {
    setPageModalState({ isOpen: true, mode: 'create' });
  };

  const handleOpenEditPage = (page: Page) => {
    setPageModalState({ isOpen: true, mode: 'edit', page });
  };

  const handleSavePageModal = (data: PageModalData) => {
    if (pageModalState.mode === 'create') {
      const newId = `page-${Date.now()}`;
      const newPage: Page = {
        id: newId,
        title: data.title,
        icon: data.icon,
        domains: data.domains,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        sections: [
          {
            id: `sec-${Date.now()}-default`,
            title: t.sidePanel.defaultCategoryName,
            order: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            items: [],
          },
        ],
      };
      setPages((prev) => [...prev, newPage]);
      setActivePageId(newId);
      showToast(t.sidePanel.createdPageToast(data.title));
    } else if (pageModalState.page) {
      const targetId = pageModalState.page.id;
      setPages((prev) =>
        prev.map((p) => {
          if (p.id !== targetId) return p;
          return {
            ...p,
            title: data.title,
            icon: data.icon,
            domains: data.domains,
            updatedAt: Date.now(),
          };
        })
      );
      showToast(t.sidePanel.updatedPageToast(data.title));
    }
    setPageModalState({ isOpen: false, mode: 'create' });
  };

  const handleOpenDeletePageModal = () => {
    if (pages.length <= 1) return;
    setShowDeletePageConfirm(true);
  };

  const handleConfirmDeleteActivePage = () => {
    if (pages.length <= 1) return;
    const deletedTitle = activePage.title;
    const remaining = pages.filter((p) => p.id !== activePage.id);
    setPages(remaining);
    setActivePageId(remaining[0]?.id || SYSTEM_GLOBAL_PAGE_ID);
    setShowDeletePageConfirm(false);
    showToast(t.sidePanel.deletedPageToast(deletedTitle));
  };

  const handleOpenAddCategory = () => {
    setCategoryModalState({
      isOpen: true,
      mode: 'create',
      initialTitle: '',
    });
  };

  const handleOpenRenameCategory = (sectionId: string) => {
    const targetSec = activePage.sections.find((s) => s.id === sectionId);
    if (!targetSec) return;
    setCategoryModalState({
      isOpen: true,
      mode: 'rename',
      sectionId,
      initialTitle: targetSec.title,
    });
  };

  const handleCategoryModalSubmit = (title: string) => {
    if (categoryModalState.mode === 'create') {
      const newSec: Section = {
        id: `sec-${Date.now()}`,
        title: title.trim(),
        order: activePage.sections.length,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        items: [],
      };
      setPages((prev) =>
        prev.map((p) => {
          if (p.id !== activePage.id) return p;
          return {
            ...p,
            sections: [...p.sections, newSec],
            updatedAt: Date.now(),
          };
        })
      );
      showToast(t.sidePanel.createdCategoryToast(title.trim()));
    } else if (categoryModalState.mode === 'rename' && categoryModalState.sectionId) {
      const secId = categoryModalState.sectionId;
      setPages((prev) =>
        prev.map((p) => {
          if (p.id !== activePage.id) return p;
          return {
            ...p,
            sections: p.sections.map((s) =>
              s.id === secId ? { ...s, title: title.trim(), updatedAt: Date.now() } : s
            ),
            updatedAt: Date.now(),
          };
        })
      );
      showToast(t.sidePanel.renamedCategoryToast(title.trim()));
    }
    setCategoryModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleOpenEditNote = (cell: Cell, sectionId: string) => {
    setEditNoteModalState({
      isOpen: true,
      cell,
      sectionId,
    });
  };

  const handleSaveEditNote = (
    cellId: string,
    updates: { key?: string; value: string; sourceUrl?: string; sourceTitle?: string }
  ) => {
    if (!editNoteModalState.sectionId) return;
    const { sectionId } = editNoteModalState;
    const now = Date.now();

    setPages((prev) =>
      prev.map((p) => {
        if (p.id !== activePage.id) return p;
        return {
          ...p,
          sections: p.sections.map((s) => {
            if (s.id !== sectionId) return s;
            return {
              ...s,
              items: s.items.map((c) =>
                c.id === cellId
                  ? {
                      ...c,
                      key: updates.key?.trim() || undefined,
                      value: updates.value,
                      sourceUrl: updates.sourceUrl?.trim() || undefined,
                      sourceTitle: updates.sourceTitle?.trim() || undefined,
                      updatedAt: now,
                    }
                  : c
              ),
              updatedAt: now,
            };
          }),
          updatedAt: now,
        };
      })
    );

    setEditNoteModalState({ isOpen: false });
    showToast(t.sidePanel.updatedNoteToast);
  };

  const handleExtractSectionToPage = (sectionId: string) => {
    const targetSec = activePage.sections.find((s) => s.id === sectionId);
    if (!targetSec) return;

    const newPageId = `page-${Date.now()}`;
    const newPage: Page = {
      id: newPageId,
      title: targetSec.title,
      icon: '📄',
      domains: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      sections: [{ ...targetSec, order: 0 }],
    };

    setPages((prev) => [
      ...prev.map((p) => {
        if (p.id !== activePage.id) return p;
        return {
          ...p,
          sections: p.sections.filter((s) => s.id !== sectionId),
          updatedAt: Date.now(),
        };
      }),
      newPage,
    ]);

    setActivePageId(newPageId);
    showToast(t.sidePanel.promotedPageToast(targetSec.title));
  };

  const handleOpenMoveModal = (cell: Cell, sourcePageId: string, sourceSectionId: string) => {
    setMovingCellTarget({ cell, sourcePageId, sourceSectionId });
  };

  const handleConfirmMoveCell = (targetPageId: string, targetSectionId: string) => {
    if (!movingCellTarget) return;
    const { cell, sourcePageId, sourceSectionId } = movingCellTarget;

    const targetPage = pages.find((p) => p.id === targetPageId);
    const targetSection = targetPage?.sections.find((s) => s.id === targetSectionId);
    if (!targetPage || !targetSection) {
      showToast(t.sidePanel.invalidCategoryToast);
      return;
    }

    setPages((prev) => {
      let movedCell: Cell | null = null;
      const pagesWithCellRemoved = prev.map((p) => {
        if (p.id !== sourcePageId) return p;
        return {
          ...p,
          sections: p.sections.map((s) => {
            if (s.id !== sourceSectionId) return s;
            const idx = s.items.findIndex((c) => c.id === cell.id);
            if (idx !== -1) {
              movedCell = s.items[idx];
              return {
                ...s,
                items: s.items.filter((c) => c.id !== cell.id),
                updatedAt: Date.now(),
              };
            }
            return s;
          }),
          updatedAt: Date.now(),
        };
      });

      if (!movedCell) return prev;

      return pagesWithCellRemoved.map((p) => {
        if (p.id !== targetPageId) return p;
        return {
          ...p,
          sections: p.sections.map((s) => {
            if (s.id !== targetSectionId) return s;
            return {
              ...s,
              items: [...s.items, movedCell!],
              updatedAt: Date.now(),
            };
          }),
          updatedAt: Date.now(),
        };
      });
    });

    showToast(t.sidePanel.movedNoteToast(targetPage.title, targetSection.title));
    setMovingCellTarget(null);
  };

  const handleBindDomain = (pageId: string) => {
    if (!currentDomain) return;
    setPages((prev) =>
      prev.map((p) => {
        if (p.id !== pageId) return p;
        if (p.domains.includes(currentDomain)) return p;
        return {
          ...p,
          domains: [...p.domains, currentDomain],
          updatedAt: Date.now(),
        };
      })
    );
    showToast(t.sidePanel.boundDomainToast(currentDomain));
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content).catch(() => {});
    showToast(t.sidePanel.copiedToast);
  };

  const handleDeleteCell = (pageId: string, sectionId: string, cellId: string) => {
    const page = pages.find((p) => p.id === pageId);
    const sec = page?.sections.find((s) => s.id === sectionId);
    const targetCell = sec?.items.find((c) => c.id === cellId);
    if (targetCell) {
      setPendingDeleteCell({ pageId, sectionId, cell: targetCell });
    }
  };

  const handleConfirmDeleteCell = () => {
    if (!pendingDeleteCell) return;
    const { pageId, sectionId, cell } = pendingDeleteCell;
    setPendingDeleteCell(null);

    setPages((prev) =>
      prev.map((p) => {
        if (p.id !== pageId) return p;
        return {
          ...p,
          sections: p.sections.map((s) => {
            if (s.id !== sectionId) return s;
            return {
              ...s,
              items: s.items.filter((c) => c.id !== cell.id),
              updatedAt: Date.now(),
            };
          }),
          updatedAt: Date.now(),
        };
      })
    );
    showToast(t.sidePanel.deletedNoteToast(cell.key));
  };

  const handleDeleteSection = (secId: string) => {
    const sec = activePage.sections.find((s) => s.id === secId);
    if (sec) {
      setPendingDeleteSection(sec);
    }
  };

  const handleConfirmDeleteSection = () => {
    if (!pendingDeleteSection) return;
    const secId = pendingDeleteSection.id;
    const secTitle = pendingDeleteSection.title;
    setPendingDeleteSection(null);

    setPages((prev) =>
      prev.map((p) => {
        if (p.id !== activePage.id) return p;
        return {
          ...p,
          sections: p.sections.filter((s) => s.id !== secId),
          updatedAt: Date.now(),
        };
      })
    );
    showToast(t.sidePanel.deletedCategoryToast(secTitle));
  };

  // Batch Selection Handlers
  const handleToggleSelectSection = (sectionId: string) => {
    const isCurrentlySelected = selectedSectionIds.includes(sectionId);
    const targetSec = activePage.sections.find((s) => s.id === sectionId);
    const secCells: CellTarget[] = targetSec
      ? targetSec.items.map((c) => ({ sectionId, cellId: c.id }))
      : [];

    if (isCurrentlySelected) {
      setSelectedSectionIds((prev) => prev.filter((id) => id !== sectionId));
      setSelectedCellTargets((prev) => prev.filter((t) => t.sectionId !== sectionId));
    } else {
      setSelectedSectionIds((prev) => [...prev, sectionId]);
      setSelectedCellTargets((prev) => {
        const remaining = prev.filter((t) => t.sectionId !== sectionId);
        return [...remaining, ...secCells];
      });
    }
  };

  const handleToggleSelectCell = (sectionId: string, cellId: string) => {
    setSelectedCellTargets((prev) => {
      const exists = prev.some((t) => t.sectionId === sectionId && t.cellId === cellId);
      if (exists) {
        setSelectedSectionIds((cats) => cats.filter((id) => id !== sectionId));
        return prev.filter((t) => !(t.sectionId === sectionId && t.cellId === cellId));
      } else {
        return [...prev, { sectionId, cellId }];
      }
    });
  };

  const totalPageSections = activePage.sections.length;
  const totalPageCells = useMemo(() => {
    return activePage.sections.reduce((acc, s) => acc + s.items.length, 0);
  }, [activePage]);

  const isAllSelected =
    totalPageSections > 0 &&
    selectedSectionIds.length === totalPageSections &&
    selectedCellTargets.length === totalPageCells;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedSectionIds([]);
      setSelectedCellTargets([]);
    } else {
      setSelectedSectionIds(activePage.sections.map((s) => s.id));
      const allCells: Array<{ sectionId: string; cellId: string }> = [];
      activePage.sections.forEach((s) => {
        s.items.forEach((c) => {
          allCells.push({ sectionId: s.id, cellId: c.id });
        });
      });
      setSelectedCellTargets(allCells);
    }
  };

  const handleConfirmExecuteBatchDelete = () => {
    const catsToDelete = new Set(selectedSectionIds);
    const cellsToDelete = new Set(selectedCellTargets.map((t) => `${t.sectionId}::${t.cellId}`));

    const deletedCatsCount = catsToDelete.size;
    let deletedNotesCount = 0;

    setPages((prev) =>
      prev.map((p) => {
        if (p.id !== activePage.id) return p;
        const nextSections: Section[] = [];
        for (const s of p.sections) {
          if (catsToDelete.has(s.id)) {
            deletedNotesCount += s.items.length;
            continue;
          }
          const nextItems = s.items.filter((c) => {
            if (cellsToDelete.has(`${s.id}::${c.id}`)) {
              deletedNotesCount++;
              return false;
            }
            return true;
          });
          nextSections.push({
            ...s,
            items: nextItems,
            updatedAt: Date.now(),
          });
        }
        return {
          ...p,
          sections: nextSections,
          updatedAt: Date.now(),
        };
      })
    );

    setSelectedSectionIds([]);
    setSelectedCellTargets([]);
    setIsBatchMode(false);
    setShowBatchConfirm(false);
    showToast(t.sidePanel.batchDeletedToast(deletedCatsCount, deletedNotesCount));
  };

  const handleBatchDeletePages = (pageIds: string[]) => {
    let remaining = pages.filter((p) => !pageIds.includes(p.id));
    if (remaining.length === 0) {
      remaining = [pages[0]];
    }
    setPages(remaining);
    if (!remaining.some((p) => p.id === activePageId)) {
      setActivePageId(remaining[0].id);
    }
    showToast(t.sidePanel.batchDeletedToast(pageIds.length, 0));
  };

  const handleQuickSaveCell = (
    data: CreateCellInput & { pageId: string; sectionId?: string }
  ) => {
    const now = Date.now();
    const newCell: Cell = {
      id: `c-${Date.now()}`,
      key: data.key,
      value: data.value,
      sourceUrl: data.sourceUrl,
      sourceTitle: data.sourceTitle,
      createdAt: now,
      updatedAt: now,
    };

    setPages((prev) =>
      prev.map((p) => {
        if (p.id !== data.pageId) return p;

        let secIndex = p.sections.findIndex((s) => s.id === data.sectionId);
        if (secIndex === -1 && p.sections.length > 0) {
          secIndex = 0;
        }

        if (secIndex === -1) {
          const newSec: Section = {
            id: `sec-${Date.now()}`,
            title: t.sidePanel.defaultCategoryName,
            order: 0,
            createdAt: now,
            updatedAt: now,
            items: [newCell],
          };
          return { ...p, sections: [newSec], updatedAt: now };
        }

        const updatedSections = [...p.sections];
        const targetSec = updatedSections[secIndex];
        updatedSections[secIndex] = {
          ...targetSec,
          items: [newCell, ...targetSec.items],
          updatedAt: now,
        };
        return { ...p, sections: updatedSections, updatedAt: now };
      })
    );

    showToast(t.sidePanel.createdNoteToast(data.key));
  };

  const handleConfirmExportJson = (selectedPages: Page[]) => {
    if (selectedPages.length === 0) return;
    const jsonPayload = serializePagesForExport(selectedPages);
    const safeSingleTitle =
      selectedPages[0].title.replace(/[\\/:*?"<>|]/g, '_').trim() || 'page';
    const filename =
      selectedPages.length === 1
        ? `${safeSingleTitle}.json`
        : `clipnote-export-${formatExportTimestamp(Date.now()).slice(0, 10)}.json`;

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonPayload);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(t.sidePanel.exportJsonSuccess);
  };

  const handleImportJsonFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const importedPages = parseImportedPagesFromJson(text);
      setPages((prev) => [...prev, ...importedPages]);
      if (importedPages[0]) {
        handleSelectPage(importedPages[0].id);
      }
      showToast(t.sidePanel.importJsonSuccess(importedPages.length));
    } catch {
      showToast(t.sidePanel.importJsonError);
    }
  };

  // ==========================================
  // Drag & Drop Handlers (HTML5 Native)
  // ==========================================

  // Section Reordering Handlers
  const handleSectionDragStart = (secId: string, e: React.DragEvent) => {
    setDraggedSectionId(secId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `section:${secId}`);
  };

  const handleSectionDragEnd = () => {
    setDraggedSectionId(null);
    setSectionDropTarget(null);
  };

  const handleSectionDragOverSection = (_secId: string, sIdx: number, e: React.DragEvent) => {
    if (draggedSectionId) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const rect = e.currentTarget.getBoundingClientRect();
      const isTop = e.clientY < rect.top + rect.height / 2;
      const targetIndex = isTop ? sIdx : sIdx + 1;
      setSectionDropTarget({ index: targetIndex });
    } else if (draggedCell) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setCellDropTarget({ sectionId: _secId, index: 0 });
    }
  };

  const handleSectionDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedCell && cellDropTarget) {
      handleCellDrop(cellDropTarget.index, cellDropTarget.sectionId, e);
      return;
    }
    if (!draggedSectionId || sectionDropTarget === null) return;

    const currentSections = activePage.sections;
    const fromIdx = currentSections.findIndex((s) => s.id === draggedSectionId);
    if (fromIdx === -1) return;

    let toIdx = sectionDropTarget.index;
    if (fromIdx < toIdx) {
      toIdx -= 1;
    }
    if (toIdx < 0) toIdx = 0;
    if (toIdx >= currentSections.length) toIdx = currentSections.length - 1;

    if (fromIdx !== toIdx) {
      const now = Date.now();
      const reordered = reorderArray(currentSections, fromIdx, toIdx);
      const reorderedSections = reordered.map((s, idx) => ({
        ...s,
        order: idx,
        updatedAt: now,
      }));

      setPages((prev) =>
        prev.map((p) => {
          if (p.id !== activePage.id) return p;
          return {
            ...p,
            sections: reorderedSections,
            updatedAt: now,
          };
        })
      );
    }

    setDraggedSectionId(null);
    setSectionDropTarget(null);
  };

  // Cell Drag Handlers
  const handleCellDragStart = (cellId: string, sectionId: string, e: React.DragEvent) => {
    setDraggedCell({ cellId, sectionId });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `cell:${sectionId}:${cellId}`);
  };

  const handleCellDragEnd = () => {
    setDraggedCell(null);
    setCellDropTarget(null);
  };

  const handleCellDragOver = (
    cIdx: number,
    targetSectionId: string,
    e: React.DragEvent
  ) => {
    if (!draggedCell) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const isTop = e.clientY < rect.top + rect.height / 2;
    const insertIndex = isTop ? cIdx : cIdx + 1;
    setCellDropTarget({ sectionId: targetSectionId, index: insertIndex });
  };

  const handleEmptySectionDragOver = (sectionId: string, e: React.DragEvent) => {
    if (!draggedCell) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setCellDropTarget({ sectionId, index: 0 });
  };

  const handleCellDrop = (
    targetIndex: number,
    targetSectionId: string,
    e: React.DragEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedCell) return;

    const { cellId: sourceCellId, sectionId: sourceSectionId } = draggedCell;
    const now = Date.now();

    setPages((prev) =>
      prev.map((p) => {
        if (p.id !== activePage.id) return p;
        return moveCellInPage(
          p,
          { sectionId: sourceSectionId, cellId: sourceCellId },
          { sectionId: targetSectionId, index: targetIndex },
          now
        );
      })
    );

    setDraggedCell(null);
    setCellDropTarget(null);
  };

  const quickCapturePages = useMemo(() => {
    return pages.map((p) => ({
      id: p.id,
      title: `${p.icon ? p.icon + ' ' : ''}${p.title}`,
      isSystem: p.isSystem,
      sections: p.sections.map((s) => ({
        id: s.id,
        title: s.title,
        pageId: p.id,
      })),
    }));
  }, [pages]);

  return (
    <div
      className={cn(
        isDarkMode ? 'dark' : '',
        'relative flex flex-col h-full w-full select-none overflow-hidden font-sans',
        className
      )}
    >
      <div
        className={cn(
          'relative flex flex-col h-full w-full border overflow-hidden',
          'bg-raycast-light-bg text-raycast-light-text border-raycast-light-border',
          'dark:bg-raycast-dark-bg dark:text-raycast-dark-text dark:border-raycast-dark-border'
        )}
      >
        {/* Header */}
        <header
          className={cn(
            'flex items-center justify-between px-3.5 py-2.5 border-b flex-shrink-0',
            'bg-raycast-light-surface/70 border-raycast-light-border backdrop-blur-md',
            'dark:bg-raycast-dark-surface/60 dark:border-white/10'
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded-md bg-raycast-amber flex items-center justify-center text-raycast-dark-bg font-black text-[11px] shadow-sm flex-shrink-0">
              N
            </div>
            <span className="font-semibold text-xs tracking-tight text-raycast-light-text dark:text-raycast-dark-text flex-shrink-0">
              {t.common.appName}
            </span>

            {currentDomain && (
              <span
                title={`目前頁面網域: ${currentDomain}`}
                className={cn(
                  'flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full border truncate',
                  'border-raycast-amber/30 bg-raycast-amber/10 text-raycast-amber'
                )}
              >
                <Globe className="w-2.5 h-2.5 flex-shrink-0" />
                <span className="truncate max-w-[130px]">{currentDomain}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => {
                setQuickCaptureInitialSectionId(undefined);
                setIsQuickCaptureOpen(true);
              }}
              title={`${t.sidePanel.newNote} (${t.sidePanel.shortcutCapture})`}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200',
                'bg-raycast-amber text-raycast-dark-bg hover:brightness-110 active:scale-95 shadow-sm'
              )}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.sidePanel.newNote}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              title={t.sidePanel.exportJson}
              className={cn(
                'p-1.5 rounded-lg text-raycast-light-muted dark:text-raycast-dark-muted',
                'hover:text-raycast-light-text dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5',
                'transition-colors duration-150'
              )}
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => importFileInputRef.current?.click()}
              title={t.sidePanel.importJson}
              className={cn(
                'p-1.5 rounded-lg text-raycast-light-muted dark:text-raycast-dark-muted',
                'hover:text-raycast-light-text dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5',
                'transition-colors duration-150'
              )}
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <input
              ref={importFileInputRef}
              type="file"
              accept=".json,application/json"
              aria-hidden="true"
              tabIndex={-1}
              className="hidden"
              onChange={handleImportJsonFile}
            />

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? t.sidePanel.switchToLight : t.sidePanel.switchToDark}
              className={cn(
                'p-1.5 rounded-lg text-raycast-light-muted dark:text-raycast-dark-muted',
                'hover:text-raycast-light-text dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5',
                'transition-colors duration-150'
              )}
            >
              {isDarkMode ? (
                <Sun className="w-3.5 h-3.5 text-raycast-amber" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-raycast-light-text" />
              )}
            </button>

            {/* Language Switcher Toggle */}
            <button
              type="button"
              onClick={handleToggleLanguage}
              title={t.sidePanel.languageToggle}
              className={cn(
                'px-1.5 py-0.5 rounded-lg text-xs font-semibold font-mono tracking-tight border',
                'bg-black/5 border-raycast-light-border text-raycast-light-muted',
                'dark:bg-white/5 dark:border-white/10 dark:text-raycast-dark-muted',
                'hover:text-raycast-light-text dark:hover:text-raycast-dark-text hover:border-raycast-amber/40',
                'transition-colors duration-150'
              )}
            >
              {language === 'zh-TW' ? 'EN' : '中'}
            </button>
          </div>
        </header>

        {/* Omni-Search Bar */}
        <div className="p-3 border-b border-raycast-light-border dark:border-raycast-dark-border flex-shrink-0">
          <OmniSearchBar
            language={language}
            results={allSearchResults}
            currentDomain={currentDomain}
            onBindDomain={handleBindDomain}
            onSelectItem={(item) => {
              handleSelectPage(item.pageId);
              showToast(t.sidePanel.copyAndLocateToast(item.title));
            }}
          />
        </div>

        {/* PageTabs */}
        <div className="flex-shrink-0">
          <PageTabs
            language={language}
            pages={pageTabItems}
            activePageId={activePageId}
            onSelectPage={handleSelectPage}
            onAddPage={handleOpenCreatePage}
            onManagePages={() => setIsManagePagesModalOpen(true)}
          />
        </div>

        {/* Active Page Control Bar (Pinned outside scrollable main area) */}
        <div className="flex items-center justify-between px-3.5 py-2.5 gap-2 border-b border-raycast-light-border dark:border-white/10 flex-shrink-0">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="text-base select-none flex-shrink-0">{activePage.icon || '📄'}</span>

            <div className="flex items-center gap-1 min-w-0 group/title">
              <h2
                onDoubleClick={() => handleOpenEditPage(activePage)}
                title={t.sidePanel.doubleClickEditPageTooltip}
                className="text-sm font-semibold text-raycast-light-text dark:text-raycast-dark-text truncate cursor-pointer hover:underline underline-offset-2 decoration-raycast-amber/50"
              >
                {activePage.title}
              </h2>
              <button
                onClick={() => handleOpenEditPage(activePage)}
                title={t.sidePanel.editPageTooltip}
                className="p-0.5 rounded opacity-0 group-hover/title:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 text-raycast-light-muted dark:text-raycast-dark-muted transition-opacity"
              >
                <Edit2 className="w-3 h-3" />
              </button>

              {pages.length > 1 && (
                <button
                  onClick={handleOpenDeletePageModal}
                  title={t.sidePanel.deletePage}
                  className="p-0.5 rounded opacity-0 group-hover/title:opacity-100 hover:bg-raycast-coral/10 text-raycast-light-muted dark:text-raycast-dark-muted hover:text-raycast-coral transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Batch Mode Toggle */}
            <button
              type="button"
              onClick={() => {
                setIsBatchMode(!isBatchMode);
                setSelectedSectionIds([]);
                setSelectedCellTargets([]);
              }}
              title={isBatchMode ? t.sidePanel.batchExit : t.sidePanel.batchSelect}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-150',
                isBatchMode
                  ? 'bg-raycast-amber text-raycast-dark-bg font-semibold'
                  : 'text-raycast-light-muted dark:text-raycast-dark-muted hover:text-raycast-light-text dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5'
              )}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isBatchMode ? t.sidePanel.batchExit : t.sidePanel.batchSelect}
              </span>
            </button>

            {/* Collapse / Expand All Categories Toggle */}
            {activePage.sections && activePage.sections.length > 0 && (
              <button
                type="button"
                onClick={handleToggleAllSections}
                title={allSectionsCollapsed ? t.sidePanel.expandAllCategories : t.sidePanel.collapseAllCategories}
                aria-label={allSectionsCollapsed ? t.sidePanel.expandAllCategories : t.sidePanel.collapseAllCategories}
                className={cn(
                  'flex items-center justify-center p-1.5 rounded-lg text-xs font-medium flex-shrink-0 transition-all duration-150',
                  'text-raycast-light-muted dark:text-raycast-dark-muted hover:text-raycast-light-text dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5 active:scale-95'
                )}
              >
                {allSectionsCollapsed ? (
                  <ChevronsUpDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronsDownUp className="w-3.5 h-3.5" />
                )}
              </button>
            )}

            {/* Add Category '+' button */}
            <button
              type="button"
              onClick={handleOpenAddCategory}
              title={t.sidePanel.addCategory}
              className={cn(
                'flex items-center justify-center p-1.5 rounded-lg text-xs font-medium flex-shrink-0 transition-all duration-150',
                'text-raycast-light-muted dark:text-raycast-dark-muted hover:text-raycast-light-text dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5 active:scale-95'
              )}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Active Page Body */}
        <main className="flex-1 overflow-y-auto p-3.5 space-y-3.5 no-scrollbar">

          {activePage.sections && activePage.sections.length > 0 ? (
            activePage.sections.map((section, sIdx) => {
              const fromSecIdx = activePage.sections.findIndex((s) => s.id === draggedSectionId);
              const isSelfSectionSlot =
                fromSecIdx !== -1 &&
                (sectionDropTarget?.index === fromSecIdx ||
                  sectionDropTarget?.index === fromSecIdx + 1);

              const showSectionSlotBefore =
                draggedSectionId &&
                sectionDropTarget?.index === sIdx &&
                !isSelfSectionSlot;
              const isLastSection = sIdx === activePage.sections.length - 1;
              const showSectionSlotAfter =
                draggedSectionId &&
                sectionDropTarget?.index === activePage.sections.length &&
                isLastSection &&
                !isSelfSectionSlot;

              return (
                <Fragment key={section.id}>
                  {showSectionSlotBefore && (
                    <DropSlot
                      type="section"
                      label={t.sectionContainer.dropCategoryHere}
                      onDrop={handleSectionDrop}
                    />
                  )}
                  <SectionContainer
                    id={section.id}
                    title={section.title}
                    type="mixed"
                    language={language}
                    itemCount={section.items.length}
                    isExpanded={!collapsedSectionIds.has(section.id)}
                    onToggleExpand={() => handleToggleSectionCollapse(section.id)}
                    isSelectMode={isBatchMode}
                    isSelected={selectedSectionIds.includes(section.id)}
                    isDragging={draggedSectionId === section.id}
                    isCellDropTarget={
                      cellDropTarget?.sectionId === section.id && section.items.length === 0
                    }
                    onDragStart={(e) => handleSectionDragStart(section.id, e)}
                    onDragEnd={handleSectionDragEnd}
                    onDragOverContainer={(e) => handleSectionDragOverSection(section.id, sIdx, e)}
                    onDropContainer={handleSectionDrop}
                    onDragOverEmpty={(e) => handleEmptySectionDragOver(section.id, e)}
                    onDropEmpty={(e) => handleCellDrop(0, section.id, e)}
                    onToggleSelect={() => handleToggleSelectSection(section.id)}
                    onRenameSection={() => handleOpenRenameCategory(section.id)}
                    onAddItem={(secId) => {
                      setQuickCaptureInitialSectionId(secId || section.id);
                      setIsQuickCaptureOpen(true);
                    }}
                    onExtractToPage={handleExtractSectionToPage}
                    onExportPage={() => setIsExportModalOpen(true)}
                    onDeleteSection={handleDeleteSection}
                  >
                    {section.items.length > 0 ? (
                      <div className="space-y-2">
                        {section.items.map((cell, cIdx) => {
                          const isTargetSec = cellDropTarget?.sectionId === section.id;
                          const isSameSec = draggedCell?.sectionId === section.id;
                          const sourceCellIdx = isSameSec
                            ? section.items.findIndex((c) => c.id === draggedCell.cellId)
                            : -1;
                          const isSelfSlot =
                            isSameSec &&
                            (cellDropTarget?.index === sourceCellIdx ||
                              cellDropTarget?.index === sourceCellIdx + 1);

                          const showCellSlotBefore =
                            isTargetSec && cellDropTarget?.index === cIdx && !isSelfSlot;
                          const isLastCell = cIdx === section.items.length - 1;
                          const showCellSlotAfter =
                            isTargetSec &&
                            cellDropTarget?.index === section.items.length &&
                            isLastCell &&
                            !isSelfSlot;

                          return (
                            <Fragment key={cell.id}>
                              {showCellSlotBefore && (
                                <DropSlot
                                  type="cell"
                                  label={t.sectionContainer.dropNoteHere}
                                  onDrop={(e) => handleCellDrop(cIdx, section.id, e)}
                                />
                              )}
                              <CellCard
                                id={cell.id}
                                cellKey={cell.key}
                                value={cell.value}
                                language={language}
                                createdAt={cell.createdAt}
                                updatedAt={cell.updatedAt}
                                sourceUrl={cell.sourceUrl}
                                sourceTitle={cell.sourceTitle}
                                isSelectMode={isBatchMode}
                                isSelected={selectedCellTargets.some(
                                  (t) => t.sectionId === section.id && t.cellId === cell.id
                                )}
                                isDragging={draggedCell?.cellId === cell.id}
                                onDragStart={(e) => handleCellDragStart(cell.id, section.id, e)}
                                onDragEnd={handleCellDragEnd}
                                onDragOver={(e) => handleCellDragOver(cIdx, section.id, e)}
                                onDrop={(e) =>
                                  handleCellDrop(cellDropTarget?.index ?? cIdx, section.id, e)
                                }
                                onToggleSelect={() => handleToggleSelectCell(section.id, cell.id)}
                                onEdit={() => handleOpenEditNote(cell, section.id)}
                                onCopy={() => handleCopy(cell.value)}
                                onMove={() => handleOpenMoveModal(cell, activePage.id, section.id)}
                                onDelete={() =>
                                  handleDeleteCell(activePage.id, section.id, cell.id)
                                }
                              />
                              {showCellSlotAfter && (
                                <DropSlot
                                  type="cell"
                                  label={t.sectionContainer.dropNoteHere}
                                  onDrop={(e) =>
                                    handleCellDrop(section.items.length, section.id, e)
                                  }
                                />
                              )}
                            </Fragment>
                          );
                        })}
                      </div>
                    ) : null}
                  </SectionContainer>
                  {showSectionSlotAfter && (
                    <DropSlot
                      type="section"
                      label={t.sectionContainer.dropCategoryHere}
                      onDrop={handleSectionDrop}
                    />
                  )}
                </Fragment>
              );
            })
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-raycast-amber/10 border border-raycast-amber/30 flex items-center justify-center text-raycast-amber">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-raycast-light-text dark:text-raycast-dark-text">
                  {t.sidePanel.emptyPagePrompt}
                </p>
              </div>
              <button
                onClick={handleOpenAddCategory}
                className="mt-1 px-3 py-1.5 rounded-xl text-xs font-medium border border-black/10 dark:border-white/10 text-raycast-light-muted dark:text-raycast-dark-muted hover:text-raycast-light-text dark:hover:text-raycast-dark-text hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.sidePanel.addCategory}</span>
              </button>
            </div>
          )}
        </main>

        {/* Floating Batch Action Toolbar */}
        {isBatchMode && (
          <div className="p-2 border-t border-raycast-amber/30 bg-raycast-amber/10 dark:bg-raycast-dark-surface/95 backdrop-blur-md flex items-center justify-between text-xs animate-in slide-in-from-bottom-2 duration-150 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-raycast-amber">
                {t.sidePanel.batchStats(selectedSectionIds.length, selectedCellTargets.length)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="px-2 py-1 rounded text-xs border border-white/10 hover:bg-white/10 transition-colors"
              >
                {isAllSelected ? t.sidePanel.batchDeselectAll : t.sidePanel.batchSelectAll}
              </button>
              <button
                type="button"
                disabled={selectedSectionIds.length === 0 && selectedCellTargets.length === 0}
                onClick={() => setShowBatchConfirm(true)}
                className="px-2 py-1 rounded text-xs bg-raycast-coral hover:brightness-110 disabled:opacity-40 disabled:pointer-events-none text-white font-medium flex items-center gap-1 transition-all"
              >
                <Trash2 className="w-3 h-3" />
                <span>{t.sidePanel.batchDeleteSelected}</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer
          className={cn(
            'flex items-center justify-between px-3 py-1.5 text-[11px] border-t flex-shrink-0 select-none',
            'border-raycast-light-border bg-raycast-light-surface/50 text-raycast-light-subtle',
            'dark:border-white/5 dark:bg-raycast-dark-surface/40 dark:text-raycast-dark-subtle'
          )}
        >
          <div className="flex items-center gap-2">
            <span>
              {t.sidePanel.statsTotal(pages.length, allSearchResults.length)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 font-mono text-[10px]">
              Alt+N
            </kbd>
            <span>{t.sidePanel.newNote}</span>
          </div>
        </footer>

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-raycast-dark-surface border border-white/15 text-raycast-dark-text text-xs shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            <Check className="w-3.5 h-3.5 text-raycast-emerald" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Batch Delete Confirmation Dialog */}
        <ConfirmModal
          isOpen={showBatchConfirm}
          language={language}
          title={t.sidePanel.batchConfirmDeleteTitle}
          description={t.sidePanel.batchConfirmDeleteDesc(
            selectedSectionIds.length,
            selectedCellTargets.length
          )}
          confirmText={t.common.delete}
          cancelText={t.common.cancel}
          isDestructive={true}
          onConfirm={handleConfirmExecuteBatchDelete}
          onClose={() => setShowBatchConfirm(false)}
        />

        {/* Delete Single Page Confirmation Dialog */}
        <ConfirmModal
          isOpen={showDeletePageConfirm}
          language={language}
          title={t.sidePanel.deletePage}
          description={t.sidePanel.confirmDeletePage(activePage.title)}
          confirmText={t.common.delete}
          cancelText={t.common.cancel}
          isDestructive={true}
          onConfirm={handleConfirmDeleteActivePage}
          onClose={() => setShowDeletePageConfirm(false)}
        />

        {/* Delete Single Category Confirmation Dialog */}
        <ConfirmModal
          isOpen={!!pendingDeleteSection}
          language={language}
          title={t.sidePanel.deleteCategory}
          description={
            pendingDeleteSection
              ? t.sidePanel.confirmDeleteCategory(pendingDeleteSection.title)
              : ''
          }
          confirmText={t.common.delete}
          cancelText={t.common.cancel}
          isDestructive={true}
          onConfirm={handleConfirmDeleteSection}
          onClose={() => setPendingDeleteSection(null)}
        />

        {/* Delete Single Cell Confirmation Dialog */}
        <ConfirmModal
          isOpen={!!pendingDeleteCell}
          language={language}
          title={t.sidePanel.confirmDeleteCellTitle}
          description={
            pendingDeleteCell?.cell.key
              ? t.sidePanel.confirmDeleteCellWithKey(pendingDeleteCell.cell.key)
              : pendingDeleteCell?.cell.value?.trim()
                ? t.sidePanel.confirmDeleteCellWithKey(
                    pendingDeleteCell.cell.value.trim().length > 20
                      ? `${pendingDeleteCell.cell.value.trim().slice(0, 20)}...`
                      : pendingDeleteCell.cell.value.trim()
                  )
                : t.sidePanel.confirmDeleteCellWithoutKey
          }
          confirmText={t.common.delete}
          cancelText={t.common.cancel}
          isDestructive={true}
          onConfirm={handleConfirmDeleteCell}
          onClose={() => setPendingDeleteCell(null)}
        />

        {/* Quick Capture Modal */}
        <QuickCaptureModal
          isOpen={isQuickCaptureOpen}
          language={language}
          onClose={() => {
            setIsQuickCaptureOpen(false);
            setQuickCaptureInitialSectionId(undefined);
          }}
          pages={quickCapturePages}
          activePageId={activePageId}
          initialSectionId={quickCaptureInitialSectionId}
          sourceUrl={currentUrl}
          sourceTitle={currentTitle || t.sidePanel.currentWebpage}
          searchResults={allSearchResults}
          onSaveCell={handleQuickSaveCell}
          onCopySearchResult={(item) => {
            handleCopy(item.content);
          }}
        />

        <NewPageModal
          isOpen={pageModalState.isOpen}
          mode={pageModalState.mode}
          initialData={
            pageModalState.page
              ? {
                  title: pageModalState.page.title,
                  icon: pageModalState.page.icon,
                  domains: pageModalState.page.domains || [],
                }
              : undefined
          }
          language={language}
          onClose={() => setPageModalState((prev) => ({ ...prev, isOpen: false }))}
          onSubmit={handleSavePageModal}
        />

        <MoveCellModal
          isOpen={Boolean(movingCellTarget)}
          language={language}
          cell={movingCellTarget?.cell || null}
          sourcePageId={movingCellTarget?.sourcePageId || ''}
          sourceSectionId={movingCellTarget?.sourceSectionId || ''}
          pages={pages}
          onClose={() => setMovingCellTarget(null)}
          onConfirm={handleConfirmMoveCell}
        />

        <CategoryModal
          isOpen={categoryModalState.isOpen}
          mode={categoryModalState.mode}
          initialTitle={categoryModalState.initialTitle}
          language={language}
          onClose={() => setCategoryModalState((prev) => ({ ...prev, isOpen: false }))}
          onSubmit={handleCategoryModalSubmit}
        />

        <EditNoteModal
          isOpen={editNoteModalState.isOpen}
          language={language}
          cellId={editNoteModalState.cell?.id || ''}
          initialKey={editNoteModalState.cell?.key || ''}
          initialValue={editNoteModalState.cell?.value || ''}
          initialSourceUrl={editNoteModalState.cell?.sourceUrl || ''}
          initialSourceTitle={editNoteModalState.cell?.sourceTitle || ''}
          currentUrl={currentUrl}
          currentTitle={currentTitle}
          onClose={() => setEditNoteModalState({ isOpen: false })}
          onSubmit={handleSaveEditNote}
        />

        <ManagePagesModal
          isOpen={isManagePagesModalOpen}
          language={language}
          pages={pages}
          activePageId={activePageId}
          onClose={() => setIsManagePagesModalOpen(false)}
          onDeletePages={handleBatchDeletePages}
          onEditPage={handleOpenEditPage}
          onRenamePage={(pageId, newTitle) => {
            setPages((prev) =>
              prev.map((p) => (p.id === pageId ? { ...p, title: newTitle, updatedAt: Date.now() } : p))
            );
            showToast(t.sidePanel.renamedPageToast(newTitle));
          }}
        />

        <ExportJsonModal
          isOpen={isExportModalOpen}
          language={language}
          pages={pages}
          activePageId={activePageId}
          onClose={() => setIsExportModalOpen(false)}
          onConfirmExport={handleConfirmExportJson}
        />
      </div>
    </div>
  );
};
