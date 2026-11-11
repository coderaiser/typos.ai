import {createHash} from 'node:crypto';
import {
    createReadStream,
    createWriteStream,
} from 'node:fs';
import {dirname} from 'node:path';
import {pipeline} from 'node:stream/promises';
import {
    mkdir,
    rename,
    rm,
    stat,
} from 'node:fs/promises';
import {tryToCatch} from 'try-to-catch';

const sizeOf = async (path) => {
    const [error, stats] = await tryToCatch(stat, path);
    
    return error ? 0 : stats.size;
};

export async function hashFile(path) {
    const hash = createHash('sha256');
    
    for await (const chunk of createReadStream(path)) {
        hash.update(chunk);
    }
    
    return hash.digest('hex');
}

export async function downloadModel({url, path, sha256, size, fetch = globalThis.fetch}) {
    if (size === await sizeOf(path))
        return path;
    
    const partial = `${path}.part`;
    const start = await sizeOf(partial);
    
    await mkdir(dirname(path), {
        recursive: true,
    });
    
    if (start < size) {
        const headers = start ? {
            Range: `bytes=${start}-`,
        } : {};
        
        const response = await fetch(url, {
            headers,
        });
        
        if (!response.ok || !response.body)
            throw Error(`Download failed: ${response.status} ${url}`);
        
        const resumed = response.status === 206;
        
        await pipeline(response.body, createWriteStream(partial, {
            flags: resumed ? 'a' : 'w',
        }));
    }
    
    if (sha256 !== await hashFile(partial)) {
        await rm(partial, {
            force: true,
        });
        throw Error(`Checksum mismatch for ${url}`);
    }
    
    await rename(partial, path);
    
    return path;
}
