import Browserify from "browserify";
import PQueue from "p-queue";
import Extend from "just-extend";
import { readFileSync, createWriteStream } from "fs";
import { join } from "path";

export default async function (options: IOptions): Promise<void> {
    // TODO Fill in required options

    const Queue = new PQueue({
        concurrency: options.concurrency ? options.concurrency : 4
    });

    for (const dependency of options.dependencies) {
        // TODO Make options clone and modify
        const lOptions = Extend({}, options, {}) as IOptions;

        // TODO Locate index/entry file
        // TODO Use browser property if defined
        const pkg = JSON.parse(readFileSync(join(options.inputDir, dependency, "package.json")).toString());
        const index = pkg.main ? pkg.main : "index.js";

        // TODO Make browserify options
        const bOptions: Browserify.Options = lOptions.browserifyOptions ? lOptions.browserifyOptions : {};
        bOptions.entries = join(options.inputDir, dependency, index);

        Queue.add(() => BrowserifyDependency(dependency, bOptions));
    }

    await Queue.onIdle();
}

async function BrowserifyDependency(name: string, options: Browserify.Options) {
    const BrowserifyInstance = new Browserify(options);

    const ws = createWriteStream("./test.js");

    BrowserifyInstance.bundle().pipe(ws)

    // TODO Bundle
    await new Promise(resolve => ws.on("finish", resolve));

    
}

export interface IOptions {
    /**
     * Options passed to browserify.
     * Certain properties (such as input) will be overwritten.
     */
    browserifyOptions?: Browserify.Options;

    /**
     * Maximum number of concurrent browserify bundling operations.
     */
    concurrency?: number;

    /**
     * List of dependencies to run browserify against
     */
    dependencies: string[];

    /**
     * Path to dependencies folder.
     */
    inputDir: string;

    /**
     * Path to output directory.
     */
    outputDir: string;
}