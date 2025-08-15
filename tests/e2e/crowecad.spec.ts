import { test, expect } from '@playwright/test';

test.describe('CroweCad E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Landing Page', () => {
    test('should display the main heading', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('Design Anything with Natural Language');
    });

    test('should have navigation links', async ({ page }) => {
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('text=Features')).toBeVisible();
      await expect(page.locator('text=Industries')).toBeVisible();
      await expect(page.locator('text=GitHub')).toBeVisible();
    });

    test('should open IDE when Launch IDE is clicked', async ({ page }) => {
      await page.click('text=Launch IDE');
      await expect(page.locator('.crowecad-ide')).toBeVisible();
    });

    test('should navigate to workspace', async ({ page }) => {
      await page.click('text=Workspace');
      await expect(page.url()).toContain('/workspace');
    });

    test('should display industry cards', async ({ page }) => {
      await expect(page.locator('text=Mechanical')).toBeVisible();
      await expect(page.locator('text=Architecture')).toBeVisible();
      await expect(page.locator('text=Electronics')).toBeVisible();
    });

    test('should display feature cards', async ({ page }) => {
      await expect(page.locator('text=Natural Language CAD')).toBeVisible();
      await expect(page.locator('text=Real-time Collaboration')).toBeVisible();
      await expect(page.locator('text=AI-Powered Design')).toBeVisible();
    });
  });

  test.describe('CAD Workspace', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/workspace');
    });

    test('should display workspace header', async ({ page }) => {
      await expect(page.locator('text=CroweCad Workspace')).toBeVisible();
    });

    test('should have model tree panel', async ({ page }) => {
      await expect(page.locator('text=Model Tree')).toBeVisible();
      await expect(page.locator('text=Assembly1')).toBeVisible();
    });

    test('should have layers panel', async ({ page }) => {
      await page.click('text=Layers');
      await expect(page.locator('text=Layer 0')).toBeVisible();
      await expect(page.locator('text=Construction')).toBeVisible();
    });

    test('should have properties panel', async ({ page }) => {
      await expect(page.locator('text=Properties')).toBeVisible();
      await expect(page.locator('text=Position X')).toBeVisible();
    });

    test('should toggle grid', async ({ page }) => {
      const gridButton = page.locator('[aria-pressed]').first();
      await gridButton.click();
      await expect(gridButton).toHaveAttribute('aria-pressed', 'false');
      
      await gridButton.click();
      await expect(gridButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('should change view', async ({ page }) => {
      await page.click('[role="combobox"]');
      await page.click('text=Front');
      await expect(page.locator('[role="combobox"]')).toContainText('Front');
    });

    test('should adjust zoom', async ({ page }) => {
      const zoomDisplay = page.locator('text=100%');
      await expect(zoomDisplay).toBeVisible();
      
      await page.click('[aria-label="Zoom out"]');
      await expect(page.locator('text=90%')).toBeVisible();
      
      await page.click('[aria-label="Zoom in"]');
      await page.click('[aria-label="Zoom in"]');
      await expect(page.locator('text=110%')).toBeVisible();
    });

    test('should open command palette with keyboard shortcut', async ({ page }) => {
      await page.keyboard.press('Control+K');
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('text=Search commands')).toBeVisible();
    });
  });

  test.describe('CroweCad IDE', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.click('text=Launch IDE');
    });

    test('should display IDE interface', async ({ page }) => {
      await expect(page.locator('.crowecad-ide')).toBeVisible();
      await expect(page.locator('text=CroweCad IDE')).toBeVisible();
    });

    test('should have AI chat panel', async ({ page }) => {
      await expect(page.locator('[placeholder*="Describe"]')).toBeVisible();
    });

    test('should generate design from text', async ({ page }) => {
      const input = page.locator('[placeholder*="Describe"]');
      await input.fill('Create a simple gear with 10 teeth');
      await page.keyboard.press('Enter');
      
      // Wait for response
      await page.waitForTimeout(1000);
      await expect(page.locator('.message')).toBeVisible();
    });

    test('should display code editor', async ({ page }) => {
      await expect(page.locator('.code-editor')).toBeVisible();
    });

    test('should show 3D preview', async ({ page }) => {
      await expect(page.locator('.preview-3d')).toBeVisible();
      await expect(page.locator('canvas')).toBeVisible();
    });

    test('should export design', async ({ page }) => {
      await page.click('text=Export');
      await expect(page.locator('[role="menu"]')).toBeVisible();
      await expect(page.locator('text=STL')).toBeVisible();
      await expect(page.locator('text=STEP')).toBeVisible();
      await expect(page.locator('text=DXF')).toBeVisible();
    });

    test('should close IDE', async ({ page }) => {
      await page.click('[aria-label="Close"]');
      await expect(page.locator('.crowecad-ide')).not.toBeVisible();
    });
  });

  test.describe('Collaboration Features', () => {
    test('should start collaboration session', async ({ page }) => {
      await page.goto('/workspace');
      await page.click('text=Collaborate');
      
      await expect(page.locator('text=Start Session')).toBeVisible();
      await page.click('text=Start Session');
      
      await expect(page.locator('text=Session ID')).toBeVisible();
    });

    test('should display active users', async ({ page }) => {
      await page.goto('/workspace');
      await expect(page.locator('[aria-label="Active users"]')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should be mobile responsive', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Mobile menu should be visible
      await expect(page.locator('[aria-label="Menu"]')).toBeVisible();
      
      // Click mobile menu
      await page.click('[aria-label="Menu"]');
      await expect(page.locator('text=Features')).toBeVisible();
    });

    test('should be tablet responsive', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('text=Launch IDE')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('/');
      
      const buttons = page.locator('button');
      const count = await buttons.count();
      
      for (let i = 0; i < count; i++) {
        const button = buttons.nth(i);
        const ariaLabel = await button.getAttribute('aria-label');
        const text = await button.textContent();
        
        expect(ariaLabel || text).toBeTruthy();
      }
    });

    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/');
      
      // Tab through interactive elements
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
      
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/');
      
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);
      
      const h2Elements = page.locator('h2');
      const h2Count = await h2Elements.count();
      expect(h2Count).toBeGreaterThan(0);
    });
  });

  test.describe('Performance', () => {
    test('should load quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(5000); // Should load in under 5 seconds
    });

    test('should handle rapid interactions', async ({ page }) => {
      await page.goto('/workspace');
      
      // Rapidly click zoom buttons
      for (let i = 0; i < 10; i++) {
        await page.click('[aria-label="Zoom in"]', { force: true });
      }
      
      // Should not crash or become unresponsive
      await expect(page.locator('text=CroweCad Workspace')).toBeVisible();
    });
  });
});