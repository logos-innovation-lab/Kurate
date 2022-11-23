import { expect, test } from '@playwright/test';

test('index page has expected header', async ({ page }) => {
	await page.goto('/');
	expect(await page.textContent('span')).toBe('The Outlet');
});
