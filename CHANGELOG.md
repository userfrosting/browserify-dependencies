# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [4.0.0] - 2021-02-09

### Changed
- Switched to native ESM, raising NodeJS requirements to `12.17.0` as a result.
- Switched from default to named export for more predictable behavior around tooling interactions.
- Updated browserify from `16.5.2` to `17.0.0`.

## [3.1.0] - 2020-04-18

### Added
- Option to silently ignore errors, effectively skipping dependencies which cannot be processed.

## [3.0.0] - 2020-03-14

### Fixed
- Existing defect where browserified code provided no exports. They are now available on `window` based on a camel cased version of the package name.

### Changed
- `ono` to `@jsdevtools/ono`, and bumped version to 7.1
- Results will no longer be within their own folder, and have a file name in the form `[dependency-name]_browserified.js`.

## [2.0.0] - 2020-01-22

### Fixed
- Workaround for malformed package main values of type array (thanks @silvioq)

### Changed
- Raised minimum node version from 8 to 10.12
- Updated `ono` (thrown errors may have a different type)

### Removed
- Deprecated concurrency option

## [1.1.0] - 2019-07-14

### Added
- Expanded test coverage to account for failure scenario.

### Fixed
- Errors while running browserify against dependency not getting hoisted up, resulting in silent failures.

### Changed
- Deprecated concurrency option citing lack of a tangible benefit in its current from and potential for issues in Browserify which isn't built to be run alongside other concurrent instances.
- Updated dependencies.

## [1.0.1] - 2019-06-05

### Fixed
- Failure on successive runs due to attempting to delete a file using directory methods. Scenario now addressed in unit tests.

### Security
- Updated dev dependency `ava` to address vulnerabilities in indirect dependencies `tar` and `js-yaml`.

## [1.0.0] - 2019-03-12

First stable release.

## [1.0.0-rc.1] - 2019-03-12

### Fixed
- Possible failure in directory tree creation.

## [1.0.0-beta.1] - 2019-01-09

Initial release
