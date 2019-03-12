# browserify-dependencies

| Branch | Status |
| ------ | ------ |
| master | [![Build Status](https://travis-ci.org/userfrosting/browserify-dependencies.svg?branch=master)](https://travis-ci.org/userfrosting/browserify-dependencies) |
| develop | [![Build Status](https://travis-ci.org/userfrosting/browserify-dependencies.svg?branch=develop)](https://travis-ci.org/userfrosting/browserify-dependencies) |

Runs browserify against compatible dependencies in `node_modules`, outputting the results in a specified location. Makes no attempt to patch node internals, etc. Browserify options may however be provided for this purpose.

## Install

```bash
npm install @userfrosting/browserify-dependencies --save-dev
```

## Usage

```js
import BrowserifyDeps from "@userfrosting/browserify-dependencies";

const options = {
    dependencies: [
        "foo",
        "bar"
    ],
    inputDir: "./node_modules",
    outputDir: "./browser_modules"
};

BrowserifyDeps(options)
    .then(() => console.log("Done! ✨"))
    .catch(() => console.log("Things have not gone according to plan... 🔥"));
```

## Release process

Generally speaking, all releases should first traverse through `alpha`, `beta`, and `rc` (release candidate) to catch missed bugs and gather feedback as appropriate. Aside from this however, there are a few steps that **MUST** always be done.

1. Make sure [`CHANGELOG.md`](./CHANGELOG.md) is up to date.
2. Update version via `npm` like `npm version 3.0.0` or `npm version patch`.
3. `npm publish`.
4. Create release on GitHub from tag made by `npm version`.

## License

[LICENSE](LICENSE)
