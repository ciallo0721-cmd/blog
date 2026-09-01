/* ============================================================
   CS · chatai-worker.js — 0.1B 对话模型推理 Worker
   在 Web Worker 里跑 transformers.js + ONNX(q4)，
   玩家在游戏聊天框发消息 → 模型生成队友回复（不卡游戏主线程）
   模型：G:\llm 微调中文 GPT-2（102M 参数，int4 量化）
   ============================================================ */
import { env, AutoTokenizer, AutoModelForCausalLM } from '../model/transformers.min.js';

// ORT wasm 从本地目录取（不联网）
if(!env.wasm) env.wasm = {};   // 模块顶层 env.wasm 可能尚未初始化，先确保对象存在
env.wasm.wasmPaths = new URL('../model/ort/', import.meta.url).href;
env.wasm.numThreads = 1;   // 无 COOP/COEP 头时 SAB 不可用，强制单线程最稳
env.allowLocalModels = true;

// 用相对路径（基于 worker 位置 ../model/gpt2ft），部署到任意域名都能 fetch，不再写死 localhost
const MODEL_DIR = '../model/gpt2ft';
let tokenizer = null, model = null;

async function load() {
  const t0 = performance.now();
  tokenizer = await AutoTokenizer.from_pretrained(MODEL_DIR);
  // 优先加载 int4 量化模型（小体积、适合部署）；若还没量化好则用 fp32 兜底
  try {
    model = await AutoModelForCausalLM.from_pretrained(MODEL_DIR, { dtype: 'q4', device: 'wasm' });
  } catch (e) {
    console.warn('[chatai] q4 加载失败，回退 fp32:', e);
    model = await AutoModelForCausalLM.from_pretrained(MODEL_DIR, { device: 'wasm' });
  }
  postMessage({ type: 'ready', ms: Math.round(performance.now() - t0) });
}
load().catch(err => postMessage({ type: 'error', msg: String(err && err.message || err) }));

function gen(text) {
  const prompt = '<|user|>' + text + '<|end|><|assistant|>';
  const input = tokenizer(prompt, { return_tensor: true, padding: false, truncation: true });
  const inLen = input.input_ids.dims[1];
  const out = model.generate({
    ...input,
    max_new_tokens: 24,
    do_sample: true,
    top_k: 40,
    top_p: 0.9,
    temperature: 0.95,
    repetition_penalty: 1.15,
  });
  const seq = out.tolist()[0];
  let reply = tokenizer.decode(seq.slice(inLen), { skip_special_tokens: true });
  reply = reply.replace(/\s+/g, ' ').trim().slice(0, 60);
  return reply;
}

onmessage = e => {
  const d = e.data || {};
  if (d.type !== 'gen') return;
  if (!model || !tokenizer) { postMessage({ type: 'reply', reply: null }); return; }
  try {
    const reply = gen(String(d.text || '').slice(0, 60));
    postMessage({ type: 'reply', reply: reply || null });
  } catch (err) {
    postMessage({ type: 'reply', reply: null, err: String(err && err.message || err) });
  }
};
