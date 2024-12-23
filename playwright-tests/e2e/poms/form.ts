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

}
