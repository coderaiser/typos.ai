import {readFile, writeFile} from 'node:fs/promises';

export async function applyFix(filePath, event, output, overrides = {}) {
    const {
        read = readFile,
        write = writeFile,
    } = overrides;
    
    const content = await read(filePath, 'utf-8');
    const lines = content.split('\n');
    const lineNumber = event.line_num - 1;
    
    lines[lineNumber] = lines[lineNumber].replace(event.typo, output);
    
    await write(filePath, lines.join('\n'));
}
