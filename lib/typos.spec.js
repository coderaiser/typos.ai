import {exit} from 'node:process';
import {stub, test} from 'supertape';
import {typos} from './typos.js';

const {stringify} = JSON;

test('typos: stdin: wrong', async (t) => {
    const pipe = stub().returns(stringify({
        type: 'exclude',
    }));
    
    const cwd = stub();
    const exit = stub();
    
    await typos({
        pipe,
        cwd,
        exit,
    });
    
    t.notCalled(exit);
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
    
    const logs = {
        log: stub(),
    };
    
    await typos({
        pipe,
        cwd,
        exit,
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
    
    await typos({
        run,
        env,
        pipe,
        cwd,
        exit,
        think,
        read,
        save,
        logs,
    });
    
    const args = [];
    
    t.calledWith(run, args);
    t.end();
});
