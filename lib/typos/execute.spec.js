import {test, stub} from 'supertape';
import {executeTypos} from './execute.js';

test('typos.ai: typos: execute', (t) => {
    const execute = stub();
    const result = executeTypos({
        execute,
    });
    
    const expected = '';
    
    t.equal(result, expected);
    t.end();
});

test('typos.ai: typos: execute: error', (t) => {
    const execute = stub().throws({
        output: ['', 'hello'],
    });
    
    const result = executeTypos({
        execute,
    });
    
    const expected = 'hello';
    
    t.equal(result, expected);
    t.end();
});
