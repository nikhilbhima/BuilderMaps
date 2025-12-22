---
name: test-flow
description: Generate Playwright E2E tests for BuilderMaps critical user flows including navigation, authentication, nominations, reviews, and upvoting. Use when setting up testing, adding test coverage, or validating user journeys.
allowed-tools: Read, Glob, Grep
---

# Test Flow Skill

Generate E2E tests for BuilderMaps using Playwright. The project currently has NO testing setup, so this skill also provides setup instructions.

## Instructions

### 1. Initial Setup (One-time)

Since BuilderMaps has no testing setup:

```bash
# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install
```

**Create `playwright.config.ts`:**
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
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 14'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Add to `package.json` scripts:**
```json
{
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed"
  }
}
```

### 2. Test File Structure

```
tests/
  e2e/
    navigation.spec.ts     # Homepage, city navigation
    spots.spec.ts          # Spot viewing, filtering
    nomination.spec.ts     # Spot nomination flow
    reviews.spec.ts        # Review submission
    upvoting.spec.ts       # Upvote functionality
    admin.spec.ts          # Admin panel flows
  fixtures/
    auth.ts                # Auth helpers
    test-data.ts           # Constants
```

### 3. Critical User Flows

**Flow 1: Homepage & Navigation**
- Load homepage
- Verify hero "Where builders hang out"
- Verify city cards display
- Switch regions (Asia, Europe, Americas)
- Click city to navigate

**Flow 2: City Page & Spots**
- Navigate to `/city/san-francisco`
- Verify spots load
- Filter by type (coworking, cafe, etc.)
- Sort by upvotes
- Click spot to view details

**Flow 3: Spot Nomination**
- Click "Nominate a Spot"
- Verify modal opens
- Fill required fields
- Submit nomination
- Verify success message

**Flow 4: Reviews (Auth Required)**
- Navigate to spot detail
- Attempt to write review
- Verify login prompt appears

**Flow 5: Upvoting (Auth Required)**
- Click upvote button
- Verify login modal appears

### 4. Test Templates

**Navigation Tests:**
```typescript
// tests/e2e/navigation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Homepage Navigation', () => {
  test('loads homepage correctly', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: /where builders hang out/i })
    ).toBeVisible();

    await expect(
      page.locator('[data-testid="city-card"]').first()
    ).toBeVisible();
  });

  test('navigates to city page', async ({ page }) => {
    await page.goto('/');
    await page.getByText('San Francisco').click();

    await expect(page).toHaveURL(/\/city\/san-francisco/);
  });

  test('switches between regions', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /Europe/i }).click();
    await expect(page.getByText('London')).toBeVisible();

    await page.getByRole('button', { name: /Asia/i }).click();
    await expect(page.getByText('Singapore')).toBeVisible();
  });
});
```

**Spots Tests:**
```typescript
// tests/e2e/spots.spec.ts
import { test, expect } from '@playwright/test';

test.describe('City Page - Spots', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/city/san-francisco');
  });

  test('displays spots list', async ({ page }) => {
    await expect(
      page.locator('[data-testid="spot-card"]').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('filters spots by type', async ({ page }) => {
    await page.getByRole('button', { name: /Coworking/i }).click();

    // Verify filter applied
    const spots = page.locator('[data-testid="spot-card"]');
    await expect(spots.first()).toBeVisible();
  });

  test('opens spot detail panel', async ({ page }) => {
    await page.locator('[data-testid="spot-card"]').first().click();

    await expect(
      page.locator('[data-testid="spot-detail"]')
    ).toBeVisible();
  });
});
```

**Nomination Tests:**
```typescript
// tests/e2e/nomination.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Spot Nomination', () => {
  test('opens nomination modal', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /Nominate a Spot/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('validates required fields', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Nominate a Spot/i }).click();

    await page.getByRole('button', { name: /Submit/i }).click();

    await expect(page.getByText(/required/i)).toBeVisible();
  });

  test('submits valid nomination', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Nominate a Spot/i }).click();

    await page.getByLabel(/name/i).fill('Test Coworking');
    await page.getByLabel(/description/i).fill(
      'A great space for builders to work together.'
    );
    await page.getByRole('button', { name: /Coworking/i }).click();

    // Fill location if required
    // await page.getByLabel(/location/i).fill('123 Test St');

    await page.getByRole('button', { name: /Submit/i }).click();

    await expect(
      page.getByText(/submitted|success/i)
    ).toBeVisible({ timeout: 5000 });
  });
});
```

### 5. Components Needing data-testid

Add these attributes for reliable test selection:

| Component | File | data-testid |
|-----------|------|-------------|
| CityCard | `src/components/CityCard.tsx` | `city-card` |
| SpotCard | `src/components/SpotCard.tsx` | `spot-card` |
| SpotDetail | `src/components/SpotDetailPanel.tsx` | `spot-detail` |
| UpvoteButton | (in SpotCard) | `upvote-button` |
| NominationModal | `src/components/NominationModal.tsx` | `nomination-modal` |
| LoginModal | `src/components/LoginModal.tsx` | `login-modal` |

### 6. Auth Testing Strategy

For OAuth flows (Twitter/LinkedIn):

**Option A: Mock Auth State**
```typescript
// tests/fixtures/auth.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  authenticatedPage: async ({ page, context }, use) => {
    // Set Supabase auth cookies
    await context.addCookies([{
      name: 'sb-access-token',
      value: process.env.TEST_AUTH_TOKEN || 'mock',
      domain: 'localhost',
      path: '/',
    }]);
    await use(page);
  },
});
```

**Option B: Test Environment**
Create a test user in Supabase with known credentials for CI.

## Output Format

```
## E2E Tests for [Flow Name]

### Setup Checklist
- [ ] Playwright installed
- [ ] Config file created
- [ ] Test directory structure
- [ ] data-testid attributes added

### Generated Test File

```typescript
[Test code]
```

### Running Tests

```bash
npx playwright test                    # Run all
npx playwright test navigation.spec.ts # Run specific
npx playwright test --headed           # Watch browser
npx playwright test --ui               # Interactive UI
npx playwright test --debug            # Debug mode
```

### Components to Update
| File | Add data-testid |
|------|-----------------|
| ... | ... |
```

## Key Files to Reference

- `src/app/page.tsx` - Homepage structure
- `src/app/city/[cityId]/page.tsx` - City page
- `src/components/SpotCard.tsx` - Spot cards
- `src/components/NominationModal.tsx` - Nomination flow
- `src/components/LoginModal.tsx` - Auth modal
- `src/components/InlineReviewForm.tsx` - Reviews

## Example Usage

```
/test-flow setup
/test-flow generate navigation
/test-flow generate nomination
/test-flow generate all
/test-flow list-testids
```
