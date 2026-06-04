import {run} from 'madrun';

const env = {
    SUPERC8_RESPONSIVE: 1,
};

export default {
    'test': () => `tape 'lib/**/*.spec.js' 'test/*.js'`,
    'watch:test': async () => `nodemon -w packages -w test -x "${await run('test')}"`,
    'lint': () => `putout .`,
    'fresh:lint': () => run('lint', '--fresh'),
    'lint:fresh': () => run('lint', '--fresh'),
    'fix:lint': () => run('lint', '--fix'),
    'coverage:c8': async () => [env, `c8 ${await run('test')}`],
    'coverage': async () => [env, `escover "${await run('test')}"`],
    'report': () => 'c8 report --reporter=lcov',
};
