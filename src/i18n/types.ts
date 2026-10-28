export type Language = 'zh-TW' | 'en';

export interface I18nTranslations {
  common: {
    appName: string;
    cancel: string;
    confirm: string;
    delete: string;
    clear: string;
    search: string;
    copied: string;
    copy: string;
    clickToCopy: string;
    moreActions: string;
    fieldBadge: string;
    jotBadge: string;
    sourceFrom: (page: string, category: string, key?: string) => string;
  };
  sidePanel: {
    newNote: string;
    exportJson: string;
    exportJsonSuccess: string;
    switchToLight: string;
    switchToDark: string;
    searchPlaceholder: string;
    searchNoResults: string;
    boundDomainToast: (domain: string) => string;
    copiedToast: string;
    copyAndLocateToast: (title: string) => string;
    addCategory: string;
    addCategoryPrompt: string;
    defaultCategoryName: string;
    addPage: string;
    addNote: string;
    emptyPagePrompt: string;
    emptyCategoryPrompt: string;
    promotedPageToast: (title: string) => string;
    createdPageToast: (title: string) => string;
    createdCategoryToast: (title: string) => string;
    deletedCategoryToast: (title: string) => string;
    deletedNoteToast: (title?: string) => string;
    movedNoteToast: (page: string, category: string) => string;
    invalidCategoryToast: string;
    shortcutClose: string;
    shortcutCapture: string;
    itemCount: (count: number) => string;
    statsTotal: (pageCount: number, noteCount: number) => string;
    bindDomainToCurrent: (pageTitle: string, domain: string) => string;
    languageToggle: string;
  };
  pageTabs: {
    scrollLeft: string;
    scrollRight: string;
    newPage: string;
  };
  sectionContainer: {
    promoteToPage: string;
    newNote: string;
    deleteCategory: string;
  };
  moveModal: {
    title: string;
    currentNote: string;
    targetPage: string;
    targetCategory: string;
    noCategories: string;
    confirmMove: string;
  };
  newPageModal: {
    title: string;
    nameLabel: string;
    namePlaceholder: string;
    iconLabel: string;
    domainLabel: string;
    domainPlaceholder: string;
    submitBtn: string;
  };
  quickCapture: {
    searchPlaceholder: string;
    titlePlaceholder: string;
    contentPlaceholder: string;
    targetPage: string;
    targetCategory: string;
    submitBtn: string;
  };
}
