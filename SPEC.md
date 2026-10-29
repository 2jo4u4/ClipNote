# Specification: Notebook Browser Extension (筆記本網頁擴充應用)

## Problem Statement

When browsing the web, users constantly encounter information they need to quickly capture (e.g., restaurant addresses, references, code snippets, drafting ideas) and repeatedly find themselves retyping or hunting down the same structured personal or technical data (e.g., resume job titles, project descriptions, hashtags, mock testing credentials) across job portals and web applications.

Existing solutions either force users into heavyweight external note apps that break browsing context, require tedious window juggling, or rely on fragile auto-fill form extensions that break modern Single Page Application (SPA) reactive inputs and fail to preserve data context across different domains. Furthermore, earlier system designs artificially segregated structured key-value fields and unstructured memos into rigid, mutually exclusive sections, creating friction when users wanted to organize related fields and free-form reflections within the same logical section.

## Solution

A lightweight, domain-aware Chrome Manifest V3 browser extension called **Notebook (筆記本)** that acts as an ambient drawer and instant capture palette.

It provides:
1. **Unified Atomic Unit (`Cell`)**: Standardizes all note items into a unified `Cell` model. If a Cell has a `key`, it behaves and renders as a structured Field; if the `key` is omitted, it behaves as a free-form Jot.
2. **Flexible Mixed Sections (`Section`)**: Sections act as pure organizational clusters containing an ordered array of `Cell` items. Sections can freely hold both Fields and Jots side-by-side without artificial container type segregation.
3. **One-Click Copy (一鍵複製)**: Fast, non-destructive copying of any Cell value with visual feedback (scale tap + emerald glow), tailored for form filling and zero DOM disruption.
4. **Context-First Active Page Resolution (作用中筆記頁解析)**: Automatically highlights and opens the relevant thematic notebook page (e.g., "104 中文經歷" or "社交平台貼文") based on the current website hostname, while universally pinning a built-in `Global Page` (`🌐`) as a universal fallback.
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
12. As a content creator drafting posts for multiple social platforms, I want to bind a single "社交平台貼文" Page to multiple domains (e.g., `x.com`, `threads.net`, `facebook.com`), so that the exact same drafting notes and hashtags appear by default whenever I visit any of these sites.
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
25. As a user on a new job website (`cake.me`), I want to type in the Side Panel search bar and have it search across all Pages, Sections, and Cells (matching both Key and Value), so that I can find my work history stored under `104 中文經歷`.
26. As a user discovering a Cell from another Page via search, I want an option to bind the current domain to that Page with one click, so that future visits automatically prioritize that Page.
27. As a user browsing search results, I want each result card to show its source path (`來自 [Page] > [Section]`) and type badge (`[欄位]` or `[隨筆]`), so that I understand the context before copying.

### Data Freedom & Backup
28. As a privacy-conscious user, I want all my notes, rules, and cells stored entirely in local browser storage (`chrome.storage.local`), so that none of my personal or resume data leaves my device. (Note: Extension declares `tabs` permission solely to read `tab.url` on `chrome.tabs.onActivated` for Side Panel domain awareness; no tab content or browsing activity is tracked or transmitted).
29. As a power user, I want to export my entire Notebook or individual Pages as standard JSON files, so that I can back up, migrate, or programmatically edit my notes.
30. As a user setting up a new device, I want to import a previously exported JSON file, so that all my Pages, Sections, Cells, and Domain Bindings are restored accurately.

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
- **Category Management**: Categories can be created and renamed through Raycast-styled `CategoryModal` (replacing native `window.prompt`), deleted individually from the section menu, or batch-deleted via Batch Mode.
- **Cell Management**: Cells can be edited through `EditNoteModal` (`Ctrl+Enter` save), deleted individually, or batch-selected and deleted.
- **Batch Mode**: Active page header allows toggling batch selection mode (`isSelectMode`), displaying checkboxes across categories and cells, with a floating action toolbar showing selection statistics, select-all/deselect-all toggles, and confirmed bulk deletion.

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
