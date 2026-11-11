import {Buffer} from 'node:buffer';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {
    mkdtemp,
    readFile,
    stat,
    writeFile,
} from 'node:fs/promises';
import {test, stub} from 'supertape';
import {tryToCatch} from 'try-to-catch';
import {downloadModel, hashFile} from './download.js';

const body = Buffer.from('hello model');
const sha256 = createHash('sha256')
    .update(body)
    .digest('hex');

const createFetch = (status, chunk) => stub().resolves(new Response(chunk, {
    status,
}));

const createPath = async () => join(await mkdtemp(join(tmpdir(), 'tai-')), 'm.gguf');

const createOptions = async (overrides = {}) => ({
    url: 'https://example.com/m.gguf',
    path: await createPath(),
    sha256,
    size: body.length,
    fetch: createFetch(200, body),
    ...overrides,
});

test('typos.ai: download: full download', async (t) => {
    const options = await createOptions();
    
    await downloadModel(options);
    const result = String(await readFile(options.path));
    const expected = 'hello model';
    
    t.equal(result, expected);
    t.end();
});

test('typos.ai: download: returns the path', async (t) => {
    const options = await createOptions();
    const result = await downloadModel(options);
    
    t.equal(result, options.path);
    t.end();
});

test('typos.ai: download: partial file is removed after rename', async (t) => {
    const options = await createOptions();
    
    await downloadModel(options);
    
    const [error] = await tryToCatch(stat, `${options.path}.part`);
    
    t.ok(error);
    t.end();
});

test('typos.ai: download: resumes a partial file', async (t) => {
    const options = await createOptions({
        fetch: createFetch(206, body.subarray(5)),
    });
    
    await writeFile(`${options.path}.part`, body.subarray(0, 5));
    await downloadModel(options);
    const result = String(await readFile(options.path));
    const expected = 'hello model';
    
    t.equal(result, expected);
    t.end();
});

test('typos.ai: download: resume sends the Range header', async (t) => {
    const options = await createOptions({
        fetch: createFetch(206, body.subarray(5)),
    });
    
    await writeFile(`${options.path}.part`, body.subarray(0, 5));
    await downloadModel(options);
    const args = [options.url, {
        headers: {
            Range: 'bytes=5-',
        },
    }];
    
    t.calledWith(options.fetch, args);
    t.end();
});

test('typos.ai: download: server ignores Range, file is downloaded again', async (t) => {
    const options = await createOptions({
        fetch: createFetch(200, body),
    });
    
    await writeFile(`${options.path}.part`, body.subarray(0, 5));
    await downloadModel(options);
    const result = String(await readFile(options.path));
    const expected = 'hello model';
    
    t.equal(result, expected);
    t.end();
});

test('typos.ai: download: already downloaded, no request is made', async (t) => {
    const options = await createOptions();
    
    await writeFile(options.path, body);
    await downloadModel(options);
    
    t.notCalled(options.fetch);
    t.end();
});

test('typos.ai: download: already downloaded, global fetch is not used', async (t) => {
    const options = await createOptions();
    
    delete options.fetch;
    
    await writeFile(options.path, body);
    const result = await downloadModel(options);
    
    t.equal(result, options.path);
    t.end();
});

test('typos.ai: download: complete partial file is verified without a request', async (t) => {
    const options = await createOptions();
    
    await writeFile(`${options.path}.part`, body);
    await downloadModel(options);
    
    t.notCalled(options.fetch);
    t.end();
});

test('typos.ai: download: bad status', async (t) => {
    const options = await createOptions({
        fetch: createFetch(500, 'error'),
    });
    
    const [error] = await tryToCatch(downloadModel, options);
    
    t.equal(error.message, `Download failed: 500 ${options.url}`);
    t.end();
});

test('typos.ai: download: no body', async (t) => {
    const options = await createOptions({
        fetch: createFetch(200, null),
    });
    
    const [error] = await tryToCatch(downloadModel, options);
    
    t.equal(error.message, `Download failed: 200 ${options.url}`);
    t.end();
});

test('typos.ai: download: checksum mismatch throws', async (t) => {
    const options = await createOptions({
        sha256: '0'.repeat(64),
    });
    
    const [error] = await tryToCatch(downloadModel, options);
    
    t.equal(error.message, `Checksum mismatch for ${options.url}`);
    t.end();
});

test('typos.ai: download: checksum mismatch removes the partial file', async (t) => {
    const options = await createOptions({
        sha256: '0'.repeat(64),
    });
    
    await tryToCatch(downloadModel, options);
    
    const [error] = await tryToCatch(stat, `${options.path}.part`);
    
    t.ok(error);
    t.end();
});

test('typos.ai: download: hashFile', async (t) => {
    const path = await createPath();
    
    await writeFile(path, body);
    
    const result = await hashFile(path);
    
    t.equal(result, sha256);
    t.end();
});
