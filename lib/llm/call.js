import process from 'node:process';
import {readFile} from 'node:fs/promises';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const system = await readFile(new URL('../../prompts/system.md', import.meta.url), 'utf-8');
const instructions = await readFile(new URL('../../prompts/instructions.md', import.meta.url), 'utf-8');

export async function callLLM(event, file) {
    const res = await fetch(GROQ_URL, {
        method: 'POST',
        
        headers: {
            'Authorization': `Bearer ${process.env.API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            temperature: 0.2,
            messages: [{
                role: 'system',
                content: system,
            }, {
                role: 'user',
                content: instructions,
            }, {
                role: 'user',
                content: JSON.stringify({
                    event,
                    file,
                }),
            }],
        }),
    });
    
    const data = await res.json();
    
    if (data.error)
        return [data.error];
    
    return [null, data.choices?.[0]?.message?.content || ''];
}

