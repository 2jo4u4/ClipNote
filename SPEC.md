# Specification: ClipNote Browser Extension (筆記本網頁擴充應用)

## Problem Statement

When browsing the web, users constantly encounter information they need to quickly capture (e.g., restaurant addresses, references, code snippets, drafting ideas) and repeatedly find themselves retyping or hunting down the same structured personal or technical data (e.g., resume job titles, project descriptions, hashtags, mock testing credentials) across job portals and web applications.

Existing solutions either force users into heavyweight external note apps that break browsing context, require tedious window juggling, or rely on fragile auto-fill form extensions that break modern Single Page Application (SPA) reactive inputs and fail to preserve data context across different domains. Furthermore, earlier system designs artificially segregated structured key-value fields and unstructured memos into rigid, mutually exclusive sections, creating friction when users wanted to organize related fields and free-form reflections within the same logical section.

## Solution

A lightweight, domain-aware Chrome Manifest V3 browser extension called **ClipNote (筆記本)** that acts as an ambient drawer and instant capture palette.

It provides:
1. **Unified Atomic Unit (`Cell`)**: Standardizes all note items into a unified `Cell` model. If a Cell has a `key`, it behaves and renders as a structured Field; if the `key` is omitted, it behaves as a free-form Jot.
2. **Flexible Mixed Sections (`Section`)**: Sections act as pure organizational clusters containing an ordered array of `Cell` items. Sections can freely hold both Fields and Jots side-by-side without artificial container type segregation.
3. **One-Click Copy (一鍵複製)**: Fast, non-destructive copying of any Cell value with visual feedback (scale tap + emerald glow), tailored for form filling and zero DOM disruption.
4. **Context-First Active Page Resolution (作用中筆記頁解析)**: Automatically highlights and opens the relevant thematic notebook page (e.g., "求職中文經歷" or "社交平台貼文") based on the current website hostname, while universally pinning a built-in `Global Page` (`🌐`) as a universal fallback.
5. **Custom Page Icons & Dynamic Creation**: Full customization of page tabs with Emoji icons (e.g., `💼`, `💬`, `📝`, `🚀`) and a streamlined creation flow (`NewPageModal`).
6. **Zero-Friction Dual-Mode Capture**: Instant capturing via right-click context menu and an in-page floating modal (`Alt+N`) with unified title/content inputs and real-time omni-search.
7. **Side Panel Workspace (側邊欄常駐工作區)**: Non-obstructive Chrome Side Panel (`Alt+S`) built with Raycast-inspired warm minimalism for multi-field continuous resume filling.
8. **Bilingual Interface (繁體中文 / English)**: Native support for both Traditional Chinese (`zh-TW`) and English (`en`) with unified ubiquitous vocabulary and header language toggle.

## User Stories

### Capture & Recording
1. As a web user reading an online post, I want to right-click selected text and choose "新增筆記", so that I can open the quick capture palette prefilled with the selected text, source URL, and page title to review or adjust the destination page and category before saving.
2. As a web user capturing snippets from diverse websites, I want the extension to automatically record the source URL and page title on each Cell, so that I can revisit the original post or article anytime in the future.
3. As a web user on a specific website, I want to press `Alt+N` to summon a lightweight in-page modal, so that I can quickly record notes or search saved snippets without opening the larger Side Panel.
4. As a user recording a structured datum, I want to optionally specify a "欄位名稱 (Key)", so that the Cell is rendered and treated as a reusable key-value Field rather than an unlabelled memo.
5. As a user recording a quick thought, I want to leave the "欄位名稱 (Key)" blank, so that the Cell is instantly saved as a free-form Jot without being forced to invent an artificial label.
6. As a user choosing a destination for my captured note, I want to select any Section under any Page regardless of whether I am capturing a Field or a Jot, so that I am never blocked by container type mismatches.

### Form Filling & Consumption
7. As a job seeker filling out an online resume form, I want to open the persistent Chrome Side Panel (`Alt+S`) alongside the form, so that I can view all my previous experiences and achievements without covering my form.
8. As a job seeker reviewing long project summaries, I want multi-line text to remain readable and uncluttered, so that my side panel stays compact and easy to scan while still allowing me to copy the entire text in a single click.
9. As a user filling inputs on modern React/Vue web applications, I want clicking a Cell card to copy its `value` directly to my clipboard with a green "Copied!" indicator, so that I can reliably paste it into any custom or rich-text input without triggering framework state bugs.
10. As a keyboard-centric user, I want to press `Alt+N` and immediately type a keyword to search through all my saved Cells, so that I can press `Enter` to copy the matched content and close the modal in less than two seconds.
11. As a user reviewing my notes, I want to see the creation or modification relative time (e.g., "5 分鐘前", "昨天") on every Cell, so that I can judge how fresh or relevant the information is.

### Domain Awareness & Organization
12. As a content creator drafting posts for multiple social platforms, I want to bind a single "社交平台貼文" Page to multiple domains (e.g., `sample.org`, `social.example.net`, `forum.example.org`), so that the exact same drafting notes and hashtags appear by default whenever I visit any of these sites.
13. As a user visiting an arbitrary or unknown website, I want the extension to automatically default to the system `Global Page`, so that I never face an empty screen or broken navigation.
14. As a user with multiple Pages associated with the same domain, I want to designate a primary Page or have the system remember my last active Page tab on that site, so that I land on the most relevant page without repetitive clicking.
15. As a user reviewing my notes on a matched domain, I want a permanent `[ 🌐 第一頁 ]` tab pinned at the top of the Side Panel, so that I can instantly switch between domain-specific notes and universal notes.
16. As a user personalizing my workspace, I want to assign custom Emoji icons (e.g., `💼`, `📝`, `💬`, `🚀`) to my Pages, so that I can recognize them visually at a glance in the tab bar.
16.b. As a user with many Pages in the tab bar, I want the tab bar to support horizontal mouse wheel scrolling and display smooth Chevron navigation buttons when overflowing, with domain badges kept clean and hidden by default, so that navigating across many tabs is effortless and compact.
17. As a user organizing my knowledge base, I want to click the `+` button on the tab bar to open a dialog for creating a new Page with title, icon, and optional bound domains, so that I can structure new projects easily.

### Content Structure & Section Flexibility
18. As a user organizing a thematic area (e.g., "資深前端職缺應徵"), I want to create a Section that holds both structured contact fields (Email, Phone) and narrative statements (Intro, Cover letter), so that related information stays grouped logically together.
19. As a user reviewing my Sections, I want the Section's `updatedAt` timestamp to automatically reflect the latest modification time among its member Cells, so that I know when that topic was last touched.
20. As a user whose Section has grown into an independent topic, I want to extract that Section into a new top-level Page with one click, so that I can progressively organize my notebook without manual copy-pasting.
21. As a user tidying up my notes, I want to click "移動至..." on any Cell to open an interactive target selection modal (`MoveCellModal`), allowing me to choose destination Page and Section, so that misplaced items can be re-filed precisely.
22. As a user updating existing notes, I want to click "編輯筆記" on any Cell to open an edit modal (`EditNoteModal`) supporting `Ctrl+Enter` to quickly save and update Key or Value, so that outdated info can be corrected without re-capturing.
23. As a user managing categories, I want an elegant modal (`CategoryModal`) for adding and renaming categories instead of native browser prompts, so that creating or modifying categories feels seamless and integrated.
24. As a user organizing or clearing notebook items, I want batch selection and deletion for Pages, Categories, and Cells, so that I can select multiple unwanted items and delete them in one step.

### Discovery & Search
25. As a user on a new job website (`sample.org`), I want to type in the Side Panel search bar and have it search across all Pages, Sections, and Cells (matching both Key and Value), so that I can find my work history stored under `求職中文經歷`.
26. As a user discovering a Cell from another Page via search, I want an option to bind the current domain to that Page with one click, so that future visits automatically prioritize that Page.
27. As a user browsing search results, I want each result card to show its source path (`來自 [Page] > [Section]`), so that I understand the context before copying.

### Data Freedom & Backup
28. As a privacy-conscious user, I want all my notes, rules, and cells stored entirely in local browser storage (`chrome.storage.local`), so that none of my personal or resume data leaves my device. (Note: Extension declares `tabs` permission solely to read `tab.url` on `chrome.tabs.onActivated` for Side Panel domain awareness; no tab content or browsing activity is tracked or transmitted).
29. As a power user, I want to export my entire Notebook or individual Pages as standard JSON files, so that I can back up, migrate, or programmatically edit my notes.
30. As a user setting up a new device, I want to import a previously exported JSON file, so that all my Pages, Sections, Cells, and Domain Bindings are restored accurately.

### Onboarding & Interactive Tutorials
31. As a first-time user installing the extension, I want to see interactive onboarding pages ("使用教學" and "Getting Started") instead of unhelpful generic filler data, so that I can immediately learn how to use the notebook by interacting with real notes.
32. As a Traditional Chinese user opening the extension for the first time, I want the side panel to automatically focus on the "使用教學" page, so that I can read instructions in my native language without manual navigation.
33. As an English-speaking user opening the extension for the first time, I want the side panel to automatically focus on the "Getting Started" page, so that I can read instructions in English without friction.
34. As a user learning keyboard workflows, I want to see clear shortcut guidance for `Alt+N` (quick capture) and right-click context menu saving within the shortcuts category, so that I can adopt fast capturing habits right away.
35. As a user exploring note types, I want to see example key-value fields (Name and Email) demonstrated alongside free-form jots in the tutorial, so that I can intuitively grasp how structured labels differ from plain notes.
36. As a user practicing CRUD operations, I want to double-click cards, edit values, create new notes, and rename categories directly on the tutorial page, so that I can safely build confidence in using the application.
37. As a user who only needs one language, I want to immediately delete the unused language tutorial page out of the box (e.g., deleting "Getting Started" while keeping "使用教學"), so that my workspace stays clean without waiting to create custom pages first.
38. As a user who has mastered all features, I want to edit, repurpose, or completely delete both tutorial pages, so that I have complete ownership over my personal notebook.
39. As a user adjusting theme and language preferences, I want my choices (dark/light theme and zh-TW/en language) to be persisted in local storage and applied synchronously on launch, so that I don't experience visual flash or have to re-select my preferred language every time the side panel opens.
40. As a user viewing the active page header, I want a clean header without redundant domain tags or badges, so that the page title and action controls remain visually unobstructed.
41. As a user deleting a category, I want a confirmation dialog (ConfirmModal) with the category's title and a destruction warning, so that I don't accidentally erase a category and all its contained notes with an accidental click.
42. As a user organizing notes within a Page, I want to reorder categories by dragging their dedicated grip handle, so that I can prioritize urgent topic sections at the top.
43. As a user reordering note cards or categories within a page, I want moving over other cards to dynamically push them apart and reveal a dashed amber placeholder slot, so that I can see the exact drop destination with tangible Trello-like spatial preview.
44. As a user moving notes between categories on the same page, I want to drag a note card from one category and drop it into another category (including empty categories), so that I can file notes instantly without opening modal dialogs.
45. As a user in batch selection mode, I want drag-and-drop handles to be disabled, so that multi-selection clicks do not accidentally trigger card dragging.
46. As a user with extensive text in a note (such as a detailed self-introduction, cover letter, or multiline code snippet), I want the note card to automatically truncate with a smooth fade gradient and an expandable "展開更多 (Show more)" button when exceeding ~4-5 lines (or ~120px), so that my side panel remains compact and easy to navigate without being vertically hijacked by a single lengthy note.
47. As a user reading or editing a long note, I want to click "展開更多" to expand the note to full length and click "收合 (Show less)" to collapse it, without accidentally triggering copy or double-click edit actions.
48. As a user copying a collapsed long note, I want clicking the note card or the copy button to copy 100% of the entire original content to my clipboard, so that truncation is strictly a visual aid and never alters copied data.
49. As a user deleting an individual note card from the action menu, I want a confirmation modal (ConfirmModal) displaying the note's key or truncated content snippet (up to 20 characters) with an explicit warning, so that I do not accidentally delete notes with a stray click.
50. As a user dragging a note card or category, I want the lifted item in the original list to transform into a Trello-like dashed indentation placeholder (`border-2 border-dashed border-raycast-amber/40 bg-raycast-amber/5 opacity-40 rounded-xl`), so that I have a tangible physical sense of where the item was lifted from.
51. As a user dragging a note card across categories, I want dragging between cards in another category to smoothly push those cards apart and reveal the insertion slot, so that cross-category filing feels as fluid as intra-category sorting.
52. As a user in batch mode, I want selecting all cards in a category to never automatically select the category container itself, so that batch-deleting notes preserves the category as an empty container unless I explicitly select the category header.
53. As a screen reader user or keyboard-only navigator opening the Page Modal (NewPageModal), I want the modal to be recognized as an accessible dialog (`role="dialog"`, `aria-modal="true"`) with trapped keyboard focus, so that pressing Tab/Shift+Tab cycles only within the modal and does not leak into background content.
54. As a user with visual or motor impairments, I want each input label in the Page Modal to be explicitly associated with its input field (`htmlFor` and `id`), so that clicking the label text focuses the input and screen readers announce the exact field name.
55. As a screen reader user selecting an emoji icon for a page, I want the preset emoji buttons to provide clear accessible names and indicate their selected state (`aria-pressed`), so that I know which icon is currently chosen.
56. As a keyboard user navigating the Page Modal, I want the close button to have a clear accessible name (`aria-label`) and decorative shortcut labels to be ignored by screen readers (`aria-hidden="true"`), so that I don't hear redundant noise while navigating.
57. As a user reordering note cards or moving them between categories by dragging, I want the note's "最後更新時間" (updatedAt) to remain unchanged, so that my notes preserve their authentic content modification history rather than falsely indicating they were just updated.
58. As a user viewing a page with multiple categories, I want a single-click collapse/expand all toggle in the page header, so that I can quickly minimize or reveal all category sections at once.
59. As a keyboard and screen reader user interacting with custom dropdowns, I want accessible combobox/listbox semantics (`role="combobox"`, `role="listbox"`), visible focus rings, arrow key navigation, and explicit label associations (`htmlFor` and `id`), so that selecting target pages and categories in move/capture modals is fully accessible.

---

## Implementation Decisions

### 1. Unified Atomic Model (`Cell`)
All note items are standardized into a single `Cell` entity. The discriminated union between `FieldsSection` and `JotsSection` is eliminated. The distinction between a Field and a Jot is determined purely by the presence of `key`:
- `key` present and non-empty: Field (structured key-value).
- `key` absent or empty: Jot (free-form note).

From prototype alignment:
```typescript
export interface Cell {
  id: string;
  key?: string;            // Distinguishes Field (present) vs. Jot (omitted)
  value: string;          // Main content payload
  createdAt: number;
  updatedAt: number;
  sourceUrl?: string;     // Source web page URL
  sourceTitle?: string;   // Source web page title
}

export interface Section {
  id: string;
  title: string;
  items: Cell[];          // Mixed collection of Fields and Jots
  order: number;
  createdAt: number;
  updatedAt: number;      // Updated whenever a contained cell changes
}

export interface Page {
  id: string;
  title: string;
  icon?: string;          // Emoji or icon identifier
  domains: string[];      // Hostname patterns for auto-resolution
  isPrimary?: boolean;
  isSystem?: boolean;
  sections: Section[];
  createdAt: number;
  updatedAt: number;
}
```

### 2. Clean-Break Migration Strategy
Because the project is in early development with no legacy production installations, direct clean-break migration is adopted. Storage data format is upgraded directly to `items: Cell[]`, deprecating legacy `fields` and `jots` arrays without backward compatibility baggage.

### 3. Unified Presentation (`CellCard`)
`FieldCard` and `JotCard` are unified into a single presentation component (`CellCard`). 
- When `cell.key` is defined, the top row renders the Key label alongside the relative timestamp.
- When `cell.key` is omitted, the top row renders the relative timestamp cleanly without an artificial empty badge.
- Both variants share the exact same hover copy action, deletion/move menus, click-to-copy interaction (scale `0.98` with emerald ring glow), and bottom source URL chip.

### 4. Simplified Quick Capture Workflow
The dual-tab switch in `QuickCaptureModal` is replaced with a single streamlined form:
- "欄位名稱 (Key)" input is optional: filling it produces a Field; omitting it produces a Jot.
- Section dropdown displays all Sections of the target Page unconditionally.

### 5. Section Timestamp Synchronization
Whenever a Cell is created, updated, or deleted within a Section:
- `section.updatedAt` is updated to `Date.now()`.
- `page.updatedAt` is updated to `Date.now()`.
- On read/export, if `section.updatedAt` is missing, it falls back to `Math.max(section.createdAt, ...items.map(i => i.updatedAt || i.createdAt))`.

### 6. Omni-Search Indexing & Resolution
`NotebookService.search(query)` indexes across all Pages, Sections, and Cells:
- Matches against both `cell.key` and `cell.value` case-insensitively.
- Emits flat `SearchResult` items with dynamic type tag (`field` if `cell.key` exists, `jot` otherwise) and source breadcrumb path (`${page.title} > ${section.title}`).
- One-click copy copies `cell.value` directly to clipboard.

### 7. Full CRUD & Batch Deletion
- **Page Management**: All pages are equal in capability and customize title, emoji icon, and applicable websites ("適用網站"). The notebook maintains the invariant that at least one page must exist (`pages.length >= 1`). If only one page exists, it cannot be deleted. When multiple pages exist, any page (including the initial first page) can be deleted, and applicable websites can be freely customized or left blank. When browsing websites not assigned to any page, the side panel remains on the active page without intrusive auto-switching. Custom and initial pages can be batch-deleted via `ManagePagesModal` (preserving the active/anchor page) or individually removed.
- **Category Management**: Categories can be created and renamed through Raycast-styled `CategoryModal` (replacing native `window.prompt`). Deleting a category from its header menu prompts a destructive `ConfirmModal` displaying the category title and warning of notes deletion before execution, preventing accidental data loss. Categories can also be batch-deleted via Batch Mode.
- **Cell Management**: Cells can be edited through `EditNoteModal` (`Ctrl+Enter` save), deleted individually, or batch-selected and deleted.
- **Batch Mode**: Active page header allows toggling batch selection mode (`isSelectMode`), displaying checkboxes across categories and cells, with a floating action toolbar showing selection statistics, select-all/deselect-all toggles, and confirmed bulk deletion.

### 8. Interactive Onboarding & Dual Default Pages
- **Bilingual Default Seed Pages**:
  Instead of initializing storage with a single generic "第一頁", the extension initializes with two equal, fully-editable tutorial pages (`createDefaultSeedData`):
  1. `使用教學` (icon: `💡`, id: `SYSTEM_GLOBAL_PAGE_ID`, domains: `[]`):
     - `⌨️ 快捷鍵與即時操作`: Guides for `Alt+N` capture, omni-search, right-click context menu capture, and one-click copy.
     - `📝 筆記與分類操作 (CRUD)`: Key-value demo fields (`姓名: 王小明`, `Email: xiaoming@example.com`), card editing (`Ctrl+Enter` save), folder note moving, batch manage, category collapse/rename/promote/export, and reassurance tip.
     - `🌐 適用網站與頁面管理`: Explanation of domain-aware auto-switching, horizontal wheel scrolling on page bar, and page management.
  2. `Getting Started` (icon: `💡`, id: `TUTORIAL_EN_PAGE_ID`, domains: `[]`):
     - Parity English translation of the exact same 3 categories, key-value fields (`Name: Alex Wang`, `Email: alex.wang@example.com`), and instructions.
- **Initial Active Page Resolution**:
  On cold start or storage initialization, the active page selection checks the user's browser language (`navigator.language` / `currentLanguage`). If it matches Chinese (`zh*`), `使用教學` is focused; otherwise `Getting Started` is focused for all other locales.
- **Instant Deletability**:
  Because the initial state contains 2 pages (`pages.length === 2`), the single-page invariant (`pages.length >= 1`) is satisfied even if a user immediately deletes one of the languages, giving users frictionless control over their preferred language setup.

### 9. Theme & Language Persistence with MV3 Pre-Hydration
- **Persistence Keys**: `notebook_theme` (`'light' | 'dark'`) and `notebook_language` (`'zh-TW' | 'en'`) stored in both `window.localStorage` (for synchronous Side Panel pre-hydration) and `chrome.storage.local` (for cross-context synchronization across Content Script and Background Service Worker).
- **MV3 CSP Compliance & Pre-Hydration**: Chrome MV3 forbids inline `<script>` tags in extension HTML entrypoints (`script-src 'self'`). Synchronous theme initialization executes at the top of bundled entrypoint scripts (`main.tsx`) before React renders, toggling the `dark` class and `style.colorScheme` on `document.documentElement` to prevent FOUC (flash of unstyled content).
- **Header Cleanliness**: The active page header displays the page icon and editable title cleanly, omitting domain badge tags to maintain a clutter-free Raycast aesthetic.

### 10. Native HTML5 Drag & Drop Reordering (Categories & Cells)
- **Zero-Dependency Native Architecture**: Implemented via native HTML5 Drag and Drop API (`draggable`, `onDragStart`, `onDragOver`, `onDragLeave`, `onDrop`, `onDragEnd`) with 0 KB external bundle footprint.
- **Dedicated Grip Handles**:
  - `CellCard` and `SectionContainer` header feature a left-aligned `GripVertical` icon (`cursor-grab active:cursor-grabbing`) to trigger dragging, preventing conflicts with single-click copying, text selection, double-click editing, and button clicks.
- **Visual Feedback & Drop Indicators**:
  - Dragged items display reduced opacity (`opacity-40`) and dashed placeholder styling (`border-2 border-dashed border-raycast-amber/40 bg-raycast-amber/5 rounded-xl`).
  - Target insertion points display a dynamic Trello-style push-apart placeholder slot (`border-2 border-dashed border-raycast-amber/60 bg-raycast-amber/5 dark:bg-raycast-amber/10 rounded-xl`) based on pointer vertical midpoint (see Decision 13).
  - Empty category containers highlight with an amber dashed border on hover when receiving a dragged cell.
- **Data Layer Domain Operations**:
  - `NotebookService.reorderSections(pageId, sourceIndex, targetIndex)`: updates `page.sections` order and normalizes sequence numbers.
  - `NotebookService.reorderCells(pageId, source, target)`: moves a cell within the same category or across categories with precise index insertion, preserving the moved cell's `updatedAt` content modification timestamp intact while updating container and page `updatedAt`.
- **Batch Mode Guard**: Drag handles and draggable attributes are suppressed when `isSelectMode` is active.

### 11. Collapsible Long Cell Text (長內容筆記自動折疊)
- **Auto-Detection Threshold**: When note text exceeds 4~5 lines or ~120px scroll height, card body renders with `max-h-[120px] overflow-hidden relative` and a bottom smooth fade gradient (`bg-gradient-to-t from-raycast-light-surface dark:from-raycast-dark-surface/90 to-transparent`). Notes below the threshold remain uncluttered without extra buttons.
- **Toggle Controls**: "展開更多 (Show more)" and "收合 (Show less)" pills with `ChevronDown` and `ChevronUp` icons.
- **Event Isolation**: Toggle click executes `e.stopPropagation()` to completely avoid triggering card single-click copy, drag handles, or double-click editing.
- **100% Full-Content Copy**: Copying the card (by clicking card body or the copy icon) always copies the entire original content to clipboard, regardless of whether it is collapsed or expanded.
- **State Boundary**: Managed via component-local React state (`useState(false)`), adhering to YAGNI and keeping `NotebookStorage` clean.

### 12. Single Cell Delete Confirmation Dialog (單筆筆記刪除確認視窗)
- **Unified Destruction Guard**: Replaces direct deletion in `CellCard` with a dedicated `pendingDeleteCell: { pageId: string; sectionId: string; cell: Cell } | null` in `SidePanel.tsx`.
- **Bilingual Copy**:
  - Traditional Chinese (`zh-TW`):
    - With key or content snippet: `確定要刪除「${key || snippet}」這則筆記嗎？此動作無法復原。` (for keyless notes, content is truncated up to 20 characters with `...`)
    - Empty note: `確定要刪除此筆記嗎？此動作無法復原。`
  - English (`en`):
    - With key or content snippet: `Are you sure you want to delete note "${key || snippet}"? This action cannot be undone.` (for keyless notes, content is truncated up to 20 characters with `...`)
    - Empty note: `Are you sure you want to delete this note? This action cannot be undone.`
- **Action Buttons & Keybindings**: Destructive red "刪除" / "Delete" button, neutral "取消" / "Cancel", and `Esc` key support to dismiss.

### 13. Trello-Style Push-Apart Drag Architecture & Unified Drop Slot (Trello 式推開動態與統一佔位空槽)
- **Deprecation of Overlay Borders**: Eliminates hard overlay border lines (`border-t-2` / `border-b-2`) and heavy outer rings (`ring-2`), unifying category and cell dragging into an identical spatial model.
- **Dynamic Drop Placeholder Slot**: At the calculated insertion point, renders an animated placeholder slot (`border-2 border-dashed border-raycast-amber/50 bg-raycast-amber/5 dark:bg-raycast-amber/10 rounded-xl transition-all duration-200 ease-out`) for both Cell and Category movements.
- **Physical Push-Apart Dynamics**: Surrounding cards smoothly slide down to accommodate the slot with `transition-all duration-200 ease-out` and gracefully return when the cursor moves away.
- **Cross-Category Seamless Parity**: Hovering between cards in an external category calculates the relative insertion position, pushes adjacent cards apart, and renders the placeholder slot identically to intra-category sorting.

### 14. Decoupled Batch Selection Model (批次管理權責解耦)
- **Cell-to-Category Isolation**: Selecting individual cells (even if all cells in a section are selected, or the section only contains 1 cell) strictly manages `selectedCellTargets` and never automatically marks the parent section in `selectedSectionIds`.
- **Category Preservation**: Executing batch deletion clears selected cells while retaining the section container as an empty category (`items: []`). Category deletion requires explicitly checking the section header checkbox.

### 15. Active Press Isolation on Card (卡片按壓縮放樣式隔離)
- **Scoped React Press State**: Replaces CSS `:active` on the parent card container with isolated React state (`isPressed`).
- **Control Element Interception**: Control buttons (edit, copy, `...` menu), drag handles, checkboxes, expand/collapse toggles, and source links apply `onMouseDown={(e) => e.stopPropagation()}` to guarantee the card remains completely static with zero twitching or unwanted scaling during control interactions.

### 16. Accessible Modal Dialog Architecture & Form Controls (`NewPageModal` a11y)
- **Dialog Role & Semantic Labelling**:
  - The modal card container applies `role="dialog"`, `aria-modal="true"`, `aria-labelledby="new-page-modal-title"`, and `aria-describedby="new-page-modal-desc"`.
  - Header title receives `id="new-page-modal-title"` and description receives `id="new-page-modal-desc"`.
- **Focus Trap & Focus Restoration**:
  - On mount / `isOpen=true`, initial focus is set to the page title input (`inputRef.current?.focus()`).
  - Active keyboard focus is trapped within the modal: `Tab` on the last interactive element wraps around to the first, and `Shift+Tab` on the first element wraps around to the last.
  - On close (`onClose` / `Escape`), focus is restored to the triggering button outside the modal.
- **Form Controls & Explicit Association**:
  - Title input uses `id="new-page-title-input"`, `required`, and `aria-required="true"`; bound via `<label htmlFor="new-page-title-input">`.
  - Custom icon input uses `id="new-page-icon-input"` and `aria-label`; bound via `<label htmlFor="new-page-icon-input">`.
  - Domain binding input uses `id="new-page-domains-input"` and `aria-describedby="new-page-domains-hint"`; bound via `<label htmlFor="new-page-domains-input">`. Domain hint paragraph carries `id="new-page-domains-hint"`.
- **Preset Emoji Group & Pressed State**:
  - The preset chip row container defines `role="group"` and `aria-label`.
  - Each preset button carries `aria-label` with the emoji description and `aria-pressed={icon === emoji}` to announce the current selection state to assistive technologies.
  - Header close button defines an explicit `aria-label`.
- **Keyboard Shortcut Decoration Isolation**:
  - The footer keyboard shortcut guidance (`<kbd>Esc</kbd> · <kbd>Enter</kbd>`) is wrapped with `aria-hidden="true"` to prevent screen reader noise, relying on standard form submission and escape handlers.

### 17. One-Click Category Collapse & Expansion (一鍵折疊與展開所有分類)
- **Active Page Header Control**:
  - A toggle button is placed alongside the Batch Mode and Add Category buttons in the active page title bar, visible when the active page contains at least 1 section.
  - Features dynamic Raycast canonical icons: `ChevronsDownUp` when any categories are expanded (action collapses all), switching to `ChevronsUpDown` when all categories are collapsed (action expands all).
- **Controlled & Uncontrolled Section Accordion**:
  - `SectionContainer` supports controlled expansion through optional `isExpanded?: boolean` and `onToggleExpand?: () => void` props, while falling back gracefully to internal state for standalone usage.
  - Individual category accordion toggles (clicking section header or chevron) remain fully functional and keep the global toggle button state synchronized.
- **Bilingual i18n & Accessible Affordance**:
  - Traditional Chinese (`zh-TW`): `全部折疊` / `全部展開`.
  - English (`en`): `Collapse All` / `Expand All`.
  - Fully accessible with dynamic `title` and `aria-label`.

### 18. Accessible Combobox Dropdown & Modal Form Association (全域下拉選單無障礙與表單關聯)
- **Combobox & Listbox Semantics**:
  - `Dropdown` renders with `role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"`, `aria-controls`, and `aria-activedescendant`.
  - Options list rendered with `role="listbox"` and options with `role="option"`, `aria-selected`, and `id`.
- **Keyboard Navigation & Visible Focus Ring**:
  - Focusable with `tabIndex={0}` and highlighted with Raycast amber focus ring (`focus-visible:ring-2 focus-visible:ring-raycast-amber`).
  - Supports `ArrowDown` / `ArrowUp` to cycle options, `Enter` / `Space` to open and confirm selection, and `Escape` to close and return focus.
- **Explicit Label Association in Modals**:
  - Form modals (`QuickCaptureModal`, `MoveCellModal`) bind label `<label htmlFor="...">` with dropdown trigger button `<Dropdown id="...">`.

### 19. Subdomain Auto-Matching & Specificity Priority (`matchDomain` & `findBestMatchingPage`)
- **Subdomain Auto-Matching**: Configuring a root domain pattern (e.g., `example.com`) automatically matches the exact domain as well as any subdomain (`www.example.com`, `m.example.com`) without requiring explicit `*.` wildcard prefixes (`normHost === normPattern || normHost.endsWith('.' + normPattern)`).
- **Subdomain Specificity**: Configuring a specific subdomain (e.g., `docs.example.com`) matches only that subdomain and its sub-branches (`v1.docs.example.com`), never matching the root domain or peer subdomains (`www.example.com`).
- **Longest-Pattern Specificity Weighting (`findBestMatchingPage`)**: When multiple pages match the active hostname, the page with the longest normalized matching domain pattern wins (`docs.example.com` > `example.com`). Ties at the top specificity score are broken by active session selection (`sessionPageId`), then `isPrimary`, then creation/list order.

### 20. Chrome Native `_locales` & Static Assets Consolidation
- **Manifest i18n (`public/_locales/`)**: Provides Chrome Web Store native localization files (`public/_locales/en/messages.json` and `public/_locales/zh_TW/messages.json`) with `default_locale: 'en'` and `__MSG_...__` placeholders in `wxt.config.ts` for browser-level extension name, description, action tooltip, and shortcut descriptions.
- **Decoupled In-App Language State**: Inside the React Side Panel and Quick Capture UI, translations continue to be driven by the React `language` state (`src/i18n/index.ts` persisted to `localStorage` and `chrome.storage.local` under `'notebook_language'`), keeping the in-app header language toggle 100% responsive and synchronized across Side Panel, In-Page Quick Capture, and the right-click context menu.
- **Single Root `public/` Directory**: All static assets (`icons/` and `_locales/`) reside exclusively in the root `public/` directory.

### 21. Portable Page / Page[] JSON Export & Import
- **Side Panel Header Controls**:
  - The top-right header bar provides an **Export JSON (`Download`)** button and an **Import JSON (`Upload`)** button side by side.
- **Multi-Page Export Selection (`ExportJsonModal`)**:
  - Clicking **Export JSON** opens `ExportJsonModal`, listing all pages with checkboxes (defaulting to the currently active page selected) and a **Select All / Deselect All** toggle.
  - Selecting **1 page** exports a single `ExportedPage` JSON object named `${page.title}.json`.
  - Selecting **multiple pages** exports an `ExportedPage[]` JSON array named `clipnote-export-YYYY-MM-DD.json`.
- **ID-Stripped Schema & Timestamp Formatting**:
  - **Export (`serializePagesForExport`)**: Strips all internal `id`, `order`, and `isSystem` properties from `Page`, `Section`, and `Cell`, and formats `createdAt` and `updatedAt` timestamps as local `"YYYY-MM-DD HH:mm:ss"` strings.
  - **Import (`parseImportedPagesFromJson` / `importPagesFromJson`)**:
    - Accepts both a single `Page` object and a `Page[]` array.
    - Ignores any `id` fields in the JSON across `Page`, `Section`, and `Cell`, generating fresh unique IDs so every imported page is guaranteed to be added as a brand-new `Page` without overwriting existing pages.
    - Parses `"YYYY-MM-DD HH:mm:ss"` (or ISO / numeric) timestamps back into epoch milliseconds, falling back to `Date.now()` whenever a timestamp is missing or invalid.
    - Automatically switches the active tab to the first newly imported page and displays a localized success or error toast.

---

## Testing Decisions

### 1. Testing Seam
The primary testing seam is **`NotebookService`**. 
- It acts as the sole domain gateway between persistent storage and user interfaces.
- It accepts an abstract `StorageAdapter`, allowing complete in-memory test isolation using `MemoryStorageAdapter` without relying on browser runtime or Chrome APIs.
- Testing through this single seam verifies all business rules: atomic Cell CRUD, section reordering, cell moving across sections/pages, domain matching with session memory, omni-search, section extraction, and JSON import/export.

### 2. Behavioral Testing Guidelines
- Tests must assert observable external behavior, invariants, and side-effects rather than internal implementation details.
- Verifications include:
  - Minimum single-page invariant (`pages.length >= 1`) and undeletability when only 1 page remains, while allowing deletion when multiple pages exist.
  - Cell creation with and without `key`, ensuring timestamps and source attribution persist correctly.
  - Section `updatedAt` updating automatically when cells are modified or removed.
  - Multi-domain resolution prioritizing explicit bindings and falling back to Global Page.
  - Omni-search retrieving matching Cells by either Key or Value.
  - Default seed data generation yielding both bilingual tutorial pages ("使用教學" and "Getting Started") with 3 structured categories and key-value demo fields.
  - Initial active page resolution prioritizing the appropriate tutorial page based on locale.
  - Instant deletion of either tutorial page out of the box while preserving the remaining page.
  - Section reordering (`reorderSections`) preserving page integrity and updating order indices.
  - Cell reordering (`reorderCells`) within the same category and across categories including empty targets.
- Prior art: Existing 33-test suite in `tests/notebook-service.test.ts`.

---

## Out of Scope

1. **Third-party cloud synchronization**: Syncing data with external servers, cloud databases, or third-party note services (e.g. Notion, Obsidian sync) is deferred to future milestones. Storage is strictly local (`chrome.storage.local`).
2. **Automated web form DOM injection**: The extension does not attempt to automatically find and inject values into web form inputs on target pages, avoiding conflicts with modern frontend frameworks. Consumption is powered by One-Click Copy to clipboard.
3. **Rich WYSIWYG / Markdown rendering in Cell Value**: Cell values are treated as plain text strings to guarantee clean clipboard pasting without unwanted formatting artifacts.
4. **Nested sub-sections**: Sections remain flat lists within Pages (no recursive Section trees).

---

## Further Notes

- Raycast Warm Minimalism design tokens:
  - Charcoal Dark surface `#18181b` / `#232326`, Ivory Light surface `#faf9f6`.
  - Amber `#F59E0B`, Coral `#FF6363`, Emerald `#30D158`.
  - Spring cubic bezier easing: `cubic-bezier(0.16, 1, 0.3, 1)`.
- Storybook dev server running at `http://localhost:6006/` serves as the live design validation environment.
