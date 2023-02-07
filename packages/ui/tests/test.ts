import { ROUTES } from '../src/lib/routes.js'
import { expect, test } from '@playwright/test'

test('index page has expected header', async ({ page }) => {
	await page.goto(ROUTES.HOME)
	expect(await page.textContent('span')).toBe('Kurate')
})
