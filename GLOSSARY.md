# Notebook Extension Domain Model (筆記本擴充應用領域模型)

This document defines the ubiquitous language for the Notebook browser extension. It establishes canonical terminology to be used consistently across UI, code, and documentation.

## Language

### Core Entities (核心實體)

**Notebook (筆記本)**:
The root extension application and entire user workspace containing all Pages, settings, and storage state.
_Avoid_: App, Workspace, System, Note

**Page (筆記頁)**:
A discrete thematic document or workspace tab (e.g., "104 中文經歷", "社交貼文草稿") that belongs to a Notebook and binds to target web domains.
_Avoid_: Note, Tab, Document, Sheet, Session

**Global Page (全域筆記頁 / 全域頁)**:
The single, system-created, non-deletable Page that applies universally across all domains as a default and scratchpad fallback.
_Avoid_: Global Notes, Master Page, Common Page, Default Note

**Section (分區 / 區段)**:
A typed sub-grouping within a Page used to organize content. A Section is strictly typed as either a `FieldsSection` (structured key-values) or a `JotsSection` (chronological plain text entries).
_Avoid_: Category, Block, Group, Session

**Field (欄位)**:
A single structured key-value pair within a `FieldsSection`, requiring a mandatory key name (`key`) and string value (`value`) optimized for one-click copying.
_Avoid_: Property, Attribute, Item, KeyValue

**Jot (隨筆)**:
An unstructured, keyless, timestamped plain text entry captured quickly into a `JotsSection` or Global Page.
_Avoid_: Memo, Scratchpad, QuickNote, Snippet

### Association & Resolution (關聯與解析)

**Domain Binding (網域綁定)**:
A list of domain patterns (e.g., `["x.com", "threads.net", "facebook.com"]`) defined directly on a Page, dictating when that Page is pinned and prioritized.
_Avoid_: Domain Rule, URL Matcher, Host Table

**Active Page Resolution (作用中筆記頁解析)**:
The deterministic logic prioritizing a domain-matched Page when available, falling back to Global Page only when no domain matches.
_Avoid_: Auto Select, Fallback Logic

**Smart Domain Binding (智慧網域綁定)**:
A one-click action from search results or page view to associate the active tab's domain directly to a target Page without manual configuration.
_Avoid_: Auto Link, Host Connect

**Section Extraction (分區升格)**:
An operation that converts an existing Section within a Page into an independent, top-level Page.
_Avoid_: Move Section, Detach Block

### User Interfaces & Interactions (介面與互動)

**Side Panel (側邊欄)**:
The persistent Chrome native side panel used as the primary interface for browsing Pages, switching Page Tabs, viewing Sections/Fields/Jots, and executing one-click copy.
_Avoid_: Sidebar, Drawer, Popup

**Omni-Search (全域穿透搜尋)**:
A real-time search interface within the Side Panel querying across all Pages, Sections, Fields, and Jots, supporting direct one-click copy from result items.
_Avoid_: Local Filter, Quick Find

**Quick Capture Modal (快速擷取框)**:
A lightweight floating modal summoned in-page via keyboard shortcut (`Alt+N`) or context menu to rapidly input a Jot or a named Field without breaking browsing flow.
_Avoid_: Prompt, Dialog, Spotlight

**One-Click Copy (一鍵複製)**:
The interaction of clicking a Field's value to instantly copy it to the clipboard with visual confirmation feedback ("已複製!").
_Avoid_: Form Injection, Auto-fill
