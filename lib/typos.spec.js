import {test, stub} from 'supertape';
import {tryToCatch} from 'try-to-catch';
import {typos} from './typos.js';

const event = {
    type: 'typo',
    path: 'a.md',
    line_num: 1,
    byte_offset: 2,
    typo: 'wich',
    corrections: ['which', 'witch'],
};

const secondEvent = {
    ...event,
    byte_offset: 16,
    typo: 'tabel',
    corrections: ['table', 'label'],
};

const scored = (best, other, original) => ({
    index: 2,
    scores: [{
        correction: best,
        score: -5,
    }, {
        correction: other,
        score: -14,
    }, {
        correction: original,
        score: -30,
    }],
});

const result = scored('witch', 'which', 'wich');

const pickByTypo = ({event}) => {
    if (event.typo === 'tabel')
        return {
            ...scored('table', 'label', 'tabel'),
            index: 16,
        };
    
    return result;
};

const stdin = JSON.stringify(event);
const twoEvents = `${stdin}\n${JSON.stringify(secondEvent)}`;

const createOptions = (overrides = {}) => {
    const {pick = stub(pickByTypo), ...rest} = overrides;
    
    const engine = {
        pick,
        dispose: stub(),
    };
    
    return {
        engine,
        env: {},
        pipe: stub().returns(stdin),
        cwd: stub().returns('/project'),
        read: stub().returns('A wich cast and tabel'),
        write: stub(),
        create: stub().returns(engine),
        logs: {
            fix: stub(),
            ignore: stub(),
            skip: stub(),
        },
        end: stub(),
        ...rest,
    };
};

test('typos.ai: typos: writes the chosen correction', async (t) => {
    const options = createOptions();
    
    await typos(options);
    
    t.calledWith(options.write, [
        '/project/a.md',
        'A witch cast and tabel',
    ]);
    t.end();
});

test('typos.ai: typos: several typos in one file are written once', async (t) => {
    const options = createOptions({
        pipe: stub().returns(twoEvents),
    });
    
    await typos(options);
    
    t.calledWith(options.write, [
        '/project/a.md',
        'A witch cast and table',
    ]);
    t.end();
});

test('typos.ai: typos: fix is logged', async (t) => {
    const options = createOptions();
    
    await typos(options);
    const args = [
        event, {
            output: 'witch',
            margin: 9,
        },
    ];
    
    t.calledWith(options.logs.fix, args);
    t.end();
});

test('typos.ai: typos: engine is disposed', async (t) => {
    const options = createOptions();
    
    await typos(options);
    
    t.calledWithNoArgs(options.engine.dispose);
    t.end();
});

test('typos.ai: typos: dry run does not write', async (t) => {
    const options = createOptions({
        env: {
            TYPOS_AI_DRY: '1',
        },
    });
    
    await typos(options);
    
    t.notCalled(options.write);
    t.end();
});

test('typos.ai: typos: low confidence is skipped quietly', async (t) => {
    const options = createOptions({
        pick: stub().returns({
            ...result,
            scores: [{
                correction: 'witch',
                score: -5,
            }, {
                correction: 'which',
                score: -5.1,
            }],
        }),
    });
    
    await typos(options);
    
    t.notCalled(options.write);
    t.end();
});

test('typos.ai: typos: TYPOS_AI_MIN_MARGIN lowers the threshold', async (t) => {
    const options = createOptions({
        env: {
            TYPOS_AI_MIN_MARGIN: '0',
        },
        pick: stub().returns({
            ...result,
            scores: [{
                correction: 'witch',
                score: -5,
            }, {
                correction: 'which',
                score: -5.1,
            }],
        }),
    });
    
    await typos(options);
    
    t.calledWith(options.write, [
        '/project/a.md',
        'A witch cast and tabel',
    ]);
    t.end();
});

test('typos.ai: typos: invalid TYPOS_AI_MIN_MARGIN throws before the engine is created', async (t) => {
    const options = createOptions({
        env: {
            TYPOS_AI_MIN_MARGIN: 'abc',
        },
    });
    
    const [error] = await tryToCatch(typos, options);
    
    t.equal(error.message, 'TYPOS_AI_MIN_MARGIN must be a number');
    t.end();
});

test('typos.ai: typos: no events, engine is never created', async (t) => {
    const options = createOptions({
        pipe: stub().returns(''),
    });
    
    await typos(options);
    
    t.notCalled(options.create);
    t.end();
});

test('typos.ai: typos: TYPOS_AI_RUN uses the output of typos', async (t) => {
    const options = createOptions({
        env: {
            TYPOS_AI_RUN: '1',
        },
        run: stub().returns(stdin),
    });
    
    await typos(options);
    
    t.calledWith(options.write, [
        '/project/a.md',
        'A witch cast and tabel',
    ]);
    t.end();
});

test('typos.ai: typos: TYPOS_AI_RUN does not read stdin', async (t) => {
    const options = createOptions({
        env: {
            TYPOS_AI_RUN: '1',
        },
        run: stub().returns(''),
    });
    
    await typos(options);
    
    t.notCalled(options.pipe);
    t.end();
});

test('typos.ai: typos: defaults', async (t) => {
    const run = stub().returns('');
    
    await typos({
        env: {
            TYPOS_AI_RUN: '1',
        },
        run,
    });
    
    t.calledWithNoArgs(run);
    t.end();
});

test('typos.ai: typos: default env', async (t) => {
    const pipe = stub().returns('');
    
    await typos({
        pipe,
    });
    
    t.calledWithNoArgs(pipe);
    t.end();
});

test('typos.ai: typos: not a typo is added to ignore list', async (t) => {
    const ignore = stub();
    const options = createOptions({
        pick: stub().returns(scored('wich', 'witch', 'which')),
    });
    
    await typos({
        ...options,
        ignore,
    });
    const args = [{
        cwd: '/project',
        words: ['wich'],
    }];
    
    t.calledWith(ignore, args);
    t.end();
});

