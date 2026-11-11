import {test} from 'supertape';
import {loadLlama} from './llama.js';

test('typos.ai: llama: loadLlama', async (t) => {
    const llama = await loadLlama();
    const result = typeof llama.loadModel;
    const expected = 'function';
    
    t.equal(result, expected);
    t.end();
});
