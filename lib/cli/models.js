import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {DEFAULT_MODEL, MODELS} from '../model/registry.js';
import {downloadModel} from '../model/download.js';

const getPath = (cacheDir, model) => join(cacheDir, 'models', model.file);

export async function runModels({args, cacheDir, log, download = downloadModel}) {
    const [subcommand = 'list', name = DEFAULT_MODEL] = args;
    
    if (subcommand === 'path')
        return log(cacheDir);
    
    if (subcommand === 'list') {
        for (const [id, model] of Object.entries(MODELS)) {
            const status = existsSync(getPath(cacheDir, model)) ? 'installed' : 'missing';
            log(`${status.padEnd(9)} ${id}  ${model.file}`);
        }
        
        return;
    }
    
    if (subcommand !== 'pull')
        throw Error(`Unknown command: models ${subcommand}`);
    
    const model = MODELS[name];
    
    if (!model)
        throw Error(`Unknown model "${name}". Known: ${Object
            .keys(MODELS)
            .join(', ')}`);
    
    await download({
        ...model,
        path: getPath(cacheDir, model),
    });
    
    log(`ready: ${name}`);
}
