import { test, expect, Page } from '@playwright/test';
import {
    LOGIN_SELECTORS,
    NAVBAR_SELECTORS, 
    CREATE_FORM_PAGE_SELECTORS, 
    PUBLISHED_FORM_PAGE_SELECTORS,
    THANK_YOU_PAGE_SELECTORS
} from '../constants/selectors';
import { FORM_TEXTS } from '../constants/texts';

test.describe("Forms page", () => {
    let newPage: Page, newPage2: Page, newPage3: Page;
    test.beforeEach(async ({ page }) => {
        await test.step("Step 1: Login to neetoform", async () => {
            await page.goto("/");
            await page.getByRole('button', { name: LOGIN_SELECTORS.loginButtonName }).click();
        })

        await test.step("Step 2: Create a new form", async () => {
            await page.getByRole('button', { name: NAVBAR_SELECTORS.addFormButtonName }).click({ timeout: 20_000 });
            await page.getByText(NAVBAR_SELECTORS.startFromScratchLink).click();
        })
    });

    test("should be able to add a new form, submit it and verify submission", async ({ page }) => {
        await test.step("Step 3: Add form elements", async () => {
            await page.getByRole('button', { name: CREATE_FORM_PAGE_SELECTORS.fullNameButtonName }).click();
            await page.getByRole('button', { name: CREATE_FORM_PAGE_SELECTORS.phoneNumberButtonName }).click();
        })

        await test.step("Step 4: Publish the form", async () => {
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.publishButton).click();
        })

        await test.step("Step 5: Go to the published form", async () => {
            [newPage] = await Promise.all([
                page.waitForEvent('popup', { timeout: 20_000 }),
                page.getByTestId(CREATE_FORM_PAGE_SELECTORS.publishPreviewButton).click()
            ]);
        })

        await test.step("Step 6: Check if all the fields are visible", async () => {
            await expect(newPage.getByRole('heading', { name: PUBLISHED_FORM_PAGE_SELECTORS.formHeading })).toBeVisible({ timeout: 10_000 });
            await expect(newPage.getByText(PUBLISHED_FORM_PAGE_SELECTORS.emailLabel)).toBeVisible({ timeout: 10_000 });
            await expect(newPage.getByText(PUBLISHED_FORM_PAGE_SELECTORS.fullNameLabel)).toBeVisible({ timeout: 10_000 });
            await expect(newPage.getByText(PUBLISHED_FORM_PAGE_SELECTORS.phoneNumberLabel)).toBeVisible({ timeout: 10_000 });
            await expect(newPage.getByRole('button', { name: PUBLISHED_FORM_PAGE_SELECTORS.submitButtonName })).toBeVisible({ timeout: 10_000 });
        })

        await test.step("step 7: Fill in the form elements with invalid email and phone number to see if it throws error", async () => {
            await newPage.getByTestId(PUBLISHED_FORM_PAGE_SELECTORS.emailField).fill(FORM_TEXTS.defaultInvalidEmail);
            await newPage.getByTestId(PUBLISHED_FORM_PAGE_SELECTORS.phoneNumberField).fill(FORM_TEXTS.defaultInvalidPhoneNumber);
        })

        await test.step("Step 8: Try submitting the form with empty fields", async () => {
            await newPage.getByTestId(PUBLISHED_FORM_PAGE_SELECTORS.emailField).clear();
            await newPage.getByTestId(PUBLISHED_FORM_PAGE_SELECTORS.phoneNumberField).clear();

            await newPage.getByRole('button', { name: PUBLISHED_FORM_PAGE_SELECTORS.submitButtonName }).click();
        })

        await test.step("Step 7: Fill in the form elements with valid values", async () => {
            await newPage.getByTestId(PUBLISHED_FORM_PAGE_SELECTORS.emailField).fill(FORM_TEXTS.defaultEmail);
            await newPage.getByTestId(PUBLISHED_FORM_PAGE_SELECTORS.firstNameField).fill(FORM_TEXTS.defaultFirstName);
            await newPage.getByTestId(PUBLISHED_FORM_PAGE_SELECTORS.lastNameField).fill(FORM_TEXTS.defaultLastName);
            await newPage.getByTestId(PUBLISHED_FORM_PAGE_SELECTORS.phoneNumberField).fill(FORM_TEXTS.defaultPhoneNumber);
            await newPage.getByRole('button', { name: PUBLISHED_FORM_PAGE_SELECTORS.submitButtonName }).click();
        })

        await test.step("Step 8: Check if thank you page is visible", async () => {
            await expect(newPage.getByRole('heading', { name: THANK_YOU_PAGE_SELECTORS.headingName1 })).toBeVisible({ timeout: 10_000});
            await expect(newPage.getByRole('heading', { name: THANK_YOU_PAGE_SELECTORS.headingName2 })).toBeVisible();
            await expect(newPage.getByText(THANK_YOU_PAGE_SELECTORS.responseText)).toBeVisible();
        })

        await test.step("Step 9: Verify the submitted response", async () => {
            await page.getByRole('link', { name: NAVBAR_SELECTORS.submissionLinkName }).click();
            await expect(page.getByRole('cell', { name: FORM_TEXTS.defaultEmail })).toBeVisible();
            await expect(page.getByRole('cell', { name: `${FORM_TEXTS.defaultFirstName} ${FORM_TEXTS.defaultLastName}` })).toBeVisible();
            await expect(page.getByText(`${FORM_TEXTS.defaultCountryCode} ${FORM_TEXTS.defaultPhoneNumber.slice(0,3)} ${FORM_TEXTS.defaultPhoneNumber.slice(3,6)}`)).toBeVisible();
        })
    });

    test("should be able to customize form's field elements", async ({ page }) => {
        test.setTimeout(200_000);

        const optionString = "Option 5, Option 6, Option 7, Option 8, Option 9, Option 10,";
        await test.step("Step 3: Add single and multiple choice elements", async () => {
            await page.getByRole('button', { name: CREATE_FORM_PAGE_SELECTORS.singleChoiceElementButtonName }).click();
            await page.getByRole('button', { name: CREATE_FORM_PAGE_SELECTORS.multipleChoiceElementButtonName }).click();

        })

        await test.step("Step 4: Add six more options to single choice element and randomize it", async () => {
            await page.getByRole('button', { name: CREATE_FORM_PAGE_SELECTORS.questionElementButtonName }).nth(1).click({ timeout: 10_000 });
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.questionContentField).fill(FORM_TEXTS.singleChoiceQuestionText);
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.addBulkOptionLink).click({ timeout: 10_000 });
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.addBulkOptionField).fill(optionString, { timeout: 15_000 });
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.addBulkOptionDoneButton).click({ timeout: 20_000 });
            await page.getByText(CREATE_FORM_PAGE_SELECTORS.randomizeOptionButtonText).click();
        })

        await test.step("Step 4: Add six more options to multiple choice element and hide it", async () => {
            await page.getByRole('button', { name: CREATE_FORM_PAGE_SELECTORS.questionElementButtonName }).nth(2).click({ timeout: 10_000 });
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.questionContentField).fill(FORM_TEXTS.multipleChoiceQuestionText);
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.addOptionLink).click();
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.addOptionLink).click();
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.addOptionLink).click();
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.addOptionLink).click();
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.addOptionLink).click();
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.addOptionLink).click();
            await page.getByText(CREATE_FORM_PAGE_SELECTORS.hideOptionButtonText).click();
        })

        await test.step("Step 5: Publish the form", async () => {
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.publishButton).click();
        })

        await test.step("Step 6: Go to the published form", async () => {
            [newPage] = await Promise.all([
                page.waitForEvent('popup', { timeout: 20_000 }),
                page.getByTestId(CREATE_FORM_PAGE_SELECTORS.publishPreviewButton).click({ timeout: 20_000 })
            ]);
        })

        await newPage.reload();

        await test.step("Step 7: Ensure options in single choice element are randomized", async () => {
            const optionArray = FORM_TEXTS.optionArray;
            const options = newPage.getByTestId(PUBLISHED_FORM_PAGE_SELECTORS.singleChoiceOptions);
            await expect(options).not.toHaveText(optionArray);
            const optionTexts = await options.allInnerTexts();
            // console.log("Option texts", optionTexts);
            const sortedTexts = optionTexts.sort((a, b) => Number(a.split(" ")[1]) - Number(b.split(" ")[1]));
            // console.log("sorted array", sortedTexts);
            expect(sortedTexts).toHaveLength(10);
            expect(sortedTexts).toEqual(optionArray);
        })

        await test.step("Step 8: Verify the multi choice element is hidden", async () => {
            await expect(newPage.getByText(FORM_TEXTS.multipleChoiceQuestionText)).toBeHidden();
        })

        await test.step("Step 8: Uncheck the hide option of multichoice element and publish the form", async () => {
            await page.getByRole('button', { name: CREATE_FORM_PAGE_SELECTORS.questionElementButtonName }).nth(2).click({ timeout: 10_000 });
            await page.getByText(CREATE_FORM_PAGE_SELECTORS.hideOptionButtonText).click();
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.publishButton).click();
            [newPage2] = await Promise.all([
                page.waitForEvent('popup', { timeout: 20_000 }),
                page.getByTestId(CREATE_FORM_PAGE_SELECTORS.publishPreviewButton).click()
            ]);

            await expect(newPage2.getByText(FORM_TEXTS.multipleChoiceQuestionText)).toBeVisible();
        })
    })
});