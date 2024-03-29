import Browserify from "browserify";
import { createWriteStream, lstatSync, mkdirSync, readFileSync, rmdirSync, unlinkSync } from "fs";
import extend from "just-extend";
import { join as joinPaths } from "path";
import ono from "@jsdevtools/ono";

function isError(error: any): error is NodeJS.ErrnoException {
    return error instanceof Error;
}

/**
 * Runs browserify against compatible dependencies in specified folder.
 * @param userOptions - Options
 *
 * @public
 */
export async function browserifyDependencies(userOptions: IOptions): Promise<void> {
    // Fill in required options
    const options = new Options(userOptions);

    for (const depName of userOptions.dependencies) {
        // Clone options for dependency
        const depOptions = options.clone();

        // Read dependency info from package
        const pkg = JSON.parse(readFileSync(joinPaths(options.inputDir, depName, "package.json")).toString());

        // Skip if no main
        if (!pkg.main) continue;

        // Workaround for invalid main definition
        // EG: https://github.com/jonmiles/bootstrap-treeview/blob/master/package.json#L22-L25
        /* istanbul ignore if */
        if (Array.isArray(pkg.main)) {
           pkg.main = pkg.main[0];
        }

        // Set entry file (browser field not used due to being non-standard and otherwise complex)
        depOptions.browserifyOptions.entries = joinPaths(options.inputDir, depName, pkg.main);

        // Set output path
        const targetPath = joinPaths(options.outputDir, `${depName}_browserified.js`);

        // Ensure directory tree exists
        try {
            mkdirSync(targetPath, { recursive: true });

            // Removes folder/file at end of target path
            if (lstatSync(targetPath).isDirectory()) {
                rmdirSync(targetPath);
            }
            else {
                unlinkSync(targetPath);
            }
        }
        catch (ex) {
            if (isError(ex)) {
                // No issue if it already exists
                if (ex.code === "EEXIST") return;
            }
            
            throw ex;
        }

        // Process dependency
        try {
            await BrowserifyDependency(depName, targetPath, depOptions);
        } catch (error) {
            if (!depOptions.silentFailures) {
                // Errors not silenced, interrupt processing.
                throw error;
            }
        }
    }
}

async function BrowserifyDependency(depName: string, targetPath: string, options: Options) {
    const BrowserifyInstance = new Browserify({
        ...options.browserifyOptions,
        standalone: depName,
    });

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

    /**
     * Silently ignore failed browserify runs.
     */
    silentFailures?: boolean;
}

/**
 * Fills in missing options from provided user options to apply defaults.
 */
class Options implements IOptions {
    browserifyOptions: Browserify.Options;
    dependencies: string[];
    inputDir: string;
    outputDir: string;
    silentFailures: boolean;

    /**
     * @param userOptions User options to build instance from.
     */
    constructor(userOptions: IOptions) {
        this.browserifyOptions = userOptions.browserifyOptions ? extend(true, {}, userOptions.browserifyOptions) : {};
        this.dependencies = userOptions.dependencies;
        this.inputDir = userOptions.inputDir;
        this.outputDir = userOptions.outputDir;
        this.silentFailures = userOptions.silentFailures ?? false;
    }

    /**
     * Creates a deep clone of the instance.
     */
    clone(): Options {
        return extend(true, {}, this) as Options;
    }
}
