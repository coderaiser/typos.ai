import {test} from 'supertape';
import {tryToCatch} from 'try-to-catch';
import {parseTypos} from './parse.js';

const event = {
    type: 'typo',
    path: 'a.md',
    line_num: 1,
    byte_offset: 2,
    typo: 'wich',
    corrections: ['which', 'witch'],
};

test('typos.ai: parse: typo events', async (t) => {
    const result = await parseTypos(`${JSON.stringify(event)}\n`);
    const expected = [event];
    
    t.deepEqual(result, expected);
    t.end();
});

test('typos.ai: parse: other event types are ignored', async (t) => {
    const result = await parseTypos('{"type":"binary_file","path":"a.bin"}');
    const expected = [];
    
    t.deepEqual(result, expected);
    t.end();
});

test('typos.ai: parse: null corrections are accepted', async (t) => {
    const withNull = {
        ...event,
        corrections: null,
    };
    
    const result = await parseTypos(JSON.stringify(withNull));
    const expected = [withNull];
    
    t.deepEqual(result, expected);
    t.end();
});

test('typos.ai: parse: invalid JSON', async (t) => {
    const [error] = await tryToCatch(parseTypos, 'not json');
    
    t.match(error.message, 'Invalid JSON from typos');
    t.end();
});

test('typos.ai: parse: unexpected event shape', async (t) => {
    const [error] = await tryToCatch(parseTypos, '{"type":"typo","path":"a.md"}');
    
    t.match(error.message, 'Unexpected typos event');
    t.end();
});

test('typos.ai: parse: empty input', async (t) => {
    const result = await parseTypos();
    const expected = [];
    
    t.deepEqual(result, expected);
    t.end();
});
