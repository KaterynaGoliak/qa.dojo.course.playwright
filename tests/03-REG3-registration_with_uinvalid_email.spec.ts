import { test, expect } from '@playwright/test';

test('REG 3: Реєстрація з невалідними даними (занадто короткий пароль)', async ({ page }) => {
    // PRECONDITIONS:
    // Унікальні username та email, але невалідний пароль (< 6 символів за правилами системи)
    const invalidShortPassword = '123';
    const timestamp = Date.now();
    // ДІЇ (ACTIONS):
    await page.goto('/articles/register');
    await page.getByTestId('auth-username').fill(`invalid_${timestamp}`);
    await page.getByTestId('auth-email').fill(`invalid_${timestamp}@example.com`);
    await page.getByTestId('auth-password').fill(invalidShortPassword);
    await page.getByTestId('register-confirm-password').fill(invalidShortPassword);
    await page.getByTestId('register-terms').check();
    await page.getByTestId('auth-submit').click();
    // ГОЛОВНА ПЕРЕВІРКА (ASSERTIONS):
    // 1. Форма не створює акаунт — залишаємося на сторінці реєстрації
    await expect(page).toHaveURL(/\/articles\/register/);
    // 2. Показується очікувана валідація від системи
    const errorBlock = page.getByTestId('error-messages');
    await expect(errorBlock).toBeVisible();
    await expect(errorBlock).toContainText('пароль має містити щонайменше 6 символів');
    // 3. Сесія не створилася — профіль не відображається
    await expect(page.getByTestId('nav-profile')).not.toBeVisible();
  });