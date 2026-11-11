import {execSync} from 'node:child_process';
import process from 'node:process';
import {tryToCatch} from 'try-to-catch';

export async function executeTypos(overrides = {}) {
    const {
        execute = execSync,
        cwd = process.cwd(),
    } = overrides;
    
    const [error] = await tryToCatch(execute, `typos --write-changes --format json`, {
        encoding: 'utf8',
        cwd,
    });
    
    if (!error)
        return '';
    
    if (!Array.isArray(error.output))
        throw error;
    
    const [, output] = error.output;
    
    return output;
}
