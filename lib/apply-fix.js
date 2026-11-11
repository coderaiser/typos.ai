import {substitute} from './engine/locate.js';

const byPositionDescending = (a, b) => {
    if (a.lineIndex !== b.lineIndex)
        return b.lineIndex - a.lineIndex;
    
    return b.index - a.index;
};

export function applyFixes(content, fixes) {
    const lines = content.split('\n');
    const sorted = fixes.toSorted(byPositionDescending);
    
    for (const {lineIndex, index, typo, correction} of sorted) {
        lines[lineIndex] = substitute(lines[lineIndex], index, typo, correction);
    }
    
    return lines.join('\n');
}
