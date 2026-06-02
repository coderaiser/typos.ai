import {test} from 'supertape';
import {parse} from './parse.js';

const {stringify} = JSON;

test('typos.ai: llm: parse: not json', (t) => {
    const result = parse('hello');
    
    t.notOk(result);
    t.end();
});

test('typos.ai: llm: parse: wrong json', (t) => {
    const result = parse('{"hello": "world"}');
    
    t.notOk(result);
    t.end();
});

test('typos.ai: llm: parse: correct', (t) => {
    const item = {
        type: 'typo',
        input: ['hello', 'world'],
        output: 'world',
    };
    
    const result = parse(stringify(item));
    
    t.deepEqual(result, item);
    t.end();
});
