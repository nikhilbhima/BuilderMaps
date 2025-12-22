---
name: perf-check
description: Analyze BuilderMaps for performance issues including unoptimized images, missing dynamic imports, bundle size problems, and Core Web Vitals. Use when optimizing load times, preparing for production, or debugging slow pages.
allowed-tools: Read, Glob, Grep
---

# Performance Check Skill

Identify performance bottlenecks in BuilderMaps - a Next.js 16 application with maps, animations, and dynamic content.

## Instructions

When invoked, perform these performance checks:

### 1. Image Optimization

**Search for unoptimized images:**
```
Pattern: <img src=|<img\s
```

For each image found:
- Flag if NOT using `next/image` component
- Check for missing width/height attributes
- Identify images in `public/` that could be optimized

**Known images to check:**
- `public/icon-*.png` - App icons
- `public/favicon.*` - Favicons
- Any user-facing images in components

### 2. Dynamic Import Analysis

**Check heavy components are dynamically imported:**

| Component | Library | Size | Should Be Dynamic |
|-----------|---------|------|-------------------|
| MapView | Leaflet | ~140KB | Yes (with ssr: false) |
| Animations | framer-motion | ~150KB | Consider for non-critical |

**Verify dynamic import pattern:**
```typescript
import dynamic from 'next/dynamic'
const Component = dynamic(() => import('./Component'), { ssr: false })
```

**Search patterns:**
- `from "leaflet"` - Should NOT appear in regular imports
- `from "framer-motion"` - Check if used in critical path

### 3. Bundle Size Analysis

**Check `package.json` dependencies:**

| Dependency | Approx Size | Action |
|------------|-------------|--------|
| framer-motion | ~150KB | Lazy load if possible |
| leaflet | ~140KB | Must be dynamic (ssr: false) |
| @supabase/supabase-js | ~50KB | Essential, keep |
| react-leaflet | ~30KB | Must be dynamic |

**Look for:**
- Unused dependencies
- Duplicate functionality
- Heavy libraries with lighter alternatives

### 4. Core Web Vitals

**Largest Contentful Paint (LCP):**
- Check hero section in `src/app/page.tsx`
- Verify no render-blocking resources
- Check font loading (`@fontsource/space-grotesk`)

**First Input Delay (FID):**
- Look for heavy JS on initial load
- Check event handlers for expensive operations
- Verify async/defer on external scripts

**Cumulative Layout Shift (CLS):**
- Images without explicit dimensions
- Dynamic content that shifts layout
- Font loading causing FOUT/FOIT

### 5. Code Splitting

**Automatic (Next.js App Router):**
- Route-based splitting is automatic
- Verify no massive shared chunks

**Manual opportunities:**
- Admin pages (`src/app/admin/*`) - Could lazy load
- Modals (NominationModal, LoginModal) - Load on interaction
- Heavy components in city pages

### 6. Data Fetching

**Check for:**
- Client-side waterfalls in `src/app/city/[cityId]/page.tsx`
- Missing caching (React Query, SWR)
- Excessive re-fetching

**Patterns to find:**
- `useEffect` with fetch calls
- `useState` for server data
- Missing loading states

### 7. CSS Analysis

**Check:**
- Tailwind purge working (check build output)
- CSS-in-JS in MapView (styled-jsx)
- Unused utility classes

## Output Format

```
## Performance Audit Report - BuilderMaps

### Score Summary
| Category | Score | Impact |
|----------|-------|--------|
| Images | X/10 | High |
| Dynamic Imports | X/10 | High |
| Bundle Size | X/10 | Medium |
| Core Web Vitals | X/10 | High |
| Code Splitting | X/10 | Medium |
| **Overall** | **X/50** | |

### Critical Issues (High Impact)
1. [Issue with estimated impact]

### Optimization Opportunities
1. [Suggestion with potential improvement]

### Bundle Analysis
| Dependency | Size | Status | Action |
|------------|------|--------|--------|
| leaflet | ~140KB | OK | Already dynamic |
| framer-motion | ~150KB | Check | Consider lazy load |

### Recommended Changes
1. [Specific change with file path]
```

## Key Files to Analyze

- `src/components/MapView.tsx` - Map rendering (Leaflet)
- `src/app/city/[cityId]/page.tsx` - Data fetching patterns
- `src/app/layout.tsx` - Font loading, global scripts
- `src/app/globals.css` - CSS size
- `package.json` - Dependencies
- `next.config.ts` - Build configuration

## Example Usage

```
/perf-check
/perf-check --focus=images
/perf-check --focus=bundle
/perf-check --focus=vitals
```
