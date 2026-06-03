export const parseTypos = (stdin = '') => {
    const result = [];
    
    for (const line of stdin.split('\n')) {
        if (!line.trim())
            continue;
        
        const event = JSON.parse(line);
        
        if (event.type !== 'typo')
            continue;
        
        result.push(event);
    }
    
    return result;
};
