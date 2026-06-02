import {tryCatch} from 'try-catch';
import {z} from 'zod';

export const LLMResponse = z.object({
    type: z
        .enum(['typo', 'exclude'])
        .optional(),
    input: z
        .array(z.string())
        .optional(),
    output: z.string(),
});

export function parse(raw) {
    const [err, json] = tryCatch(JSON.parse, raw);
    
    if (err)
        return null;
    
    const {success, data} = LLMResponse.safeParse(json);
    
    if (!success)
        return null;
    
    return data;
}
