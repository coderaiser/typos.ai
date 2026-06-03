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
    const pipe = stub().returns(stringify({
        path: '/README.md',
        type: 'typo',
    }));
    
    const cwd = stub().returns('/');
    const think = stub().returns('hello');
    const read = stub().returns('world');
    const save = stub();
    
    await typos({
        pipe,
        cwd,
        exit,
        think,
        read,
        save,
    });
    
    const args = ['/README.md', {
        path: '/README.md',
        type: 'typo',
    }, 'hello'];
    
    t.calledWith(save, args);
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
    
    const executeTypos = stub();
    
    const logs = {
        log: stub(),
    };
    
    await typos({
        executeTypos,
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
    
    t.calledWith(executeTypos, args);
    t.end();
});
