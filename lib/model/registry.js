const REVISION = '9e6855bc4be717fca1ef21360a1db4b29d5c559a';
const REPO = 'unsloth/SmolLM2-135M-Instruct-GGUF';
const FILE = 'SmolLM2-135M-Instruct-Q4_K_M.gguf';

export const DEFAULT_MODEL = 'smol';

export const MODELS = {
    smol: {
        file: FILE,
        url: `https://huggingface.co/${REPO}/resolve/${REVISION}/${FILE}`,
        sha256: 'ed5fa30c487b282ec156c29062f1222e5c20875a944ac98289dbd242e947f747',
        size: 105_454_144,
    },
};
