import { test, expect } from '@playwright/test';

test('REG 1: Успішна реєстрація нового користувача', async ({ page }) => {
    // ДІЇ (ACTIONS):
    await page.goto('/articles/register');
    await page.getByTestId('auth-username').fill('kate2');
    await page.getByTestId('auth-email').fill('kate2@gmail.com');
    await page.getByTestId('auth-password').fill('Kate2@13');
    await page.getByTestId('register-confirm-password').fill('Kate2@13');
    // Обов'язковий чекбокс згоди з правилами
    await page.getByTestId('register-terms').check();
    // Натискаємо кнопку "Create account"
    await page.getByTestId('auth-submit').click();
    // ГОЛОВНА ПЕРЕВІРКА (ASSERTIONS):
    // 1. Відбувся перехід на головну сторінку
    await expect(page).toHaveURL(/\/articles$/);
    // 2. У навігації з'явився профіль користувача "kate2"
    const profileLink = page.getByTestId('nav-profile');
    await expect(profileLink).toBeVisible();
    await expect(profileLink).toContainText('kate2');
    // 3. З'явилася кнопка для створення нової статті
    await expect(page.getByTestId('nav-new-article')).toBeVisible();
  });