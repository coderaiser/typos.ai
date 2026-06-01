#!/usr/bin/env node
import {join} from 'node:path';
import process, {cwd} from 'node:process';
import {readFile} from 'node:fs/promises';

import {readStdin} from 'redstd';
import {resolveEvent} from '../lib/typos.js';

const line = await readStdin();

if (!line)
    process.exit();

const event = JSON.parse(line);

const filePath = join(cwd, event.path);
const file = await readFile(filePath, 'utf-8');

await resolveEvent(event, file);
