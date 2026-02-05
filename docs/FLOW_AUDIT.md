# Email Builder — Flow Audit (MVP + Missing vs Reference)

This checklist is the source of truth for what we support and what we still need.

Legend:
- ✅ Implemented
- 🟡 Partial
- ❌ Missing
- 🧪 Covered by CI tests

## 0) Navigation / Shell
- ✅ Home page exists
- ✅ Login page exists
- ✅ Templates page exists
- 🟡 Editor page layout matches reference (3-pane) (still needs sticky topbar + name edit)

## 1) Auth
- ✅ Google OAuth via Supabase
- ✅ Redirect URL config documented
- 🟡 Domain locking / consistent prod domain (can regress if misconfigured)
- ❌ Team/workspace concept (currently per-user + per-template sharing)

## 2) Templates (CRUD)
- ✅ Create template
- ✅ Rename template
- ✅ Delete template
- ✅ List My templates
- ✅ List Shared-with-me
- ❌ Search/filter templates
- ❌ Template duplication

## 3) Editor — elements + drag/drop
- ✅ Elements panel with categories
- ✅ Collapsible categories (accordion)
- ✅ Drag & drop blocks into canvas (BlockManager)
- ✅ Basic blocks (text, heading, button, image placeholder, divider, spacer)
- ✅ Layout blocks (section/container/2-col/3-col)
- ✅ Social row block
- 🟡 Advanced HTML block (placeholder only)
- ❌ Email-specific blocks (hero/header/footer/CTA/etc.)
- ❌ Saved blocks / reusable sections

## 4) Editor — preview + responsive
- ✅ Desktop/Mobile device toggle
- ✅ Preview mode
- ❌ Monitor/tablet breakpoints
- ❌ In-editor preview for email width presets (600/700/920)

## 5) Editor — save/version history
- ✅ Save creates new version
- ✅ Version list (basic)
- ❌ Restore version / load a previous version
- ❌ Autosave toggle + indicator (like reference)
- ❌ Draft vs published

## 6) Sharing / Permissions
- ✅ Share by email (requires recipient signed in once)
- ✅ Viewer vs Editor roles
- ✅ RLS prevents unauthorized writes (fixed recursion issues)
- ❌ Pending invites (share before recipient signs in)
- ❌ Share link (token) option

## 7) Assets / Images
- ❌ Supabase Storage bucket integration
- ❌ Upload image from UI
- ❌ Asset library per user/workspace

## 8) Export
- ✅ Copy HTML
- ❌ Download HTML file
- ❌ Inline CSS / email-client compatibility pass

## 9) Testing (CI)
- ✅ Unit tests (Vitest + RTL)
- ✅ E2E smoke (Playwright demo editor)
- ✅ E2E elements accordion guard
- ✅ Visual regression (lenient) snapshots
- ✅ RLS integration test scaffold
- ❌ Full auth+templates+save+share E2E against staging (recommended)

## Next priorities (recommended)
1) Sticky editor topbar + template name edit + autosave indicator (reference match)
2) Email-specific blocks set
3) Supabase Storage image upload
4) Saved blocks
5) Version restore
