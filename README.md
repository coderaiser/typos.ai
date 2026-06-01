# typos.ai [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

[NPMURL]: https://npmjs.org/package/typos.ai "npm"
[NPMIMGURL]: https://img.shields.io/npm/v/typos.ai.svg?style=flat
[BuildStatusURL]: https://github.com/coderaiser/typos.ai/actions?query=workflow%3A%22Node+CI%22 "Build Status"
[BuildStatusIMGURL]: https://github.com/coderaiser/typos.ai/workflows/Node%20CI/badge.svg
[LicenseURL]: https://tldrlegal.com/license/mit-license "MIT License"
[LicenseIMGURL]: https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[CoverageURL]: https://coveralls.io/github/coderaiser/typos.ai?branch=master
[CoverageIMGURL]: https://coveralls.io/repos/coderaiser/typos.ai/badge.svg?branch=master&service=github

CLI tool to fix typos after `typos`.

## Install

```
npm i typos.ai -g
```

# Usage

```sh
$ export API_KEY=your-api-key
$ typos --write-changes --format json | typos.ai
```

## License

MIT
