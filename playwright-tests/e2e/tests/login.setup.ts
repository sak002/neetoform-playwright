import { test } from '@playwright/test';
import { STORAGE_STATE } from "../../playwright.config";

test.describe("Forms page", () => {
    test("should be able to login to neetoform", async ({ page }) => {
        await page.goto("https://neeto-form-web-playwright.neetodeployapp.com/login");
        await page.getByRole('button', { name: 'Login as Oliver' }).click();
        await page.context().storageState({ path: STORAGE_STATE });
    });

})
