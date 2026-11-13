import {join} from 'node:path';
import {readFile, writeFile} from 'node:fs/promises';

const SECTION = '[default.extend-words]';

export const addIgnored = (content, words) => {
    const lines = content.split('\n');
    const missing = [...new Set(words.map((word) => word.toLowerCase()))].filter((word) => !lines.some((line) => line
        .trim()
        .startsWith(`${word} =`)));
    
    if (!missing.length)
        return content;
    
    const entries = [];
    
    for (const word of missing) {
        entries.push(`${word} = "${word}"`);
    }
    
    const at = lines.findIndex((line) => line.trim() === SECTION);
    
    if (at !== -1) {
        lines.splice(at + 1, 0, ...entries);
        return lines.join('\n');
    }
    
    const base = content.replace(/\n*$/, '');
    
    return `${base}${base ? '\n\n' : ''}${SECTION}\n${entries.join('\n')}\n`;
};

export async function saveIgnored({cwd, words, read = readFile, write = writeFile}) {
    const path = join(cwd, '.typos.toml');
    let content = '';
    
    try {
        content = await read(path, 'utf8');
    } catch {}
    
    const updated = addIgnored(content, words);
    
    if (updated !== content)
        await write(path, updated);
}

