import { expect, Page, BrowserContext } from '@playwright/test';
import pdfParse from 'pdf-parse';
import { faker } from "@faker-js/faker";
import { test } from '../fixtures';
import {
    LOGIN_SELECTORS,
    NAVBAR_SELECTORS,
    CREATE_FORM_PAGE_SELECTORS,
    PUBLISHED_FORM_PAGE_SELECTORS,
    THANK_YOU_PAGE_SELECTORS,
    SUBMISSIONS_PAGE_SELECTORS,
    FORM_TABLE_SELECTORS,
    SETTINGS_PAGE_SELECTORS,
    SHARE_PAGE_SELECTORS,
    ADD_CONDITION_SELECTORS,
} from '../constants/selectors';
import { FORM_TEXTS, CREATE_FORM_TEXTS } from '../constants/texts';

test.describe("Forms page", () => {
    let newPage: Page, newPage2: Page, newPage3: Page, formName: string, formUrl: string;
    test.beforeEach(async ({ page }) => {
        await test.step("Step 1: Login to neetoform", async () => {
            await page.goto("/");
            await page.getByRole('button', { name: LOGIN_SELECTORS.loginButtonName }).click();
        })

        await test.step("Step 2: Create a new form", async () => {
            await page.getByRole('button', { name: NAVBAR_SELECTORS.addFormButtonName }).click({ timeout: 20_000 });
            await page.getByText(NAVBAR_SELECTORS.startFromScratchLink).click();
        })


        formName = faker.word.words({ count: 2 });
        await page.getByTestId('form-title').click();
        await page.getByTestId(NAVBAR_SELECTORS.formRenameField).fill(formName);
    });

    test.afterEach(async ({ page }) => {
        await page.getByTestId(NAVBAR_SELECTORS.homeButton).click();
        await page.getByRole('cell', { name: formName }).getByTestId(FORM_TABLE_SELECTORS.moreActionsDropdownButton).click({ timeout: 10_000 });
        await page.getByRole('button', { name: FORM_TABLE_SELECTORS.deleteButtonName }).click();
        await page.getByTestId('delete-archive-alert-archive-checkbox').click();
        await page.getByTestId('delete-archive-alert-delete-button').click();
    })

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
            await expect(newPage.getByRole('heading', { name: THANK_YOU_PAGE_SELECTORS.headingName1 })).toBeVisible({ timeout: 10_000 });
            await expect(newPage.getByRole('heading', { name: THANK_YOU_PAGE_SELECTORS.headingName2 })).toBeVisible();
            await expect(newPage.getByText(THANK_YOU_PAGE_SELECTORS.responseText)).toBeVisible();
        })

        await test.step("Step 9: Verify the submitted response", async () => {
            await page.getByRole('link', { name: NAVBAR_SELECTORS.submissionLinkName }).click();
            await expect(page.getByRole('cell', { name: FORM_TEXTS.defaultEmail })).toBeVisible();
            await expect(page.getByRole('cell', { name: `${FORM_TEXTS.defaultFirstName} ${FORM_TEXTS.defaultLastName}` })).toBeVisible();
            await expect(page.getByText(`${FORM_TEXTS.defaultCountryCode} ${FORM_TEXTS.defaultPhoneNumber.slice(0, 3)} ${FORM_TEXTS.defaultPhoneNumber.slice(3, 6)}`)).toBeVisible();
        })
    });

    test("should be able to customize form's field elements", async ({ page }) => {
        // test.setTimeout(200_000);

        const optionString = "Option 5, Option 6, Option 7, Option 8, Option 9, Option 10,";
        await test.step("Step 3: Add single and multiple choice elements", async () => {
            await page.getByRole('button', { name: CREATE_FORM_PAGE_SELECTORS.singleChoiceElementButtonName }).click();
            await page.getByRole('button', { name: CREATE_FORM_PAGE_SELECTORS.multipleChoiceElementButtonName }).click();

        })

        await test.step("Step 4: Add six more options to single choice element and randomize it", async () => {
            await page.getByRole('button', { name: CREATE_FORM_PAGE_SELECTORS.questionElementButtonName }).nth(1).click({ timeout: 10_000 });
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.questionContentField).fill(CREATE_FORM_TEXTS.singleChoiceQuestionText);
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.addBulkOptionLink).click({ timeout: 10_000 });
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.addBulkOptionField).fill(optionString, { timeout: 15_000 });
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.addBulkOptionDoneButton).click({ timeout: 20_000 });
            await page.getByText(CREATE_FORM_PAGE_SELECTORS.randomizeOptionButtonText).click();
        })

        await test.step("Step 4: Add six more options to multiple choice element and hide it", async () => {
            await page.getByRole('button', { name: CREATE_FORM_PAGE_SELECTORS.questionElementButtonName }).nth(2).click({ timeout: 10_000 });
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.questionContentField).fill(CREATE_FORM_TEXTS.multipleChoiceQuestionText);
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
            const optionArray = CREATE_FORM_TEXTS.optionArray;
            const options = newPage.getByTestId(PUBLISHED_FORM_PAGE_SELECTORS.singleChoiceOptions);
            await expect(options).not.toHaveText(optionArray);
            const optionTexts = await options.allInnerTexts();
            const sortedTexts = optionTexts.sort((a, b) => Number(a.split(" ")[1]) - Number(b.split(" ")[1]));
            expect(sortedTexts).toHaveLength(10);
            expect(sortedTexts).toEqual(optionArray);
        })

        await test.step("Step 8: Verify the multi choice element is hidden", async () => {
            await expect(newPage.getByText(CREATE_FORM_TEXTS.multipleChoiceQuestionText)).toBeHidden();
        })

        await test.step("Step 8: Uncheck the hide option of multichoice element and publish the form", async () => {
            await page.getByRole('button', { name: CREATE_FORM_PAGE_SELECTORS.questionElementButtonName }).nth(2).click({ timeout: 10_000 });
            await page.getByText(CREATE_FORM_PAGE_SELECTORS.hideOptionButtonText).click();
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.publishButton).click();
            [newPage2] = await Promise.all([
                page.waitForEvent('popup', { timeout: 20_000 }),
                page.getByTestId(CREATE_FORM_PAGE_SELECTORS.publishPreviewButton).click()
            ]);

            await expect(newPage2.getByText(CREATE_FORM_TEXTS.multipleChoiceQuestionText)).toBeVisible();
        })
    })

    test("should be able to verify form insights", async ({ page }) => {
        await test.step("Step 3: Publish the form", async () => {
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.publishButton).click();
        })

        await test.step("Step 4: Go to the insights tab", async () => {
            await page.getByRole('link', { name: NAVBAR_SELECTORS.submissionLinkName }).click();
            await page.getByRole('link', { name: SUBMISSIONS_PAGE_SELECTORS.insightsLinkName }).click();
        })

        await test.step("Step 5: Verify the visits, starts, submissions count and completion rate is 0", async () => {
            await expect(page.getByTestId(SUBMISSIONS_PAGE_SELECTORS.visitsCountSection)
                .getByTestId(SUBMISSIONS_PAGE_SELECTORS.insightsCount)).toHaveText("0");
            await expect(page.getByTestId(SUBMISSIONS_PAGE_SELECTORS.startsCountSection)
                .getByTestId(SUBMISSIONS_PAGE_SELECTORS.insightsCount)).toHaveText("0");
            await expect(page.getByTestId(SUBMISSIONS_PAGE_SELECTORS.submissionsCountSection)
                .getByTestId(SUBMISSIONS_PAGE_SELECTORS.insightsCount)).toHaveText("0");
            await expect(page.getByTestId(SUBMISSIONS_PAGE_SELECTORS.completionRateSection)
                .getByTestId(SUBMISSIONS_PAGE_SELECTORS.insightsCount)).toHaveText("0%");
        })

        await test.step("Step 6: Go to the published page and verify the visits count", async () => {
            [newPage] = await Promise.all([
                page.waitForEvent('popup', { timeout: 20_000 }),
                page.getByTestId(CREATE_FORM_PAGE_SELECTORS.publishPreviewButton).click()
            ]);

            await page.reload();
            await expect(page.getByTestId(SUBMISSIONS_PAGE_SELECTORS.visitsCountSection)
                .getByTestId(SUBMISSIONS_PAGE_SELECTORS.insightsCount)).toHaveText("1", { timeout: 10_000 });
        })

        await test.step("Step 7: Go to the published form again and add a value to the field", async () => {
            [newPage2] = await Promise.all([
                page.waitForEvent('popup', { timeout: 20_000 }),
                page.getByTestId(CREATE_FORM_PAGE_SELECTORS.publishPreviewButton).click()
            ]);

            await newPage2.getByRole('textbox').fill(FORM_TEXTS.defaultEmail);
        })

        await test.step("Step 8: Verify the visits and starts count", async () => {
            await page.reload();
            await expect(page.getByTestId(SUBMISSIONS_PAGE_SELECTORS.visitsCountSection)
                .getByTestId(SUBMISSIONS_PAGE_SELECTORS.insightsCount)).toHaveText("2");
            await expect(page.getByTestId(SUBMISSIONS_PAGE_SELECTORS.startsCountSection)
                .getByTestId(SUBMISSIONS_PAGE_SELECTORS.insightsCount)).toHaveText("1");
        })

        await test.step("Step 9: Open the published form again and submit the form", async () => {
            [newPage3] = await Promise.all([
                page.waitForEvent('popup', { timeout: 20_000 }),
                page.getByTestId(CREATE_FORM_PAGE_SELECTORS.publishPreviewButton).click()
            ]);
            await newPage3.getByRole('button', { name: PUBLISHED_FORM_PAGE_SELECTORS.submitButtonName }).click({ timeout: 10_000 });
        })

        await test.step("Step 10: Verify the visits, starts, submissions count and completion rate", async () => {
            await page.reload();
            await expect(page.getByTestId(SUBMISSIONS_PAGE_SELECTORS.visitsCountSection).getByTestId(SUBMISSIONS_PAGE_SELECTORS.insightsCount)).toHaveText("3");
            await expect(page.getByTestId(SUBMISSIONS_PAGE_SELECTORS.startsCountSection).getByTestId(SUBMISSIONS_PAGE_SELECTORS.insightsCount)).toHaveText("1");
            await expect(page.getByTestId(SUBMISSIONS_PAGE_SELECTORS.submissionsCountSection).getByTestId(SUBMISSIONS_PAGE_SELECTORS.insightsCount)).toHaveText("1", { timeout: 10_000 });
            await expect(page.getByTestId(SUBMISSIONS_PAGE_SELECTORS.completionRateSection).getByTestId(SUBMISSIONS_PAGE_SELECTORS.insightsCount)).toHaveText("100%");
        })
    })

    test("should be able to access control the form", async ({ page, context, browser, formPage }) => {
        let newUserContext: BrowserContext, newUserPage: Page;
        await test.step("Step 3: Publish the form", async () => {
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.publishButton).click();
        })

        await test.step("Step 4: Go to access control card", async () => {
            await page.getByRole('link', { name: NAVBAR_SELECTORS.settingsLinkName }).click();
            await page.getByRole('link', { name: SETTINGS_PAGE_SELECTORS.accessControlCardName }).click();
        })

        await test.step("Step 5: Secure access with password", async () => {
            await page.getByText(SETTINGS_PAGE_SELECTORS.secureByPasswordOptionText).click();
            await page.getByPlaceholder(SETTINGS_PAGE_SELECTORS.passwordFieldPlaceholder).fill(CREATE_FORM_TEXTS.defaultFormPassword);
            await page.getByTestId(SETTINGS_PAGE_SELECTORS.saveChangesButton).click();
        })

        await test.step("Step 6: Copy form link to clipboard and read it", async () => {
            formUrl = await formPage.copyFormLink();
        })

        await test.step("Step 7: Open form in a new page and access using password", async () => {
            newUserContext = await browser.newContext();
            newUserPage = await newUserContext.newPage();

            await newUserPage.goto(formUrl);
            await newUserPage.getByTestId(PUBLISHED_FORM_PAGE_SELECTORS.passwordField).fill('password123');
            await newUserPage.getByTestId(PUBLISHED_FORM_PAGE_SELECTORS.submitPasswordButton).click();
        })

        await test.step("Step 8: Fill in the form and verify submission", async () => {
            await newUserPage.getByRole('textbox').fill(FORM_TEXTS.defaultEmail);
            await newUserPage.getByRole('button', { name: PUBLISHED_FORM_PAGE_SELECTORS.submitButtonName }).click({ timeout: 10_000 });
            await page.getByRole('link', { name: NAVBAR_SELECTORS.submissionLinkName }).click();
            await expect(page.getByRole('cell', { name: FORM_TEXTS.defaultEmail })).toBeVisible();
        })

        await test.step("Step 9: Close page and context", async () => {
            await newUserPage.close();
            await newUserContext.close();
        })
    })

    test("should be able to make unique submissions", async ({ page, context, browser, formPage }) => {
        await test.step("Step 3: Publish the form", async () => {
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.publishButton).click();
        })

        await test.step("Step 4: Go to prevent duplicate submissions card", async () => {
            await page.getByRole('link', { name: NAVBAR_SELECTORS.settingsLinkName }).click();
            await page
                .getByRole('link', { name: SETTINGS_PAGE_SELECTORS.uniqueSubmissionCardName })
                .click();
        })

        await test.step("Step 5: Select use cookies option and save it", async () => {
            await page.getByText(SETTINGS_PAGE_SELECTORS.useCookiesOptionText).click();
            await page.getByTestId(SETTINGS_PAGE_SELECTORS.saveChangesButton).click();
        });

        await test.step("Step 8: Open the form and submit it", async () => {
            [newPage] = await Promise.all([
                page.waitForEvent('popup', { timeout: 60_000 }),
                page.getByTestId(CREATE_FORM_PAGE_SELECTORS.publishPreviewButton).click({ timeout: 10_000 })
            ]);
            await newPage.getByRole('textbox').fill(FORM_TEXTS.defaultEmail);
            await newPage.getByRole('button', { name: PUBLISHED_FORM_PAGE_SELECTORS.submitButtonName }).click({ timeout: 10_000 });
        })

        await test.step("Step 6: Open the form again", async () => {
            [newPage2] = await Promise.all([
                page.waitForEvent('popup', { timeout: 20_000 }),
                page.getByTestId(CREATE_FORM_PAGE_SELECTORS.publishPreviewButton).click({ timeout: 10_000 })
            ]);
        })

        await test.step("Step 7: Copy the form link", async () => {
            const formUrl = await formPage.copyFormLink();
        })

        await test.step("Step 7: Fill the form in new context", async () => {
            const newUserContext = await browser.newContext();
            const newUserPage = await newUserContext.newPage();

            await newUserPage.goto(formUrl);
            await newUserPage.getByRole('textbox').fill(FORM_TEXTS.defaultEmail);
            await newUserPage.getByRole('button', { name: PUBLISHED_FORM_PAGE_SELECTORS.submitButtonName }).click({ timeout: 10_000 });

            await newUserPage.close();
            await newUserContext.close();
        })
        await test.step("Step 7: Turn off unique submissions", async () => {
            await page.getByRole('link', { name: NAVBAR_SELECTORS.settingsLinkName }).click();
            await page
                .getByRole('link', { name: SETTINGS_PAGE_SELECTORS.uniqueSubmissionCardName })
                .click();
            await page.getByText(SETTINGS_PAGE_SELECTORS.noCheckOptionText).click();
            await page.getByTestId(SETTINGS_PAGE_SELECTORS.saveChangesButton).click();
        })
        await test.step("Step 7: Fill the form again", async () => {
            [newPage3] = await Promise.all([
                page.waitForEvent('popup', { timeout: 60_000 }),
                page.getByTestId(CREATE_FORM_PAGE_SELECTORS.publishPreviewButton).click({ timeout: 10_000 })
            ]);

            await newPage3.getByRole('textbox').fill(FORM_TEXTS.defaultEmail);
            await newPage3.getByRole('button', { name: PUBLISHED_FORM_PAGE_SELECTORS.submitButtonName }).click({ timeout: 10_000 });
        })
    })

    test("should be able to add conditional logic to the form", async ({ page }) => {
        await test.step("Step 3: Add a single choice element with two options", async () => {
            await page.getByRole('button', { name: CREATE_FORM_PAGE_SELECTORS.singleChoiceElementButtonName }).click();
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.questionContentField).fill(CREATE_FORM_TEXTS.standardSingleChoiceQuestionText);
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.singleChoiceOption1).click();
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.singleChoiceOption1).fill(CREATE_FORM_TEXTS.yesOptionText);
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.singleChoiceOption2).click();
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.singleChoiceOption2).fill(CREATE_FORM_TEXTS.noOptionText);

            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.singleChoiceOption3).hover();
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.singleChoiceOption3).click();
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.singleChoiceOption3).hover();
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.singleChoiceOption3).click();

            await page.getByRole('button', { name: NAVBAR_SELECTORS.summaryButtonName }).click();
            await page
                .getByRole('button', { name: CREATE_FORM_TEXTS.standardSingleChoiceQuestionText })
                .dragTo(page.getByRole('button', { name: CREATE_FORM_PAGE_SELECTORS.emailAddressButtonName }));
        })

        await test.step("Step 4: Go to conditional logic in settings tab", async () => {
            await page.getByRole('link', { name: NAVBAR_SELECTORS.settingsLinkName }).click();
            await page.getByRole('link', { name: SETTINGS_PAGE_SELECTORS.conditionalLogicCardName }).click();
        })

        await test.step("Step 5: Add new condition", async () => {
            await page.getByTestId(SETTINGS_PAGE_SELECTORS.addNewConditionButton).click();

            const [conditionSelector, verbSelector, optionSelector, actionSelector, _] =
                await page.getByTestId(SETTINGS_PAGE_SELECTORS.selectElementsForAddingCondition).all();

            await conditionSelector.click();
            await page.getByText(ADD_CONDITION_SELECTORS.selectConditionOptionText).click();

            await verbSelector.click();
            await page.getByText(ADD_CONDITION_SELECTORS.selectVerbOptionText, { exact: true }).click();

            await optionSelector.click();
            await page.getByText(ADD_CONDITION_SELECTORS.selectOptionOptionText, { exact: true }).click();

            await actionSelector.click();
            await page.locator(ADD_CONDITION_SELECTORS.selectActionOptionText).click();

            await page.locator(ADD_CONDITION_SELECTORS.selectFieldLocator).click();
            await page.getByText(ADD_CONDITION_SELECTORS.selectFieldOptionText, { exact: true }).click();

            await page.locator(ADD_CONDITION_SELECTORS.saveChangesButtonLocator).click();
        })

        await test.step("Step 6: Publish the form", async () => {
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.publishButton).click();
        })

        await test.step("Step 7: Open the form and click No option and submit", async () => {
            [newPage] = await Promise.all([
                page.waitForEvent('popup', { timeout: 20_000 }),
                page.getByTestId(CREATE_FORM_PAGE_SELECTORS.publishPreviewButton).click()
            ]);

            await expect(newPage.getByText(PUBLISHED_FORM_PAGE_SELECTORS.emailAddressQuestionLabel)).toBeHidden();
            await newPage.locator('label').filter({ hasText: CREATE_FORM_TEXTS.noOptionText }).click();
            await newPage.getByRole('button', { name: PUBLISHED_FORM_PAGE_SELECTORS.submitButtonName }).click();
        })

        await test.step("Step 8: Open the form and fill Yes", async () => {
            [newPage2] = await Promise.all([
                page.waitForEvent('popup', { timeout: 20_000 }),
                page.getByTestId(CREATE_FORM_PAGE_SELECTORS.publishPreviewButton).click()
            ]);
            await expect(newPage2.getByText(PUBLISHED_FORM_PAGE_SELECTORS.emailAddressQuestionLabel)).toBeHidden();
            await newPage2.locator('label').filter({ hasText: CREATE_FORM_TEXTS.yesOptionText }).click();
            await expect(newPage2.getByText(PUBLISHED_FORM_PAGE_SELECTORS.emailAddressQuestionLabel)).toBeVisible();
            await newPage2.getByRole('textbox').fill(FORM_TEXTS.defaultEmail);
            await newPage2.getByRole('button', { name: PUBLISHED_FORM_PAGE_SELECTORS.submitButtonName }).click();
        })

        await test.step("Step 9: Disable the condition", async () => {
            await page.getByRole('button', { name: ADD_CONDITION_SELECTORS.chooseConditionButtonName }).getByRole('button').click();
            await page.getByRole('button', { name: ADD_CONDITION_SELECTORS.conditionDisableButtonName }).click();
        })

        await test.step("Step 8: Fill the form again", async () => {
            [newPage3] = await Promise.all([
                page.waitForEvent('popup', { timeout: 20_000 }),
                page.getByTestId(CREATE_FORM_PAGE_SELECTORS.publishPreviewButton).click()
            ]);
            await expect(newPage3.getByText(PUBLISHED_FORM_PAGE_SELECTORS.emailAddressQuestionLabel)).toBeVisible();
            await newPage3.locator('label').filter({ hasText: CREATE_FORM_TEXTS.yesOptionText }).click();
            await newPage3.locator('label').filter({ hasText: CREATE_FORM_TEXTS.noOptionText }).click();
            await newPage3.getByRole('textbox').fill(FORM_TEXTS.defaultEmail);
            await newPage3.getByRole('button', { name: PUBLISHED_FORM_PAGE_SELECTORS.submitButtonName }).click();
        })
    })

    test("should be able to download submissions and verify them", async ({ page, formPage }) => {
        await test.step("Step 3: Add a star rating, opinion scale and matrix fields to the form", async () => {
            await formPage.addStarRatingOpinionAndMatrixField();
        })

        await test.step("Step 5: Publish the form and make a submission", async () => {
            await page.getByTestId(CREATE_FORM_PAGE_SELECTORS.publishButton).click();

            [newPage] = await Promise.all([
                page.waitForEvent('popup', { timeout: 20_000 }),
                page.getByTestId(CREATE_FORM_PAGE_SELECTORS.publishPreviewButton).click()
            ]);

            await newPage.getByRole('textbox').fill(FORM_TEXTS.defaultEmail);
            await newPage.locator(PUBLISHED_FORM_PAGE_SELECTORS.starRatingLocator).nth(3).click();
            await newPage.getByText(PUBLISHED_FORM_PAGE_SELECTORS.defaultRating).click();
            await newPage.getByRole('row', { name: PUBLISHED_FORM_PAGE_SELECTORS.matrixRow1Name }).locator('span').first().click();
            await newPage.getByRole('row', { name: PUBLISHED_FORM_PAGE_SELECTORS.matrixRow2Name }).locator('span').nth(1).click();
            await newPage.getByRole('button', { name: PUBLISHED_FORM_PAGE_SELECTORS.submitButtonName }).click();
        })

        await test.step("Step 6: Navigate to the submissions tab", async () => {
            await page.getByRole('link', { name: NAVBAR_SELECTORS.submissionLinkName }).click();
            await page.reload();
        })

        await test.step("Step 7: Click on View button", async () => {
            await page.getByRole('cell', { name: FORM_TEXTS.defaultEmail }).hover();
            await page.getByRole('button', { name: SUBMISSIONS_PAGE_SELECTORS.viewButtonName }).click();
        })

        await test.step("Step 8: Choose download option pdf", async () => {
            await page.getByTestId(SUBMISSIONS_PAGE_SELECTORS.chooseDownloadOptionButton).nth(7).click();
            await page.locator('div').filter({ hasText: SUBMISSIONS_PAGE_SELECTORS.pdfOptionButton }).click();
        })

        let pdfBuffer: Buffer | null = null;
        await test.step("Step 9: Open the pdf submission and verify it", async () => {
            const [newPage2] = await Promise.all([
                page.waitForEvent("popup"),
                page.getByTestId(SUBMISSIONS_PAGE_SELECTORS.downloadButton).click(),
            ]);

            await newPage2.waitForLoadState("domcontentloaded");

            const pdfUrl = newPage2.url();

            const response = await page.request.get(pdfUrl);
            pdfBuffer = Buffer.from(await response.body());
            expect(pdfBuffer).not.toBeNull();

            if (pdfBuffer) {
                const pdfData = await pdfParse(pdfBuffer);
                const submittedData = pdfData.text.split('\n').slice(3);
                const submittedDataArray = submittedData.map(data => {
                    data = data.trim();
                    data = data.includes("1:") ? data.replace("1:", "1 :") :
                        (data.includes("2:") ? data.replace("2:", "2 :") : data);
                    return data;
                });
                await expect(page.getByTestId(SUBMISSIONS_PAGE_SELECTORS.submissionPainView)).toHaveText(submittedDataArray.join(""));
            }
        })
        await page.getByTestId(SUBMISSIONS_PAGE_SELECTORS.closeSubmissionViewButton).click();
    })



});


