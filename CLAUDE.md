# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Admin console for **Temploy**, a freelance marketplace (freelancers + clients, Bangladesh-focused: BDT, bKash/Nagad). Next.js 16 App Router, React 19, MUI v7 (Emotion), JavaScript only (no TypeScript). The backend API is **mostly not wired up yet**: login, **Banners**, **Countries**, **Currencies**, **Languages**, **Users** (list + `/users/[id]` details), **Jobs** (list + `/jobs/[id]` details), **Orders** (bookings: list + `/orders/[id]` with tracker and timeline), **Transactions** (wallet ledger: list + details drawer), **Withdrawals** (list + details drawer, approve / reject / mark paid / failed), **Categories** (list + `/categories/[id]` details with its subcategories) , **Subcategories**, **Skills**, **Payout methods** (list + add) and **Employees** (list + add + suspend/activate, `/employees/[id]` details with the access matrix, Edit / Delete and a "Show deleted" list for Super admins only via `GET auth/employee/profile`), **Roles** (`/employees/roles`: list, permission matrix save, new / rename / delete via `admin/roles*`; matrix rows from `admin/permission-modules`) and **Permission areas** (`/employees/permission-areas`: list, add / edit / switch off / delete for Super admins) use the real API (calls in `src/utils/services/api/*Service.jsx`); every other screen runs on deterministic mock data with local-state actions. To wire another page, copy `(admin)/countries/page.jsx`: `useApiList(fetcher, toRow)` + `ApiListFallback` (`components/common/ApiList.jsx`) to load, `ResourcePage` with the form's async `onSave` / `onDelete` hooks, `RemoteSwitch` (cells.jsx) for toggles that save, and `getErrorMessage` (`utils/services/api/apiError.js`) for toasts. For a details page or a dialog outside `ResourcePage`, reuse `Facts` (`components/common/Facts.jsx`) and `FormField` (exported from `ResourcePage.jsx`; `components/common/FormDialog.jsx` wraps it). Show API timestamps with `formatLocalDate` (viewer's zone), not `formatDate` (mock date-only strings).

## Commands

```bash
npm run dev      # next dev --turbopack (http://localhost:3000)
npm run build    # production build; also the main correctness check
npm run start    # serve the production build
npm run lint     # eslint . (flat config; `next lint` no longer exists in Next 16)
```

There is no test suite. Verify changes with `npx eslint src` and `npm run build`. Hydration mismatches can appear **only** against the prerendered production build (`npm run build && npx next start -p <port>`), so check there when touching formatting or data generation. `next start` and `next dev` share `.next/`; don't run `npm run build` while another process depends on a running build.

The middleware file is `src/proxy.js` (Next 16 renamed `middleware` → `proxy`). It redirects to `/auth/login` when the `token` cookie is missing, but only for the paths in its `matcher`. The login page calls `POST auth/employee/login` (`employeeLogin` in `src/utils/services/api/ApiService.jsx`) and stores the returned token in the `token` cookie.

## Architecture

**Routing.** `src/app/(admin)/` is a route group whose `layout.jsx` wraps every admin page in `AdminShell` (sidebar + topbar; the hamburger hides the sidebar on desktop and opens a drawer below `lg`). `src/app/auth/login` sits outside it. `src/app/(admin)/[...slug]/page.jsx` is a placeholder for any nav entry without a real page, and it 404s anything not in the nav config.

**Navigation is config-driven.** `src/config/navigation.js` (`NAV_SECTIONS`) is the single source of truth for the sidebar, active-link detection (`findNavItem`, longest-prefix match) and the placeholder pages. Items are links (`href`) or groups (`children`), which render as collapsible second-level menus. Adding a page = add the route folder + an entry here.

**List pages use `ResourcePage`.** Most screens (jobs, offers, orders, skills, transactions, withdrawals, reports, disputes, categories, subcategories, currencies, countries, languages, employees) are thin configs over `src/components/common/ResourcePage.jsx`. Its doc comment is the API reference: `columns`, `stats`, `tabs`, `search`, `filters`, `rowActions(row, api)`, `detail` (side drawer), and `form` (gives Add/Edit/Delete dialogs; `canDelete(row)` can hide Delete). Rows live in local state seeded from mock data; `api.update/remove/create/confirm` mutate that state and fire toasts. When the backend lands, these are the calls to replace with requests. Use `src/app/(admin)/jobs/page.jsx` as the reference page. Shared cell renderers are in `src/components/common/cells.jsx`.

Custom pages that don't use it: dashboard (`(admin)/page.jsx`), `analytics`, `users`, and `employees/roles` (permission matrix). `ResourcePage` also takes `onRowClick(row)` (open a details page instead of the drawer) and `form.canEdit(row)`; `FormField` supports `email` / `password` types and `{ value, label }` select options. `employees`, `employees/roles` and `employees/permission-areas` share `components/team/TeamNav.jsx`.

**Status chips.** `components/common/StatusChip.jsx` maps status strings → palette tones in `TONES`. Any new status label must be added there, or it renders as a neutral grey chip.

**Mock data** is in `src/data/*.js` (`marketplace`, `finance`, `moderation`, `settings`, `team`, `analytics`, plus `mock.js` for the dashboard/users). It must stay deterministic: index-based generation, dates via `daysAgo(n)` relative to the fixed mock "today" (2026-11-04), and no `Math.random()`/`Date.now()`, because pages are prerendered and hydration would break. `doc/` holds the planned MongoDB schema (`db-schema.md`, `user type.md`); mock shapes loosely follow it.

**Server/client boundary.** Most pages are `"use client"`. `(admin)/page.jsx` (dashboard) is a Server Component: it can pass icons to client components only as rendered elements (`<LuWallet />`), not component references or functions.

**Formatting.** Use `src/helper/format.js` (`formatStat`, `formatCurrency`, `formatDate`, …). Don't use `Intl.NumberFormat` with `notation: "compact"`: Node and Chrome format it differently (`$10K` vs `$10.0K`), which caused production hydration errors. `formatStat` has a hand-rolled compact formatter for that reason.

## Styling

- **Theme:** `src/theme/theme.js` uses MUI with `cssVariables: true` and is **light mode only**. Components read colors via `theme.vars.palette.*` (`palette.chart.*` is a custom data-viz palette). Brand: green primary `#2e7d32`, dark-green secondary; fonts are Poppins (headings) and Roboto (body), loaded with `next/font` in `app/layout.jsx` as `--font-display` / `--font-body`.
- **Claymorphism:** the visual style. Shadow recipes and the page/paper colors are tokens in `src/theme/clay.js` (`clay.card`, `clay.raised`, `clay.pressed`, `clay.tinted(rgb)`, `clayRgb`, `bg`, `paper`, `ink`). Reuse these instead of writing new shadows. Changing the background means updating `bg`, `paper` and `ink` together. `bg` is currently semi-transparent, so overlays (drawers, etc.) should use `background.paper`.
- **CSS layers:** MUI styles render inside `@layer mui` (`enableCssLayer`). Unlayered CSS beats any layered CSS, so global resets in `src/app/globals.css` must stay inside `@layer base` (declared before `mui`). Otherwise rules like `a { color: inherit }` override MUI components rendered as links.
- Icons come from `react-icons/lu` (Lucide). Toasts use `react-toastify` (`toast.success`, …; container in `app/layout.jsx`).

## Conventions

- **Imports:** use the `@/*` alias for `src/*` (see `jsconfig.json`).
- **Folder names:** lowercase (`src/components`, `src/helper`). The repo sits on an NTFS drive (case-insensitive), so case-only renames need a two-step `git mv` through a temp name.
- **API base URL:** `NEXT_PUBLIC_API_BASE_URL` in `.env`. The previous fetch helpers (`src/Helper/HttpRequestHelper.jsx`, Bearer token from the `token` cookie) were removed and are in git history (e.g. commit `dc220b5`) for reference when connecting the API.
