import {test} from 'supertape';
import {applyFixes} from './apply-fix.js';

test('typos.ai: apply-fix: several fixes on one line with different lengths', (t) => {
    const fixes = [{
        lineIndex: 0,
        index: 4,
        typo: 'wich',
        correction: 'which',
    }, {
        lineIndex: 0,
        index: 13,
        typo: 'tabel',
        correction: 'tbl',
    }];
    
    const result = applyFixes('aaa wich bbb tabel\nnext', fixes);
    
    t.equal(result, 'aaa which bbb tbl\nnext');
    t.end();
});

test('typos.ai: apply-fix: fixes on several lines', (t) => {
    const fixes = [{
        lineIndex: 0,
        index: 0,
        typo: 'wich',
        correction: 'which',
    }, {
        lineIndex: 1,
        index: 2,
        typo: 'tabel',
        correction: 'table',
    }];
    
    const result = applyFixes('wich a\nb tabel', fixes);
    
    t.equal(result, 'which a\nb table');
    t.end();
});
