import process from 'node:process';
import {readFile} from 'node:fs/promises';

const system = await readFile('../../prompts/system.md', 'utf-8');
const instructions = await readFile('../../prompts/instructions.md', 'utf-8');

const URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function callLLM(event, file) {
    const res = await fetch(URL, {
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
