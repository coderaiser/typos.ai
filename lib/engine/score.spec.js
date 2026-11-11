import {test, stub} from 'supertape';
import {
    buildText,
    pickCorrection,
    scoreText,
} from './score.js';

const MIN = Math.log(1e-9);

const createResults = (probability) => [{
    next: {
        probabilities: new Map([
            [2, probability],
        ]),
    },
}];

const createEvaluate = (values) => {
    let index = 0;
    
    const evaluate = () => createResults(values[index++]);
    
    return stub(evaluate);
};

const createSequence = (values) => ({
    clearHistory: stub(),
    controlledEvaluate: createEvaluate(values),
});

const createModel = () => ({
    tokenize: stub().returns([1, 2]),
});

const event = {
    line_num: 1,
    byte_offset: 2,
    typo: 'wich',
    corrections: ['which', 'witch'],
};

test('typos.ai: score: scoreText: sums log probabilities', async (t) => {
    const model = {
        tokenize: stub().returns([1, 2, 3]),
    };
    
    const sequence = {
        clearHistory: stub(),
        controlledEvaluate: stub().returns([{
            next: {
                probabilities: new Map([
                    [2, 0.5],
                ]),
            },
        }, {
            next: {
                probabilities: new Map(),
            },
        },
        undefined]),
    };
    
    const result = await scoreText({
        model,
        sequence,
        text: 'a b c',
    });
    
    t.equal(result, Math.log(0.5) + MIN);
    t.end();
});

test('typos.ai: score: scoreText: missing data falls back to the minimum probability', async (t) => {
    const model = {
        tokenize: stub().returns([
            1,
            2,
            3,
            4,
            5,
        ]),
    };
    
    const sequence = {
        clearHistory: stub(),
        controlledEvaluate: stub().returns([
            undefined, {}, {
                next: {},
            }, {
                next: {
                    probabilities: new Map([
                        [5, 0],
                    ]),
                },
            },
        ]),
    };
    
    const result = await scoreText({
        model,
        sequence,
        text: 'a b c d e',
    });
    
    const delta = Math.abs(result - 4 * MIN);
    
    t.ok(delta < 1e-6);
    t.end();
});

test('typos.ai: score: scoreText: history is cleared first', async (t) => {
    const sequence = createSequence([0.5]);
    
    await scoreText({
        model: createModel(),
        sequence,
        text: 'a b',
    });
    
    t.calledWithNoArgs(sequence.clearHistory);
    t.end();
});

test('typos.ai: score: buildText: radius', (t) => {
    const result = buildText({
        lines: [
            'a',
            'b',
            'c',
            'd',
        ],
        lineIndex: 2,
        radius: 1,
        replacement: 'X',
    });
    
    t.equal(result, 'b\nX\nd');
    t.end();
});

test('typos.ai: score: buildText: start of the file', (t) => {
    const result = buildText({
        lines: ['a', 'b'],
        lineIndex: 0,
        radius: 1,
        replacement: 'X',
    });
    
    t.equal(result, 'X\nb');
    t.end();
});

test('typos.ai: score: buildText: long lines are cut', (t) => {
    const result = buildText({
        lines: ['a'],
        lineIndex: 0,
        radius: 0,
        replacement: 'x'.repeat(500),
    });
    
    t.equal(result.length, 400);
    t.end();
});

test('typos.ai: score: pickCorrection: best candidate wins', async (t) => {
    const result = await pickCorrection({
        model: createModel(),
        sequence: createSequence([0.1, 0.9]),
        event,
        file: 'A wich cast',
    });
    
    t.equal(result.output, 'witch');
    t.end();
});

test('typos.ai: score: pickCorrection: margin is the gap to the second candidate', async (t) => {
    const result = await pickCorrection({
        model: createModel(),
        sequence: createSequence([0.1, 0.9]),
        event,
        file: 'A wich cast',
    });
    
    t.equal(result.margin, Math.log(0.9) - Math.log(0.1));
    t.end();
});

test('typos.ai: score: pickCorrection: index of the typo', async (t) => {
    const result = await pickCorrection({
        model: createModel(),
        sequence: createSequence([0.9, 0.1]),
        event,
        file: 'A wich cast',
    });
    
    t.equal(result.index, 2);
    t.end();
});

test('typos.ai: score: pickCorrection: single candidate has infinite margin', async (t) => {
    const result = await pickCorrection({
        model: createModel(),
        sequence: createSequence([0.5]),
        event: {
            ...event,
            corrections: ['which'],
        },
        file: 'A wich cast',
    });
    
    t.equal(result.margin, Infinity);
    t.end();
});

test('typos.ai: score: pickCorrection: line out of range is skipped', async (t) => {
    const result = await pickCorrection({
        event: {
            ...event,
            line_num: 5,
        },
        file: 'one line',
    });
    
    t.equal(result.skip, 'line not found');
    t.end();
});

test('typos.ai: score: pickCorrection: line before the first is skipped', async (t) => {
    const result = await pickCorrection({
        event: {
            ...event,
            line_num: 0,
        },
        file: 'one line',
    });
    
    t.equal(result.skip, 'line not found');
    t.end();
});

test('typos.ai: score: pickCorrection: typo not on the line is skipped', async (t) => {
    const result = await pickCorrection({
        event,
        file: 'no typo here',
    });
    
    t.equal(result.skip, 'typo not found on line');
    t.end();
});
