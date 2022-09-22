# browserify-dependencies

| Branch | Status |
| ------ | ------ |
| master | [![Continuous Integration](https://github.com/userfrosting/browserify-dependencies/workflows/Continuous%20Integration/badge.svg?branch=master)](https://github.com/userfrosting/browserify-dependencies/actions) [![codecov](https://codecov.io/gh/userfrosting/browserify-dependencies/branch/master/graph/badge.svg)](https://codecov.io/gh/userfrosting/browserify-dependencies/branch/master) |


Runs browserify against compatible dependencies in `node_modules` or whichever other folder you specify, outputting the results as UMD bundles in a specified location. Makes no attempt to patch node internals, Browserify options may however be provided for this purpose.

## Install

```bash
npm i -D @userfrosting/browserify-dependencies
```

## Usage

> **IMPORTANT**<br/>
> This is an ES module package targeting NodeJS `>=13.2.0`, refer to the [NodeJS ESM docs](https://nodejs.org/api/esm.html) regarding how to correctly import.
> ESM loaders like `@babel/loader` or `esm` likely won't work as expected.

```js
import { browserifyDependencies } from "@userfrosting/browserify-dependencies";

const options = {
    dependencies: [
        "foo",
        "bar"
    ],
    inputDir: "./node_modules",
    outputDir: "./browser_modules"
};

browserifyDependencies(options)
    .then(() => console.log("Done! ✨"))
    .catch(() => console.log("Things have not gone according to plan... 🔥"));
```

Process modules are wrapped with UMD to allow consumption by most environments, exports in the browser are available via `window.[normalized-package-name]`.

## API

API documentation is regenerated for every release using [API Extractor](https://www.npmjs.com/package/@microsoft/api-extractor) and [API Documenter](https://www.npmjs.com/package/@microsoft/api-documenter).
The results reside in [docs/api](./docs/api/index.md).

## Release process

Generally speaking, all releases should first traverse through `alpha`, `beta`, and `rc` (release candidate) to catch missed bugs and gather feedback as appropriate. Aside from this however, there are a few steps that **MUST** always be done.

1. Make sure [`CHANGELOG.md`](./CHANGELOG.md) is up to date.
2. Update version via `npm` like `npm version 3.0.0` or `npm version patch`.
3. `npm publish`.
4. Create release on GitHub from tag made by `npm version`.

## License

[MIT](LICENSE)
