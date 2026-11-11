import {test} from 'supertape';
import {findTypo, substitute} from './locate.js';

test('typos.ai: locate: findTypo: picks occurrence nearest to byte offset', (t) => {
    const line = 'wich cast and wich spell';
    const result = findTypo(line, 'wich', 15);
    
    t.equal(result, 14);
    t.end();
});

test('typos.ai: locate: findTypo: byte offset is in bytes, not chars', (t) => {
    const line = 'Привет, wich option';
    const result = findTypo(line, 'wich', 14);
    
    t.equal(result, 8);
    t.end();
});

test('typos.ai: locate: findTypo: ignores matches inside words', (t) => {
    const result = findTypo('switch wichita', 'wich', 0);
    
    t.equal(result, -1);
    t.end();
});

test('typos.ai: locate: substitute', (t) => {
    const result = substitute('a wich b', 2, 'wich', 'which');
    
    t.equal(result, 'a which b');
    t.end();
});
