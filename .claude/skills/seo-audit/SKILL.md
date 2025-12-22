---
name: seo-audit
description: Analyze BuilderMaps pages for SEO issues including meta tags, Open Graph, Twitter cards, structured data, and sitemap coverage. Use when checking SEO health, preparing for launch, or optimizing for search rankings.
allowed-tools: Read, Glob, Grep
---

# SEO Audit Skill

Comprehensive SEO analysis for BuilderMaps - a Next.js application with 46+ dynamic city pages.

## Instructions

When invoked, perform these checks in order:

### 1. Meta Tags Analysis

**Check root layout (`src/app/layout.tsx`):**
- Title tag presence and format (50-60 chars optimal)
- Meta description (150-160 chars optimal)
- Viewport configuration
- Theme color

**Check dynamic city pages (`src/app/city/[cityId]/page.tsx`):**
- `generateMetadata` function implementation
- Unique titles per city
- Unique descriptions per city

### 2. Open Graph Tags

Verify in layout and pages:
- `og:title` - matches or complements page title
- `og:description` - present and descriptive
- `og:type` - appropriate (website, article)
- `og:url` - uses canonical URLs
- `og:image` - check for `opengraph-image.tsx`
- `og:site_name` - consistent across pages

### 3. Twitter Card Tags

Verify:
- `twitter:card` - should be `summary_large_image`
- `twitter:title` and `twitter:description`
- `twitter:image` - check for `twitter-image.tsx`

### 4. Structured Data (JSON-LD)

Search for `application/ld+json` scripts:
- Organization schema on homepage
- LocalBusiness schema for spots (if applicable)
- BreadcrumbList for navigation
- WebSite schema with SearchAction

### 5. Sitemap Coverage

Check for:
- `src/app/sitemap.ts` or `src/app/sitemap.xml`
- Dynamic generation of all 46+ city URLs
- Spot detail page URLs
- Proper lastmod dates

If missing, recommend creating dynamic sitemap.

### 6. Additional Checks

- `public/robots.txt` - presence and configuration
- Canonical URL implementation
- H1 usage (one per page)
- Image alt text patterns
- Internal linking structure

## Output Format

```
## SEO Audit Report - BuilderMaps

### Score Summary
| Category | Score | Status |
|----------|-------|--------|
| Meta Tags | X/10 | [emoji] |
| Open Graph | X/10 | [emoji] |
| Twitter Cards | X/10 | [emoji] |
| Structured Data | X/10 | [emoji] |
| Sitemap & Robots | X/10 | [emoji] |
| **Overall** | **X/50** | |

### Critical Issues (Fix Now)
1. [Issue with file path and line number]

### Warnings (Should Fix)
1. [Issue with recommendation]

### Recommendations (Nice to Have)
1. [Suggestion for improvement]

### Missing Files to Create
- `src/app/sitemap.ts` - Dynamic sitemap
- `public/robots.txt` - Search engine directives
```

## Key Files to Analyze

- `src/app/layout.tsx` - Root metadata
- `src/app/page.tsx` - Homepage
- `src/app/city/[cityId]/page.tsx` - Dynamic city pages
- `src/app/opengraph-image.tsx` - OG image generation
- `src/app/twitter-image.tsx` - Twitter image
- `src/data/cities.ts` - All 46 cities for sitemap
- `public/manifest.json` - PWA metadata

## Example Usage

```
/seo-audit
/seo-audit --focus=city-pages
/seo-audit --focus=structured-data
```
