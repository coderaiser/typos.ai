import {
    mkdir,
    writeFile,
    mkdtemp,
} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {test, stub} from 'supertape';
import {tryToCatch} from 'try-to-catch';
import {MODELS} from '../model/registry.js';
import {runModels} from './models.js';

const createCacheDir = () => mkdtemp(join(tmpdir(), 'tai-'));

test('typos.ai: models: path', async (t) => {
    const log = stub();
    
    await runModels({
        args: ['path'],
        cacheDir: '/cache',
        log,
    });
    
    t.calledWith(log, ['/cache']);
    t.end();
});

test('typos.ai: models: list: missing', async (t) => {
    const log = stub();
    
    await runModels({
        args: ['list'],
        cacheDir: await createCacheDir(),
        log,
    });
    
    t.calledWith(log, [`missing   smol  ${MODELS.smol.file}`]);
    t.end();
});

test('typos.ai: models: list: installed', async (t) => {
    const log = stub();
    const cacheDir = await createCacheDir();
    
    await mkdir(join(cacheDir, 'models'));
    await writeFile(join(cacheDir, 'models', MODELS.smol.file), 'x');
    
    await runModels({
        args: ['list'],
        cacheDir,
        log,
    });
    
    t.calledWith(log, [`installed smol  ${MODELS.smol.file}`]);
    t.end();
});

test('typos.ai: models: list is the default command', async (t) => {
    const log = stub();
    
    await runModels({
        args: [],
        cacheDir: await createCacheDir(),
        log,
    });
    
    t.calledWith(log, [`missing   smol  ${MODELS.smol.file}`]);
    t.end();
});

test('typos.ai: models: pull', async (t) => {
    const download = stub();
    
    await runModels({
        args: ['pull'],
        cacheDir: '/cache',
        log: stub(),
        download,
    });
    const args = [{
        ...MODELS.smol,
        path: join('/cache', 'models', MODELS.smol.file),
    }];
    
    t.calledWith(download, args);
    t.end();
});

test('typos.ai: models: pull: ready', async (t) => {
    const log = stub();
    
    await runModels({
        args: ['pull', 'smol'],
        cacheDir: '/cache',
        log,
        download: stub(),
    });
    
    t.calledWith(log, ['ready: smol']);
    t.end();
});

test('typos.ai: models: pull: unknown model', async (t) => {
    const [error] = await tryToCatch(runModels, {
        args: ['pull', 'nope'],
        cacheDir: '/cache',
        log: stub(),
        download: stub(),
    });
    
    t.equal(error.message, 'Unknown model "nope". Known: smol');
    t.end();
});

test('typos.ai: models: unknown command', async (t) => {
    const [error] = await tryToCatch(runModels, {
        args: ['remove'],
        cacheDir: '/cache',
        log: stub(),
    });
    
    t.equal(error.message, 'Unknown command: models remove');
    t.end();
});
