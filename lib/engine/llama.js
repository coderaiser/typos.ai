export async function loadLlama() {
    const {getLlama} = await import('node-llama-cpp');
    
    return getLlama({
        gpu: false,
    });
}
