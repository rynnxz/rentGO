# Comprehensive Loading States Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add semantic, accessible, and responsive loading indicators (spinners, indeterminate progress bars, skeleton loaders, and granular per-action button/row states) across all three RentGo Medan surfaces (`landing`, `book`, `admin`) and shared components.

**Architecture:** Build reusable loading primitives in `src/components/ui/loading.tsx` backed by native `<progress>` CSS in `src/app/globals.css` (following `modern-web-guidance` for `spinner` and `progress`), add route-level `loading.tsx` boundaries for Next.js App Router transitions, and wire action-specific pending states across all client components that call server APIs or trigger navigation.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, Vitest.

---

### Task 1: Reusable Loading Primitives & Modern CSS (`src/components/ui/loading.tsx` & `src/app/globals.css`)

**Files:**
- Modify: `website/src/app/globals.css`
- Create: `website/src/components/ui/loading.tsx`
- Test: `website/tests/unit/loading-ui.test.ts`

- [x] **Step 1: Add CSS rules for `progress.loading-spinner` and `progress.loading-bar` in `website/src/app/globals.css`**
- [x] **Step 2: Create `website/src/components/ui/loading.tsx` with `LoadingSpinner`, `LoadingBar`, `LoadingStatusBanner`, `CatalogCardSkeleton`, and `TableRowsSkeleton`**
- [x] **Step 3: Add unit test in `website/tests/unit/loading-ui.test.ts` and verify it passes**

### Task 2: Route-Level Loading Boundaries (`loading.tsx`)

**Files:**
- Modify: `website/src/app/loading.tsx`
- Create: `website/src/app/site/book/loading.tsx`
- Create: `website/src/app/site/book/vehicles/[id]/loading.tsx`
- Create: `website/src/app/site/book/bookings/loading.tsx`
- Create: `website/src/app/site/book/bookings/[id]/loading.tsx`
- Create: `website/src/app/site/admin/loading.tsx`

- [x] **Step 1: Upgrade `website/src/app/loading.tsx` and create surface-specific `loading.tsx` files**

### Task 3: Landing & Shared Components Loading States

**Files:**
- Modify: `website/src/components/shared/auth-controls.tsx`
- Create: `website/src/components/landing/hero-search-form.tsx`
- Modify: `website/src/app/site/landing/page.tsx`
- Modify: `website/src/components/shared/pickup-map.tsx`

- [x] **Step 1: Add action-specific loading states (`google`, `email`, `logout`) and dialog `LoadingStatusBanner` in `auth-controls.tsx`**
- [x] **Step 2: Create `HeroSearchForm` client component with submit loading state and wire into `landing/page.tsx`**
- [x] **Step 3: Update `pickup-map.tsx` to use `LoadingSpinner` for dynamic import and geolocation**

### Task 4: Customer Booking Surface Loading States

**Files:**
- Modify: `website/src/components/book/catalog-view.tsx`
- Modify: `website/src/components/book/vehicle-checkout-view.tsx`
- Modify: `website/src/components/book/booking-detail-client.tsx`
- Modify: `website/src/components/book/profile-form.tsx`

- [x] **Step 1: Add date-fetch skeleton/overlay, AI recommendation skeleton (`data-testid="ai-loading-skeleton"`), and vehicle card CTA navigation spinner in `catalog-view.tsx`**
- [x] **Step 2: Add checkout submission banner, button spinner, and fieldset lock in `vehicle-checkout-view.tsx`**
- [x] **Step 3: Separate `simulatingPayment` and `uploadingProof` states, add QRIS card loading overlay, and add cancel booking spinner in `booking-detail-client.tsx`**
- [x] **Step 4: Add `LoadingBar` and submit button `LoadingSpinner` in `profile-form.tsx`**

### Task 5: Granular Action Loading States in All 5 Admin Managers

**Files:**
- Modify: `website/src/components/admin/bookings-manager.tsx`
- Modify: `website/src/components/admin/vehicles-manager.tsx`
- Modify: `website/src/components/admin/categories-manager.tsx`
- Modify: `website/src/components/admin/maintenance-manager.tsx`
- Modify: `website/src/components/admin/customers-manager.tsx`

- [x] **Step 1: Add per-action `pendingAction` tracking, button spinners, row `aria-busy`, and `LoadingStatusBanner` in `bookings-manager.tsx`**
- [x] **Step 2: Add per-row delete spinner, cloud upload spinner, and modal `LoadingBar` in `vehicles-manager.tsx`**
- [x] **Step 3: Add per-row delete spinner and modal `LoadingBar` in `categories-manager.tsx`**
- [x] **Step 4: Add per-row status/delete spinners and modal `LoadingBar` in `maintenance-manager.tsx`**
- [x] **Step 5: Add per-row role/active toggle spinners and `LoadingStatusBanner` in `customers-manager.tsx`**

### Task 6: Verification, Build, Commit & Push to GitHub

- [x] **Step 1: Run unit tests (`npm test`), typecheck (`npx tsc --noEmit`), and production build (`npm run build`)**
- [x] **Step 2: Commit all changes and push to `origin main`**
