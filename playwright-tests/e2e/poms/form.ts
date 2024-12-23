import { Page, BrowserContext } from "@playwright/test";
import { CREATE_FORM_PAGE_SELECTORS, NAVBAR_SELECTORS, SHARE_PAGE_SELECTORS } from "../constants/selectors";
import { CREATE_FORM_TEXTS } from "../constants/texts";
export class FormPage {
    constructor(private page: Page, private context: BrowserContext) { };

    openPublishedForm = async () => {
        const [newPage] = await Promise.all([
            await this.page.waitForEvent('popup', { timeout: 10_000 }),
            await this.page.getByTestId(CREATE_FORM_PAGE_SELECTORS.publishPreviewButton).click({ timeout: 10_000 })
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


    addStarRatingOpinionAndMatrixField = async () => {
        await this.page.getByRole('button', { name: CREATE_FORM_PAGE_SELECTORS.starRatingButtonName }).click();
        await this.page.getByRole('button', { name: CREATE_FORM_PAGE_SELECTORS.opinionScaleButtonName }).click();
        await this.page.getByRole('button', { name: CREATE_FORM_PAGE_SELECTORS.matrixButtonName }).click();

        await this.page.getByRole('button', { name: CREATE_FORM_PAGE_SELECTORS.questionElementButtonName }).nth(1).click();
        await this.page.getByPlaceholder(CREATE_FORM_PAGE_SELECTORS.questionPlaceHolder).fill(CREATE_FORM_TEXTS.defaultStarRatingQuestion);

        await this.page.getByRole('button', { name: CREATE_FORM_PAGE_SELECTORS.questionElementButtonName }).nth(2).click();
        await this.page.getByPlaceholder(CREATE_FORM_PAGE_SELECTORS.questionPlaceHolder).fill(CREATE_FORM_TEXTS.defaultOpinionScaleQuestion);

        await this.page.getByRole('button', { name: CREATE_FORM_PAGE_SELECTORS.questionElementButtonName }).nth(3).click();
        await this.page.getByPlaceholder(CREATE_FORM_PAGE_SELECTORS.questionPlaceHolder).fill(CREATE_FORM_TEXTS.defaultMatrixQuestion);
    }

}
