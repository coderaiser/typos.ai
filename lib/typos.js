import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tryCatch } from 'try-catch';
import {readStdin} from 'redstd';
import { z } from 'zod';

const cwd = process.cwd();
const MAX_RETRIES = 5;

const system = await readFile('./system.md', 'utf-8');
const instructions = await readFile('./instructions.md', 'utf-8');

const LLMResponse = z.object({
  type: z.enum(['typo', 'exclude']).optional(),
  input: z.array(z.string()).optional(),
  output: z.string(),
});

await main();

async function callLLM(event, file) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: instructions },
        {
          role: 'user',
          content: JSON.stringify({ event, file }),
        },
      ],
    }),
  });

  const data = await res.json();
  if (data.error)
      return [data.error];
      
  return [null, data.choices?.[0]?.message?.content || ''];
}

function parse(raw) {
  const [err, json] = tryCatch(JSON.parse, raw);
  if (err) return null;

  const res = LLMResponse.safeParse(json);
  if (!res.success) return null;

  return res.data;
}

function isValid(result, event) {
  if (!result.output) return false;
  return event.corrections.includes(result.output);
}

async function applyFix(filePath, event, output) {
  const content = await readFile(filePath, 'utf-8');
  const fixed = content.replaceAll(event.typo, output);
  await writeFile(filePath, fixed);
}

function logRetry(raw, event) {
  console.log('\x1b[31mLLM INVALID OUTPUT → RETRY\x1b[0m');
  console.log(event);
}

function logReject(raw, event) {
  console.log('\x1b[31mLLM FAILED AFTER RETRIES\x1b[0m');
  console.log(raw);
  console.log(event);
}

async function resolveEvent(event, file) {
  for (let i = 0; i < MAX_RETRIES; i++) {
    const [error, raw] = await callLLM(event, file);

    if (error) {
      console.error(error.message);
      return;
    }
    const result = parse(raw);

    if (!result) {
      logRetry(raw, event);
      continue;
    }

    if (!isValid(result, event)) {
      logRetry(raw, event);
      continue;
    }

    if (result.type === 'exclude') return;

    await applyFix(event.path, event, result.output);
    return;
  }

  logReject('no valid result', event);
}

async function main() {
  const line = await readStdin();
    const event = JSON.parse(line);

    const filePath = join(cwd, event.path);
    const file = await readFile(filePath, 'utf-8');

    await resolveEvent(event, file);
}

