import process from 'node:process';
import {stub, test} from 'supertape';
import {tryToCatch} from 'try-to-catch';
import {typos} from './typos.js';

const {stringify} = JSON;

test('typos: stdin: wrong', async (t) => {
    const pipe = stub().returns(stringify({
        type: 'exclude',
    }));
    
    const cwd = stub();
    const end = stub();
    
    await typos({
        pipe,
        cwd,
        end,
    });
    
    t.notCalled(end);
    t.end();
});

test('typos: save', async (t) => {
    const event = {
        path: '/README.md',
        type: 'typo',
        corrections: ['a', 'b'],
    };
    
    const pipe = stub().returns(stringify(event));
    
    const cwd = stub().returns('/');
    const think = stub().returns('hello');
    const read = stub().returns('world');
    const save = stub();
    const end = stub();
    
    const logs = {
        log: stub(),
    };
    
    await typos({
        pipe,
        cwd,
        end,
        think,
        read,
        save,
        logs,
    });
    
    t.calledWith(save, ['/README.md', event, 'hello']);
    t.end();
});

test('typos: TYPOS_AI_RUN', async (t) => {
    const pipe = stub().returns(stringify({
        path: '/README.md',
        type: 'typo',
    }));
    
    const cwd = stub().returns('/');
    const think = stub().returns('hello');
    const read = stub().returns('world');
    const save = stub();
    
    const env = {
        TYPOS_AI_RUN: 1,
    };
    
    const run = stub().returns(stringify({
        type: 'typo',
        path: './README.md',
        line_num: 22,
        byte_offset: 13,
        typo: 'neaded',
        corrections: ['needed', 'kneaded', 'headed'],
    }));
    
    const logs = {
        log: stub(),
    };
    
    const end = stub();
    
    await typos({
        run,
        env,
        pipe,
        cwd,
        end,
        think,
        read,
        save,
        logs,
    });
    
    const args = [];
    
    t.calledWith(run, args);
    t.end();
});

test('typos: end: no output', async (t) => {
    const event = {
        path: '/README.md',
        type: 'typo',
        corrections: ['a', 'b'],
    };
    
    const pipe = stub().returns(stringify(event));
    
    const cwd = stub().returns('/');
    const think = stub();
    const read = stub().returns('world');
    const save = stub();
    const end = stub();
    
    const logs = {
        log: stub(),
    };
    
    await typos({
        pipe,
        cwd,
        end,
        think,
        read,
        save,
        logs,
    });
    
    t.calledWith(end, [1]);
    t.end();
});

test('typos: defaults: no overrides', async (t) => {
    const originalIsTTY = process.stdin.isTTY;
    
    process.stdin.isTTY = true;
    
    const [error] = await tryToCatch(typos);
    
    process.stdin.isTTY = originalIsTTY;
    
    t.notOk(error);
    t.end();
});

test('typos: defaults: pipe', async (t) => {
    const originalIsTTY = process.stdin.isTTY;
    
    process.stdin.isTTY = true;
    
    const cwd = stub();
    const end = stub();
    
    const [error] = await tryToCatch(typos, {
        cwd,
        end,
    });
    
    process.stdin.isTTY = originalIsTTY;
    
    t.notOk(error);
    t.end();
});

test('typos: defaults', async (t) => {
    const pipe = stub().returns('');
    
    const end = stub();
    
    await typos({
        pipe,
        end,
    });
    
    t.notCalled(end);
    t.end();
});
