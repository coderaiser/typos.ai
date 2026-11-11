import {homedir} from 'node:os';
import {join} from 'node:path';

export const getCacheDir = (overrides = {}) => {
    const {
        env = {},
        home = homedir(),
    } = overrides;
    
    if (env.TYPOS_AI_HOME)
        return env.TYPOS_AI_HOME;
    
    return join(env.XDG_CACHE_HOME || join(home, '.cache'), 'typos.ai');
};
