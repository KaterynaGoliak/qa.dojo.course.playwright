import { test, expect } from '@playwright/test';

test('REG 2: Реєстрація з уже використаним email', async ({ page }) => {
    // PRECONDITIONS:
    // Email kate2@gmail.com вже був зареєстрований раніше у тесті REG 1
    const existingEmail = 'kate2@gmail.com';
    const password = 'Kate2@13';

    // ДІЇ (ACTIONS):
    // 1. Переходимо на сторінку реєстрації
    await page.goto('/articles/register');

    // 2. Вводимо ім'я та вже зайнятий email
    await page.getByTestId('auth-username').fill('kate_new');
    await page.getByTestId('auth-email').fill(existingEmail);
    await page.getByTestId('auth-password').fill(password);
    await page.getByTestId('register-confirm-password').fill(password);

    // 3. Відмічаємо обов'язковий чекбокс правил
    await page.getByTestId('register-terms').check();

    // 4. Тиснемо кнопку створення акаунта
    await page.getByTestId('auth-submit').click();

    // ГОЛОВНА ПЕРЕВІРКА (ASSERTIONS):
    // 1. Користувач залишається на сторінці реєстрації (переходу на /articles не відбулося)
    await expect(page).toHaveURL(/\/articles\/register/);

    // 2. Відображається конкретне повідомлення про помилку від сервера
    const errorBlock = page.getByTestId('error-messages');
    await expect(errorBlock).toBeVisible();
    await expect(errorBlock).toContainText('email або username вже зайняті');

    // 3. Користувач залишається неавторизованим (кнопка "Sign in" досі є в навігації)
    await expect(page.getByTestId('nav-sign-in')).toBeVisible();
    await expect(page.getByTestId('nav-profile')).not.toBeVisible();
});