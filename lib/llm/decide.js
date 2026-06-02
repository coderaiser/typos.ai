import {callLLM} from './call.js';
import {parse} from './parse.js';
import {applyFix} from './apply-fix.js';

const MAX_RETRIES = 5;

function isValid(result, event) {
    if (!result.output)
        return false;
    
    return event.corrections.includes(result.output);
}

export async function decide(file, overrides) {
    const {
        logError,
        logRetry,
        logReject,
    } = overrides;
    
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
        
        const {type, output} = result;
        
        if (type === 'exclude')
            return;
        
        return output;
    }
    
    logReject('no valid result', event);
    
    return null;
}
