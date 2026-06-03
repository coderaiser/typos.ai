import {test} from 'supertape';
import {formatTypos} from './format-typos.js';

test('typos.ai: formatTypos', (t) => {
    const input = {
        type: 'typo',
        path: './lib/llm/decide.spec.js',
        line_num: 15,
        byte_offset: 15,
        typo: 'Deply',
        corrections: ['Deploy', 'Deeply'],
    };
    
    const result = formatTypos(input);
    const expected = './lib/llm/decide.spec.js: Deply -> Deploy, Deeply';
    
    t.equal(result, expected);
    t.end();
});
