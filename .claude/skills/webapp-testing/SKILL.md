---
name: webapp-testing
description: Run Playwright E2E tests against the local BuilderMaps dev server. Use when you want to actually execute tests, verify functionality works, or debug failing tests.
allowed-tools: Read, Glob, Grep, Bash
---

# Webapp Testing Skill

Execute Playwright tests against the running BuilderMaps application.

## Prerequisites

Ensure Playwright is installed:
```bash
npm install -D @playwright/test
npx playwright install
```

## Instructions

### 1. Check Test Setup

Verify `playwright.config.ts` exists at project root. If not, create it:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 14'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 2. Run Tests

**All tests:**
```bash
npx playwright test
```

**Specific test file:**
```bash
npx playwright test tests/e2e/navigation.spec.ts
```

**With visible browser:**
```bash
npx playwright test --headed
```

**Debug mode:**
```bash
npx playwright test --debug
```

**Interactive UI:**
```bash
npx playwright test --ui
```

### 3. Analyze Results

After running tests:
- Check console output for pass/fail
- Open HTML report: `npx playwright show-report`
- Review screenshots in `test-results/` for failures

### 4. Common Issues

| Issue | Solution |
|-------|----------|
| "Cannot find module" | Run `npm install` |
| "Browser not found" | Run `npx playwright install` |
| Tests timeout | Increase timeout in config or check if dev server is running |
| Element not found | Add `data-testid` attributes to components |

## Output Format

```
## Test Results

### Summary
- Total: X tests
- Passed: X
- Failed: X
- Skipped: X

### Failed Tests
1. **test-name** - [reason]
   - File: tests/e2e/file.spec.ts:42
   - Error: [error message]
   - Fix: [suggestion]

### Next Steps
- [ ] Fix failing test X
- [ ] Add missing data-testid to component Y
```

## Example Usage

```
/webapp-testing run all
/webapp-testing run navigation
/webapp-testing debug spots.spec.ts
/webapp-testing show-report
```
