import { test, expect, Page } from '@playwright/test';

test.describe("Forms page", () => {
    test("should be able to add a new form", async ({ page, context }) => {
        let newPage: Page;
        await test.step("Step 1: Login to neetoform", async () => {
            await page.goto("https://neeto-form-web-playwright.neetodeployapp.com/login");
            await page.getByRole('button', { name: 'Login as Oliver' }).click();
        })

        await test.step("Step 2: Create a new form", async () => {
            await page.getByRole('button', { name: 'Add new form' }).click({ timeout: 10_000 });
            await page.getByText('Start from scratchA blank').click();
        })

        await test.step("Step 3: Add form elements", async () => {
            await page.getByRole('button', { name: 'Full name' }).click();
            await page.getByRole('button', { name: 'Phone number' }).click();
        })

        await test.step("Step 4: Publish the form", async () => {
            await page.getByTestId('publish-button').click();
        })

        await test.step("Step 5: Go to the published form", async () => {
            [newPage] = await Promise.all([
                page.waitForEvent('popup', { timeout: 10_000 }),
                page.getByTestId('publish-preview-button').click()
              ]);
            
        })
        await test.step("Step 6: Check if all the fields are visible", async () => {
            await expect(newPage.getByRole('heading', { name: 'Form Title' })).toBeVisible({ timeout: 10_000 });
            await expect(newPage.getByText('Email address*')).toBeVisible({ timeout: 10_000 });
            await expect(newPage.getByText('Full name*')).toBeVisible({ timeout: 10_000 });
            await expect(newPage.getByText('Phone number*')).toBeVisible({ timeout: 10_000 });
            await expect(newPage.getByRole('button', { name: 'Submit' })).toBeVisible({ timeout: 10_000 });
        })

        await test.step("step 7: Fill in the form elements with invalid email and phone number to see if it throws error", async () => {
            await newPage.getByTestId('email-text-field').fill("oliver");
            await newPage.getByTestId('phone-number-input-field').fill("123");
        })

        await test.step("Step 8: Try submitting the form with empty fields", async () => {
            await newPage.getByTestId('email-text-field').clear();
            await newPage.getByTestId('phone-number-input-field').clear();

            await newPage.getByRole('button', { name: 'Submit' }).click();
        })

        await test.step("Step 7: Fill in the form elements with valid values", async () => {
            await newPage.getByTestId('email-text-field').fill("oliver@example.com");
            await newPage.getByTestId('first-name-text-field').fill("Oliver");
            await newPage.getByTestId('last-name-text-field').fill("Smith");
            await newPage.getByTestId('phone-number-input-field').fill("9087654321");
            await newPage.getByRole('button', { name: 'Submit' }).click();
        })

        await test.step("Step 8: Check if thank you is visible", async () => {
            await expect(newPage.getByRole('heading', { name: '🎉' })).toBeVisible();
            await expect(newPage.getByRole('heading', { name: 'Thank You.' })).toBeVisible();
            await expect(newPage.getByText('Your response has been')).toBeVisible();
        })

        await test.step("Step 9: Verify the submitted response", async () => {
            await page.getByRole('link', { name: 'Submissions' }).click();
            await expect(page.getByRole('cell', { name: 'oliver@example.com' })).toBeVisible();
            await expect(page.getByRole('cell', { name: 'Oliver Smith' })).toBeVisible();
            await expect(page.getByText('+1 908 765')).toBeVisible();
        })
    })
});