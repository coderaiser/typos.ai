#!/usr/bin/env node

import {cwd, exit} from 'node:process';
import {readStdin} from 'redstd';
import {typos} from '../lib/typos.js';

await typos({
    cwd,
    readStdin,
    exit,
});
