---
name: conventional-commits
description: Enforce conventional commit message format for clean git history. Use when committing changes, fixing bad commit messages, or setting up commit standards.
allowed-tools: Read, Glob, Grep, Bash
---

# Conventional Commits Skill

Keep git history clean with standardized commit messages.

## Commit Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | New feature | `feat: add dark mode toggle` |
| `fix` | Bug fix | `fix: resolve login timeout` |
| `docs` | Documentation | `docs: update API readme` |
| `style` | Formatting (no code change) | `style: fix indentation` |
| `refactor` | Code restructuring | `refactor: extract auth logic` |
| `perf` | Performance improvement | `perf: optimize image loading` |
| `test` | Adding tests | `test: add spot card tests` |
| `chore` | Maintenance | `chore: update dependencies` |
| `ci` | CI/CD changes | `ci: add deploy workflow` |
| `build` | Build system | `build: upgrade Next.js` |

### Scopes (for BuilderMaps)

| Scope | Area |
|-------|------|
| `spots` | Spot-related features |
| `cities` | City pages/data |
| `auth` | Authentication |
| `admin` | Admin panel |
| `api` | API routes |
| `ui` | UI components |
| `db` | Database/Supabase |
| `map` | Map functionality |

### Examples

**Good commits:**
```
feat(spots): add upvote animation
fix(auth): handle OAuth callback error
docs(api): document nomination endpoint
perf(map): lazy load Leaflet library
refactor(admin): extract table components
test(spots): add SpotCard unit tests
chore: upgrade to Next.js 16
```

**Bad commits:**
```
fixed stuff              # Vague
WIP                      # Not descriptive
asdfasdf                 # Meaningless
Update SpotCard.tsx      # Just filename
```

## Instructions

### 1. Check Recent Commits

```bash
git log --oneline -10
```

### 2. Fix Bad Commit Message (last commit)

```bash
git commit --amend -m "feat(spots): add rating display"
```

### 3. Interactive Rebase (multiple commits)

```bash
git rebase -i HEAD~3
# Change 'pick' to 'reword' for commits to fix
```

### 4. Commit Template

Create `.gitmessage` in project root:

```
# <type>(<scope>): <subject>
#
# Types: feat, fix, docs, style, refactor, perf, test, chore, ci, build
# Scopes: spots, cities, auth, admin, api, ui, db, map
#
# Subject: imperative mood, no period, max 50 chars
#
# Body: explain what and why (not how)
#
# Footer: Breaking changes, issue references
# BREAKING CHANGE: description
# Fixes #123
```

Set as default:
```bash
git config commit.template .gitmessage
```

### 5. Pre-commit Hook (optional)

Add to `.husky/commit-msg`:
```bash
#!/bin/sh
npx commitlint --edit $1
```

## Output Format

When asked to write a commit:

```
## Suggested Commit Message

```
feat(spots): add average rating display

- Show star rating on spot cards
- Calculate from user reviews
- Update on new review submission

Closes #45
```

### Breakdown
- **Type:** feat (new feature)
- **Scope:** spots (affects spot display)
- **Subject:** clear, imperative mood
- **Body:** explains the change
- **Footer:** links to issue
```

## Example Usage

```
/conventional-commits write
/conventional-commits check
/conventional-commits fix-last
/conventional-commits setup-hook
```
