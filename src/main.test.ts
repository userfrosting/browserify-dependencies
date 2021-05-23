import test from "ava";
import del from "del";
import { browserifyDependencies, IOptions } from "@userfrosting/browserify-dependencies";

test.serial("Successfully runs browserify against dependencies", async t => {
    const options: IOptions = {
        dependencies: [
            "changelog-updater",
            "just-extend",
            "typescript",
            "browserify"
        ],
        inputDir: "./node_modules",
        outputDir: "./dist/main.test/t1/browser_modules"
    };

    // Clear target
    await del(options.outputDir);

    // First run (no files exist in target)
    t.timeout(30000);
    await t.notThrowsAsync(() => browserifyDependencies(options));

    // Second run (files exist in target)
    t.timeout(30000);
    await t.notThrowsAsync(() => browserifyDependencies(options));
});

test.serial("Throws when attempting to browserify non existant dependency", async t => {
    const options: IOptions = {
        dependencies: [
            "p-queue"
        ],
        inputDir: "./node_modules",
        outputDir: "./dist/main.test/t2/browser_modules"
    };

    // Clear target
    await del(options.outputDir);

    t.timeout(30000);
    await t.throwsAsync(
        () => browserifyDependencies(options),
        {
            instanceOf: Error,
            code: "ENOENT",
        }
    );
});

test.todo("Throws when attempting to browserify dependency with malformed input file without silent flag");

test.todo("Doesn't throw when attempting to browserify dependency with malformed input file without silent flag");

// NOTE: Silent failures offers an alternative handling here, do we want to remove support?
test.todo("Successfully runs against dependencies with an array for main");
