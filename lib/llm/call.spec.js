import {test, stub} from 'supertape';
import {callLLM} from './call.js';

test('typos.ai: llm: call: fetch ok', async (t) => {
    const data = {
        choices: [{
            message: {
                content: 'hello',
            },
        }],
    };
    
    const json = stub().returns(data);
    
    const runFetch = stub().returns({
        json,
    });
    
    const event = {
        type: 'typo',
        path: '1.md',
        line_num: 1,
        byte_offset: 0,
        typo: 'Deply',
        corrections: ['Deploy', 'Deeply'],
    };
    
    const [error] = await callLLM(event, 'file content', {
        runFetch,
    });
    
    t.notOk(error);
    t.end();
});

test('typos.ai: llm: call: fetch ok result', async (t) => {
    const data = {
        choices: [{
            message: {
                content: 'hello',
            },
        }],
    };
    
    const json = stub().returns(data);
    
    const runFetch = stub().returns({
        json,
    });
    
    const event = {
        type: 'typo',
        path: '1.md',
        line_num: 1,
        byte_offset: 0,
        typo: 'Deply',
        corrections: ['Deploy', 'Deeply'],
    };
    
    const [, result] = await callLLM(event, 'file content', {
        runFetch,
    });
    
    t.equal(result, 'hello');
    t.end();
});

test('typos.ai: llm: call: fetch error', async (t) => {
    const data = {
        error: {
            message: 'API Error',
        },
    };
    
    const json = stub().returns(data);
    
    const runFetch = stub().returns({
        json,
    });
    
    const event = {
        type: 'typo',
        path: '1.md',
        line_num: 1,
        byte_offset: 0,
        typo: 'Deply',
        corrections: ['Deploy', 'Deeply'],
    };
    
    const [error] = await callLLM(event, 'file content', {
        runFetch,
    });
    
    const expected = {
        message: 'API Error',
    };
    
    t.deepEqual(error, expected);
    t.end();
});
