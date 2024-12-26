import { Page, BrowserContext, expect } from "@playwright/test";
import { CREATE_FORM_PAGE_SELECTORS, NAVBAR_SELECTORS, SHARE_PAGE_SELECTORS } from "../constants/selectors";
// import { CREATE_FORM_TEXTS } from "../constants/texts";
export class FormPage {
    constructor(private page: Page, private context: BrowserContext) { };

    openPublishedForm = async () => {
        const [newPage] = await Promise.all([
            this.page.waitForEvent('popup', { timeout: 10_000 }),
            this.page.getByTestId(CREATE_FORM_PAGE_SELECTORS.publishPreviewButton).click({ timeout: 10_000 })
        ]);
        return newPage;
    };

    copyFormLink = async () => {
        await this.context.grantPermissions(["clipboard-read", "clipboard-write"]);

        await this.page.getByRole('link', { name: NAVBAR_SELECTORS.shareLinkName }).click();
        await this.page.getByTestId(SHARE_PAGE_SELECTORS.copyFormLinkButton).click();
        const formUrl = await this.page.evaluate(() => navigator.clipboard.readText());

        return formUrl;
    }


    addStarRatingOpinionAndMatrixField = async (starRatingQuestion: string, opinionScaleQuestion: string, matrixQuestion: string ) => {
        await this.page.getByRole('button', { name: CREATE_FORM_PAGE_SELECTORS.starRatingButtonName }).click();
        await expect(this.page.getByRole('button', { name: 'Question' }).nth(1)).toBeVisible({ timeout: 10_000 });

        await this.page.getByRole('button', { name: CREATE_FORM_PAGE_SELECTORS.opinionScaleButtonName }).click();
        await expect(this.page.getByRole('button', { name: 'Question' }).nth(2)).toBeVisible({ timeout: 10_000 });

        await this.page.getByRole('button', { name: CREATE_FORM_PAGE_SELECTORS.matrixButtonName }).click();
        await expect(this.page.getByRole('button', { name: 'Question' }).nth(3)).toBeVisible({ timeout: 10_000 });

        await this.page.getByRole('button', { name: CREATE_FORM_PAGE_SELECTORS.questionElementButtonName }).nth(1).click();
        await this.page.getByTestId('content-text-field').fill(starRatingQuestion);

        await this.page.getByRole('button', { name: CREATE_FORM_PAGE_SELECTORS.questionElementButtonName }).nth(2).click();
        await this.page.getByTestId('content-text-field').fill(opinionScaleQuestion);

        await this.page.getByRole('button', { name: CREATE_FORM_PAGE_SELECTORS.questionElementButtonName }).nth(3).click();
        await this.page.getByTestId('content-text-field').fill(matrixQuestion);
    }

}

