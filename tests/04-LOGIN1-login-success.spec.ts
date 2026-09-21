import { test, expect } from '@playwright/test';

test('LOGIN 1: Успішний вхід', async ({ page }) => {
  // PRECONDITIONS:
  // Користувач kate2@gmail.com вже зареєстрований у системі
  const validEmail = 'kate2@gmail.com';
  const validPassword = 'Kate2@13';

  // ДІЇ (ACTIONS):
  // 1. Відкриваємо сторінку входу
  await page.goto('/articles/login');

  // 2. Вводимо валідні дані вашого акаунта
  await page.getByTestId('auth-email').fill(validEmail);
  await page.getByTestId('auth-password').fill(validPassword);

  // 3. Натискаємо кнопку "Sign in"
  await page.getByTestId('auth-submit').click();

  // ГОЛОВНА ПЕРЕВІРКА (ASSERTIONS):
  // 1. Перехід на головну сторінку статей (authenticated state)
  await expect(page).toHaveURL(/\/articles$/);

  // 2. У навігації з'явився профіль і видно ім'я користувача kate2
  const profile = page.getByTestId('nav-profile');
  await expect(profile).toBeVisible();
  await expect(profile).toContainText('kate2');

  // 3. Посилання "Sign in" зникло з меню
  await expect(page.getByTestId('nav-sign-in')).not.toBeVisible();
});