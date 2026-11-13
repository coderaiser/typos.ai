import {test} from 'supertape';
import {decide} from './decide.js';

const pick = (which, witch, wich = -20) => ({
    scores: [{
        correction: 'which',
        score: which,
    }, {
        correction: 'witch',
        score: witch,
    }, {
        correction: 'wich',
        score: wich,
    }],
});

test('typos.ai: decide: confident answer', (t) => {
    const result = decide({
        typo: 'wich',
        picks: [pick(-5, -9)],
    });
    
    t.equal(result.best, 'which');
    t.end();
});

test('typos.ai: decide: evidence of all occurrences is pooled', (t) => {
    const result = decide({
        typo: 'wich',
        picks: [
            pick(-5, -7),
            pick(-5, -7),
            pick(-8, -7.5),
        ],
    });
    
    t.equal(result.best, 'which');
    t.end();
});

test('typos.ai: decide: low pooled margin is skipped', (t) => {
    const result = decide({
        typo: 'wich',
        picks: [pick(-5, -5.5)],
    });
    
    t.ok(result.skip.startsWith('low confidence'));
    t.end();
});

test('typos.ai: decide: the original word wins, it is not a typo', (t) => {
    const result = decide({
        typo: 'wich',
        picks: [pick(-12, -12, -4)],
    });
    
    t.ok(result.keep);
    t.end();
});

test('typos.ai: decide: usage in the code base breaks the tie', (t) => {
    const result = decide({
        typo: 'wich',
        picks: [pick(-5, -5.2)],
        counts: {
            which: 20,
            witch: 0,
        },
        minMargin: 1,
    });
    
    t.equal(result.best, 'which');
    t.end();
});

test('typos.ai: decide: single candidate has infinite margin', (t) => {
    const result = decide({
        typo: 'x',
        picks: [{
            scores: [{
                correction: 'y',
                score: -1,
            }],
        }],
    });
    
    t.equal(result.margin, Infinity);
    t.end();
});
