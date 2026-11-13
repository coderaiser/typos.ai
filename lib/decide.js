export const DEFAULT_MIN_MARGIN = 1;

const lower = (a) => a.toLowerCase();

// Pool the evidence of all occurrences of one typo: the log-likelihood gap of
// every candidate to the best one on each line is summed, plus a small prior
// for candidates that are already used in the code base.
export function decide({typo, picks, counts = {}, minMargin = DEFAULT_MIN_MARGIN}) {
    const total = new Map();
    const original = lower(typo);
    
    for (const {scores} of picks) {
        const top = Math.max(...scores.map(({score}) => score));
        
        for (const {correction, score} of scores) {
            const key = lower(correction);
            
            total.set(key, (total.get(key) || 0) + score - top);
        }
    }
    
    for (const [key, value] of total) {
        if (key !== original)
            total.set(key, value + Math.log1p(counts[key] || 0));
    }
    
    const ranked = Array.from(total).sort((a, b) => b[1] - a[1]);
    const [[best, score], second] = ranked;
    const margin = second ? score - second[1] : Infinity;
    
    if (margin < minMargin)
        return {
            skip: `low confidence (margin ${margin.toFixed(1)})`,
        };
    
    return {
        best,
        keep: best === original,
        margin,
    };
}

