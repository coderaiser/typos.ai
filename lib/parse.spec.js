import {test} from 'supertape';
import {parseTypos} from './parse.js';

test('typos.ai: parseTypo: binary_file', (t) => {
    const result = parseTypos('{"type":"binary_file","path":"./font/fontello.eot"}');
    const expected = [];
    
    t.deepEqual(result, expected);
    t.end();
});

test('typos.ai: parseTypo: newline', (t) => {
    const result = parseTypos('\n');
    const expected = [];
    
    t.deepEqual(result, expected);
    t.end();
});

test('typos.ai: parseTypo: typo', (t) => {
    const event = {
        type: 'typo',
        path: 'abc.md',
        line_num: 1,
        byte_offset: 0,
        typo: 'Deply',
        corrections: ['Deploy', 'Deeply'],
    };
    
    const result = parseTypos(JSON.stringify(event));
    const expected = [event];
    
    t.deepEqual(result, expected);
    t.end();
});
