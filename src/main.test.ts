import test from "ava";
import * as del from "del";
import { mkdirSync, writeFileSync } from "fs";
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
    await del.deleteAsync(options.outputDir);

    // First run (no files exist in target)
    t.timeout(30000);
    await t.notThrowsAsync(() => browserifyDependencies(options));

    // Second run (files exist in target)
    t.timeout(30000);
    await t.notThrowsAsync(() => browserifyDependencies(options));

    // Clear target
    await del.deleteAsync(options.outputDir);
});

test.serial("Throws when attempting to browserify non existent dependency", async t => {
    const options: IOptions = {
        dependencies: [
            "p-queue"
        ],
        inputDir: "./node_modules",
        outputDir: "./dist/main.test/t2/browser_modules"
    };

    // Clear target
    await del.deleteAsync(options.outputDir);

    t.timeout(30000);
    await t.throwsAsync(
        () => browserifyDependencies(options),
        {
            instanceOf: Error,
            code: "ENOENT",
        }
    );

    // Clear target
    await del.deleteAsync(options.outputDir);
});

test.serial("Wraps errors when a dependency entry file is missing", async t => {
    const inputDir = "./dist/main.test/t3";
    const options: IOptions = {
        dependencies: [ "missing-entry" ],
        inputDir,
        outputDir: `${inputDir}/browser_modules`
    };

    await del.deleteAsync(inputDir);
    t.teardown(() => del.deleteAsync(inputDir));
    mkdirSync(`${inputDir}/missing-entry`, { recursive: true });
    writeFileSync(`${inputDir}/missing-entry/package.json`, JSON.stringify({ main: "missing.js" }));

    await t.throwsAsync(
        () => browserifyDependencies(options),
        {
            instanceOf: Error,
            message: /Failed to browserify 'missing-entry'/
        }
    );
});

test.todo("Throws when attempting to browserify dependency with malformed input file without silent flag");

test.todo("Doesn't throw when attempting to browserify dependency with malformed input file without silent flag");

// NOTE: Silent failures offers an alternative handling here, do we want to remove support?
test.todo("Successfully runs against dependencies with an array for main");
