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
