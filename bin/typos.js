#!/usr/bin/env node

import {
    argv,
    env,
    cwd,
    exit,
} from 'node:process';
import chalk from 'chalk';
import {typos} from '../lib/typos.js';
import {runModels} from '../lib/cli/models.js';
import {getCacheDir} from '../lib/cache.js';

const [command, ...args] = argv.slice(2);
const log = (message) => console.log(message);

const logFix = ({path, line_num, typo}, {output, margin}) => {
    log(`${chalk.green('fix ')} ${path}:${line_num} ${typo} -> ${output} (margin ${margin.toFixed(1)})`);
};

const logIgnore = ({path, line_num, typo}, {margin}) => {
    log(`${chalk.cyan('keep')} ${path}:${line_num} ${typo} is not a typo, added to .typos.toml (margin ${margin.toFixed(1)})`);
};

const logSkip = ({path, line_num, typo}, reason) => {
    if (!env.TYPOS_AI_VERBOSE)
        return;
    
    log(`${chalk.yellow('skip')} ${path}:${line_num} ${typo}: ${reason}`);
};

if (command === 'models') {
    await runModels({
        args,
        cacheDir: getCacheDir({
            env,
        }),
        log,
    });
    
    exit(0);
}

await typos({
    env,
    cwd,
    logs: {
        fix: logFix,
        ignore: logIgnore,
        skip: logSkip,
    },
});
