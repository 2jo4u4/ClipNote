# ClipNote - Chrome Web Store 上架資料指南 (Store Listing Kit)

本文件整理了上架 **ClipNote** 至 [Chrome 線上應用程式商店開發者資訊主頁 (Chrome Web Store Developer Dashboard)](https://chrome.google.com/webstore/devconsole) 所需的所有表單文字、審查申報範本與截圖規範。

---

## 1. 基本資訊 (Basic Information)

| 欄位名稱 (Field) | 英文建議填寫 (English Recommended) | 繁中建議填寫 (Traditional Chinese) | 限制與注意事項 |
| :--- | :--- | :--- | :--- |
| **擴充功能名稱 (Name)** | `ClipNote` | `ClipNote` | 上限 45 半形字元 |
| **簡短說明 (Summary)** | `Lightweight, domain-aware scratchpad and quick form-filling notepad for Chrome.` | `輕量、感知網域的個人備忘與快速填表 Chrome 擴充功能` | 上限 132 半形字元 |
| **主要類別 (Category)** | `Productivity` | `生產力` | 推薦分類 |
| **定價 (Pricing)** | `Free` | `免費` | 無內購、無廣告 |
| **預設語言 (Default Language)** | `English` (或 `繁體中文`) | `繁體中文` (或 `English`) | 後台可設置多語系獨立說明 |
| **隱私權政策 (Privacy Policy URL)** | 您的 GitHub Gist 公開網址（請參閱 [`PRIVACY_POLICY.md`](file:///d:/project/note-ext/PRIVACY_POLICY.md)） | 必填欄位 |

---

## 2. 商店詳細說明 (Detailed Description)

### 2.1 英文版 (English Version - Ready to Copy & Paste)

```markdown
ClipNote is a lightweight, domain-aware scratchpad and quick form-filling notepad built directly into Chrome's native Side Panel.

Designed for job seekers, developers, content creators, and power users who frequently reference repetitive snippets or fill out web forms. As you navigate between browser tabs, ClipNote intelligently detects the active website and instantly switches to your domain-specific notebook page. With one-click full copy, flexible note structures, and an elegant warm minimalist aesthetic, your daily web workflows stay fast and frictionless.

────────────────────────
✨ KEY FEATURES
────────────────────────

1. 🌐 Domain-Aware Page Switching
• Browsing job boards (LinkedIn, 104, Indeed), developer portals (GitHub, AWS, Stack Overflow), or social platforms?
• ClipNote automatically identifies the active domain and presents the exact notes, credentials, templates, and profile snippets associated with that site.
• Say goodbye to hunting through external apps or cluttered text documents.

2. ⚡ One-Click Copy & Quick Paste
• Single-click any note card to instantly copy 100% of its content to your clipboard, complete with subtle haptic-like visual feedback.
• Dramatically accelerates job applications, repeated form submissions, customer support replies, and social media posting.

3. 🚀 Quick Capture Anywhere (Alt + N)
• Press Alt + N on any webpage to bring up the instant capture overlay. Search existing notes or record fresh ideas without losing your focus.
• Highlight text on any page and right-click "新增筆記" to clip highlighted text directly into ClipNote with source attribution.

4. 📁 Structured Fields & Free-form Jots
• Supports structured "Fields" (Key-Value pairs like Phone, Email, Address, Portfolio links) and unstructured "Jots" (free-flowing plain text memos and code snippets).
• Organize content into custom Categories, with one-click "Collapse All / Expand All" and batch selection management.

5. 🔒 100% Local Storage & Extreme Privacy
• All your notes, categories, pages, and settings are stored strictly on your local device (chrome.storage.local).
• Zero external servers, zero background telemetry, zero trackers, and 100% functional offline.

────────────────────────
⌨️ KEYBOARD SHORTCUTS
────────────────────────
• Alt + S: Open or close the ClipNote side panel
• Alt + N: Trigger Quick Capture / search notes overlay
• Ctrl + Enter: Quickly save and submit note modal
• Esc: Dismiss modals or exit batch selection mode

────────────────────────
💡 POPULAR USE CASES
────────────────────────
• 【Job Hunting & Resumes】: Keep tailored cover letters, intro blurbs, portfolio URLs, and project summaries ready for single-click pasting into applicant tracking systems.
• 【Research & Note-Taking】: Clip quotes, code examples, technical documentation references, and literature snippets on the fly.
• 【Developer Workflows】: Store local terminal commands, environment variable names, API keys for staging, and quick regex patterns.
• 【Social & Creator Work】: Maintain bio links, recurring post formats, hashtags, and draft ideas right alongside your browser.
```

---

### 2.2 繁體中文版 (Traditional Chinese Version - Ready to Copy & Paste)

```markdown
ClipNote 是一款極簡、高質感且具備「網域感知」能力的瀏覽器側邊欄筆記本。

專為頻繁需要填表、投遞履歷、整理網頁片段或暫存常用資訊的使用者設計。當您在不同瀏覽器標籤頁間切換時，ClipNote 會自動識別當前網站並切換至該網站專屬的筆記頁，並提供「一鍵複製」與全域快速記錄能力，讓您的工作流程行雲流水。

────────────────────────
✨ 核心亮點功能
────────────────────────

1. 🌐 網域感知（Domain Awareness）
• 當您瀏覽 104 人力銀行、GitHub、LinkedIn 等網站時，側邊欄會即時自動切換至該網域綁定的專屬頁面。
• 告別在雜亂記事本中反覆翻找特定網站常用帳號、常用履歷段落或個人資料的困擾。

2. ⚡ 一鍵複製（One-Click Fast Copy）
• 點擊任何筆記卡片，完整文字立即複製至剪貼簿，並伴隨細緻觸感回饋。
• 求職投履歷、填寫線上表單、社群發文一氣呵成，效率倍增。

3. 🚀 快捷全域記錄（Quick Capture）
• 按下 Alt + N 即可在任何網頁浮層喚起搜尋與新增面板，輸入筆記不中斷工作流。
• 網頁選取文字時，點擊滑鼠右鍵選單「新增筆記」，自動帶入選取內文與來源網址。

4. 📁 結構化欄位與隨筆管理
• 同時支援具備標題的「欄位（Field，適用結構化 Key-Value）」與無標題的「隨筆（Jot，適用純文字備忘）」。
• 提供分類一鍵全部折疊／展開，以及靈活的多選批次管理功能。

5. 🔒 100% 本機儲存，極致隱私
• 所有筆記完全儲存在您的電腦本機（chrome.storage.local）。
• 零伺服器傳輸、零數據分析追蹤、完全離線可用。

────────────────────────
⌨️ 常用鍵盤快捷鍵
────────────────────────
• Alt + S：開啟／關閉 ClipNote 側邊欄
• Alt + N：開啟全域新增筆記／快速搜尋面板
• Ctrl + Enter：快速儲存並提交表單
• Esc：關閉對話框或退出批次管理模式

────────────────────────
💡 推薦使用場景
────────────────────────
• 【求職應徵】：紀錄各求職網站的自我介紹、作品集連結、專案經歷，填表時一鍵貼上。
• 【研究採集】：瀏覽技術文檔、論壇或論文時，右鍵快速採集關鍵段落與來源連結。
• 【開發運維】：暫存伺服器指令、環境變數名稱、API 測試範例片段。
• 【日常社群】：預備常用發文模板、Emoji 組合與 Hashtag 列表。
```

---

## 3. 權限合規申報範本 (Permission Justification for Google Reviewers)

在提交審核時，後台「隱私權宣告（Privacy）」會要求針對擴充功能申請的權限提供「用途合理性說明」。請直接將下列文字貼入各對應權限的說明欄：

### (1) `tabs` 權限用途申報
```text
The "tabs" permission is strictly required to detect the active tab's hostname in the foreground (e.g. 104.com.tw, github.com) so ClipNote can automatically display the user's domain-specific notebook page. Tab URLs are matched in local memory only. ClipNote never logs, stores, or transmits browsing history or URLs to any external server.
```

### (2) `storage` 權限用途申報
```text
The "storage" permission is used to persist user-created notes, pages, categories, and theme settings locally on the user's device using chrome.storage.local. No data leaves the local browser.
```

### (3) `sidePanel` 權限用途申報
```text
The "sidePanel" permission is used to render ClipNote's core notepad user interface inside Chrome's native side panel companion view, allowing users to reference their notes alongside active web pages.
```

### (4) `contextMenus` 權限用途申報
```text
The "contextMenus" permission is used to provide a right-click context menu action ("新增筆記") on highlighted text, enabling users to quickly capture snippets directly from webpages into ClipNote.
```

### (5) 單一用途聲明 (Single Purpose Statement)
```text
ClipNote serves a single, dedicated purpose: providing a lightweight, domain-aware scratchpad and note-taking tool embedded in Chrome's native side panel for quick reference and one-click copy.
```

---

## 4. 宣傳截圖規格指南 (Screenshots Guide)

Chrome 商店要求至少 1 張、建議上傳 4~5 張高解析截圖。
- **解析度**：固定為 **1280 x 800** 或 **640 x 400** 像素（PNG 或 JPEG，不能有黑邊裁切）。
- **建議拍攝 4 張核心情境**：

1. **截圖 1：網域感知與側邊欄連動（主視覺）**
   - *畫面*：瀏覽器左側開啟求職網站（如 104 人力銀行），右側 ClipNote 側邊欄自動顯示「求職履歷」專屬頁與各結構化欄位（自我介紹、專案經驗）。
   - *文字標籤*：`隨瀏覽網站自動切換專屬筆記本` / `Domain-Aware Notes, Auto-Switching`

2. **截圖 2：快捷記錄浮層 (Quick Capture)**
   - *畫面*：網頁中央顯示 Alt + N 喚起的乾淨 Quick Capture 對話框，展示即時搜尋結果與「新增筆記」欄位。
   - *文字標籤*：`隨處按下 Alt+N，快速搜尋與即時記錄` / `Quick Capture Anywhere via Alt+N`

3. **截圖 3：極簡黑夜風格與一鍵複製**
   - *畫面*：側邊欄處於黑夜模式（Charcoal Dark + Amber），滑鼠懸停於卡片上呈現細緻點亮，顯示「已複製！」Toast 提示。
   - *文字標籤*：`極簡黑夜風格，一鍵點擊立即複製` / `Warm Minimalist Design, One-Click Copy`

4. **截圖 4：批次管理與一鍵折疊**
   - *畫面*：展示分類標題列的多選核取方塊，以及頂部 Chevrons 一鍵折疊所有分類的收合效果。
   - *文字標籤*：`一鍵折疊分類，靈活批次管理` / `One-Click Collapse All & Batch Management`

---

## 5. 打包上傳操作步驟 (Packaging & Upload)

專案已配置好自動化打包腳本：

1. **執行打包指令**：
   ```bash
   cmd.exe /c "npm run zip"
   ```
2. **取得打包檔案**：
   打包完成後，WXT 會在專案目錄下生成：
   `.output/clipnote-1.0.0-chrome.zip`
3. **上傳至 Chrome 開發者後台**：
   - 登入 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)。
   - 點擊「新增項目 (New Item)」，將 `.output/clipnote-1.0.0-chrome.zip` 拖曳上傳。
   - 依據本文件第 1~4 節填寫名稱、說明、隱私權網址、權限聲明與上傳 1280x800 截圖。
   - 點擊「提交審查 (Submit for Review)」，通常在 1~3 個工作天內即可通過上架！
