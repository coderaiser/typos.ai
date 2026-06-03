#!/usr/bin/env node

import {
    env,
    cwd,
    exit,
} from 'node:process';
import {execSync} from 'node:child_process';
import {readStdin} from 'redstd';
import chalk from 'chalk';
import {tryCatch} from 'try-catch';
import {typos} from '../lib/typos.js';

const {TYPOS_AI_KEY} = env;

if (!TYPOS_AI_KEY)
    console.error(chalk.yellow(`TYPOS_AI_KEY is missing`));

await typos({
    executeTypos,
    env,
    cwd,
    readStdin,
    exit,
    logs: {
        logReject,
        logRetry,
        logError,
        log: console.log,
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

function executeTypos() {
    const [error] = tryCatch(execSync, `typos --write-changes --format json`, {
        encoding: 'utf8',
    });
    
    const [, output] = error.output;
    
    return output;
}
