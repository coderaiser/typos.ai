import {exit} from 'node:process';
import {stub, test} from 'supertape';
import {typos} from './typos.js';

const {stringify} = JSON;

test('typos: no stdin', async (t) => {
    const pipe = stub();
    const cwd = stub();
    const exit = stub();
    
    await typos({
        pipe,
        cwd,
        exit,
    });
    
    t.calledWithNoArgs(exit);
    t.end();
});

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
