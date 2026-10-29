# Privacy Policy for ClipNote

*Last Updated: 2026-10-29*

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
- **`tabs` & `activeTab`**: Required solely to read the current tab's hostname/domain in the foreground. This allows ClipNote to automatically switch to the matching page (e.g., displaying your job application notes when visiting `example.com`). URLs and page contents are processed strictly in local memory and are never logged, stored, or transmitted.
- **`contextMenus`**: Required to provide the right-click "New Note" shortcut when highlighting text on any webpage.

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

### 7. Contact
If you have any questions or suggestions regarding this Privacy Policy, please open an issue on the project's GitHub repository or contact the developer.
