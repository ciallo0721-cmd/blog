/* ============================================================
   CS · chatai-worker.js — Qwen2.5-0.5B-Instruct 对话推理 Worker
   在 Web Worker 里跑 transformers.js + ONNX(q4f16, 460MB 切 5 块入库)
   玩家在游戏聊天框发消息 → 模型生成队友回复（不卡游戏主线程）
   模型：onnx-community/Qwen2.5-0.5B-Instruct（现成对话模型，int4 权重+fp16 激活）
   说明：CS 游戏 web 部署经用户明确允许使用现成对话模型，不走 G:\llm 自训原则。
   ============================================================ */
import { env, AutoTokenizer, AutoModelForCausalLM } from '../model/transformers.min.js';

// ORT wasm 从本地目录取（不联网）
if(!env.wasm) env.wasm = {};   // 模块顶层 env.wasm 可能尚未初始化，先确保对象存在
env.wasm.wasmPaths = new URL('../model/ort/', import.meta.url).href;
env.wasm.numThreads = 1;   // 无 COOP/COEP 头时 SAB 不可用，强制单线程最稳
env.allowLocalModels = true;

// 把 worker 内 console（含 ORT/wasm 的报错）转发到主线程日志，排查 abort 真正原因
const _wpost = (m) => postMessage({ type:'log', msg:'[ort] ' + m });
console.log = (...a) => _wpost(a.map(String).join(' '));
console.info = console.log;
console.warn = (...a) => _wpost('WARN ' + a.map(String).join(' '));
console.error = (...a) => _wpost('ERR ' + a.map(String).join(' '));
// ORT verbose：abort 前通常会打印不支持的 op / 内存错误
env.wasm.logLevel = 'verbose';

// 用相对路径：tokenizer / config 这条路 transformers.js 认相对路径（绝对 URL 反而被当成 HF model id 报 invalid）
const MODEL_DIR = '../model/qwen25';
let tokenizer = null, model = null, fullModel = null;

// 多轮对话历史（仅玩家↔AI 的轮次，worker 内自维护）
const MAX_HISTORY = 12;   // 最多保留最近 12 条（6 轮），防止上下文无限增长
let convHistory = [];

// Qwen2 系统人设：简短、口语化、中文 FPS 队友
const SYSTEM_PROMPT = '你是 CS 射击游戏里玩家的 AI 队友，说话简短口语化，用中文，偶尔带点俏皮。';

/* ------------------------------------------------------------
   模型 460MB 超 GitHub Pages 单文件 100MB 限制，切成 .00~.04 五块入库，
   worker 内拼成完整 onnx 后，拦截 transformers.js 对权重文件的 fetch，
   直接返回内存中的完整模型字节（绕过其 URL/路径判定黑盒）。
   ------------------------------------------------------------ */
const _origFetch = globalThis.fetch ? globalThis.fetch.bind(globalThis) : null;
globalThis.fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : (input && input.url ? input.url : '');
  if (fullModel && typeof url === 'string' && /\/qwen25\/[^/]*\.onnx($|\?)/.test(url)) {
    return new Response(fullModel, {
      status: 200,
      headers: {
        'content-type': 'application/octet-stream',
        'content-length': String(fullModel.byteLength),
      },
    });
  }
  return _origFetch ? _origFetch(input, init) : fetch(input, init);
};

function post(d){ postMessage(d); }

async function loadModelChunks() {
  // 先探测分块数量与每块大小（HEAD），避免一次性把全部块读进内存再拼的峰值浪费
  const sizes = [];
  let i = 0;
  for (;;) {
    const url = `${MODEL_DIR}/model.onnx.${String(i).padStart(2, '0')}`;
    const head = await fetch(url, { method: 'HEAD' });
    if (!head.ok) break;
    sizes.push(Number(head.headers.get('content-length')) || 0);
    i++;
  }
  if (i === 0) throw new Error('未找到模型分块文件 model.onnx.00（fetch 全部失败，检查路径/服务）');
  const total = sizes.reduce((a, b) => a + b, 0);
  const out = new Uint8Array(total);   // 仅分配一次，避免双份持有
  let off = 0;
  for (let k = 0; k < sizes.length; k++) {
    const url = `${MODEL_DIR}/model.onnx.${String(k).padStart(2, '0')}`;
    const buf = new Uint8Array(await (await fetch(url)).arrayBuffer());   // 短生命周期，拼完即释放
    out.set(buf, off); off += buf.length;
    post({ type:'log', msg:`  分块 ${k + 1} 拼入 ${(buf.length / 1048576).toFixed(1)}MB` });
  }
  post({ type:'log', msg:`模型分块拼合完成: ${sizes.length} 块, ${(total / 1048576).toFixed(1)}MB` });
  return out;
}

async function load() {
  const t0 = performance.now();
  post({ type:'log', msg:'加载 tokenizer...' });
  tokenizer = await AutoTokenizer.from_pretrained(MODEL_DIR);
  post({ type:'log', msg:'tokenizer 就绪，拼合模型分块...' });

  fullModel = await loadModelChunks();   // 拼合完成，fetch 拦截此刻起对模型文件生效
  post({ type:'log', msg:'分块已就位，调用 from_pretrained(subfolder:"")...' });

  try {
    // subfolder:'' → 默认找 <MODEL_DIR>/model.onnx，被上面 fetch 拦截返回拼合数据
    model = await AutoModelForCausalLM.from_pretrained(MODEL_DIR, { subfolder: '', device: 'wasm' });
    post({ type:'log', msg:'✅ 模型加载成功' });
  } catch (e) {
    post({ type:'error', msg:'模型加载失败: ' + (e && e.message ? e.message : e) });
    throw e;
  }
  postMessage({ type: 'ready', ms: Math.round(performance.now() - t0) });
}
load().catch(err => post({ type: 'error', msg: String(err && err.message || err) }));

/* ------------------------------------------------------------
   Qwen2 对话模板：
   <|im_start|>system\n{prompt}<|im_end|>\n
   <|im_start|>user\n{content}<|im_end|>\n
   <|im_start|>assistant\n{生成}
   ------------------------------------------------------------ */
function buildPrompt(history, userText) {
  let p = `<|im_start|>system\n${SYSTEM_PROMPT}<|im_end|>\n`;
  for (const m of history) {
    p += `<|im_start|>${m.role}\n${m.content}<|im_end|>\n`;
  }
  p += `<|im_start|>user\n${userText}<|im_end|>\n`;
  p += `<|im_start|>assistant\n`;
  return p;
}

async function gen(userText) {
  const prompt = buildPrompt(convHistory, userText);
  const input = tokenizer(prompt, { add_special_tokens: false, return_tensors: 'pt', padding: false, truncation: true, max_length: 1024 });
  const inLen = input.input_ids.dims[1];
  const output = await model.generate({
    ...input,
    max_new_tokens: 48,
    do_sample: true,
    top_k: 40,
    top_p: 0.9,
    temperature: 0.8,
    repetition_penalty: 1.2,
    eos_token_id: 151645,   // <|im_end|>，生成到此停止
  });
  // transformers.js v3 的 generate() 直接返回 Tensor（v2 包在 {sequences:Tensor} 里），这里兼容两种返回
  const seqTensor = output.sequences ? output.sequences : output;
  const seq = seqTensor.tolist()[0];
  let reply = tokenizer.decode(seq.slice(inLen), { skip_special_tokens: true, clean_up_tokenization_spaces: false });
  // 收敛多余空白（Qwen 输出真实词，不要把空格全删，仅折叠成单空格）
  reply = reply.replace(/\s+/g, ' ').trim();
  // 模型若未停在 eos（如自己续写下一轮），遇到新的 <|im_start|> / <|im_end|> 即截断，避免 AI 抢话/扮演用户
  const cut = reply.search(/<\|im_end\|>|<\|im_start\|>/);
  if (cut >= 0) reply = reply.slice(0, cut).trim();
  // 写入历史（裁剪上限）
  convHistory.push({ role: 'user', content: userText });
  convHistory.push({ role: 'assistant', content: reply });
  if (convHistory.length > MAX_HISTORY) convHistory = convHistory.slice(convHistory.length - MAX_HISTORY);
  return reply.slice(0, 60);
}

onmessage = async e => {
  const d = e.data || {};
  if (d.type !== 'gen') return;
  if (!model || !tokenizer) { postMessage({ type: 'reply', reply: null, err: 'model/tokenizer 未就绪' }); return; }
  try {
    // 前端只发 {type:'gen', text}（单条玩家发言）；多轮历史在 worker 内自维护。
    // 兼容扩展：若前端传 d.prompt（已拼好的完整 prompt）或 d.history（显式历史）也支持。
    let reply;
    if (d.history && Array.isArray(d.history) && d.history.length) {
      const lastUser = (d.text != null) ? String(d.text) : (d.history.filter(m=>m.role==='user').pop()||{}).content || '';
      convHistory = d.history.slice(-MAX_HISTORY).map(m=>({role:m.role, content:String(m.content||'')}));
      reply = await gen(lastUser);
    } else if (typeof d.prompt === 'string' && d.prompt) {
      // 已拼好的完整 prompt：直接喂给模型（不套模板、不入历史），适合外部预格式化
      const input = tokenizer(d.prompt, { add_special_tokens: false, return_tensors: 'pt', truncation: true, max_length: 1024 });
      const inLen = input.input_ids.dims[1];
      const output = await model.generate({ ...input, max_new_tokens: 48, do_sample: true, top_k: 40, top_p: 0.9, temperature: 0.8, repetition_penalty: 1.2, eos_token_id: 151645 });
      const seqTensor = output.sequences ? output.sequences : output;
      const seq = seqTensor.tolist()[0];
      reply = tokenizer.decode(seq.slice(inLen), { skip_special_tokens: true }).replace(/\s+/g, ' ').trim();
      const cut = reply.search(/<\|im_end\|>|<\|im_start\|>/);
      if (cut >= 0) reply = reply.slice(0, cut).trim();
      reply = reply.slice(0, 60);
    } else {
      reply = await gen(String(d.text || '').slice(0, 120));
    }
    postMessage({ type: 'reply', reply: reply || null });
  } catch (err) {
    postMessage({ type: 'reply', reply: null, err: String(err && err.message || err) });
  }
};
