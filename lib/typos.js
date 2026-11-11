import {join} from 'node:path';
import {readFile, writeFile} from 'node:fs/promises';
import process, {exit} from 'node:process';
import {readStdin} from 'redstd';
import {parseTypos} from './typos/parse.js';
import {executeTypos} from './typos/execute.js';
import {createEngine} from './engine/create.js';
import {
    decide,
    DEFAULT_MIN_MARGIN,
} from './decide.js';
import {applyFixes} from './apply-fix.js';
import {getCacheDir} from './cache.js';

const groupByPath = (events) => {
    const groups = new Map();
    
    for (const event of events) {
        const list = groups.get(event.path) || [];
        list.push(event);
        groups.set(event.path, list);
    }
    
    return groups;
};

export const typos = async (overrides) => {
    const {
        env = {},
        pipe = readStdin,
        cwd = process.cwd,
        parseStdin = parseTypos,
        read = readFile,
        write = writeFile,
        run = executeTypos,
        create = createEngine,
        logs,
        end = exit,
    } = overrides;
    
    const stdin = env.TYPOS_AI_RUN ? await run() : await pipe();
    const events = await parseStdin(stdin);
    
    if (!events.length)
        return;
    
    const dryRun = Boolean(env.TYPOS_AI_DRY);
    const minMargin = Number(env.TYPOS_AI_MIN_MARGIN || DEFAULT_MIN_MARGIN);
    
    if (Number.isNaN(minMargin))
        throw Error('TYPOS_AI_MIN_MARGIN must be a number');
    
    const engine = await create({
        cacheDir: getCacheDir({
            env,
        }),
        env,
    });
    
    let unresolved = 0;
    
    for (const [path, fileEvents] of groupByPath(events)) {
        const filePath = join(cwd(), path);
        const content = await read(filePath, 'utf8');
        const fixes = [];
        
        for (const event of fileEvents) {
            const result = await decide({
                event,
                file: content,
                engine,
                minMargin,
            });
            
            if (result.skip) {
                unresolved++;
                logs.skip(event, result.skip);
                continue;
            }
            
            logs.fix(event, result);
            fixes.push({
                lineIndex: event.line_num - 1,
                index: result.index,
                typo: event.typo,
                correction: result.output,
            });
        }
        
        if (fixes.length && !dryRun)
            await write(filePath, applyFixes(content, fixes));
    }
    
    await engine.dispose();
    
    if (unresolved)
        return end(1);
};
