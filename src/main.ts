import Browserify from "browserify";
import PQueue from "p-queue";
import extendObject from "just-extend";
import { readFileSync, createWriteStream, lstatSync, mkdirSync, rmdirSync } from "fs";
import { join as joinPathSegments } from "path";

export default async function (userOptions: IOptions): Promise<void> {
    // Fill in required options
    const options = new Options(userOptions);

    const queue = new PQueue({
        concurrency: options.concurrency
    });

    for (const depName of userOptions.dependencies) {
        // Clone options for dependency
        const depOptions = options.clone();

        // Read dependency info from package
        const pkg = JSON.parse(readFileSync(joinPathSegments(options.inputDir, depName, "package.json")).toString());

        // Set entry file (browser field not used due to being non-standard and otherwise complex)
        depOptions.browserifyOptions.entries = joinPathSegments(options.inputDir, depName, pkg.main ||  "./");

        // Set output path
        const targetPath = (() => {
            // Handle incomplete main attribute
            if (lstatSync(depOptions.browserifyOptions.entries).isDirectory())
                return joinPathSegments(options.outputDir, depName, pkg.main || "./", "index.js");
            else
                return joinPathSegments(options.outputDir, depName, pkg.main);
        })();

        // Ensure directory tree exists
        try {
            mkdirSync(targetPath, { recursive: true });
            rmdirSync(targetPath);
        }
        catch (ex) {
            // No issue if it already exists
            if (ex.code !== "EEXIST") throw ex;
        }

        // Add to queue
        queue.add(() => BrowserifyDependency(depName, targetPath, depOptions));
    }

    await queue.onIdle();
}

async function BrowserifyDependency(depName: string, targetPath: string, options: Options) {
    const BrowserifyInstance = new Browserify(options.browserifyOptions);

    // Open write stream
    const out = createWriteStream(targetPath, { flags: "w" });

    // Browserify and save script
    BrowserifyInstance.bundle().pipe(out);
    await new Promise(resolve => out.on("finish", resolve));
}

/**
 * Interface defining possible user provided options.
 */
export interface IOptions {
    /**
     * Options passed to browserify.
     * Certain properties (such as entries) will be overwritten.
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

/**
 * Fills in missing options from provided user options to apply defaults.
 */
class Options implements IOptions {
    browserifyOptions: Browserify.Options;
    concurrency: number;
    dependencies: string[];
    inputDir: string;
    outputDir: string;
    
    /**
     * @param userOptions User options to build instance from.
     */
    constructor(userOptions: IOptions) {
        this.browserifyOptions = userOptions.browserifyOptions ? extendObject(true, {}, userOptions.browserifyOptions) : {};
        this.concurrency = userOptions.concurrency || 4;
        this.dependencies = userOptions.dependencies;
        this.inputDir = userOptions.inputDir;
        this.outputDir = userOptions.outputDir;
    }

    /**
     * Creates a deep clone of the instance.
     */
    clone(): Options {
        return extendObject(true, {}, this) as Options;
    }
}