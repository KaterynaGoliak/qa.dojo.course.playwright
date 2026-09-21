import { test, expect } from '@playwright/test';

test.describe('Registration', () => {
  test('REG 1: Успішна реєстрація нового користувача', async ({ page }) => {
    // PRECONDITIONS:
    // Генеруємо унікальний email та username для ізоляції кожного прогону
    const timestamp = Date.now();
    const uniqueUsername = `user_${timestamp}`;
    const uniqueEmail = `user_${timestamp}@example.com`;
    const password = 'Password123!';

    // ДІЇ (ACTIONS):
    // 1. Відкриваємо сторінку реєстрації
    await page.goto('/articles/register');

    // 2. Заповнюємо обов'язкові поля
    await page.getByTestId('auth-username').fill(uniqueUsername);
    await page.getByTestId('auth-email').fill(uniqueEmail);
    await page.getByTestId('auth-password').fill(password);
    await page.getByTestId('register-confirm-password').fill(password);

    // 3. Відмічаємо чекбокс згоди з правилами
    await page.getByTestId('register-terms').check();

    // 4. Натискаємо кнопку створення акаунта
    await page.getByTestId('auth-submit').click();

    // ГОЛОВНА ПЕРЕВІРКА (ASSERTIONS):
    // 1. Відбувся перехід на головну сторінку статей
    await expect(page).toHaveURL(/\/articles$/);

    // 2. У навігації з'явився профіль створеного користувача
    const profileLink = page.getByTestId('nav-profile');
    await expect(profileLink).toBeVisible();
    await expect(profileLink).toContainText(uniqueUsername);

    // 3. З'явилася кнопка для створення нової статті
    await expect(page.getByTestId('nav-new-article')).toBeVisible();
  });

  test('REG 2: Реєстрація з уже використаним email', async ({ page }) => {
    // PRECONDITIONS:
    // Email kate2@gmail.com вже зареєстрований у системі
    const existingEmail = 'kate2@gmail.com';
    const password = 'Password123!';

    // ДІЇ (ACTIONS):
    // 1. Переходимо на сторінку реєстрації
    await page.goto('/articles/register');

    // 2. Вводимо ім'я та вже зайнятий email
    await page.getByTestId('auth-username').fill(`kate_new_${Date.now()}`);
    await page.getByTestId('auth-email').fill(existingEmail);
    await page.getByTestId('auth-password').fill(password);
    await page.getByTestId('register-confirm-password').fill(password);

    // 3. Відмічаємо обов'язковий чекбокс правил
    await page.getByTestId('register-terms').check();

    // 4. Тиснемо кнопку створення акаунта
    await page.getByTestId('auth-submit').click();

    // ГОЛОВНА ПЕРЕВІРКА (ASSERTIONS):
    // 1. Користувач залишається на сторінці реєстрації
    await expect(page).toHaveURL(/\/articles\/register/);

    // 2. Відображається конкретне повідомлення про помилку від сервера
    const errorBlock = page.getByTestId('error-messages');
    await expect(errorBlock).toBeVisible();
    await expect(errorBlock).toContainText('email або username вже зайняті');

    // 3. Користувач залишається неавторизованим
    await expect(page.getByTestId('nav-sign-in')).toBeVisible();
    await expect(page.getByTestId('nav-profile')).not.toBeVisible();
  });

  test('REG 3: Реєстрація з невалідними даними (занадто короткий пароль)', async ({ page }) => {
    // PRECONDITIONS:
    // Унікальні username та email, але пароль < 6 символів
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

    // 2. Показується очікуване повідомлення про валідацію
    const errorBlock = page.getByTestId('error-messages');
    await expect(errorBlock).toBeVisible();
    await expect(errorBlock).toContainText('пароль має містити щонайменше 6 символів');

    // 3. Сесія не створилася — профіль не відображається
    await expect(page.getByTestId('nav-profile')).not.toBeVisible();
  });
});

test.describe('Login', () => {
  test('LOGIN 1: Успішний вхід', async ({ page }) => {
    // PRECONDITIONS:
    // Користувач kate2@gmail.com зареєстрований у системі
    const validEmail = 'kate2@gmail.com';
    const validPassword = 'Kate2@13';

    // ДІЇ (ACTIONS):
    // 1. Відкриваємо сторінку входу
    await page.goto('/articles/login');

    // 2. Вводимо валідні облікові дані
    await page.getByTestId('auth-email').fill(validEmail);
    await page.getByTestId('auth-password').fill(validPassword);

    // 3. Натискаємо кнопку "Sign in"
    await page.getByTestId('auth-submit').click();

    // ГОЛОВНА ПЕРЕВІРКА (ASSERTIONS):
    // 1. Перехід на головну сторінку статей (стан авторизованого користувача)
    await expect(page).toHaveURL(/\/articles$/);

    // 2. У навігації з'явився профіль користувача
    const profile = page.getByTestId('nav-profile');
    await expect(profile).toBeVisible();
    await expect(profile).toContainText('kate2');

    // 3. Посилання "Sign in" зникло з меню
    await expect(page.getByTestId('nav-sign-in')).not.toBeVisible();
  });

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
    // 1. Залишаємося unauthenticated на сторінці входу
    await expect(page).toHaveURL(/\/articles\/login/);

    // 2. Бачимо повідомлення про помилку
    const errorBlock = page.getByTestId('error-messages');
    await expect(errorBlock).toBeVisible();
    await expect(errorBlock).toContainText('email or password неправильні');

    // 3. Сесія не створилася: посилання Sign in залишається, профіль відсутній
    await expect(page.getByTestId('nav-sign-in')).toBeVisible();
    await expect(page.getByTestId('nav-profile')).not.toBeVisible();
  });

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

    // 2. Отримуємо повідомлення про помилку
    const errorBlock = page.getByTestId('error-messages');
    await expect(errorBlock).toBeVisible();
    await expect(errorBlock).toContainText('email or password неправильні');

    // 3. Сесія не створилася: профіль не відображається
    await expect(page.getByTestId('nav-profile')).not.toBeVisible();
    await expect(page.getByTestId('nav-sign-in')).toBeVisible();
  });
});
