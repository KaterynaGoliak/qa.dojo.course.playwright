import { test, expect, Page } from '@playwright/test';

/**
 * Допоміжна функція: Реєстрація нового користувача та перевірка авторизації
 */
async function registerUser(page: Page, username: string, email: string, password: string): Promise<void> {
  // 1. Перехід на сторінку реєстрації
  await page.goto('/articles/register');

  // 2. Заповнення полів форми реєстрації
  await page.getByTestId('auth-username').fill(username);
  await page.getByTestId('auth-email').fill(email);
  await page.getByTestId('auth-password').fill(password);
  await page.getByTestId('register-confirm-password').fill(password);

  // 3. Підтвердження згоди з правилами
  await page.getByTestId('register-terms').check();

  // 4. Відправка форми
  await page.getByTestId('auth-submit').click();

  // 5. Перевірка успішної авторизації
  await expect(page).toHaveURL(/\/articles$/);
  const profileLink = page.getByTestId('nav-profile');
  await expect(profileLink).toBeVisible();
  await expect(profileLink).toContainText(username);
}

/**
 * Допоміжна функція: Передумова для Your Feed (підписка на себе)
 * За логікою Conduit / RealWorld, Your Feed відображає лише статті авторів,
 * на яких користувач підписаний. Для того щоб створені користувачем статті
 * з'явилися у його персональній стрічці, додаємо підписку на свій профіль.
 */
async function followSelf(page: Page, username: string): Promise<void> {
  await page.evaluate(async (uname) => {
    const token = localStorage.getItem('qa-dojo.token');
    await fetch(`/api/profiles/${uname}/follow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    });
  }, username);
}

/**
 * Допоміжна функція: Створення однієї статті через інтерфейс редактора
 */
async function createArticle(page: Page, title: string, description: string, body: string): Promise<void> {
  // 1. Перехід до форми створення статті
  await page.getByTestId('nav-new-article').click();
  await expect(page.getByTestId('editor-title')).toBeVisible();

  // 2. Заповнення обов'язкових полів статті
  await page.getByTestId('editor-title').fill(title);
  await page.getByTestId('editor-description').fill(description);
  await page.getByTestId('editor-body').fill(body);

  // 3. Публікація статті
  await page.getByTestId('editor-submit').click();

  // 4. Перевірка успішної публікації (перехід на сторінку статті з правильним заголовком)
  const articleTitle = page.getByTestId('article-title');
  await expect(articleTitle).toBeVisible();
  await expect(articleTitle).toHaveText(title);
}

/**
 * Допоміжна функція: Перевірка наявності списку статей у Your Feed з урахуванням пагінації
 */
async function verifyArticlesInYourFeed(page: Page, expectedTitles: string[]): Promise<void> {
  // 1. Відкриваємо головну сторінку статей
  await page.goto('/articles');

  // 2. Перемикаємося на вкладку "Your feed"
  const yourFeedTab = page.getByTestId('feed-tab-your');
  await yourFeedTab.click();
  await expect(yourFeedTab).toHaveAttribute('data-active', 'true');

  // Очікуємо завершення завантаження списку статей
  await expect(page.getByTestId('article-list-loading')).not.toBeVisible();

  // 3. Збираємо всі заголовки статей з усіх доступних сторінок стрічки Your Feed
  const allFeedTitles: string[] = [];
  const pagination = page.getByTestId('pagination');

  if (await pagination.isVisible()) {
    const pageButtons = pagination.locator('button');
    const totalPages = await pageButtons.count();

    for (let p = 1; p <= totalPages; p++) {
      if (p > 1) {
        await page.getByTestId(`pagination-page-${p}`).click();
        await expect(page.getByTestId('article-list-loading')).not.toBeVisible();
      }
      const titlesOnPage = await page.getByTestId('preview-title').allInnerTexts();
      allFeedTitles.push(...titlesOnPage);
    }
  } else {
    const titlesOnPage = await page.getByTestId('preview-title').allInnerTexts();
    allFeedTitles.push(...titlesOnPage);
  }

  // 4. Цикл перевірки: переконуємося, що кожна створена стаття присутня у Your Feed
  for (const title of expectedTitles) {
    expect(
      allFeedTitles,
      `Статтю "${title}" не знайдено у персональній стрічці Your Feed!`
    ).toContain(title);
  }
}

test.describe('Your Feed - Створення та перевірка статей', () => {
  test('Створення 10 статей і перевірка їхньої наявності у Your Feed', async ({ page }) => {
    // Збільшуємо таймаут для послідовного створення 10 статей через UI
    test.setTimeout(120000);

    // Унікальні ідентифікатори для ізоляції тестового прогону
    const runId = Date.now();
    const username = `user_${runId}`;
    const email = `user_${runId}@example.com`;
    const password = 'Password123!';

    // СЦЕНАРІЙ ТЕСТУ:

    // 1. Авторизація (реєстрація нового користувача)
    await registerUser(page, username, email, password);

    // Підготовка передумови: підписка користувача на себе для формування Your Feed
    await followSelf(page, username);

    // 2. Створення 10 статей за допомогою циклу та власної функції
    const createdTitles: string[] = [];
    for (let i = 1; i <= 10; i++) {
      const title = `Article ${runId}-${i}`;
      const description = `Опис для статті номер ${i} (запуск ${runId})`;
      const body = `Повний текст статті номер ${i}. Тестування E2E сценарію створення статей.`;

      await createArticle(page, title, description, body);
      createdTitles.push(title);
    }

    // 3. Перевірка персональної стрічки Your Feed
    await verifyArticlesInYourFeed(page, createdTitles);
  });
});
