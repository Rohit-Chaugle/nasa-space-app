import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('flame toggle switches between Earth and free fall', async ({ page }) => {
  await page.goto('/#/');
  const flame = page.getByRole('img', { name: /Combustion flame/ });
  await expect(flame).toHaveAttribute('aria-label', /Earth teardrop/);
  await page.getByRole('button', { name: 'free fall' }).click();
  await expect(page.getByRole('img', { name: /free-fall sphere/ })).toBeVisible();
});

test('Atlas filter updates the URL and the table', async ({ page }) => {
  await page.goto('/#/atlas');
  await page.getByLabel('Phase').selectOption('liquid');
  await expect(page).toHaveURL(/phase=liquid/);
  const table = page.getByRole('table', { name: /Investigation records/ });
  await expect(table.getByRole('link', { name: 'FLEX', exact: true })).toBeVisible();
  await expect(table.getByRole('link', { name: 'BASS', exact: true })).toHaveCount(0);
});

test('Crew Fit ranks CFI-G then E-FIELD for the Lunar preset', async ({ page }) => {
  await page.goto('/#/crew-fit?preset=lunar');
  const links = page.locator('.rank-list .rank-heading a');
  await expect(links.nth(0)).toHaveText('CFI-G');
  await expect(links.nth(1)).toHaveText('E-FIELD');
});

test('Crew Fit re-normalizes weights after a slider change', async ({ page }) => {
  await page.goto('/#/crew-fit?preset=lunar');
  await page.getByRole('slider', { name: 'Function' }).fill('0');
  await expect(page.getByText('Total 100.0%')).toBeVisible();
  await expect(page).toHaveURL(/w=/);
});

test('Atmosphere Lab shows the required Moon and suit values', async ({ page }) => {
  await page.goto('/#/atmosphere?o=30&p=10.2');
  const readouts = page.locator('.readout-grid');
  await expect(readouts).toContainText('3.06 psi');
  await expect(readouts).toContainText('-1%');
  await expect(readouts).toContainText('+43%');
  await expect(readouts).toContainText('4.30 psi');
  await expect(readouts).toContainText('+39%');
});

test('Ask parses an oxygen threshold and finds CFI-G', async ({ page }) => {
  await page.goto('/#/ask?q=above+30%25+oxygen');
  await expect(page.getByRole('heading', { name: 'Ranked results.' })).toBeVisible();
  await expect(page.locator('.result-list')).toContainText('CFI-G');
  await expect(page.getByText(/1 ranked record/)).toBeVisible();
});

test('Compare stops at four records and shows a limit message', async ({ page }) => {
  await page.goto('/#/atlas');
  const table = page.getByRole('table', { name: /Investigation records/ });
  for (const id of ['BASS', 'BASS-II', 'Saffire-I', 'Saffire-II', 'Saffire-III']) {
    const row = table.getByRole('row').filter({ hasText: id }).first();
    await row.getByRole('button', { name: 'Add', exact: true }).click();
  }
  await expect(page.getByText('Four records is the Compare limit.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Compare 4' })).toBeVisible();
});

test('guided tour reaches every stop, closes, and leaves the visitor on Judges', async ({ page }) => {
  await page.goto('/#/');
  await page.getByRole('button', { name: 'Guided tour' }).click();
  const dialog = page.getByRole('dialog', { name: 'The flame' });
  await expect(dialog).toBeVisible();
  await expect(page.getByText('1 / 7')).toBeVisible();
  for (let index = 1; index < 7; index += 1) {
    await page.getByRole('button', { name: 'Next' }).click();
  }
  await expect(page.getByText('7 / 7')).toBeVisible();
  await page.getByRole('button', { name: 'Finish' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('h1')).toContainText('Three minutes');
});

test('Data room exports CSV, JSON, and a Markdown dictionary', async ({ page }) => {
  await page.goto('/#/data');

  const csvEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const csv = await csvEvent;
  expect(csv.suggestedFilename()).toBe('ghostflame-data.csv');
  const csvPath = await csv.path();
  const csvText = await readFile(csvPath!, 'utf8');
  expect(csvText).toContain('BASS');
  expect(csvText.split('\n').length).toBeGreaterThanOrEqual(18);

  const jsonEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const json = await jsonEvent;
  expect(json.suggestedFilename()).toBe('ghostflame-data.json');
  const jsonPath = await json.path();
  const records = JSON.parse(await readFile(jsonPath!, 'utf8')) as unknown[];
  expect(records).toHaveLength(17);

  const mdEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download dictionary' }).click();
  const md = await mdEvent;
  expect(md.suggestedFilename()).toBe('ghostflame-data-dictionary.md');
  const mdPath = await md.path();
  expect(await readFile(mdPath!, 'utf8')).toContain('Source');
});

test('Brief print control invokes the browser print flow', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __printCalls: number }).__printCalls = 0;
    window.print = () => {
      (window as unknown as { __printCalls: number }).__printCalls += 1;
    };
  });
  await page.goto('/#/brief');
  await page.getByRole('button', { name: 'Print or save as PDF' }).click();
  const calls = await page.evaluate(
    () => (window as unknown as { __printCalls: number }).__printCalls,
  );
  expect(calls).toBe(1);
});
