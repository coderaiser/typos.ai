#!/usr/bin/env node

import {
    env,
    cwd,
    exit,
} from 'node:process';
import {readStdin} from 'redstd';
import chalk from 'chalk';
import {typos} from '../lib/typos.js';

const {TYPOS_AI_KEY} = env;

if (!TYPOS_AI_KEY)
    console.error(chalk.yellow(`TYPOS_AI_KEY is missing`));

await typos({
    env,
    cwd,
    readStdin,
    exit,
    logs: {
        logReject,
        logRetry,
        logError,
        log: (a) => console.log(chalk.red(a)),
    },
});

function logRetry(event) {
    console.log('\x1b[31mLLM INVALID OUTPUT → RETRY\x1b[0m');
    console.log(event);
}

function logReject(raw, event) {
    console.log('\x1b[31mLLM FAILED AFTER RETRIES\x1b[0m');
    console.log(raw);
    console.log(event);
}

function logError(error, event) {
    console.log('\x1b[31mLLM FAILED AFTER RETRIES\x1b[0m');
    console.log(error);
    console.log(event);
}
