You receive:

1. typo event (JSON)
2. full file content (string)

Event format:

{
"type": "typo",
"path": "abc.md",
"line_num": 1,
"byte_offset": 0,
"typo": "Deply",
"corrections": ["Deploy", "Deeply"]
}

FILE CONTENT:
<<<
{{FILE}}

> > >

TASK:

- choose exactly ONE value from corrections
- decide best fix for typo in context of file
- if none are correct → type = "exclude"

OUTPUT JSON:

{
"input": "...",
"output": "..."
}

RULES:

- output MUST be ONE word
- output MUST be from corrections
- path must be unchanged
- no extra fields
- no explanation

OUTPUT EXAMPLE:
{
"input": ["Deploy", "Deeply"]
"output": "Deploy"
}
