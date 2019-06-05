import test from "ava";
import del from "del";
import BrowserifyDeps, { IOptions } from "./main";

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

    // Clear target
    await del(options.outputDir);

    // First run (no files exist in target)
    await BrowserifyDeps(options);

    // Second run (files exist in target)
    await BrowserifyDeps(options);

    t.pass();
});
