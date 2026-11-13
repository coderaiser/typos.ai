import {availableParallelism} from 'node:os';
import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {DEFAULT_MODEL, MODELS} from '../model/registry.js';
import {downloadModel} from '../model/download.js';
import {loadLlama} from './llama.js';
import {pickCorrection} from './score.js';

const CONTEXT_SIZE = 2048;
const MAX_THREADS = 4;

export const resolveModelPath = ({env, cacheDir}) => {
    const name = env.TYPOS_AI_MODEL || DEFAULT_MODEL;
    
    if (name.endsWith('.gguf'))
        return {
            path: name,
        };
    
    const model = MODELS[name];
    
    if (!model)
        throw Error(`Unknown model "${name}". Known: ${Object
            .keys(MODELS)
            .join(', ')}`);
    
    return {
        path: join(cacheDir, 'models', model.file),
        model,
    };
};

export async function createEngine({cacheDir, env = {}, load = loadLlama, download = downloadModel}) {
    const {path, model: entry} = resolveModelPath({
        env,
        cacheDir,
    });
    
    if (env.TYPOS_AI_OFFLINE && !existsSync(path))
        throw Error(`Model is missing and TYPOS_AI_OFFLINE is set: ${path}`);
    
    if (entry)
        await download({
            ...entry,
            path,
        });
    
    const threads = Number(env.TYPOS_AI_THREADS) || Math.min(availableParallelism(), MAX_THREADS);
    const llama = await load();
    
    const model = await llama.loadModel({
        modelPath: path,
    });
    
    const context = await model.createContext({
        contextSize: CONTEXT_SIZE,
        threads,
    });
    
    const sequence = context.getSequence();
    
    return {
        pick({event, file, radius}) {
            return pickCorrection({
                model,
                sequence,
                event,
                file,
                radius,
            });
        },
        dispose() {
            return model.dispose();
        },
    };
}
