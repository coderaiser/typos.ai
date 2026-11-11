import {join} from 'node:path';
import {test} from 'supertape';
import {getCacheDir} from './cache.js';

test('typos.ai: cache: TYPOS_AI_HOME', (t) => {
    const result = getCacheDir({
        env: {
            TYPOS_AI_HOME: '/tmp/typos-ai',
        },
    });
    
    t.equal(result, '/tmp/typos-ai');
    t.end();
});

test('typos.ai: cache: XDG_CACHE_HOME', (t) => {
    const result = getCacheDir({
        env: {
            XDG_CACHE_HOME: '/xdg',
        },
    });
    
    t.equal(result, join('/xdg', 'typos.ai'));
    t.end();
});

test('typos.ai: cache: home', (t) => {
    const result = getCacheDir({
        home: '/home/user',
    });
    
    t.equal(result, join('/home/user', '.cache', 'typos.ai'));
    t.end();
});

test('typos.ai: cache: defaults', (t) => {
    const result = getCacheDir();
    
    t.equal(typeof result, 'string');
    t.end();
});
