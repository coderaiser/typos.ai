import {execSync} from 'node:child_process';
import {tryCatch} from 'try-catch';

export function executeTypos(overrides = {}) {
    const {
        execute = execSync,
    } = overrides;
    
    const [error] = tryCatch(execute, `typos --write-changes --format json`, {
        encoding: 'utf8',
    });
    
    if (!error)
        return '';
    
    console.log(error);
    const [, output] = error.output;
    
    return output;
}
