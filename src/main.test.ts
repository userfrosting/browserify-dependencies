import BrowserifyDeps, { IOptions } from "./main";
import test from "ava";

test("Basic scenario", async t => {
    const options: IOptions = {
        dependencies: [
            "changelog-updater"
        ],
        inputDir: "./node_modules",
        outputDir: "./main.test/browser_modules"
    };

    await BrowserifyDeps(options);
    t.pass();
});
