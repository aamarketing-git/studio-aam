// AI Lab — 방문자 본인 키 무저장 중계 (pass-through)
// ---------------------------------------------------------------------------
// 원칙 (소영 님 지시)
//  1) 운영자 과금 0원 — 이 파일은 process.env 의 어떤 API 키도 읽지 않는다.
//     키는 오직 방문자가 요청 본문(apiKey)으로 보낸 것만 쓴다.
//  2) 무저장 — 키를 로그·DB·파일에 남기지 않는다. 요청 처리 중 메모리 변수로만 쓰고 끝낸다.
//  3) Claude(Anthropic)의 브라우저 CORS 제한을 이 서버 중계로 해결한다.
//
// POST /api/ai-lab
//   { provider: "openai"|"anthropic"|"gemini", apiKey, model, system, messages: [{role, content}],
//     json: boolean, temperature: number, maxTokens: number, task?: "text"|"image", aspectRatio?: "1:1" }
//   → { text, model, provider, finish } | { image: dataURL, model }
//   실패 → { error } + 해당 HTTP 상태 (401 = 키 오류, 429 = 한도, 400 = 요청 오류)
// ---------------------------------------------------------------------------
import { tooManyRequests } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 60;

const OPENAI_CHAT = "https://api.openai.com/v1/chat/completions";
const OPENAI_IMAGE = "https://api.openai.com/v1/images/generations";
const ANTHROPIC = "https://api.anthropic.com/v1/messages";
const GEMINI = "https://generativelanguage.googleapis.com/v1beta";

const MAX_MESSAGES = 60;
const MAX_CHARS = 120000;      // 한 요청의 총 프롬프트 상한 (남용 방지)
const MAX_SYSTEM = 24000;
const TIMEOUT_MS = 55000;

const DEFAULT_MODEL = {
  openai: "gpt-4o-mini",
  anthropic: "claude-sonnet-4-5",
  gemini: "gemini-2.5-flash",
};

const PROVIDER_LABEL = { openai: "ChatGPT", anthropic: "Claude", gemini: "Gemini" };

const fail = (status, message) => Response.json({ error: message }, { status });
const num = (v, min, max, fallback) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
};

function normProvider(v) {
  const p = String(v || "").toLowerCase().trim();
  if (p === "openai" || p === "chatgpt" || p === "gpt") return "openai";
  if (p === "anthropic" || p === "claude") return "anthropic";
  if (p === "gemini" || p === "google") return "gemini";
  return null;
}

/** 본문 메시지를 정리한다. system 역할은 따로 빼서 각 API의 system 필드로 보낸다. */
function readMessages(raw, system) {
  const list = [];
  for (const m of Array.isArray(raw) ? raw : []) {
    const role = String(m?.role || "user").toLowerCase();
    const content = typeof m?.content === "string" ? m.content : "";
    if (!content.trim()) continue;
    if (role !== "user" && role !== "assistant" && role !== "system") continue;
    list.push({ role, content: content.slice(0, MAX_CHARS) });
  }
  const sysParts = [];
  const msgs = [];
  for (const m of list) {
    if (m.role === "system") sysParts.push(m.content);
    else msgs.push(m);
  }
  const sys = [system, ...sysParts].filter(Boolean).join("\n\n").trim().slice(0, MAX_SYSTEM);
  return { sys, msgs };
}

/** 연속된 같은 role 병합 · 첫 발화를 user 로 맞춤 (Anthropic 요구사항) */
function tidy(msgs) {
  const out = [];
  for (const m of msgs) {
    const last = out[out.length - 1];
    if (last && last.role === m.role) last.content += "\n\n" + m.content;
    else out.push({ ...m });
  }
  if (!out.length || out[0].role !== "user") out.unshift({ role: "user", content: "계속 진행해주세요." });
  const chars = out.reduce((n, m) => n + m.content.length, 0);
  return { msgs: out, chars };
}

function upstreamMessage(status, text, label) {
  let msg = "";
  try {
    const j = JSON.parse(text);
    msg = j?.error?.message || j?.error?.error?.message || j?.message || "";
  } catch {}
  if (!msg) msg = String(text || "").trim().slice(0, 300);
  msg = msg.replace(/^Error:\s*/i, "").trim();
  if (status === 401) return `${label} API 키가 올바르지 않습니다 (401). 설정에서 키를 다시 확인해주세요.`;
  if (status === 403) return `${label} 키에 이 요청 권한이 없습니다 (403). ${msg}`.trim();
  if (status === 404) return `${label} 모델을 찾을 수 없습니다 (404). 모델 이름을 확인해주세요. ${msg}`.trim();
  if (status === 429) return `${label} 요청 한도를 초과했습니다 (429). 잠시 후 다시 시도하거나 결제가 연결된 키를 사용해주세요.`;
  return `${label} 오류 (HTTP ${status})${msg ? ": " + msg : ""}`;
}

/* ───────── OpenAI (ChatGPT) ───────── */
async function callOpenAI({ apiKey, model, sys, msgs, json, temperature, maxTokens }) {
  let newTokens = /^(o\d|gpt-5)/i.test(model); // o1·o3·o4·gpt-5 계열은 max_completion_tokens
  let noJsonMode = /^o1/i.test(model);         // o1 계열은 response_format 미지원
  let noTemp = newTokens;                      // 추론 계열은 temperature 미지원
  let noSystem = /^o1/i.test(model);           // o1 계열은 system 메시지 미지원

  const chat = noSystem ? [{ role: "user", content: [sys, ...msgs.map((m) => m.content)].filter(Boolean).join("\n\n") }] : [...(sys ? [{ role: "system", content: sys }] : []), ...msgs];

  for (let attempt = 0; attempt < 4; attempt++) {
    const body = { model, messages: chat };
    if (newTokens) body.max_completion_tokens = maxTokens;
    else body.max_tokens = maxTokens;
    if (!noTemp) body.temperature = temperature;
    if (json && !noJsonMode) body.response_format = { type: "json_object" };

    const r = await fetch(OPENAI_CHAT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const text = await r.text();
    if (r.ok) {
      const j = JSON.parse(text);
      const choice = (j.choices || [])[0] || {};
      const content = (choice.message && choice.message.content) || "";
      if (!content.trim()) throw Object.assign(new Error("ChatGPT 응답이 비어 있습니다. 다른 모델로 시도해주세요."), { status: 502 });
      return { text: content, model: j.model || model, finish: choice.finish_reason === "length" ? "length" : "stop" };
    }
    // 모델별 파라미터 차이를 스스로 교정해 재시도한다
    if (r.status === 400 || r.status === 422) {
      if (!noTemp && /temperature/i.test(text)) { noTemp = true; continue; }
      if (!newTokens && /max_tokens/i.test(text)) { newTokens = true; continue; }
      if (newTokens && /max_completion_tokens/i.test(text)) { newTokens = false; continue; }
      if (!noJsonMode && /response_format|json_object/i.test(text)) { noJsonMode = true; continue; }
      if (!noSystem && /system/i.test(text)) { noSystem = true; continue; }
    }
    throw Object.assign(new Error(upstreamMessage(r.status, text, "ChatGPT")), { status: r.status });
  }
  throw Object.assign(new Error("ChatGPT 요청 형식을 맞추지 못했습니다. 모델 이름을 확인해주세요."), { status: 400 });
}

/* ───────── Anthropic (Claude) ───────── */
async function callAnthropic({ apiKey, model, sys, msgs, temperature, maxTokens }) {
  const body = {
    model,
    max_tokens: Math.max(256, Math.min(16000, maxTokens)),
    temperature: Math.max(0, Math.min(1, temperature)),
    messages: msgs,
  };
  if (sys) body.system = sys;
  const r = await fetch(ANTHROPIC, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const text = await r.text();
  if (!r.ok) throw Object.assign(new Error(upstreamMessage(r.status, text, "Claude")), { status: r.status });
  const j = JSON.parse(text);
  const content = (j.content || []).filter((b) => b && b.type === "text").map((b) => b.text || "").join("");
  if (!content.trim()) throw Object.assign(new Error("Claude 응답이 비어 있습니다. 다른 모델로 시도해주세요."), { status: 502 });
  return { text: content, model: j.model || model, finish: j.stop_reason === "max_tokens" ? "length" : "stop" };
}

/* ───────── Google Gemini ───────── */
async function callGemini({ apiKey, model, sys, msgs, json, temperature, maxTokens }) {
  const contents = msgs.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
  const generationConfig = { temperature, maxOutputTokens: maxTokens };
  if (json) generationConfig.responseMimeType = "application/json";
  const body = { contents, generationConfig };
  if (sys) body.systemInstruction = { parts: [{ text: sys }] };
  const r = await fetch(`${GEMINI}/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const text = await r.text();
  if (!r.ok) throw Object.assign(new Error(upstreamMessage(r.status, text, "Gemini")), { status: r.status });
  const j = JSON.parse(text);
  const out = (j.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("");
  if (!out.trim()) {
    const why = j.promptFeedback?.blockReason ? `안전 정책으로 차단됨 (${j.promptFeedback.blockReason})` : "응답이 비어 있습니다.";
    throw Object.assign(new Error(`Gemini ${why}`), { status: 502 });
  }
  return { text: out, model: j.modelVersion || model, finish: j.candidates?.[0]?.finishReason === "MAX_TOKENS" ? "length" : "stop" };
}

/* ───────── OpenAI 이미지 (gpt-image-1 / dall-e-3) ───────── */
function imageSize(model, aspectRatio) {
  const ratio = String(aspectRatio || "1:1");
  const vertical = /^9:16|^3:4|^2:3/.test(ratio);
  const horizontal = /^16:9|^4:3|^3:2/.test(ratio);
  if (/dall-e-3/i.test(model)) return vertical ? "1024x1792" : horizontal ? "1792x1024" : "1024x1024";
  return vertical ? "1024x1536" : horizontal ? "1536x1024" : "1024x1024";
}

async function callOpenAIImage({ apiKey, model, prompt, aspectRatio }) {
  const gptImage = /gpt-image/i.test(model);
  const body = { model, prompt: String(prompt).slice(0, 3800), n: 1, size: imageSize(model, aspectRatio) };
  if (!gptImage) body.response_format = "b64_json";
  const r = await fetch(OPENAI_IMAGE, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const text = await r.text();
  if (!r.ok) throw Object.assign(new Error(upstreamMessage(r.status, text, "ChatGPT 이미지")), { status: r.status });
  const j = JSON.parse(text);
  const item = (j.data || [])[0] || {};
  if (item.b64_json) return { image: `data:image/png;base64,${item.b64_json}`, model: j.model || model };
  if (item.url) return { image: item.url, model: j.model || model };
  throw Object.assign(new Error("이미지가 응답에 포함되지 않았습니다."), { status: 502 });
}

/* ───────── 핸들러 ───────── */
export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return fail(400, "요청 본문이 올바른 JSON 이 아닙니다.");
  }

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
  if (tooManyRequests(`ai-lab:${ip}`, 60, 60_000)) {
    return fail(429, "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");
  }

  const provider = normProvider(body.provider);
  if (!provider) return fail(400, "provider 는 openai · anthropic · gemini 중 하나여야 합니다.");

  // 방문자 본인 키만. 서버 환경변수 키는 절대 쓰지 않는다.
  const apiKey = String(body.apiKey || "").trim();
  if (!apiKey) return fail(400, `${PROVIDER_LABEL[provider]} API 키가 필요합니다. 설정에서 본인 키를 입력해주세요.`);
  if (apiKey.length > 400 || /\s/.test(apiKey)) return fail(400, "API 키 형식이 올바르지 않습니다.");

  const model = String(body.model || "").trim().slice(0, 120) || DEFAULT_MODEL[provider];
  const temperature = num(body.temperature, 0, 2, 0.7);
  const maxTokens = Math.round(num(body.maxTokens, 64, 32000, 8192));
  const label = PROVIDER_LABEL[provider];

  try {
    if (body.task === "image") {
      if (provider !== "openai") return fail(400, "이미지 생성 중계는 OpenAI 키로만 지원합니다. Gemini 이미지는 브라우저에서 직접 생성됩니다.");
      const prompt = String(body.prompt || "").trim();
      if (!prompt) return fail(400, "이미지 프롬프트가 비어 있습니다.");
      const out = await callOpenAIImage({ apiKey, model: /^(gpt-image|dall-e)/i.test(model) ? model : "gpt-image-1", prompt, aspectRatio: body.aspectRatio });
      return Response.json({ ...out, provider });
    }

    const { sys, msgs } = readMessages(body.messages, body.system);
    const { msgs: chat, chars } = tidy(msgs);
    if (chars > MAX_CHARS) return fail(413, "요청이 너무 큽니다. 입력 내용을 줄여주세요.");
    if (!msgs.length) return fail(400, "messages 가 비어 있습니다.");

    const json = body.json === true;
    let out;
    if (provider === "openai") out = await callOpenAI({ apiKey, model, sys, msgs: chat, json, temperature, maxTokens });
    else if (provider === "anthropic") out = await callAnthropic({ apiKey, model, sys, msgs: chat, temperature, maxTokens });
    else out = await callGemini({ apiKey, model, sys, msgs: chat, json, temperature, maxTokens });

    return Response.json({ ...out, provider });
  } catch (e) {
    // 키는 어떤 경우에도 응답·로그에 남기지 않는다.
    const status = e && e.status && e.status >= 400 && e.status < 600 ? e.status : 502;
    let message = String((e && e.message) || "중계 중 오류가 발생했습니다.");
    if (/timeout|aborted/i.test(message)) message = `${label} 응답이 너무 늦습니다. 잠시 후 다시 시도해주세요.`;
    // 서버 로그에는 상태코드와 요청 종류만 남긴다 (본문·키·프롬프트 없음)
    console.error(`[ai-lab] ${provider} ${status}`);
    return fail(status, message);
  }
}

export async function GET() {
  return fail(405, "POST 로만 사용할 수 있습니다.");
}
