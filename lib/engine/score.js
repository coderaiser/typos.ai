import {findTypo, substitute} from './locate.js';

const MIN_PROBABILITY = 1e-9;
const MAX_LINE_LENGTH = 400;

const compareScores = (a, b) => b.score - a.score;

const getProbability = (result, token) => {
    if (!result || !result.next || !result.next.probabilities)
        return MIN_PROBABILITY;
    
    return result.next.probabilities.get(token) || MIN_PROBABILITY;
};

const cut = (line) => line.slice(0, MAX_LINE_LENGTH);

export async function scoreText({model, sequence, text}) {
    const tokens = model.tokenize(text, true);
    const input = [];
    
    for (const [i, token] of tokens.entries()) {
        if (i === tokens.length - 1) {
            input.push(token);
            continue;
        }
        
        input.push([
            token, {
                generateNext: {
                    probabilities: true,
                },
            },
        ]);
    }
    
    await sequence.clearHistory();
    const results = await sequence.controlledEvaluate(input);
    
    let sum = 0;
    
    for (const [i, token] of tokens
        .slice(1)
        .entries()) {
        sum += Math.log(Math.max(
            getProbability(results[i], token),
            MIN_PROBABILITY,
        ));
    }
    
    return sum;
}

export function buildText({lines, lineIndex, radius, after = radius, replacement}) {
    const from = Math.max(0, lineIndex - radius);
    const to = Math.min(lines.length, lineIndex + after + 1);
    const result = [];
    
    for (const [i, line] of lines
        .slice(from, to)
        .entries()) {
        result.push(cut(lineIndex === from + i ? replacement : line));
    }
    
    return result.join('\n');
}

export async function pickCorrection({model, sequence, event, file, radius = 1}) {
    const lines = file.split('\n');
    const lineIndex = event.line_num - 1;
    
    if (lineIndex < 0 || lineIndex >= lines.length)
        return {
            skip: 'line not found',
        };
    
    const line = lines[lineIndex];
    const index = findTypo(line, event.typo, event.byte_offset);
    
    if (index === -1)
        return {
            skip: 'typo not found on line',
        };
    
    const scores = [];
    
    for (const correction of [...event.corrections, event.typo]) {
        const replacement = correction === event.typo ? line : substitute(line, index, event.typo, correction);
        const text = buildText({
            lines,
            lineIndex,
            radius,
            after: 0,
            replacement,
        });
        
        const score = await scoreText({
            model,
            sequence,
            text,
        });
        
        scores.push({
            correction,
            score,
        });
    }
    
    scores.sort(compareScores);
    
    const [best, second] = scores;
    
    return {
        output: best.correction,
        keep: best.correction === event.typo,
        margin: second ? best.score - second.score : Infinity,
        scores,
        index,
    };
}
