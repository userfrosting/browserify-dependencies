import Browserify from "browserify";
import { createWriteStream, existsSync, lstatSync, mkdirSync, readFileSync, rmdirSync, unlinkSync } from "fs";
import extendObject from "just-extend";
import { join as joinPathSegments } from "path";
import ono from "ono";

/**
 * Runs browserify against compatible dependencies in specified folder.
 * @param userOptions - Options
 *
 * @public
 */
export default async function (userOptions: IOptions): Promise<void> {
    // Fill in required options
    const options = new Options(userOptions);

    for (const depName of userOptions.dependencies) {
        // Clone options for dependency
        const depOptions = options.clone();

        // Read dependency info from package
        const pkg = JSON.parse(readFileSync(joinPathSegments(options.inputDir, depName, "package.json")).toString());

        // Skip if no main
        if (!pkg.main) continue;

        // Workaround for invalid main definition
        // EG: https://github.com/jonmiles/bootstrap-treeview/blob/master/package.json#L22-L25
        if (Array.isArray(pkg.main)) {
           pkg.main = pkg.main[0];
        }

        // Set entry file (browser field not used due to being non-standard and otherwise complex)
        depOptions.browserifyOptions.entries = joinPathSegments(options.inputDir, depName, pkg.main ||  "./");

        // Set output path
        const targetPath = (() => {
            try {
                if (lstatSync(depOptions.browserifyOptions.entries).isDirectory())
                    // Handle folder
                    return joinPathSegments(options.outputDir, depName, "./index.js");
            } catch {
                // Handle file without extension (assume js)
                return joinPathSegments(options.outputDir, depName, pkg.main + ".js");
            }

            // And finally, handle exact path
            return joinPathSegments(options.outputDir, depName, pkg.main);
        })();

        // Ensure directory tree exists
        try {
            try {
                mkdirSync(targetPath, { recursive: true });
            } catch {
                // Fallback for when recursive fails
                function createDirRecursively(dir) {
                    if (!existsSync(dir)) {
                        createDirRecursively(joinPathSegments(dir, ".."));
                        mkdirSync(dir);
                    }
                }
                createDirRecursively(targetPath);
            }
            // Removes folder/file at end of target path
            if (lstatSync(targetPath).isDirectory()) {
                rmdirSync(targetPath);
            }
            else {
                unlinkSync(targetPath);
            }
        }
        catch (ex) {
            // No issue if it already exists
            if (ex.code !== "EEXIST") throw ex;
        }

        // Add to queue
        await BrowserifyDependency(depName, targetPath, depOptions);
    }
}

async function BrowserifyDependency(depName: string, targetPath: string, options: Options) {
    const BrowserifyInstance = new Browserify(options.browserifyOptions);

    // Open write stream
    const out = createWriteStream(targetPath, { flags: "w" });

    // Browserify and save script
    const bundleStream = BrowserifyInstance.bundle();
    bundleStream.pipe(out);

    await new Promise(function (resolve, reject) {
        let errored = false;
        function handleError(e: any) {
            if (!errored) {
                errored = true;
                reject(ono(e, `Failed to browserify '${depName}'`));
            }
        }
        bundleStream.on("error", handleError);
        out.on("error", handleError);
        out.on("finish", resolve)
    });
}

/**
 * Interface defining possible user provided options.
 *
 * @public
 */
export interface IOptions {
    /**
     * Options passed to browserify.
     * Certain properties (such as entries) will be overwritten.
     */
    browserifyOptions?: Browserify.Options;

    /**
     * Maximum number of concurrent browserify bundling operations.
     * @deprecated Since 1.0.1, benefits of concurreny ultimately limited due to single-threaded runtime
     * and increases risk of issues within Browserify (not intended for parallel usage).
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
