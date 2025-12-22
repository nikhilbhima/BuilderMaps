---
name: changelog
description: Auto-generate changelogs and release notes from git commit history. Use when preparing releases, updating CHANGELOG.md, or summarizing recent changes.
allowed-tools: Read, Glob, Grep, Bash
---

# Changelog Generator Skill

Generate professional changelogs from git commits.

## Instructions

### 1. Analyze Recent Commits

```bash
# Last 20 commits
git log --oneline -20

# Commits since last tag
git log $(git describe --tags --abbrev=0)..HEAD --oneline

# Commits in date range
git log --since="2024-01-01" --oneline
```

### 2. Categorize Changes

Group commits by type:

| Prefix | Category | Emoji |
|--------|----------|-------|
| `feat:` | New Features | ✨ |
| `fix:` | Bug Fixes | 🐛 |
| `perf:` | Performance | ⚡ |
| `docs:` | Documentation | 📚 |
| `style:` | Styling | 💄 |
| `refactor:` | Refactoring | ♻️ |
| `test:` | Tests | ✅ |
| `chore:` | Maintenance | 🔧 |
| `breaking:` | Breaking Changes | 💥 |

### 3. Changelog Format

```markdown
# Changelog

## [1.2.0] - 2024-01-15

### ✨ New Features
- Add dark mode toggle (#123)
- Support for 10 new cities (#124)

### 🐛 Bug Fixes
- Fix login timeout on slow connections (#125)
- Resolve map not loading on mobile (#126)

### ⚡ Performance
- Optimize image loading with lazy load (#127)

### 💥 Breaking Changes
- Remove deprecated `/api/v1` endpoints (#128)
```

### 4. Version Bumping

| Change Type | Version Bump | Example |
|-------------|--------------|---------|
| Breaking changes | Major | 1.0.0 → 2.0.0 |
| New features | Minor | 1.0.0 → 1.1.0 |
| Bug fixes | Patch | 1.0.0 → 1.0.1 |

### 5. Generate from Commits

Parse commit messages and group:

```bash
# Get commits with full messages
git log --pretty=format:"%h %s" $(git describe --tags --abbrev=0 2>/dev/null || echo "HEAD~20")..HEAD
```

### 6. For BuilderMaps Specifically

Key areas to highlight:
- New cities added
- New spot types
- Admin panel changes
- API changes
- UI/UX improvements
- Mobile responsiveness fixes

## Output Format

```markdown
## [X.Y.Z] - YYYY-MM-DD

### ✨ New Features
- Feature description (#PR)

### 🐛 Bug Fixes
- Fix description (#PR)

### 🏙️ Cities
- Added: City1, City2, City3

### 📱 Mobile
- Improvement description

---

**Full Changelog**: https://github.com/user/repo/compare/v1.0.0...v1.1.0
```

## Example Usage

```
/changelog generate
/changelog since v1.0.0
/changelog last-week
/changelog for-release 1.2.0
```
