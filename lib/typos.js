import {join} from 'node:path';
import {readFile} from 'node:fs/promises';
import {process} from 'zod/v4/core';
import {readStdin} from 'redstd';
import {parseTypos} from './parse.js';
import {resolveEvent} from './resolve-event.js';

export const typos = async (overrides = {}) => {
    const {
        pipe = readStdin,
        cwd = process.cwd,
        exit = process.exit,
    } = overrides;
    
    const stdin = await pipe();
    
    if (!stdin)
        return exit();
    
    for (const event of parseTypos(stdin)) {
        if (event.type !== 'typo')
            continue;
        
        const filePath = join(cwd(), event.path);
        const file = await readFile(filePath, 'utf-8');
        
        await resolveEvent(event, file);
    }
};

