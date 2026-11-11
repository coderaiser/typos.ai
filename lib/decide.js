export const DEFAULT_MIN_MARGIN = 1;

export async function decide({event, file, engine, minMargin = DEFAULT_MIN_MARGIN}) {
    const {corrections} = event;
    
    if (!Array.isArray(corrections) || !corrections.length)
        return {
            skip: 'no corrections',
        };
    
    const result = await engine.pick({
        event,
        file,
    });
    
    if (result.skip)
        return result;
    
    if (result.margin < minMargin)
        return {
            skip: `low confidence (margin ${result.margin.toFixed(1)})`,
        };
    
    return result;
}
