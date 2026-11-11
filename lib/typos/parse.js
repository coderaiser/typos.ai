import {tryToCatch} from 'try-to-catch';

const isString = (a) => typeof a === 'string';
const isNumber = (a) => typeof a === 'number';
const isCorrections = (a) => a === null || Array.isArray(a);

const isTypo = (event) => {
    return isString(event.path)
        && isNumber(event.line_num)
        && isNumber(event.byte_offset)
        && isString(event.typo)
        && isCorrections(event.corrections);
};

export async function parseTypos(stdin = '') {
    const result = [];
    
    for (const line of stdin.split('\n')) {
        if (!line.trim())
            continue;
        
        const [error, event] = await tryToCatch(JSON.parse, line);
        
        if (error)
            throw Error(`Invalid JSON from typos: ${line}`);
        
        if (!event || event.type !== 'typo')
            continue;
        
        if (!isTypo(event))
            throw Error(`Unexpected typos event: ${line}`);
        
        result.push(event);
    }
    
    return result;
}
