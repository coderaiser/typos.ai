import {test, stub} from 'supertape';
import {decide} from './decide.js';

const event = {
    typo: 'wich',
    corrections: ['which', 'witch'],
};

test('typos.ai: decide: confident answer', async (t) => {
    const pick = stub().returns({
        output: 'which',
        margin: 5,
        index: 0,
    });
    
    const result = await decide({
        event,
        file: '',
        engine: {
            pick,
        },
    });
    
    t.equal(result.output, 'which');
    t.end();
});

test('typos.ai: decide: low margin is skipped', async (t) => {
    const pick = stub().returns({
        output: 'which',
        margin: 0.2,
        index: 0,
    });
    
    const result = await decide({
        event,
        file: '',
        engine: {
            pick,
        },
    });
    
    t.ok(result.skip.startsWith('low confidence'));
    t.end();
});

test('typos.ai: decide: no corrections is skipped without calling the engine', async (t) => {
    const pick = stub();
    const result = await decide({
        event: {
            typo: 'x',
            corrections: null,
        },
        file: '',
        engine: {
            pick,
        },
    });
    
    t.equal(result.skip, 'no corrections');
    t.end();
});

test('typos.ai: decide: no corrections does not call the engine', async (t) => {
    const pick = stub();
    
    await decide({
        event: {
            typo: 'x',
            corrections: null,
        },
        file: '',
        engine: {
            pick,
        },
    });
    
    t.notCalled(pick);
    t.end();
});

test('typos.ai: decide: engine skip is returned as is', async (t) => {
    const pick = stub().returns({
        skip: 'typo not found on line',
    });
    
    const result = await decide({
        event,
        file: '',
        engine: {
            pick,
        },
    });
    
    t.equal(result.skip, 'typo not found on line');
    t.end();
});
