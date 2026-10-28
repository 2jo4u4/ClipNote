# Specification: Notebook Browser Extension (筆記本網頁擴充應用)

## Problem Statement

When browsing the web, users constantly encounter information they need to quickly capture (e.g., restaurant addresses on Instagram, reference links, snippet ideas) and repeatedly find themselves retyping or hunting down the same structured personal or technical data (e.g., resume job titles, project descriptions, hashtags, mock testing accounts) across multiple job boards or social platforms. 

Existing solutions either force users into heavyweight note-taking apps that disrupt browsing context, require tedious copy-pasting between separate windows, or rely on fragile auto-fill form extensions that break modern Single Page Application (SPA) inputs and fail to preserve data context across different domains.

## Solution

A lightweight, domain-aware Chrome Manifest V3 browser extension called **Notebook (筆記本)** that acts as an ambient drawer and instant capture palette. 

It provides:
1. **One-Click Copy (一鍵複製)**: Fast, non-destructive copying of structured key-value fields with visual feedback, tailored for resume form filling and repetitive data entry.
2. **Context-First Active Page Resolution (作用中筆記頁解析)**: Automatically highlights and opens the relevant thematic notebook page (e.g., "社交平台貼文" or "104 中文經歷") based on the current website hostname, while universally falling back to a built-in `Global Page` for general web browsing.
3. **Zero-Friction Capture (極速擷取)**: Instant capturing via right-click context menu (direct to Global Jot with source URL tracking) and an in-page floating modal (`Alt+N`) that doubles as an instant Spotlight/Palette search.
4. **Side Panel Workspace (側邊欄常駐工作區)**: Non-obstructive Chrome Side Panel (`Alt+S`) with long-text folding for multi-field continuous resume filling.
5. **Progressive Migration & Omni-Search (漸進式整理與全域穿透搜尋)**: Allows beginners to start with a single Global Page, elevate sections into dedicated Pages as they grow ("Section Extraction"), and instantly search across all pages with one-click domain association.

---

## User Stories

### Capture & Recording
1. As a web user reading an Instagram post, I want to right-click selected text and choose "存為全域隨筆", so that I can capture a restaurant address in one second without any modal interrupting my browsing.
2. As a web user capturing snippets from diverse websites, I want the extension to automatically record the source URL and page title, so that I can revisit the original post or article anytime in the future.
3. As a web user on a specific website, I want to press `Alt+N` to summon a lightweight in-page modal, so that I can quickly record notes without opening the larger Side Panel.
4. As a user creating structured data, I want to capture a field by specifying a mandatory Key and Value, so that I can categorize it as a reusable snippet rather than an unstructured scratchpad note.
5. As a user who values simplicity, I want to decide for myself whether an item is a free-form Jot or a named Field, so that the tool never guesses incorrectly or forces unwanted categories on me.

### Form Filling & Consumption
6. As a job seeker filling out an online resume form, I want to open the persistent Chrome Side Panel (`Alt+S`) alongside the form, so that I can view all my previous experiences and achievements without covering my form.
7. As a job seeker with long project achievement descriptions, I want long text fields to be clamped to 2-3 lines in the UI, so that my side panel stays compact and easy to scan while still allowing me to copy the entire text in a single click.
8. As a user filling inputs on modern React/Vue web applications, I want clicking a Field value to copy it directly to my clipboard with a green "Copied!" indicator, so that I can reliably paste it into any custom or rich-text input without triggering framework state bugs.
9. As a keyboard-centric user, I want to press `Alt+N` and immediately type a keyword to search through all my saved resume fields, so that I can press `Enter` to copy the matched content and close the modal in less than two seconds.

### Domain Awareness & Organization
10. As a content creator drafting posts for multiple social platforms, I want to bind a single "社交平台貼文" Page to multiple domains (e.g., `x.com`, `threads.net`, `facebook.com`), so that the exact same drafting notes and hashtags appear by default whenever I visit any of these sites.
11. As a user visiting an arbitrary or unknown website, I want the extension to automatically default to the system `Global Page`, so that I never face an empty screen or broken navigation.
12. As a user with multiple Pages associated with the same domain, I want to designate a primary Page or have the system remember my last active Page tab on that site, so that I land on the most relevant page without repetitive clicking.
13. As a user reviewing my notes on a matched domain, I want a permanent `[ 🌍 全域筆記頁 ]` tab pinned at the top of the Side Panel, so that I can instantly switch between domain-specific notes and universal notes.

### Progressive Migration & Onboarding
14. As a first-time user who does not yet understand Pages, I want the extension to come preloaded with friendly seed examples in the Global Page, so that I can immediately experience clicking to copy and saving a jot.
15. As a user whose Global Page has accumulated many notes into a Section, I want to click "將此分區升格為新筆記頁 (Extract Section to Page)", so that I can turn that cluster into an independent Page without manually copying and pasting items.
16. As a user organizing my knowledge base, I want to move individual Fields or Jots to another Page and Section, so that I can tidy up misplaced items easily.

### Discovery & Search
17. As a user on a new job website (`cake.me`), I want to type in the Side Panel search bar and have it search across all Pages, Sections, Fields, and Jots, so that I can find my work history stored under `104 中文經歷`.
18. As a user discovering a field from another Page via search, I want a button saying "＋ 將此 Page 綁定至當前網域", so that I can permanently associate the current domain with that Page with one click.
19. As a user browsing search results, I want each result card to show its source path (`來自 [Page] > [Section]`), so that I know the context before copying.

### Data Freedom & Backup
20. As a privacy-conscious user, I want all my notes, rules, and fields stored entirely in local browser storage (`chrome.storage.local`), so that none of my personal or resume data leaves my device.
21. As a power user, I want to export my entire Notebook or individual Pages as a standard JSON file, so that I can back up, migrate, or programmatically edit my notes.
22. As a user switching computers, I want to import a previously exported JSON file, so that all my Pages, Sections, Fields, and Domain Bindings are restored accurately.

---

## Implementation Decisions

### 1. Technology Stack & Manifest V3 Architecture
- Built as a **Chrome Manifest V3 Extension** using **TypeScript** and **Vite (WXT Framework)**.
- **Background Service Worker**: Handles extension lifecycle, context menu registrations (`chrome.contextMenus`), tab tracking (`chrome.tabs.onActivated`, `chrome.tabs.onUpdated`), and default storage seeding.
- **Side Panel (`chrome.sidePanel`)**: Primary persistent user interface hosting the Page Tabs, Section cards, Field copy interactions, and Omni-Search bar.
- **Content Script (`Quick Capture Modal`)**: Shadow DOM-isolated in-page floating modal triggered by `Alt+N` or context menu, providing keyboard search and field/jot capture without CSS interference from host pages.

### 2. Domain & Schema Specifications
All data is stored in `chrome.storage.local`. The core schema implements discriminated union typing for sections:

```typescript
export interface Field {
  id: string;
  key: string;
  value: string;
  sourceUrl?: string;
  sourceTitle?: string;
}

export interface Jot {
  id: string;
  content: string;
  createdAt: number;
  sourceUrl?: string;
  sourceTitle?: string;
}

export interface BaseSection {
  id: string;
  title: string;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface FieldsSection extends BaseSection {
  type: 'fields';
  fields: Field[];
}

export interface JotsSection extends BaseSection {
  type: 'jots';
  jots: Jot[];
}

export type Section = FieldsSection | JotsSection;

export interface Page {
  id: string;
  title: string;
  domains: string[];
  isPrimary?: boolean;
  isSystem?: boolean;
  sections: Section[];
  createdAt: number;
  updatedAt: number;
}

export interface NotebookStorage {
  pages: Record<string, Page>;
  systemGlobalPageId: string; // "SYSTEM_GLOBAL_PAGE"
}
```

### 3. Active Page Resolution Logic
When the user opens the Side Panel or captures content on a given tab:
1. Extract hostname using `new URL(tab.url).hostname`.
2. Find all Pages whose `domains` list matches the hostname (exact match `hostname === domain` or wildcard suffix match `*.domain.com`).
3. If matches exist:
   - If one of them has `isPrimary: true`, select it.
   - Else, select the first matched Page (or last user-selected page in active session).
4. If no match exists:
   - Fall back to `systemGlobalPageId` (`Global Page`).

### 4. Dual-Mode Quick Palette (`Alt+N`)
- **Summoned in-page**: Injected into current DOM within an isolated Shadow Root (`#notebook-quick-palette`).
- **Input state**:
  - If text was pre-selected, pre-fill as `value` or `jot.content`.
  - Typing filters all Notebook entries in real-time.
  - Arrow keys navigate search hits; `Enter` copies the selected item's text to the system clipboard and immediately removes the modal, returning focus to the page.
  - `Escape` dismisses the modal immediately.

### 5. Rejection of DOM Auto-Fill Injection
As recorded in [ADR-0001](file:///d:/project/note-ext/docs/adr/0001-capture-and-copy-architecture.md), the system deliberately does not attempt automated DOM input injection or `HTMLInputElement.prototype` value hijacking. It relies purely on high-speed clipboard copy ("One-Click Copy").

### 6. Raycast-Inspired Design System & Motion Physics
As recorded in [ADR-0004](file:///d:/project/note-ext/docs/adr/0004-raycast-design-system.md):
- **Color Palette**: Warm charcoal (`#18181b` - `#1c1c1f`) with 1px `border-white/8` in dark mode, warm ivory (`#faf9f6`) in light mode; Coral Red (`#FF6363`) / Warm Amber (`#F59E0B`) accents; soft Emerald (`#30D158`) copy confirmation.
- **Fluid Layout & Physics**: Magnetic sliding pill for Page Tabs; smooth height accordion expansions; Apple/Raycast curve (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Tactile Copy Interactions**: `active:scale-[0.98]` physical press feedback, emerald micro-glow halo, and a 1.2s icon flip to checkmark.
- **Keyboard-First Navigation**: Smooth floating cursor highlight with dedicated `kbd` badges on interactive elements.

---

## Testing Decisions

### Test Quality Philosophy
- Tests must strictly verify **observable external behavior and state transitions**, never private implementation details.
- Avoid mocking internal service calls; test against concrete in-memory storage adapters.

### Primary Testing Seam: `NotebookService` / `StorageManager`
The highest architectural seam is the unified **`NotebookService`**:
- All operations (Page creation, Section mutation, Field/Jot CRUD, Domain resolution, Omni-Search, Section extraction, JSON export/import) flow through this single seam.
- UI components (Side Panel, Quick Modal) interact only through this seam.
- The test suite runs against this seam with an in-memory `chrome.storage.local` fake.

### Modules to Test:
1. **Domain Resolution Engine**:
   - Exact domain matches (`x.com`).
   - Wildcard subdomain matches (`*.104.com.tw` matches `pda.104.com.tw`).
   - Multiple matching pages with `isPrimary` precedence.
   - Fallback to `Global Page` on unmatched domains.
2. **Omni-Search Engine**:
   - Query matching across Page titles, Section titles, Field keys, Field values, and Jot contents.
   - Ranking and path metadata tagging (`[Page] > [Section]`).
3. **Section Extraction & Progressive Migration**:
   - Promoting a `FieldsSection` or `JotsSection` from `Global Page` to a new `Page`.
   - Verifying IDs, timestamps, and order preservation.
4. **JSON Serialization & Recovery**:
   - Exporting the entire notebook state to JSON schema.
   - Importing valid JSON and recovering clean state.
   - Handling corrupt/malformed JSON payloads safely.

---

## Out of Scope

1. **Automated DOM Input Auto-Fill / Form Injection**: Intentionally omitted in favor of One-Click Copy.
2. **Cloud Account Sync & User Authentication**: Strictly local-first via `chrome.storage.local`; synchronization across machines is achieved via JSON export/import.
3. **Rich Text WYSIWYG / Markdown Rendering Engine in Fields**: Fields are strictly plain text strings for reliable clipboard compatibility; Markdown formatting within fields is deferred.
4. **Third-party Cloud Storage Integrations (Dropbox, Google Drive)**: Out of scope for V1.

---

## Further Notes

- **System Global Page Invariant**: The Page with ID `SYSTEM_GLOBAL_PAGE` must be created during extension installation (`runtime.onInstalled`) if not already present. UI actions must disable the "Delete Page" and "Change Domains" options for this system page.
- **Cross-Browser Compatibility**: While optimized for Chrome Side Panel API, the architecture isolates Side Panel views such that it can compile to Firefox/Edge sidebar implementations if needed in the future.
