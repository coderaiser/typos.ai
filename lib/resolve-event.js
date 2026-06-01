import {readFile, writeFile} from 'node:fs/promises';
import {tryCatch} from 'try-catch';
import {LLMResponse} from './llm/response.js';
import {callLLM} from './llm/call.js';

const MAX_RETRIES = 5;

function parse(raw) {
    const [err, json] = tryCatch(JSON.parse, raw);
    
    if (err)
        return null;
    
    const res = LLMResponse.safeParse(json);
    
    if (!res.success)
        return null;
    
    return res.data;
}

function isValid(result, event) {
    if (!result.output)
        return false;
    
    return event.corrections.includes(result.output);
}

async function applyFix(filePath, event, output) {
    const content = await readFile(filePath, 'utf-8');
    const fixed = content.replaceAll(event.typo, output);
    
    await writeFile(filePath, fixed);
}

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

export async function resolveEvent(event, file) {
    for (let i = 0; i < MAX_RETRIES; i++) {
        const [error, raw] = await callLLM(event, file);
        
        if (error) {
            logError(error, event);
            return;
        }
        
        const result = parse(raw);
        
        if (!result) {
            logRetry(event);
            continue;
        }
        
        if (!isValid(result, event)) {
            logRetry(event);
            continue;
        }
        
        if (result.type === 'exclude')
            return;
        
        await applyFix(event.path, event, result.output);
        
        return;
    }
    
    logReject('no valid result', event);
}
