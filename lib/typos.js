import {join} from 'node:path';
import {readFile, writeFile} from 'node:fs/promises';
import process from 'node:process';
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
import {saveIgnored} from './ignore.js';
import {countWords} from './count.js';

export const typos = async (overrides) => {
    const {
        env = {},
        pipe = readStdin,
        cwd = process.cwd,
        parseStdin = parseTypos,
        read = readFile,
        write = writeFile,
        ignore = saveIgnored,
        run = executeTypos,
        create = createEngine,
        logs,
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
    
    const contents = new Map();
    
    for (const path of new Set(events.map((event) => event.path)))
        contents.set(path, await read(join(cwd(), path), 'utf8'));
    
    const picks = new Map();
    
    for (const event of events) {
        const key = event.typo.toLowerCase();
        
        if (!Array.isArray(event.corrections) || !event.corrections.length) {
            logs.skip(event, 'no corrections');
            continue;
        }
        
        const result = await engine.pick({
            event,
            file: contents.get(event.path),
        });
        
        if (result.skip) {
            logs.skip(event, result.skip);
            continue;
        }
        
        const list = picks.get(key) || [];
        
        list.push({
            event,
            result,
        });
        picks.set(key, list);
    }
    
    const counts = countWords([...picks.values()].flatMap((list) => list.flatMap(({result}) => result.scores.map(({correction}) => correction))), [...contents.values()]);
    const fixes = new Map();
    const ignored = [];
    
    for (const list of picks.values()) {
        const [{event}] = list;
        const decision = decide({
            typo: event.typo,
            picks: list.map(({result}) => result),
            counts,
            minMargin,
        });
        
        if (decision.skip) {
            for (const {event} of list)
                logs.skip(event, decision.skip);
            
            continue;
        }
        
        if (decision.keep) {
            ignored.push(event.typo);
            logs.ignore(event, decision);
            continue;
        }
        
        for (const {event, result} of list) {
            const {correction} = result.scores.find((a) => a.correction.toLowerCase() === decision.best);
            const fix = {
                lineIndex: event.line_num - 1,
                index: result.index,
                typo: event.typo,
                correction,
            };
            
            logs.fix(event, {
                output: correction,
                margin: decision.margin,
            });
            fixes.set(event.path, [...fixes.get(event.path) || [], fix]);
        }
    }
    
    if (!dryRun) {
        for (const [path, list] of fixes)
            await write(join(cwd(), path), applyFixes(contents.get(path), list));
        
        if (ignored.length)
            await ignore({
                cwd: cwd(),
                words: ignored,
            });
    }
    
    await engine.dispose();
};
