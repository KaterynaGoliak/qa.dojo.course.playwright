import { test, expect } from '@playwright/test';

test.describe('Sortable table - Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://104.168.59.50/laboratory/interactions');
  });

  test('Перевірка роботи з чекбоксами (збільшення кількості "Вибрано")', async ({ page }) => {
    // 1. Блок заголовка "Sortable table"
    const tableHeader = page.locator('xpath=//h2[text()="Sortable table"]');
    await expect(tableHeader).toBeVisible();

    // 2. Лічильник вибраних елементів (початково "Вибрано: 0")
    // Можна шукати за текстом або за data-testid через xpath
    const selectedCount = page.locator('xpath=//span[contains(text(), "Вибрано:")]');
    await expect(selectedCount).toHaveText('Вибрано: 0');

    // 3. Чекбокси в рядках таблиці
    // Перший чекбокс (наприклад, для першого рядка таблиці)
    const firstCheckbox = page.locator('xpath=(//table[@data-testid="interactions-table"]//tbody//input[@type="checkbox"])[1]');
    await firstCheckbox.check();

    // Перевіряємо, що лічильник збільшився до 1
    await expect(selectedCount).toHaveText('Вибрано: 1');

    // 4. Другий чекбокс
    const secondCheckbox = page.locator('xpath=(//table[@data-testid="interactions-table"]//tbody//input[@type="checkbox"])[2]');
    await secondCheckbox.check();

    // Перевіряємо, що лічильник збільшився до 2
    await expect(selectedCount).toHaveText('Вибрано: 2');

    // Додатково: зняття вибору (декремент)
    await firstCheckbox.uncheck();
    await expect(selectedCount).toHaveText('Вибрано: 1');
  });

  test('Перевірка сортування колонок і зміни порядку рядків', async ({ page }) => {
    // Таблиця
    const table = page.locator('xpath=//table[@data-testid="interactions-table"]');
    await expect(table).toBeVisible();

    // Всі назви тестів у стовпчику "Тест" (2-га колонка)
    const testNameCells = page.locator('xpath=//table[@data-testid="interactions-table"]//tbody/tr/td[2]');

    // За замовчуванням відсортовано за зростанням (asc):
    // "Авторизація", "Завантаження файлу", "Пошук за тегом", "Створення статті"
    await expect(testNameCells).toHaveText([
      'Авторизація',
      'Завантаження файлу',
      'Пошук за тегом',
      'Створення статті'
    ]);

    // Кнопка сортування колонки "Тест"
    const sortNameBtn = page.locator('xpath=//button[contains(., "Тест")]');
    
    // Клікаємо для сортування за спаданням (desc)
    await sortNameBtn.click();

    // Перевіряємо, що порядок змінився на зворотний
    await expect(testNameCells).toHaveText([
      'Створення статті',
      'Пошук за тегом',
      'Завантаження файлу',
      'Авторизація'
    ]);

    // Кнопка сортування колонки "Тривалість"
    const sortDurationBtn = page.locator('xpath=//button[contains(., "Тривалість")]');
    await sortDurationBtn.click();

    // Стовпчик тривалості (4-та колонка)
    const durationCells = page.locator('xpath=//table[@data-testid="interactions-table"]//tbody/tr/td[4]');

    // Тривалість за зростанням: 0.0 s, 5.7 s, 8.4 s, 12.1 s
    await expect(durationCells).toHaveText([
      '0.0 s',
      '5.7 s',
      '8.4 s',
      '12.1 s'
    ]);

    // Клікаємо ще раз по колонці "Тривалість" для сортування за спаданням
    await sortDurationBtn.click();

    // Тривалість за спаданням: 12.1 s, 8.4 s, 5.7 s, 0.0 s
    await expect(durationCells).toHaveText([
      '12.1 s',
      '8.4 s',
      '5.7 s',
      '0.0 s'
    ]);
  });
});
