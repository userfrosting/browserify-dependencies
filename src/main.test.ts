import BrowserifyDeps, { IOptions } from "./main";
import test from "ava";

test("Doesn't crash", async t => {
    const options: IOptions = {
        dependencies: [
            "changelog-updater",
            "p-queue",
            "just-extend",
            "typescript",
            "browserify"
        ],
        inputDir: "./node_modules",
        outputDir: "./dist/main.test/browser_modules"
    };

    await BrowserifyDeps(options);
    t.pass();
});
