import { test as base } from "@playwright/test";
import { FormPage } from "../poms/form";

interface Fixtures {
    formPage: FormPage;
};

export const test = base.extend<Fixtures>({
    formPage: async ({ page }, use) => {
        const formPage = new FormPage(page);
        await use(formPage);
    },
});

