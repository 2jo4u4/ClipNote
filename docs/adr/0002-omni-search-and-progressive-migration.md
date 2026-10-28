# 0002: Omni-Search and Progressive Migration

## Context & Decision

New users initially accumulate unstructured notes and fields exclusively inside the system `Global Page`. As their collection grows and they visit new domains, they need mechanisms to organize data without complex setup upfront, and find data regardless of which domain they currently browse.

We decided to implement:
1. **Omni-Search Across All Pages**: The Side Panel search bar queries the entire Notebook (all Pages, Sections, Fields, and Jots) with direct One-Click Copy on search hits.
2. **Smart Domain Binding**: Users can attach the active domain to any discovered Page with one click directly from search results.
3. **Progressive Migration via Section Extraction**: Sections can be promoted directly into top-level Pages ("Extract Section to Page"), supporting a natural transition from an initial catch-all Global Page to specialized domain-bound Pages.
