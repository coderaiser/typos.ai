import {join} from 'node:path';
import {readFile} from 'node:fs/promises';
import {process} from 'zod/v4/core';
import {readStdin} from 'redstd';
import {parseTypos} from './typos/parse.js';
import {decide} from './llm/decide.js';
import {applyFix} from './llm/apply-fix.js';

export const typos = async (overrides = {}) => {
    const {
        env = {},
        pipe = readStdin,
        cwd = process.cwd,
        parseStdin = parseTypos,
        read = readFile,
        think = decide,
        save = applyFix,
        executeTypos,
        logs,
    } = overrides;
    
    let stdin = await pipe();
    
    if (env.TYPOS_AI_RUN) {
        stdin = executeTypos();
        logs.log(stdin);
    }
    
    for (const event of parseStdin(stdin)) {
        const {path} = event;
        const filePath = join(cwd(), path);
        const file = await read(filePath, 'utf-8');
        const output = await think(event, file, logs);
        
        if (output)
            await save(path, event, output);
    }
};
