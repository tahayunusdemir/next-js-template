import { expect, takeSnapshot, test } from '@chromatic-com/playwright';

test.describe('Visual testing', () => {
  test.describe('Static pages', () => {
    test('should take screenshot of the homepage', async ({ page }, testInfo) => {
      await page.goto('/');

      await expect(
        page.getByRole('heading', {
          name: 'Welcome',
        }),
      ).toBeVisible();

      await takeSnapshot(page, testInfo);
    });

    test('should take screenshot of the counter page', async ({ page }, testInfo) => {
      await page.goto('/counter');

      await expect(page.getByText('Count:')).toBeVisible();

      await takeSnapshot(page, testInfo);
    });

    test('should take screenshot of the Turkish homepage', async ({ page }, testInfo) => {
      await page.goto('/tr');

      await expect(
        page.getByRole('heading', {
          name: 'Hoş geldiniz',
        }),
      ).toBeVisible();

      await takeSnapshot(page, testInfo);
    });
  });
});
