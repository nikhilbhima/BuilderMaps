---
name: debugging
description: Structured debugging workflow for tracking down bugs systematically. Use when something is broken, behaving unexpectedly, or you need help finding the root cause of an issue.
allowed-tools: Read, Glob, Grep, Bash
---

# Debugging Skill

Find bugs systematically instead of random guessing.

## The Debugging Process

### Step 1: Reproduce the Bug

**Questions to answer:**
- What exactly is broken?
- What should happen vs what actually happens?
- Can you reproduce it consistently?
- Does it happen in all environments (dev, prod)?

**Commands:**
```bash
# Check if dev server is running
lsof -i :3000

# Check recent changes
git log --oneline -10
git diff HEAD~3
```

### Step 2: Isolate the Problem

**Narrow down the scope:**

| Area | How to Check |
|------|--------------|
| Frontend | Does it fail in browser console? |
| API | Does the endpoint return errors? (check Network tab) |
| Database | Is the query returning wrong data? |
| Auth | Is the user session valid? |
| External | Is a 3rd party service down? |

**For BuilderMaps specifically:**

| Component | Files to Check |
|-----------|----------------|
| Spots not loading | `src/app/city/[cityId]/page.tsx`, API route |
| Auth broken | `src/lib/supabase/`, `src/middleware.ts` |
| Admin panel | `src/app/admin/`, check role permissions |
| Map not showing | `src/components/MapView.tsx`, Leaflet import |
| Forms failing | Check CSRF token, API response |

### Step 3: Form a Hypothesis

Based on evidence, what do you think is wrong?

**Common causes in web apps:**
- Missing environment variable
- Typo in variable/function name
- Wrong data type (string vs number)
- Async timing issue (race condition)
- Missing null check
- CORS issue
- Cache showing stale data

### Step 4: Test the Hypothesis

**Add strategic logging:**
```typescript
console.log('Debug: spots data', { spots, count: spots?.length });
console.log('Debug: user session', { user, isAuth: !!user });
```

**Check specific values:**
```bash
# Search for where a variable is used
grep -r "spotId" src/

# Find function definition
grep -r "function fetchSpots" src/
```

### Step 5: Fix and Verify

1. Make the smallest change that fixes the issue
2. Test the fix
3. Check for regressions (did fixing this break something else?)
4. Remove debug logs
5. Write a test to prevent regression

## Debugging Checklist

```
## Bug: [Description]

### Symptoms
- [ ] What's broken:
- [ ] Error message:
- [ ] When it happens:
- [ ] Reproducible: Yes / No / Sometimes

### Environment
- [ ] Browser:
- [ ] Environment: dev / staging / prod
- [ ] Recent changes:

### Investigation
- [ ] Console errors:
- [ ] Network errors:
- [ ] Checked files:
- [ ] Hypothesis:

### Solution
- [ ] Root cause:
- [ ] Fix applied:
- [ ] Files changed:
- [ ] Tested: Yes / No
```

## Common BuilderMaps Issues

| Symptom | Likely Cause | Check |
|---------|--------------|-------|
| Spots don't load | Supabase query error | Browser console, API response |
| Can't login | OAuth callback URL wrong | Supabase dashboard settings |
| Map blank | Leaflet not loaded | Check dynamic import, CSP headers |
| Admin 403 | Role not set | `admin_users` table |
| Form fails silently | CSRF token missing | Check request headers |
| Reviews not showing | RLS policy blocking | Check Supabase RLS |

## Output Format

```
## Debug Report: [Issue]

### Summary
[1-2 sentence description]

### Root Cause
[What was actually wrong]

### Evidence
- File: `path/to/file.ts:42`
- Error: [error message]
- Related: [other affected areas]

### Fix
```typescript
// Before
[broken code]

// After
[fixed code]
```

### Prevention
- [ ] Add test for this case
- [ ] Add validation
- [ ] Update documentation
```

## Example Usage

```
/debugging spots-not-loading
/debugging login-redirect-loop
/debugging help
```
