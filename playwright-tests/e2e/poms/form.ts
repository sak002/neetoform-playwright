import { Page } from "@playwright/test";
import { CREATE_FORM_PAGE_SELECTORS } from "../constants/selectors";
import { CREATE_FORM_TEXTS } from "../constants/texts";
export class FormPage {
    constructor(private page: Page) { };

    openPublishedForm = async () => {
        const [newPage] = await Promise.all([
            await this.page.waitForEvent('popup', { timeout: 10_000 }),
            await this.page.getByTestId(CREATE_FORM_PAGE_SELECTORS.publishPreviewButton).click({ timeout: 10_000})
        ]);
        return newPage;
    };

   
}
