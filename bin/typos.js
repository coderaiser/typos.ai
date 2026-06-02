#!/usr/bin/env node

import {cwd, exit} from 'node:process';
import {readStdin} from 'redstd';
import {typos} from '../lib/typos.js';

await typos({
    cwd,
    readStdin,
    exit,
    logs: {
        logReject,
        logRetry,
        logError,
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
