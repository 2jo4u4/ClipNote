# Notebook Extension Domain Model (筆記本擴充應用領域模型)

This document defines the ubiquitous language for the Notebook browser extension across both Traditional Chinese (`zh-TW`) and English (`en`). It establishes canonical terminology to be used consistently across UI, code, and documentation.

## Bilingual Terminology Mapping (雙語術語對照)

| Concept | Traditional Chinese (`zh-TW`) | English (`en`) | Description |
| :--- | :--- | :--- | :--- |
| **Notebook** | 筆記本 | Notebook | The root application workspace containing all pages, settings, and storage state. |
| **Page** | 一頁 / 頁 | Page | A discrete thematic document or tab (e.g., "104 中文經歷", "社交貼文草稿") that binds to target web domains. |
| **Default Tutorial Pages** | 使用教學 / Getting Started | Getting Started / Tutorial | The system-created initial bilingual tutorial pages providing interactive onboarding instructions (both are fully editable and deletable by user). |
| **Section** | 分類 | Category | A flexible grouping within a Page to organize content items. |
| **Cell** | 筆記 | Note | The fundamental, atomic unit of content within a Category. Holds a value and an optional title/key. |
| **Field** | [欄位] | [Field] | A Cell with a non-empty title/key, optimized for structured form-filling and key-value copying. |
| **Jot** | [隨筆] | [Jot] | A Cell with no title/key, representing an unstructured, timestamped plain text memo or quote. |
| **Quick Capture** | 新增筆記 | New Note | The fast in-page palette (`Alt+N`) or top action button to instantly record notes. |
| **Edit Note** | 編輯筆記 | Edit Note | Modifying the title or content of an existing note via modal (`EditNoteModal`). |
| **Batch Manage** | 批次管理 | Batch Manage | Multi-item selection mode allowing bulk deletion across pages, categories, and notes. |
| **Cell Key** | 筆記名稱 | Note Title | The optional structured label for a note (e.g., Phone, Email, Address). |
| **Cell Value** | 筆記內容 | Note Content | The primary payload of the note. |
| **Domain Binding** | 網域綁定 | Domain Binding | Domain patterns associated with a Page for automatic prioritization. |
| **Section Extraction** | 升格為獨立一頁 | Promote to Standalone Page | Elevating an existing Category into an independent top-level Page. |
| **Move Note** | 移動筆記 | Move Note | Re-filing a note to another Page and Category. |

---

## Canonical Language Rules

### Avoided Terms (需避免的非標準詞彙)
- For **Page**: Avoid `分頁`, `Tab`, `Document`, `Sheet`, `Session`
- For **Section**: Avoid `分區`, `區段`, `Block`, `Group`
- For **Cell**: Avoid `單元項`, `筆記單元`, `筆記項目`, `Item`, `Property`
- For **Quick Capture**: Avoid `快速捕獲`, `快速擷取` (UI buttons and prompts use `新增筆記` / `New Note`)
- For **Batch Manage**: Avoid `多選`, `批次選取`, `批量操作` (Use `批次管理` / `Batch Manage`)
- For **Dialog/Modal**: Avoid `彈窗`, `Prompt`, `Popup`

---

## Standard UI Phrases & Feedback (標準互動與提示詞彙)

### Actions & Tooltips (按鈕與懸停提示)
- Main Action Button: `+ 新增筆記` / `+ New Note`
- Add Page (Tab Bar): `+` (Tooltip: `新增一頁` / `New Page`)
- Add Category (Page Title Banner): `+` (Tooltip: `新增分類` / `New Category`)
- Add Note (Category Header): `+` (Tooltip: `新增筆記` / `New Note`)
- Copy Card: `點擊複製` / `Click to copy`
- Copy Button State: `複製` / `Copy` (Uncopied), `已複製` / `Copied` (Copied)
- Category Menu: `升格為獨立一頁` / `Promote to Standalone Page`, `刪除分類` / `Delete Category`

### Placeholders & Empty States (輸入提示與空狀態)
- Search Input Placeholder: `搜尋筆記...` / `Search notes...`
- Search Empty Results: `查無符合的筆記內容` / `No matching notes found`
- Empty Category: `分類中無筆記，點擊右上角「+」新增` / `No notes in this category. Click "+" to add.`
- Empty Page: `還沒開始筆記，點擊右上角「+」新增` / `No notes yet. Click "+" to start.`
- Note Title Placeholder: `筆記名稱 (選填)` / `Note Title (Optional)`
- Note Content Placeholder: `筆記內容 (必填)` / `Note Content (Required)`

### Toast Notifications (狀態通知)
- Copy: `已複製內容` / `Content copied`
- Create Page: `已新增一頁「{標題}」` / `Created page "{title}"`
- Create Category: `已新增分類「{標題}」` / `Created category "{title}"`
- Delete Note: `已刪除筆記` / `Note deleted` (or `已刪除筆記「{名稱}」` / `Deleted note "{title}"`)
- Delete Category: `已刪除分類「{標題}」` / `Deleted category "{title}"`
- Move Note: `已移動筆記至「{目標頁} > {目標分類}」` / `Moved note to "{targetPage} > {targetCategory}"`
- Promote Category: `已升格為獨立一頁「{標題}」` / `Promoted to standalone page "{title}"`
- Bind Domain: `已綁定「{網域}」至此頁` / `Bound "{domain}" to this page`
