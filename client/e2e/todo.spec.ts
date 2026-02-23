import { test, expect, Page } from '@playwright/test';

async function clearAllItems(page: Page) {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Add Item' })).toBeVisible();
    await page.waitForTimeout(500);

    let removeButton = page
        .getByRole('button', { name: 'Remove Item' })
        .first();
    while (await removeButton.isVisible().catch(() => false)) {
        await removeButton.click();
        await page.waitForTimeout(300);
        removeButton = page
            .getByRole('button', { name: 'Remove Item' })
            .first();
    }
}

test.describe('Todo App', () => {
    test.beforeEach(async ({ page }) => {
        await clearAllItems(page);
    });

    test('should display the greeting', async ({ page }) => {
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toHaveText('Hello world!');
    });

    test('should show empty state message when no items exist', async ({
        page,
    }) => {
        await expect(
            page.getByText('No items yet! Add one above!'),
        ).toBeVisible();
    });

    test('should add a new todo item', async ({ page }) => {
        const input = page.getByLabel('New item');
        const addButton = page.getByRole('button', { name: 'Add Item' });

        await input.fill('Buy groceries');
        await addButton.click();

        await expect(page.getByText('Buy groceries')).toBeVisible();
        await expect(input).toHaveValue('');
    });

    test('should toggle item completion', async ({ page }) => {
        const input = page.getByLabel('New item');
        const addButton = page.getByRole('button', { name: 'Add Item' });

        await input.fill('Toggle test');
        await addButton.click();
        await expect(page.getByText('Toggle test')).toBeVisible();

        const itemRow = page.locator('.item', { hasText: 'Toggle test' });
        await itemRow
            .getByRole('button', { name: 'Mark item as complete' })
            .click();

        await expect(
            itemRow.getByRole('button', { name: 'Mark item as incomplete' }),
        ).toBeVisible();
        await expect(itemRow).toHaveClass(/completed/);
    });

    test('should delete an item', async ({ page }) => {
        const input = page.getByLabel('New item');
        const addButton = page.getByRole('button', { name: 'Add Item' });

        await input.fill('Delete me');
        await addButton.click();
        await expect(page.getByText('Delete me')).toBeVisible();

        const itemRow = page.locator('.item', { hasText: 'Delete me' });
        await itemRow.getByRole('button', { name: 'Remove Item' }).click();

        await expect(page.getByText('Delete me')).not.toBeVisible();
    });

    test('should add multiple items', async ({ page }) => {
        const input = page.getByLabel('New item');
        const addButton = page.getByRole('button', { name: 'Add Item' });

        const items = ['First task', 'Second task', 'Third task'];

        for (const item of items) {
            await input.fill(item);
            await addButton.click();
            await expect(page.getByText(item)).toBeVisible();
        }

        for (const item of items) {
            await expect(page.getByText(item)).toBeVisible();
        }
    });

    test('should disable add button when input is empty', async ({ page }) => {
        const addButton = page.getByRole('button', { name: 'Add Item' });
        await expect(addButton).toBeDisabled();
    });
});
