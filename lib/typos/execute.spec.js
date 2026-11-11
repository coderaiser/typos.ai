import {mkdtemp, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import process from 'node:process';
import {test, stub} from 'supertape';
import {tryToCatch} from 'try-to-catch';
import {executeTypos} from './execute.js';

test('typos.ai: typos: execute', async (t) => {
    const execute = stub();
    const result = await executeTypos({
        execute,
    });
    
    const expected = '';
    
    t.equal(result, expected);
    t.end();
});

test('typos.ai: typos: execute: runs in the current directory by default', async (t) => {
    const execute = stub();
    
    await executeTypos({
        execute,
    });
    
    const args = ['typos --write-changes --format json', {
        encoding: 'utf8',
        cwd: process.cwd(),
    }];
    
    t.calledWith(execute, args);
    t.end();
});

test('typos.ai: typos: execute: error', async (t) => {
    const execute = stub().throws({
        output: ['', 'hello'],
    });
    
    const result = await executeTypos({
        execute,
    });
    
    const expected = 'hello';
    
    t.equal(result, expected);
    t.end();
});

test('typos.ai: typos: execute: unknown error is rethrown', async (t) => {
    const execute = stub().throws(Error('spawn failed'));
    const [error] = await tryToCatch(executeTypos, {
        execute,
    });
    
    t.equal(error.message, 'spawn failed');
    t.end();
});

test('typos.ai: typos: execute: defaults', async (t) => {
    const originalStderrWrite = process.stderr.write;
    
    // real `typos --write-changes` rewrites files: run it in an empty directory
    const cwd = await mkdtemp(join(tmpdir(), 'typos-ai-'));
    
    process.stderr.write = stub();
    
    const result = await executeTypos({
        cwd,
    });
    
    process.stderr.write = originalStderrWrite;
    
    t.equal(typeof result, 'string');
    t.end();
});

test('typos.ai: typos: execute: default options', async (t) => {
    const {PATH} = process.env;
    const bin = await mkdtemp(join(tmpdir(), 'typos-ai-bin-'));
    
    // a fake `typos` is the only executable on PATH: the real one never runs in the project directory
    await writeFile(join(bin, 'typos'), '#!/bin/sh\necho hello\nexit 2\n', {
        mode: 0o755,
    });
    
    const originalStderrWrite = process.stderr.write;
    
    process.env.PATH = bin;
    process.stderr.write = stub();
    
    const result = await executeTypos();
    
    process.stderr.write = originalStderrWrite;
    process.env.PATH = PATH;
    
    t.equal(result, 'hello\n');
    t.end();
});
