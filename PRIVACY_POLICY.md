# Privacy Policy for ClipNote / ClipNote 隱私權政策

*Last Updated: 2026-10-29*

---

> ### 📌 How to Publish this to GitHub Gist (如何將此政策發布為公開 URL)
> 1. 前往 [GitHub Gist](https://gist.github.com/)（登入您的 GitHub 帳號）。
> 2. 「Gist description」填寫：`ClipNote Chrome Extension Privacy Policy`。
> 3. 「Filename including extension」填寫：`privacy-policy.md`。
> 4. 將下方分隔線以後的內容完整複製貼入編輯區。
> 5. 點擊右下角綠色按鈕 **「Create public gist」**。
> 6. 複製瀏覽器網址列的 Gist 網址（例如 `https://gist.github.com/<your-username>/<gist-id>`），即可直接作為 Chrome Web Store 開發者後台的「Privacy Policy URL」！

---

## English Version

### 1. Overview
**ClipNote** is a lightweight, privacy-first, and domain-aware browser notepad extension designed to help users quickly jot down notes, copy frequently used fields, and organize web clippings directly within Chrome's native Side Panel.

We are committed to protecting your privacy. ClipNote operates on a strict **zero-data-collection** principle: we do not collect, transmit, sell, or share any personal information or browsing activities.

### 2. Data Storage and Local Processing
- **100% Local Storage**: All your notes, categories, pages, domain associations, and preferences are stored exclusively on your local device using Chrome's native `chrome.storage.local` API.
- **No Remote Servers**: ClipNote does not operate any remote backend servers, analytics endpoints, tracking beacons, or telemetry services.
- **No Cloud Synchronization**: Your data never leaves your browser unless you explicitly choose to export it via the built-in "Export JSON" feature.

### 3. Permissions Used and Justification
ClipNote requests only the minimum set of permissions necessary to deliver its core functionality:
- **`storage`**: Required to save and persist your notes, pages, and categories locally on your device.
- **`sidePanel`**: Required to display the notebook interface within the Chrome Side Panel.
- **`tabs` & `activeTab`**: Required solely to read the current tab's hostname/domain in the foreground. This allows ClipNote to automatically switch to the matching page (e.g., displaying your job application notes when visiting `104.com.tw`). URLs and page contents are processed strictly in local memory and are never logged, stored, or transmitted.
- **`contextMenus`**: Required to provide the right-click "新增筆記 (Add note)" shortcut when highlighting text on any webpage.

### 4. Third-Party Services & Tracking
ClipNote contains:
- **NO** third-party trackers or analytics SDKs (e.g., Google Analytics, Mixpanel).
- **NO** advertising networks.
- **NO** external API calls or outbound network requests.

### 5. User Data Ownership and Deletion
You retain complete ownership and control over your data:
- You can export all your notes at any time via the JSON export tool.
- You can edit or delete individual notes, categories, or pages at any time.
- Uninstalling the extension will automatically remove all locally stored data created by ClipNote.

### 6. Changes to this Policy
If we update this Privacy Policy in the future, changes will be published directly to this page and documented in extension release notes.

---

## 中文版（繁體中文）

### 1. 簡介與承諾
**ClipNote** 是一款極簡、感知網域的個人備忘與快速填表 Chrome 擴充功能，旨在協助使用者在瀏覽器側邊欄（Side Panel）中高效率記錄隨筆、整理結構化欄位並提供一鍵複製。

我們極度重視您的個人隱私。ClipNote 秉持**「零資料收集」**的嚴格原則：我們不會收集、上傳、追蹤、分享或販售您的任何個人資訊或瀏覽活動。

### 2. 資料儲存與本機運作
- **100% 本機儲存**：您建立的所有筆記、頁面、分類、綁定網域與偏好設定，均透過 Chrome 官方提供的 `chrome.storage.local` 儲存於您的本機裝置中。
- **無雲端伺服器**：ClipNote 沒有建置任何後端伺服器、數據分析系統（Analytics）或追蹤端點（Telemetry）。
- **完全離線可用**：除 Chrome 擴充功能自我更新外，您的資料絕不會離開您的本機瀏覽器。

### 3. 所需權限與具體用途說明
ClipNote 遵循最小權限原則，僅申請實現核心功能不可或缺的權限：
- **`storage`（本機儲存）**：用於在您的電腦本機讀寫與持久化筆記資料。
- **`sidePanel`（側邊欄）**：用於在 Chrome 原生側邊欄中渲染筆記本介面。
- **`tabs` 與 `activeTab`（分頁網域識別）**：僅在前景即時讀取目前活躍分頁的網域名稱（Hostname），以實現切換分頁時自動顯示該網站對應筆記本（例如開啟 104 人力銀行時自動切換至求職筆記頁面）。網址僅於本機記憶體即時比對，絕不上傳或留存記錄。
- **`contextMenus`（右鍵選單）**：用於在網頁上選取文字時，提供「新增筆記」右鍵快捷搜刮功能。

### 4. 第三方服務與廣告
ClipNote **完全不含**任何第三方數據分析工具、追蹤代碼或廣告 SDK，亦不會在背景發起任何外部網路連線。

### 5. 使用者資料自主權與刪除
- 您隨時可透過「匯出 JSON」功能備份或遷移您的所有資料。
- 您可以隨時手動修改、刪除任何筆記、分類或頁面。
- 若解除安裝本擴充功能，Chrome 將自動清除所有儲存於本機的 ClipNote 筆記資料。

### 6. 隱私權政策變更
本隱私權政策若有任何修訂，將即時更新於此頁面，並於擴充功能更新日誌中清楚標示。

### 7. 聯絡方式
若您對 ClipNote 的隱私權政策有任何疑問或建議，歡迎透過 GitHub 專案儲存庫提出 Issue 或與開發者取得聯繫。
