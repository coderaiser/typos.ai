import {test} from 'supertape';
import {addIgnored} from './ignore.js';

test('typos.ai: ignore: creates the section', (t) => {
    const result = addIgnored('[files]\nextend-exclude = ["ChangeLog"]\n', ['CPY']);
    
    t.equal(result, '[files]\nextend-exclude = ["ChangeLog"]\n\n[default.extend-words]\ncpy = "cpy"\n');
    t.end();
});

test('typos.ai: ignore: adds to the existing section', (t) => {
    const result = addIgnored('[default.extend-words]\nteh = "teh"\n', ['CPY']);
    
    t.equal(result, '[default.extend-words]\ncpy = "cpy"\nteh = "teh"\n');
    t.end();
});

test('typos.ai: ignore: no duplicates', (t) => {
    const content = '[default.extend-words]\ncpy = "cpy"\n';
    const result = addIgnored(content, ['CPY', 'cpy']);
    const expected = content;
    
    t.equal(result, expected);
    t.end();
});

test('typos.ai: ignore: empty file', (t) => {
    const result = addIgnored('', ['x']);
    const expected = '[default.extend-words]\nx = "x"\n';
    
    t.equal(result, expected);
    t.end();
});

