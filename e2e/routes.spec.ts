import { expect, test } from '@playwright/test';

const routes = [
  ['/', /Which combustion experiments/],
  ['/atlas', /Every record/],
  ['/investigations/cfi-g', /CFI-G/],
  ['/crew-fit', /A score you can argue with/],
  ['/atmosphere', /Two ways to read an atmosphere/],
  ['/ask', /Ask in plain words/],
  ['/compare', /Two to four records/],
  ['/controls', /Four control questions/],
  ['/data', /Metadata you can take out/],
  ['/brief', /A scenario brief/],
  ['/earth', /The same fire problem/],
  ['/gaps', /What the archive cannot answer/],
  ['/glossary', /The words a fire-safety engineer/],
  ['/method', /The method is part of/],
  ['/judges', /Three minutes/],
  ['/not-a-route', /not in the notebook/],
] as const;

for (const [path, heading] of routes) {
  test(`route ${path} renders its page`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`/#${path}`);
    await expect(page.locator('h1')).toContainText(heading);
    await expect(page.locator('main')).toBeVisible();
    expect(errors).toEqual([]);
  });
}
