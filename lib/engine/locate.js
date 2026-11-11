import {Buffer} from 'node:buffer';

const WORD = '[\\p{L}\\p{N}_]';

const createRegExp = (typo) => {
    const escaped = typo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    return new RegExp(`(?<!${WORD})${escaped}(?!${WORD})`, 'gu');
};

export const findTypo = (line, typo, byteOffset) => {
    let best = null;
    
    for (const {index} of line.matchAll(createRegExp(typo))) {
        const distance = Math.abs(Buffer.byteLength(line.slice(0, index)) - byteOffset);
        
        if (!best || distance < best.distance)
            best = {
                index,
                distance,
            };
    }
    
    return best ? best.index : -1;
};

export const substitute = (line, index, typo, correction) => line.slice(0, index) + correction +
    line.slice(index + typo.length);
