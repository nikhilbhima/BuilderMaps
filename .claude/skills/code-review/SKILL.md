---
name: code-review
description: Review code changes like a senior developer. Analyze PRs, diffs, or specific files for bugs, security issues, performance problems, and best practices. Use when reviewing pull requests or wanting feedback on code.
allowed-tools: Read, Glob, Grep, Bash
---

# Code Review Skill

Provide thorough, constructive code reviews like a senior developer.

## Instructions

### 1. Get Changes to Review

**For a PR:**
```bash
gh pr diff <pr-number>
```

**For staged changes:**
```bash
git diff --cached
```

**For recent commits:**
```bash
git diff HEAD~3
```

### 2. Review Checklist

#### Security
- [ ] No hardcoded secrets/API keys
- [ ] Input validation on user data
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitized output)
- [ ] CSRF protection on forms
- [ ] Auth checks on protected routes

#### Performance
- [ ] No N+1 queries
- [ ] Expensive operations are cached
- [ ] Large lists are paginated
- [ ] Images are optimized
- [ ] No memory leaks (cleanup in useEffect)

#### Code Quality
- [ ] Functions are small and focused
- [ ] No code duplication
- [ ] Clear variable/function names
- [ ] Complex logic has comments
- [ ] Error handling is present
- [ ] Types are properly defined (TypeScript)

#### Testing
- [ ] New code has tests
- [ ] Edge cases are covered
- [ ] Tests are readable

#### React/Next.js Specific
- [ ] Hooks follow rules (deps arrays correct)
- [ ] No unnecessary re-renders
- [ ] Keys on list items
- [ ] Loading/error states handled
- [ ] Server vs client components appropriate

### 3. Severity Levels

| Level | Icon | Meaning |
|-------|------|---------|
| Blocker | 🚨 | Must fix before merge |
| Warning | ⚠️ | Should fix, but not blocking |
| Suggestion | 💡 | Nice to have improvement |
| Question | ❓ | Need clarification |
| Praise | 👍 | Good job, highlight good patterns |

### 4. Comment Format

```
🚨 **Security Issue** - `src/api/users.ts:42`
User input is not sanitized before database query.

**Problem:**
const user = await db.query(`SELECT * FROM users WHERE id = ${id}`);

**Fix:**
const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);
```

### 5. BuilderMaps Specific Checks

- Supabase RLS policies on new tables
- Admin role checks on admin routes
- CSRF tokens on form submissions
- Rate limiting on public APIs
- Spot data validation (coordinates, URLs)

## Output Format

```
## Code Review: [PR Title / Description]

### Summary
[1-2 sentence overview of changes]

### 🚨 Blockers (X)
1. **Issue** - `file:line`
   - Problem: [description]
   - Fix: [suggestion]

### ⚠️ Warnings (X)
1. **Issue** - `file:line`
   - [description and suggestion]

### 💡 Suggestions (X)
1. [improvement idea]

### 👍 What's Good
- [positive feedback]

### Verdict
- [ ] Approve
- [ ] Request changes
- [ ] Needs discussion
```

## Example Usage

```
/code-review pr 42
/code-review staged
/code-review file src/components/SpotCard.tsx
/code-review last-commit
```
