# typos.ai [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

[NPMURL]: https://npmjs.org/package/typos.ai "npm"
[NPMIMGURL]: https://img.shields.io/npm/v/typos.ai.svg?style=flat
[BuildStatusURL]: https://github.com/coderaiser/typos.ai/actions?query=workflow%3A%22Node+CI%22 "Build Status"
[BuildStatusIMGURL]: https://github.com/coderaiser/typos.ai/workflows/Node%20CI/badge.svg
[LicenseURL]: https://tldrlegal.com/license/mit-license "MIT License"
[LicenseIMGURL]: https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[CoverageURL]: https://coveralls.io/github/coderaiser/typos.ai?branch=master
[CoverageIMGURL]: https://coveralls.io/repos/coderaiser/typos.ai/badge.svg?branch=master&service=github

CLI tool to fix typos after [`typos`](https://github.com/crate-ci/typos), for cases like:

```
error: `Deply` should be `Deploy`, `Deeply`
  ╭▸ 1.md:1:1
  │
1 │ Deply the code to production
  ╰╴━━━━━
```

When context needed to figure out for the world should be placed instead.

## Install

```
npm i typos.ai -g
```

(installs `node-llama-cpp`, about 800 MB on Linux because it ships several GPU builds)

## Usage

```sh
typos --write-changes --format json | typos.ai
```

or let it run `typos` itself:

```sh
TYPOS_AI_RUN=1 typos.ai
```

`typos` fixes typos with a single correction. `typos.ai` resolves the rest with a small local
language model (SmolLM2-135M, ~105 MB, downloaded on first run to `~/.cache/typos.ai`). No API key,
no network inference. Typos it is not confident about are printed and the exit code is 1.

```sh
typos.ai models list|pull|path
```

| Env | Default | Meaning |
|---|---|---|
| `TYPOS_AI_HOME` | `~/.cache/typos.ai` | cache for the model |
| `TYPOS_AI_MODEL` | `smol` | registry name or path to a `.gguf` |
| `TYPOS_AI_MIN_MARGIN` | `1` | minimum score gap between best and second candidate |
| `TYPOS_AI_DRY` | unset | print decisions, do not write files |
| `TYPOS_AI_OFFLINE` | unset | never download |
| `TYPOS_AI_THREADS` | min(cpus, 4) | llama.cpp threads |
| `TYPOS_AI_RUN` | unset | run `typos --write-changes --format json` internally |

`TYPOS_AI_KEY` is no longer used (Groq was removed in 2.0.0).

## License

MIT
