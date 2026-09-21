import { test, expect } from '@playwright/test';

test('LOGIN 2: Вхід з неправильним password', async ({ page }) => {
  // PRECONDITIONS:
  // Існуючий зареєстрований email, але навмисно невірний пароль
  const existingEmail = 'kate2@gmail.com';
  const wrongPassword = 'WrongPassword999!';

  // ДІЇ (ACTIONS):
  // 1. Відкриваємо сторінку входу
  await page.goto('/articles/login');

  // 2. Вводимо правильний email і неправильний пароль
  await page.getByTestId('auth-email').fill(existingEmail);
  await page.getByTestId('auth-password').fill(wrongPassword);

  // 3. Натискаємо кнопку "Sign in"
  await page.getByTestId('auth-submit').click();

  // ГОЛОВНА ПЕРЕВІРКА (ASSERTIONS):
  // 1. Залишаємося unauthenticated (сторінка не змінилася)
  await expect(page).toHaveURL(/\/articles\/login/);

  // 2. Бачимо повідомлення про помилку
  const errorBlock = page.getByTestId('error-messages');
  await expect(errorBlock).toBeVisible();
  await expect(errorBlock).toContainText('email or password неправильні');

  // 3. Сесія не створилася: посилання Sign in залишається, а профіль відсутній
  await expect(page.getByTestId('nav-sign-in')).toBeVisible();
  await expect(page.getByTestId('nav-profile')).not.toBeVisible();
});