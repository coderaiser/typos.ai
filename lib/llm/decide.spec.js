import {test, stub} from 'supertape';
import {tryToCatch} from 'try-to-catch';
import {decide} from './decide.js';

test('typos.ai: llm: decide: callLLM error', async (t) => {
    const callLLM = stub().returns([Error('API error')]);
    const logError = stub();
    const logRetry = stub();
    const logReject = stub();
    
    const event = {
        type: 'typo',
        path: '1.md',
        line_num: 1,
        byte_offset: 0,
        typo: 'Deply',
        corrections: ['Deploy', 'Deeply'],
    };
    
    const result = await decide(event, 'file content', {
        callLLM,
        logError,
        logRetry,
        logReject,
        parse: () => null,
    });
    
    t.notOk(result);
    t.end();
});

test('typos.ai: llm: decide: callLLM error calls logError', async (t) => {
    const callLLM = stub().returns([Error('API error')]);
    const logError = stub();
    const logRetry = stub();
    const logReject = stub();
    
    const event = {
        type: 'typo',
        path: '1.md',
        line_num: 1,
        byte_offset: 0,
        typo: 'Deply',
        corrections: ['Deploy', 'Deeply'],
    };
    
    await decide(event, 'file content', {
        callLLM,
        logError,
        logRetry,
        logReject,
        parse: () => null,
    });
    
    t.calledWith(logError, [Error('API error'), event]);
    t.end();
});

test('typos.ai: llm: decide: invalid parse retry', async (t) => {
    const callLLM = stub().returns([null, 'not json']);
    const logError = stub();
    const logRetry = stub();
    const logReject = stub();
    
    const event = {
        type: 'typo',
        path: '1.md',
        line_num: 1,
        byte_offset: 0,
        typo: 'Deply',
        corrections: ['Deploy', 'Deeply'],
    };
    
    await decide(event, 'file content', {
        callLLM,
        logError,
        logRetry,
        logReject,
        parse: () => null,
    });
    
    t.calledWith(logRetry, [event]);
    t.end();
});

test('typos.ai: llm: decide: not valid result retry', async (t) => {
    const callLLM = stub().returns([
        null,
        '{"output": "hello"}',
    ]);
    
    const logError = stub();
    const logRetry = stub();
    const logReject = stub();
    
    const event = {
        type: 'typo',
        path: '1.md',
        line_num: 1,
        byte_offset: 0,
        typo: 'Deply',
        corrections: ['Deploy', 'Deeply'],
    };
    
    await decide(event, 'file content', {
        callLLM,
        logError,
        logRetry,
        logReject,
        parse: () => ({
            output: 'hello',
        }),
    });
    
    t.calledWith(logRetry, [event]);
    t.end();
});

test('typos.ai: llm: decide: exclude', async (t) => {
    const callLLM = stub().returns([
        null,
        '{"output": "Deploy"}',
    ]);
    
    const logError = stub();
    const logRetry = stub();
    const logReject = stub();
    
    const event = {
        type: 'typo',
        path: '1.md',
        line_num: 1,
        byte_offset: 0,
        typo: 'Deply',
        corrections: ['Deploy', 'Deeply'],
    };
    
    const result = await decide(event, 'file content', {
        callLLM,
        logError,
        logRetry,
        logReject,
        parse: () => ({
            type: 'exclude',
            output: 'Deploy',
        }),
    });
    
    t.notOk(result);
    t.end();
});

test('typos.ai: llm: decide: success', async (t) => {
    const callLLM = stub().returns([
        null,
        '{"output": "Deploy"}',
    ]);
    
    const logError = stub();
    const logRetry = stub();
    const logReject = stub();
    
    const event = {
        type: 'typo',
        path: '1.md',
        line_num: 1,
        byte_offset: 0,
        typo: 'Deply',
        corrections: ['Deploy', 'Deeply'],
    };
    
    const result = await decide(event, 'file content', {
        callLLM,
        logError,
        logRetry,
        logReject,
        parse: () => ({
            type: 'typo',
            output: 'Deploy',
        }),
    });
    
    t.equal(result, 'Deploy');
    t.end();
});

test('typos.ai: llm: decide: all retries exhausted', async (t) => {
    const callLLM = stub().returns([
        null,
        '{"output": "hello"}',
    ]);
    
    const logError = stub();
    const logRetry = stub();
    const logReject = stub();
    
    const event = {
        type: 'typo',
        path: '1.md',
        line_num: 1,
        byte_offset: 0,
        typo: 'Deply',
        corrections: ['Deploy', 'Deeply'],
    };
    
    const result = await decide(event, 'file content', {
        callLLM,
        logError,
        logRetry,
        logReject,
        parse: () => ({
            output: 'hello',
        }),
    });
    
    t.notOk(result);
    t.end();
});

test('typos.ai: llm: decide: all retries exhausted calls logReject', async (t) => {
    const callLLM = stub().returns([
        null,
        '{"output": "hello"}',
    ]);
    
    const logError = stub();
    const logRetry = stub();
    const logReject = stub();
    
    const event = {
        type: 'typo',
        path: '1.md',
        line_num: 1,
        byte_offset: 0,
        typo: 'Deply',
        corrections: ['Deploy', 'Deeply'],
    };
    
    await decide(event, 'file content', {
        callLLM,
        logError,
        logRetry,
        logReject,
        parse: () => ({
            output: 'hello',
        }),
    });
    
    t.calledWith(logReject, [
        'no valid result',
        event,
    ]);
    t.end();
});

test('typos.ai: llm: decide: empty output retry', async (t) => {
    const callLLM = stub().returns([null, '{"output": ""}']);
    
    const logError = stub();
    const logRetry = stub();
    const logReject = stub();
    
    const event = {
        type: 'typo',
        path: '1.md',
        line_num: 1,
        byte_offset: 0,
        typo: 'Deply',
        corrections: ['Deploy', 'Deeply'],
    };
    
    await decide(event, 'file content', {
        callLLM,
        logError,
        logRetry,
        logReject,
        parse: () => ({
            output: '',
        }),
    });
    
    t.calledWith(logRetry, [event]);
    t.end();
});

test('typos.ai: llm: decide: default overrides', async (t) => {
    const event = {
        type: 'typo',
        path: '1.md',
        line_num: 1,
        byte_offset: 0,
        typo: 'Deply',
        corrections: ['Deploy', 'Deeply'],
    };
    
    const [error] = await tryToCatch(decide, event, 'file content');
    
    t.ok(error);
    t.end();
});
