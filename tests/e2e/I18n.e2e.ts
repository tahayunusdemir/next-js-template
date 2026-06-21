import { expect, test } from '@playwright/test';

test.describe('I18n', () => {
  test.describe('Language Switching', () => {
    test('should switch language from English to Turkish using dropdown and verify text on the homepage', async ({
      page,
    }) => {
      await page.goto('/');

      await expect(
        page.getByRole('heading', {
          name: 'Welcome',
        }),
      ).toBeVisible();

      await page.getByLabel('Change language').selectOption('tr');

      await expect(
        page.getByRole('heading', {
          name: 'Hoş geldiniz',
        }),
      ).toBeVisible();
    });

    test('should switch language from English to Turkish using URL and verify text on the sign-in page', async ({
      page,
    }) => {
      await page.goto('/sign-in');

      await expect(page.getByText('Email address')).toBeVisible();

      await page.goto('/tr/sign-in');

      await expect(page.getByText('E-posta adresi')).toBeVisible();
    });
  });
});
