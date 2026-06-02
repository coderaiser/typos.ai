import {test, stub} from 'supertape';
import {applyFix} from './apply-fix.js';

test('typos.ai: apply-fix', async (t) => {
    const read = stub().returns('Deply to server');
    const write = stub();
    
    const event = {
        type: 'typo',
        path: '1.md',
        line_num: 1,
        byte_offset: 0,
        typo: 'Deply',
        corrections: [
            'Deploy',
            'Deeply',
        ],
    };
    
    await applyFix('1.md', event, 'Deploy', {
        read,
        write,
    });
    
    const args = [
        '1.md',
        'Deploy to server',
    ];
    
    t.calledWith(write, args);
    t.end();
});
