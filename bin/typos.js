#!/usr/bin/env node

import {join} from 'node:path';
import process, {cwd} from 'node:process';
import {readFile} from 'node:fs/promises';
import {readStdin} from 'redstd';
import {resolveEvent} from '../lib/typos.js';
import {parseTypos} from '../lib/parse.js';

const CWD = cwd();

const stdin = await readStdin();

if (!stdin)
    process.exit();

for (const event of parseTypos(stdin)) {
    if (event.type !== 'typo')
        continue;
    
    const filePath = join(CWD, event.path);
    const file = await readFile(filePath, 'utf-8');
    
    await resolveEvent(event, file);
}
