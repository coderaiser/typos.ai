const WORD = '[\\p{L}\\p{N}_]';

const escape = (word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const countWords = (words, contents) => {
    const counts = {};
    
    for (const word of new Set(words.map((a) => a.toLowerCase()))) {
        const regexp = new RegExp(`(?<!${WORD})${escape(word)}(?!${WORD})`, 'giu');
        
        counts[word] = contents.reduce((sum, content) => sum + (content.match(regexp) || []).length, 0);
    }
    
    return counts;
};
