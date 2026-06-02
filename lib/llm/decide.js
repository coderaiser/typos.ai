import {callLLM} from './call.js';
import {parse} from './parse.js';

const MAX_RETRIES = 5;

function isValid(result, event) {
    if (!result.output)
        return false;
    
    return event.corrections.includes(result.output);
}

export async function decide(event, file, overrides = {}) {
    const {
        logError,
        logRetry,
        logReject,
        callLLM: runLLM = callLLM,
        parse: runParse = parse,
    } = overrides;
    
    for (let i = 0; i < MAX_RETRIES; i++) {
        const [error, raw] = await runLLM(event, file);
        
        if (error) {
            logError(error, event);
            return;
        }
        
        const result = runParse(raw);
        
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
