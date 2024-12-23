import { test as base } from "@playwright/test";
import { FormPage } from "../poms/form";

interface Fixtures {
    formPage: FormPage;
};

export const test = base.extend<Fixtures>({
    formPage: async ({ page, context }, use) => {
        const formPage = new FormPage(page, context);
        await use(formPage);
    },
});

