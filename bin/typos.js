#!/usr/bin/env node

import process, {cwd} from 'node:process';
import {readStdin} from 'redstd';
import {typos} from '../lib/typos.js';

const stdin = await readStdin();

if (!stdin)
    process.exit();

await typos({
    cwd,
});
