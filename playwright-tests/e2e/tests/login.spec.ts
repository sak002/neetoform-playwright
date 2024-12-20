import { test } from '@playwright/test';

test.describe("Forms page", () => {
    test("should be able to login to neetoform", async ({ page }) => {
        await page.goto("https://neeto-form-web-playwright.neetodeployapp.com/login");
        await page.getByRole('button', { name: 'Login as Oliver' }).click();
    })
})
