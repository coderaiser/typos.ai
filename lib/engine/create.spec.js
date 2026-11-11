import {availableParallelism} from 'node:os';
import {join} from 'node:path';
import {test, stub} from 'supertape';
import {tryToCatch} from 'try-to-catch';
import {MODELS} from '../model/registry.js';
import {
    createEngine,
    resolveModelPath,
} from './create.js';

const cacheDir = '/cache';
const CONTEXT_SIZE = 2048;
const MAX_THREADS = 4;

const event = {
    line_num: 1,
    byte_offset: 2,
    typo: 'wich',
    corrections: ['which', 'witch'],
};

const createLlama = () => {
    const sequence = {
        clearHistory: stub(),
        controlledEvaluate: stub().returns([{
            next: {
                probabilities: new Map([
                    [2, 0.5],
                ]),
            },
        },
        undefined]),
    };
    
    const context = {
        getSequence: stub().returns(sequence),
    };
    
    const model = {
        tokenize: stub().returns([1, 2]),
        createContext: stub().returns(context),
        dispose: stub(),
    };
    
    const llama = {
        loadModel: stub().returns(model),
    };
    
    return {
        llama,
        model,
    };
};

const createOptions = (overrides = {}) => {
    const {llama, model} = createLlama();
    
    return {
        llama,
        model,
        cacheDir,
        env: {},
        load: stub().returns(llama),
        download: stub(),
        ...overrides,
    };
};

test('typos.ai: create: resolveModelPath: default model', (t) => {
    const result = resolveModelPath({
        env: {},
        cacheDir,
    });
    
    const expected = {
        path: join(cacheDir, 'models', MODELS.smol.file),
        model: MODELS.smol,
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('typos.ai: create: resolveModelPath: path to gguf', (t) => {
    const result = resolveModelPath({
        env: {
            TYPOS_AI_MODEL: '/models/my.gguf',
        },
        cacheDir,
    });
    
    const expected = {
        path: '/models/my.gguf',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('typos.ai: create: resolveModelPath: unknown model', async (t) => {
    const [error] = await tryToCatch(resolveModelPath, {
        env: {
            TYPOS_AI_MODEL: 'nope',
        },
        cacheDir,
    });
    
    t.equal(error.message, 'Unknown model "nope". Known: smol');
    t.end();
});

test('typos.ai: create: offline and model is missing', async (t) => {
    const options = createOptions({
        env: {
            TYPOS_AI_OFFLINE: '1',
        },
    });
    
    const [error] = await tryToCatch(createEngine, options);
    
    t.equal(error.message, `Model is missing and TYPOS_AI_OFFLINE is set: ${join(cacheDir, 'models', MODELS.smol.file)}`);
    t.end();
});

test('typos.ai: create: downloads the registry model (default env)', async (t) => {
    const options = createOptions();
    
    delete options.env;
    
    await createEngine(options);
    const args = [{
        ...MODELS.smol,
        path: join(cacheDir, 'models', MODELS.smol.file),
    }];
    
    t.calledWith(options.download, args);
    t.end();
});

test('typos.ai: create: path to gguf is not downloaded', async (t) => {
    const options = createOptions({
        env: {
            TYPOS_AI_MODEL: '/models/my.gguf',
        },
    });
    
    await createEngine(options);
    
    t.notCalled(options.download);
    t.end();
});

test('typos.ai: create: model is loaded from the resolved path', async (t) => {
    const options = createOptions({
        env: {
            TYPOS_AI_MODEL: '/models/my.gguf',
        },
    });
    
    await createEngine(options);
    const args = [{
        modelPath: '/models/my.gguf',
    }];
    
    t.calledWith(options.llama.loadModel, args);
    t.end();
});

test('typos.ai: create: TYPOS_AI_THREADS', async (t) => {
    const options = createOptions({
        env: {
            TYPOS_AI_THREADS: '3',
        },
    });
    
    await createEngine(options);
    const args = [{
        contextSize: CONTEXT_SIZE,
        threads: 3,
    }];
    
    t.calledWith(options.model.createContext, args);
    t.end();
});

test('typos.ai: create: default threads', async (t) => {
    const options = createOptions();
    
    await createEngine(options);
    const args = [{
        contextSize: CONTEXT_SIZE,
        threads: Math.min(availableParallelism(), MAX_THREADS),
    }];
    
    t.calledWith(options.model.createContext, args);
    t.end();
});

test('typos.ai: create: pick', async (t) => {
    const options = createOptions();
    const engine = await createEngine(options);
    
    const result = await engine.pick({
        event,
        file: 'A wich cast',
    });
    
    t.equal(result.output, 'which');
    t.end();
});

test('typos.ai: create: dispose', async (t) => {
    const options = createOptions();
    const engine = await createEngine(options);
    
    await engine.dispose();
    
    t.calledWithNoArgs(options.model.dispose);
    t.end();
});

test('typos.ai: create: default load and download', async (t) => {
    const [error] = await tryToCatch(createEngine, {
        cacheDir,
        env: {
            TYPOS_AI_MODEL: '/nonexistent/model.gguf',
        },
    });
    
    t.ok(error);
    t.end();
});
