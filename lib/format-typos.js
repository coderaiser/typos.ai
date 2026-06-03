export const formatTypos = (typos) => {
    const result = [];
    
    for (const {path, typo, corrections} of typos) {
        result.push(`${path}: ${typo} -> ${corrections.join(', ')}`);
    }
    
    return result;
};
