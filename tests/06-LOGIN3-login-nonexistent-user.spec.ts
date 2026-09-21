import { test, expect } from '@playwright/test';

test('LOGIN 3: Вхід неіснуючого користувача', async ({ page }) => {
  // PRECONDITIONS:
  // Генеруємо email, якого гарантовано немає в системі
  const nonExistentEmail = `ghost_user_${Date.now()}@gmail.com`;
  const anyPassword = 'Kate2@13';

  // ДІЇ (ACTIONS):
  // 1. Відкриваємо сторінку входу
  await page.goto('/articles/login');

  // 2. Вводимо неіснуючий email та будь-який пароль
  await page.getByTestId('auth-email').fill(nonExistentEmail);
  await page.getByTestId('auth-password').fill(anyPassword);

  // 3. Натискаємо кнопку "Sign in"
  await page.getByTestId('auth-submit').click();

  // ГОЛОВНА ПЕРЕВІРКА (ASSERTIONS):
  // 1. Система відхиляє запит і залишає користувача на сторінці входу
  await expect(page).toHaveURL(/\/articles\/login/);

  // 2. Отримуємо повідомлення про помилку відхилення входу
  const errorBlock = page.getByTestId('error-messages');
  await expect(errorBlock).toBeVisible();
  await expect(errorBlock).toContainText('email or password неправильні');

  // 3. Сесія не створилася: профіль користувача не відображається
  await expect(page.getByTestId('nav-profile')).not.toBeVisible();
  await expect(page.getByTestId('nav-sign-in')).toBeVisible();
});








