import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const auditPaths = [
  '/',
  '/atlas',
  '/investigations/cfi-g',
  '/crew-fit?preset=lunar',
  '/atmosphere?o=30&p=10.2',
  '/ask?q=liquid',
  '/compare',
  '/data',
  '/brief',
  '/judges',
];

for (const path of auditPaths) {
  test(`WCAG A and AA scan for ${path}`, async ({ page }) => {
    await page.goto(`/#${path}`);
    await expect(page.locator('h1')).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test('no horizontal overflow at four viewport widths', async ({ page }) => {
  for (const width of [375, 768, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/', '/atlas', '/crew-fit', '/atmosphere', '/data', '/brief']) {
      await page.goto(`/#${path}`);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${path} at ${width}px`).toBeLessThanOrEqual(1);
    }
  }
});
