/* ==========================================================================
   SNS AI 마케팅 자동화 — 공통 코어
   유틸 · 저장소(localStorage + IndexedDB) · Gemini API · YouTube Data API · 마크다운 · 라우터 · 설정
   서버 없이 브라우저에서만 동작합니다. API 키는 방문자 브라우저에만 저장됩니다.
   ========================================================================== */
(function () {
  'use strict';
  const C = window.SITE_CONFIG || {};
  const P = C.storagePrefix || 'snsai_';
  const App = (window.App = { config: C, modules: {}, state: {} });

  /* ───────── 아이콘 ───────── */
  const svg = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  App.icon = {
    copy: svg('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>'),
    dl: svg('<path d="M12 3v12m0 0-4-4m4 4 4-4M4 21h16"/>'),
    ext: svg('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
    img: svg('<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>'),
    spark: svg('<path d="M12 3l1.9 5.8L20 10l-5 3.6L16.5 20 12 16.4 7.5 20 9 13.6 4 10l6.1-1.2z"/>'),
    redo: svg('<path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/>'),
    play: svg('<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z" fill="currentColor"/>'),
    search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    key: svg('<circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 9.2-9.2M17 6l3 3M14 9l2 2"/>'),
    gear: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
    mic: svg('<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v4"/>'),
    film: svg('<rect x="2" y="3" width="20" height="18" rx="2"/><path d="M7 3v18M17 3v18M2 8h5M2 16h5M17 8h5M17 16h5"/>'),
    upload: svg('<path d="M12 21V9m0 0-4 4m4-4 4 4M4 3h16"/>'),
    trash: svg('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>'),
    edit: svg('<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'),
    chart: svg('<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>'),
    doc: svg('<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>'),
    list: svg('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'),
    mail: svg('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>'),
    thread: svg('<path d="M21 12a8 8 0 1 1-3.2-6.4"/><path d="M16 8c-1-1.5-6-2-6 2s7 2.5 7 6-6 4-8 1"/>'),
    yt: svg('<path d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-3.8 31 31 0 0 0-.4-3.8z"/><path d="m10 15 5-3-5-3z" fill="currentColor"/>'),
    check: svg('<path d="M20 6 9 17l-5-5"/>'),
    lock: svg('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
  };

  /* ───────── 유틸 ───────── */
  App.$ = (s, el = document) => el.querySelector(s);
  App.$$ = (s, el = document) => [...el.querySelectorAll(s)];
  App.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  App.uid = (p = 'id') => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  App.sleep = ms => new Promise(r => setTimeout(r, ms));
  App.slug = s => String(s || 'file').replace(/[\\/:*?"<>|\s]+/g, '_').slice(0, 40);
  App.fmtNum = n => (n == null || n === '' ? '-' : Number(n).toLocaleString('ko-KR'));
  App.fmtShort = n => {
    n = Number(n) || 0;
    if (n >= 1e8) return (n / 1e8).toFixed(1).replace(/\.0$/, '') + '억';
    if (n >= 1e4) return (n / 1e4).toFixed(1).replace(/\.0$/, '') + '만';
    return n.toLocaleString('ko-KR');
  };
  App.fmtDate = t => { try { return new Date(t).toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }); } catch { return ''; } };
  App.fmtTime = s => { s = Math.max(0, Math.round(s)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
  App.toList = v => Array.isArray(v) ? v : (typeof v === 'string' ? v.split(/[,\n]/) : []);
  App.str = (v, max = 99999) => String(v ?? '').trim().slice(0, max);

  App.toast = (msg, bad = false) => {
    let t = App.$('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
    t.innerHTML = (bad ? '⚠️ ' : App.icon.check.replace('<svg', '<svg style="width:16px;height:16px;color:var(--a300)"')) + `<span>${App.esc(msg)}</span>`;
    t.classList.toggle('bad', !!bad); t.classList.add('show');
    clearTimeout(App.toast._t); App.toast._t = setTimeout(() => t.classList.remove('show'), bad ? 4200 : 1900);
  };
  App.copy = async (text, label = '복사했습니다') => {
    try { await navigator.clipboard.writeText(text); }
    catch { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
    App.toast(label);
  };
  App.download = (name, data, type = 'text/plain') => {
    const a = document.createElement('a');
    let url;
    if (data instanceof Blob) url = URL.createObjectURL(data);
    else if (typeof data === 'string' && data.startsWith('data:')) url = data;
    else url = URL.createObjectURL(new Blob([data], { type: type + ';charset=utf-8' }));
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    if (url.startsWith('blob:')) setTimeout(() => URL.revokeObjectURL(url), 4000);
  };
  App.blobToDataURL = blob => new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
  App.dataURLToBlob = async url => (await fetch(url)).blob();

  /* ───────── 이벤트 ───────── */
  const listeners = {};
  App.on = (ev, fn) => (listeners[ev] = listeners[ev] || []).push(fn);
  App.emit = (ev, data) => (listeners[ev] || []).forEach(fn => { try { fn(data); } catch (e) { console.error(e); } });

  /* ───────── 저장소 ───────── */
  App.store = {
    get(k, def = null) { try { const v = localStorage.getItem(P + k); return v == null ? def : JSON.parse(v); } catch { return def; } },
    set(k, v) {
      try { localStorage.setItem(P + k, JSON.stringify(v)); return true; }
      catch (e) { App.toast('브라우저 저장 공간이 부족합니다. 오래된 기록을 삭제해주세요.', true); return false; }
    },
    del(k) { localStorage.removeItem(P + k); },
  };
  App.coll = name => ({
    list() { return App.store.get(name, []); },
    get(id) { return this.list().find(x => x.id === id) || null; },
    put(obj) {
      const l = this.list().filter(x => x.id !== obj.id);
      l.unshift(obj);
      while (l.length > 40) l.pop();
      App.store.set(name, l); App.emit('coll:' + name, obj); return obj;
    },
    remove(id) { App.store.set(name, this.list().filter(x => x.id !== id)); App.emit('coll:' + name); },
  });
  App.analyses = App.coll('analyses');
  App.plans = App.coll('plans');
  App.channels = App.coll('channels');
  App.campaigns = App.coll('campaigns');

  // 대용량 미디어(이미지·오디오·영상)는 IndexedDB
  App.db = (() => {
    let opening;
    const open = () => opening || (opening = new Promise((res, rej) => {
      const r = indexedDB.open(P + 'media', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('kv');
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    }));
    const tx = async (mode, fn) => {
      const db = await open();
      return new Promise((res, rej) => {
        const t = db.transaction('kv', mode); const req = fn(t.objectStore('kv'));
        t.oncomplete = () => res(req && 'result' in req ? req.result : undefined);
        t.onerror = () => rej(t.error);
      });
    };
    return {
      get: k => tx('readonly', s => s.get(k)),
      set: (k, v) => tx('readwrite', s => s.put(v, k)),
      del: k => tx('readwrite', s => s.delete(k)),
      delPrefix: pre => tx('readwrite', s => {
        const r = s.openCursor(IDBKeyRange.bound(pre, pre + '\uffff'));
        r.onsuccess = () => { const c = r.result; if (c) { c.delete(); c.continue(); } };
      }),
      clear: () => tx('readwrite', s => s.clear()),
    };
  })();

  /* ───────── 설정 (API 키) ───────── */
  const KEY_STORE = 'keys';
  App.settings = {
    _mem: null,
    load() {
      if (this._mem) return this._mem;
      let v = App.store.get(KEY_STORE);
      if (!v) { try { v = JSON.parse(sessionStorage.getItem(P + KEY_STORE) || 'null'); } catch {} }
      this._mem = Object.assign({ gemini: '', youtube: '', oauth: '', model: '', voiceServer: '', voiceEngine: '', voiceProxy: '', dsKey: '', dsWorkspace: '', dsRegion: 'ap-southeast-1', dsModel: '',
        llmEngine: '', llmBackend: 'auto', lmstudioUrl: '', ollamaUrl: '', lmstudioModel: '', ollamaModel: '', lmstudioToken: '', remember: false }, v || {});
      return this._mem;
    },
    save(v) {
      this._mem = Object.assign(this.load(), v);
      if (this._mem.remember) { App.store.set(KEY_STORE, this._mem); sessionStorage.removeItem(P + KEY_STORE); }
      else { App.store.del(KEY_STORE); sessionStorage.setItem(P + KEY_STORE, JSON.stringify(this._mem)); }
      App.ai.reset(); App.local && App.local.reset(); App.emit('settings', this._mem);
    },
    get gemini() { return this.load().gemini.trim(); },
    get youtube() { return (this.load().youtube || '').trim(); },
    get oauth() { return (this.load().oauth || '').trim(); },
    get voiceServer() { return ((this.load().voiceServer || C.voiceServer || 'http://127.0.0.1:8805').trim()).replace(/\/+$/, ''); },
    // 클라우드 내 목소리 (DashScope · 프록시 경유)
    get voiceProxy() { return ((this.load().voiceProxy || C.voiceProxy || '').trim()).replace(/\/+$/, ''); },
    get voiceEngine() { const e = this.load().voiceEngine || C.voiceEngine || 'cloud'; return e === 'cloud' && !this.voiceProxy ? 'local' : e; },
    get dsKey() { return (this.load().dsKey || '').trim(); },
    get dsWorkspace() { return (this.load().dsWorkspace || '').trim(); },
    get dsRegion() { return this.load().dsRegion || 'ap-southeast-1'; },
    get dsModel() { return (this.load().dsModel || C.cloudVoiceModel || 'qwen-audio-3.1-tts-flash').trim(); },
    // 텍스트 AI 엔진: 'gemini' | 'local'(LM Studio · Ollama)
    get llmEngine() { return this.load().llmEngine || (C.localLLM && C.localLLM.defaultEngine) || 'gemini'; },
    get llmBackend() { return this.load().llmBackend || 'auto'; },
    get lmstudioUrl() { return ((this.load().lmstudioUrl || (C.localLLM && C.localLLM.lmstudioUrl) || 'http://127.0.0.1:1234').trim()).replace(/\/+$/, '').replace(/\/v1$/, ''); },
    get ollamaUrl() { return ((this.load().ollamaUrl || (C.localLLM && C.localLLM.ollamaUrl) || 'http://127.0.0.1:11434').trim()).replace(/\/+$/, ''); },
  };
  /** kind='text' → 로컬 LLM 모드면 Gemini 키 없이 통과 (영상 분석 · 이미지 · Gemini 음성은 항상 키 필요) */
  App.requireKey = (kind) => {
    if (kind === 'text' && App.settings.llmEngine === 'local') return true;
    if (App.settings.gemini) return true;
    App.toast(kind === 'text' ? '먼저 Gemini API 키를 등록하거나, 설정에서 로컬 LLM(LM Studio · Ollama)을 선택해주세요.' : '이 기능은 Gemini API 키가 필요합니다 (영상 분석 · 이미지 · AI 음성).', true);
    App.openSettings();
    return false;
  };

  /* ───────── 로컬 LLM — LM Studio(1234) / Ollama(11434) 자동 감지 (TubeInsight llm_client.py 웹 버전) ─────────
     우선순위: 사용자 선택(lmstudio/ollama) > 자동(LM Studio 우선)
     브라우저가 직접 호출하므로 LM Studio는 'Enable CORS', Ollama는 OLLAMA_ORIGINS 허용이 필요할 수 있음 */
  const OLLAMA_NUM_CTX = (C.localLLM && C.localLLM.numCtx) || 16384; // Ollama 기본 4096은 긴 프롬프트가 조용히 잘림
  const NAMES = { lmstudio: 'LM Studio', ollama: 'Ollama' };
  async function getJSON(url, timeout = 1800, headers = {}) {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), timeout);
    try { const r = await fetch(url, { signal: ctl.signal, headers }); if (!r.ok) throw Object.assign(new Error('HTTP ' + r.status), { status: r.status }); return await r.json(); }
    finally { clearTimeout(t); }
  }
  // LM Studio 인증(설정에서 'Require API token' 켜진 경우) → Authorization: Bearer
  const lmsHeaders = () => { const t = (App.settings.load().lmstudioToken || '').trim(); return t ? { Authorization: 'Bearer ' + t } : {}; };
  App.local = {
    NAMES,
    _cache: { ts: 0, backend: null },
    reset() { this._cache = { ts: 0, backend: null }; },
    base(key) { return key === 'ollama' ? App.settings.ollamaUrl : App.settings.lmstudioUrl; },
    async probe(key) {
      try {
        if (key === 'lmstudio') {
          const d = await getJSON(this.base(key) + '/v1/models', 1800, lmsHeaders());
          const models = (d.data || []).map(m => m.id).filter(id => id && !/embed/i.test(id));
          return { online: true, models };
        }
        const d = await getJSON(this.base(key) + '/api/tags');
        return { online: true, models: (d.models || []).map(m => m.name).filter(n => n && !/embed/i.test(n)) };
      } catch (e) { return { online: e.status === 401 || e.status === 403, auth: e.status === 401 || e.status === 403, models: [] }; }
    },
    async probeAll() { const [lmstudio, ollama] = await Promise.all([this.probe('lmstudio'), this.probe('ollama')]); return { lmstudio, ollama }; },
    pick(key, models) { const pref = App.settings.load()[key + 'Model']; return pref && models.includes(pref) ? pref : (models[0] || null); },
    /** 실제 사용할 백엔드 {key, name, base, model} 또는 null (10초 캐시) */
    async detect() {
      const force = App.settings.llmBackend;
      if (this._cache.backend && Date.now() - this._cache.ts < 10000 && (force === 'auto' || this._cache.backend.key === force)) return this._cache.backend;
      let backend = null;
      for (const key of ['lmstudio', 'ollama']) {
        if (force !== 'auto' && force !== key) continue;
        const p = await this.probe(key);
        if (p.online && p.auth && force === 'auto') continue; // 토큰 없는 LM Studio는 건너뛰고 Ollama 시도
        if (p.online) { backend = { key, name: NAMES[key], base: this.base(key), model: this.pick(key, p.models), auth: !!p.auth }; break; }
      }
      this._cache = { ts: Date.now(), backend };
      return backend;
    },
    offlineError() {
      const f = App.settings.llmBackend;
      const where = f === 'auto' ? `LM Studio(${App.settings.lmstudioUrl}) 또는 Ollama(${App.settings.ollamaUrl})` : `${NAMES[f]}(${this.base(f)})`;
      return new Error(`로컬 AI를 찾을 수 없습니다. ${where}를 실행해주세요. LM Studio는 Developer → Local Server에서 서버 시작 + 'Enable CORS' 켜기, Ollama는 이 사이트 주소를 OLLAMA_ORIGINS에 허용해야 합니다.`);
    },
    async callOnce(b, messages, maxTokens, temperature, json) {
      let r;
      try {
        if (b.key === 'ollama') {
          // 추론 모델(qwen3 등)은 think를 끄지 않으면 토큰을 생각에 다 써서 빈 답이 나옴 → think:false (미지원 모델이면 빼고 재시도)
          const payload = { model: b.model, messages, stream: false, think: false, options: { num_ctx: OLLAMA_NUM_CTX, num_predict: maxTokens, temperature } };
          if (json) payload.format = 'json';
          const post = p => fetch(b.base + '/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) });
          r = await post(payload);
          if (r.status === 400) { const t = await r.clone().text(); if (/think/i.test(t)) { delete payload.think; r = await post(payload); } }
          if (!r.ok) throw Object.assign(new Error(`로컬 AI(${b.name})가 요청을 거부했습니다 (HTTP ${r.status}). ${(await r.text()).slice(0, 300)}`), { status: r.status });
          const j = await r.json(); const m = j.message || {};
          if (!m.content && m.thinking) throw Object.assign(new Error(`로컬 AI(${b.name})가 생각만 하고 답을 내지 못했습니다. 추론(thinking) 기능이 없는 모델을 쓰거나 다른 모델을 골라주세요.`), { status: 422 });
          return { content: m.content || '', finish: j.done_reason || 'stop' };
        }
        r = await fetch(b.base + '/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', ...lmsHeaders() }, body: JSON.stringify({ model: b.model, messages, max_tokens: maxTokens, temperature }) });
        if (!r.ok) throw Object.assign(new Error(`로컬 AI(${b.name})가 요청을 거부했습니다 (HTTP ${r.status}). ${(await r.text()).slice(0, 300)}`), { status: r.status });
        const j = await r.json(); const c = (j.choices || [])[0] || {}; const msg = c.message || {};
        if (!msg.content && msg.reasoning_content) throw Object.assign(new Error(`로컬 AI(${b.name})가 생각(reasoning)만 하고 답을 내지 못했습니다. LM Studio에서 추론 끄기 또는 다른 모델을 사용해주세요.`), { status: 422 });
        return { content: msg.content || '', finish: c.finish_reason || 'stop' };
      } catch (e) {
        if (e.status) throw e;
        this.reset();
        throw new Error(`로컬 AI(${b.name}) 연결이 끊겼거나 브라우저 접근(CORS)이 막혔습니다. 서버 상태와 CORS 설정을 확인해주세요.`);
      }
    },
    /** 대화 요청. 길이 제한으로 끊기면 자동 이어쓰기(최대 maxContinues회) → {text, model} */
    async chat(messages, { maxTokens = 4096, temperature = 0.7, json = false, maxContinues = 3 } = {}) {
      const b = await this.detect();
      if (!b) throw this.offlineError();
      if (b.auth) throw new Error('LM Studio가 API 토큰을 요구합니다. 설정 → 로컬 LLM → LM Studio API 토큰에 토큰을 넣거나, LM Studio 서버 설정에서 Require API token을 꺼주세요.');
      if (!b.model) throw new Error(b.key === 'ollama' ? 'Ollama가 실행 중이지만 설치된 모델이 없습니다. 터미널에서 ollama pull gemma3 등으로 모델을 먼저 받아주세요.' : 'LM Studio에 로드된 모델이 없습니다. LM Studio에서 모델을 로드해주세요.');
      const history = [...messages]; let full = '';
      for (let i = 0; i < maxContinues; i++) {
        const { content, finish } = await this.callOnce(b, history, maxTokens, temperature, json);
        full += content;
        if (finish !== 'length' || !content.trim()) break;
        history.push({ role: 'assistant', content }, { role: 'user', content: '이전 답변이 중간에 끊겼습니다. 끊긴 부분부터 이어서 계속 작성해주세요.' });
      }
      // 추론 모델(qwen3 · deepseek-r1 등)의 생각 과정 제거
      full = full.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/^[\s\S]*?<\/think>/i, '').trim();
      return { text: full, model: `${b.name} · ${b.model}` };
    },
  };

  /* ───────── Gemini API ───────── */
  const API = 'https://generativelanguage.googleapis.com/v1beta';
  const FALLBACK = {
    text: ['gemini-2.5-flash', 'gemini-2.0-flash'],
    image: ['gemini-2.5-flash-image', 'nano-banana-pro-preview', 'gemini-2.0-flash-preview-image-generation'],
    tts: ['gemini-2.5-flash-preview-tts', 'gemini-2.5-pro-preview-tts'],
  };
  const verOf = n => { const m = n.match(/(\d+(?:\.\d+)?)/); return m ? parseFloat(m[1]) : 0; };
  const byNewest = (a, b) => (verOf(b) - verOf(a)) || (/preview|exp/.test(a) - /preview|exp/.test(b));

  async function apiError(r) {
    let msg = `HTTP ${r.status}`;
    try { const j = await r.json(); msg = j.error?.message || msg; } catch {}
    const e = new Error(msg); e.status = r.status; return e;
  }
  const isFatal = e => e && (e.status === 401 || e.status === 403 || (e.status === 400 && /api key/i.test(e.message)));

  /* JSON 복원 유틸 (llm_client.py 포팅) — 로컬 모델의 앞뒤 잡담 · 끝 쉼표 · 잘린 응답 대응 */
  function balancedSpan(text) {
    const start = text.search(/[\{\[]/); if (start < 0) return null;
    const stack = []; let inStr = false, esc = false;
    for (let i = start; i < text.length; i++) {
      const ch = text[i];
      if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === '"') inStr = false; continue; }
      if (ch === '"') inStr = true;
      else if (ch === '{' || ch === '[') stack.push(ch);
      else if (ch === '}' || ch === ']') { stack.pop(); if (!stack.length) return text.slice(start, i + 1); }
    }
    return text.slice(start); // 끊긴 경우: 있는 만큼
  }
  function repairJSON(s) {
    s = s.replace(/,\s*([}\]])/g, '$1').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '');
    const stack = []; let inStr = false, esc = false;
    for (const ch of s) {
      if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === '"') inStr = false; continue; }
      if (ch === '"') inStr = true;
      else if (ch === '{') stack.push('}'); else if (ch === '[') stack.push(']');
      else if ((ch === '}' || ch === ']') && stack.length) stack.pop();
    }
    if (inStr) s += '"';
    s = s.replace(/,\s*$/, '').replace(/:\s*$/, ': null');
    return s + stack.reverse().join('');
  }

  App.ai = {
    models: null,
    reset() { this.models = null; },
    friendly(e) {
      const m = (e && e.message) || String(e);
      if (e?.status === 400 && /api key/i.test(m)) return 'Gemini API 키가 올바르지 않습니다. 설정에서 키를 확인해주세요.';
      if (e?.status === 403) return 'API 키에 권한이 없습니다. Google AI Studio에서 발급한 키인지 확인해주세요.';
      if (e?.status === 429 || /quota|exhausted/i.test(m)) return '요청 한도를 초과했습니다. 잠시 후 다시 시도하거나 결제가 연결된 키를 사용해주세요.';
      if (/failed to fetch|networkerror/i.test(m)) return '네트워크 오류입니다. 인터넷 연결을 확인해주세요.';
      return m;
    },
    async listModels() {
      if (this.models) return this.models;
      const key = App.settings.gemini;
      const forced = (App.settings.load().model || '').trim();
      try {
        const r = await fetch(`${API}/models?pageSize=1000`, { headers: { 'x-goog-api-key': key } });
        if (!r.ok) throw await apiError(r);
        const j = await r.json();
        const all = (j.models || []).filter(m => (m.supportedGenerationMethods || []).includes('generateContent')).map(m => m.name.replace(/^models\//, ''));
        const text = all.filter(n => /^gemini-.*flash/.test(n) && !/(image|tts|live|audio|embed|lite|omni|vision|thinking)/.test(n)).sort(byNewest);
        const image = all.filter(n => /image|nano-banana/.test(n) && !/imagen/.test(n)).sort(byNewest);
        const tts = all.filter(n => /tts/.test(n)).sort((a, b) => (/flash/.test(b) - /flash/.test(a)) || byNewest(a, b));
        this.models = {
          text: [...new Set([...(forced ? [forced] : []), ...text.slice(0, 3), ...FALLBACK.text])],
          image: [...new Set([...image, ...FALLBACK.image])],
          tts: [...new Set([...tts, ...FALLBACK.tts])],
        };
      } catch (e) {
        if (isFatal(e) || e.status === 400) throw e;
        this.models = { text: [...(forced ? [forced] : []), ...FALLBACK.text], image: FALLBACK.image, tts: FALLBACK.tts };
      }
      return this.models;
    },
    async call(model, body) {
      const r = await fetch(`${API}/models/${model}:generateContent`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': App.settings.gemini }, body: JSON.stringify(body),
      });
      if (!r.ok) throw await apiError(r);
      return r.json();
    },
    /** 텍스트 생성. opts: {prompt, system, json, temperature, maxTokens, video, lowRes, parts, cloudOnly} → {text, model}
        로컬 LLM 모드면 로컬로 보냄. 단, 영상(video) · 이미지(parts) · cloudOnly(영상 분석) 요청은 항상 Gemini */
    async generate(opts) {
      if (App.settings.llmEngine === 'local' && !opts.video && !opts.parts && !opts.cloudOnly) {
        const messages = [];
        if (opts.system) messages.push({ role: 'system', content: opts.system });
        messages.push({ role: 'user', content: opts.prompt + (opts.json !== false ? '\n\n반드시 설명 없이 유효한 JSON만 출력하세요. (Reply with valid JSON only.)' : '') });
        return App.local.chat(messages, { maxTokens: opts.maxTokens || 8192, temperature: opts.temperature ?? 0.7, json: opts.json !== false, maxContinues: opts.json !== false ? 2 : 3 });
      }
      if (!App.settings.gemini) { const e = new Error('Gemini API 키가 없습니다.'); e.status = 401; throw e; }
      const { text: models } = await this.listModels();
      const parts = [];
      if (opts.video) parts.push({ fileData: { fileUri: opts.video } });
      if (opts.parts) parts.push(...opts.parts);
      parts.push({ text: opts.prompt });
      const generationConfig = { temperature: opts.temperature ?? 0.7, maxOutputTokens: opts.maxTokens || 8192 };
      if (opts.json !== false) generationConfig.responseMimeType = 'application/json';
      if (opts.video && opts.lowRes !== false) generationConfig.mediaResolution = 'MEDIA_RESOLUTION_LOW';
      const body = { contents: [{ role: 'user', parts }], generationConfig };
      if (opts.system) body.systemInstruction = { parts: [{ text: opts.system }] };
      let last;
      for (const model of models) {
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const j = await this.call(model, body);
            const text = (j.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
            if (text) return { text, model };
            last = new Error(j.promptFeedback?.blockReason ? `안전 정책으로 차단됨 (${j.promptFeedback.blockReason})` : 'AI 응답이 비어 있습니다.');
            break;
          } catch (e) {
            if (isFatal(e)) throw e;
            last = e;
            if ((e.status === 503 || e.status === 500) && attempt === 0) { await App.sleep(1500); continue; }
            break;
          }
        }
      }
      throw last || new Error('사용 가능한 Gemini 모델이 없습니다.');
    },
    parseJSON(txt) {
      try { return JSON.parse(txt); } catch {}
      const clean = String(txt).replace(/<think>[\s\S]*?<\/think>/gi, '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
      try { return JSON.parse(clean); } catch {}
      const fence = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const cands = [fence && fence[1], balancedSpan(clean), (clean.match(/[\{\[][\s\S]*[\}\]]/) || [])[0]].filter(Boolean);
      for (const c of cands) {
        try { return JSON.parse(c); } catch {}
        try { return JSON.parse(repairJSON(c)); } catch {}
      }
      return null;
    },
    /** JSON 생성 (파싱 실패 시 1회 재시도) → {data, model} */
    async json(opts) {
      for (let i = 0; i < 2; i++) {
        const { text, model } = await this.generate({ ...opts, json: true });
        const data = this.parseJSON(text);
        if (data && typeof data === 'object') return { data, model };
      }
      throw new Error('AI가 올바른 JSON을 만들지 못했습니다. 다시 시도해주세요.' + (App.settings.llmEngine === 'local' ? ' (로컬 모델이 작으면 자주 실패합니다. 7B 이상 모델을 권장합니다)' : ''));
    },
    /** 이미지 생성 → dataURL */
    async image(prompt, aspectRatio = '1:1') {
      if (!App.settings.gemini) { const e = new Error('Gemini API 키가 없습니다.'); e.status = 401; throw e; }
      const { image } = await this.listModels();
      let last;
      for (const model of image) {
        try {
          const j = await this.call(model, {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseModalities: ['IMAGE', 'TEXT'], imageConfig: { aspectRatio } },
          });
          const part = (j.candidates?.[0]?.content?.parts || []).find(p => p.inlineData || p.inline_data);
          const d = part && (part.inlineData || part.inline_data);
          if (d?.data) return `data:${d.mimeType || d.mime_type || 'image/png'};base64,${d.data}`;
          last = new Error('이미지가 응답에 포함되지 않았습니다.');
        } catch (e) { if (isFatal(e)) throw e; last = e; }
      }
      throw last || new Error('이미지 생성 모델을 사용할 수 없습니다.');
    },
    /** 음성 합성 → {blob(WAV), duration} */
    async tts(text, voice = 'Kore', style = '') {
      if (!App.settings.gemini) { const e = new Error('Gemini API 키가 없습니다.'); e.status = 401; throw e; }
      const { tts } = await this.listModels();
      const prompt = style ? `${style}:\n${text}` : text;
      let last;
      for (const model of tts) {
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const j = await this.call(model, {
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } },
            });
            const part = (j.candidates?.[0]?.content?.parts || []).find(p => p.inlineData || p.inline_data);
            const d = part && (part.inlineData || part.inline_data);
            if (!d?.data) { last = new Error('음성 데이터가 응답에 없습니다.'); break; }
            const rate = parseInt((String(d.mimeType || d.mime_type).match(/rate=(\d+)/) || [])[1] || '24000', 10);
            const pcm = Uint8Array.from(atob(d.data), c => c.charCodeAt(0));
            return { blob: App.audio.pcmToWav(pcm, rate), duration: pcm.length / 2 / rate };
          } catch (e) {
            if (isFatal(e)) throw e;
            last = e;
            if (e.status === 429 && attempt < 2) { await App.sleep(8000 * (attempt + 1)); continue; }
            if ((e.status === 500 || e.status === 503) && attempt < 2) { await App.sleep(2000); continue; }
            break;
          }
        }
      }
      throw last || new Error('음성 합성 모델을 사용할 수 없습니다.');
    },
    async test() {
      this.reset();
      const m = await this.listModels();
      const { model } = await this.generate({ prompt: 'Reply with {"ok":true}', json: true, maxTokens: 50 });
      return { model, models: m };
    },
  };

  /* ───────── 오디오 (WAV) ───────── */
  App.audio = {
    pcmToWav(pcm, rate = 24000, channels = 1) {
      const header = new ArrayBuffer(44); const v = new DataView(header);
      const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
      w(0, 'RIFF'); v.setUint32(4, 36 + pcm.length, true); w(8, 'WAVE'); w(12, 'fmt ');
      v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, channels, true);
      v.setUint32(24, rate, true); v.setUint32(28, rate * channels * 2, true); v.setUint16(32, channels * 2, true); v.setUint16(34, 16, true);
      w(36, 'data'); v.setUint32(40, pcm.length, true);
      return new Blob([header, pcm], { type: 'audio/wav' });
    },
    async concatWav(blobs, gapSec = 0.3, rate = 24000) {
      const parts = []; const gap = new Uint8Array(Math.round(gapSec * rate) * 2);
      for (const b of blobs) { if (!b) continue; parts.push(new Uint8Array(await b.arrayBuffer()).slice(44)); parts.push(gap); }
      const total = parts.reduce((n, p) => n + p.length, 0); const out = new Uint8Array(total); let o = 0;
      parts.forEach(p => { out.set(p, o); o += p.length; });
      return this.pcmToWav(out, rate);
    },
  };

  /* ───────── YouTube ───────── */
  const YT = 'https://www.googleapis.com/youtube/v3';
  const isoDur = s => { const m = String(s || '').match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/); if (!m) return 0; return (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0); };
  const durStr = sec => { const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60; return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`; };
  App.yt = {
    id(url) { const m = String(url || '').match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([A-Za-z0-9_-]{11})/); return m ? m[1] : (/^[A-Za-z0-9_-]{11}$/.test(String(url).trim()) ? String(url).trim() : null); },
    async get(path, params) {
      const q = new URLSearchParams({ ...params, key: App.settings.youtube });
      const r = await fetch(`${YT}/${path}?${q}`);
      if (!r.ok) throw await apiError(r);
      return r.json();
    },
    async info(id) {
      const base = { id, url: `https://www.youtube.com/watch?v=${id}`, thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, source: 'basic' };
      if (App.settings.youtube) {
        try {
          const j = await this.get('videos', { part: 'snippet,statistics,contentDetails', id });
          const v = j.items?.[0];
          if (v) {
            const sec = isoDur(v.contentDetails?.duration);
            const info = {
              ...base, source: 'youtube_api',
              title: v.snippet.title, channel: v.snippet.channelTitle, channel_id: v.snippet.channelId,
              description: v.snippet.description || '', tags: v.snippet.tags || [],
              published: v.snippet.publishedAt, duration: sec, duration_string: durStr(sec),
              view_count: +v.statistics.viewCount || 0, like_count: +v.statistics.likeCount || 0, comment_count: +v.statistics.commentCount || 0,
              thumbnail: v.snippet.thumbnails?.maxres?.url || v.snippet.thumbnails?.high?.url || base.thumbnail,
            };
            try { const c = await this.get('channels', { part: 'statistics', id: info.channel_id }); info.subscribers = +c.items?.[0]?.statistics?.subscriberCount || null; } catch {}
            return info;
          }
        } catch (e) { console.warn('YouTube API 실패, 기본 정보로 대체', e); base.api_error = e.message; }
      }
      try {
        const r = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(base.url)}`);
        const j = await r.json();
        if (j.title) Object.assign(base, { title: j.title, channel: j.author_name, channel_url: j.author_url });
      } catch {}
      return base;
    },
    async comments(id) {
      if (!App.settings.youtube) return [];
      try {
        const j = await this.get('commentThreads', { part: 'snippet', videoId: id, order: 'relevance', maxResults: 30, textFormat: 'plainText' });
        return (j.items || []).map(it => { const s = it.snippet.topLevelComment.snippet; return { text: s.textDisplay, like_count: s.likeCount || 0, author: s.authorDisplayName }; })
          .sort((a, b) => b.like_count - a.like_count);
      } catch { return []; }
    },
    async search(q) {
      if (!App.settings.youtube) throw new Error('키워드 검색에는 YouTube Data API 키가 필요합니다. 설정에서 등록하거나 영상 링크를 직접 넣어주세요.');
      const s = await this.get('search', { part: 'snippet', type: 'video', maxResults: 12, q, relevanceLanguage: (C.defaults?.lang || 'ko') });
      const ids = (s.items || []).map(i => i.id.videoId).filter(Boolean);
      if (!ids.length) return [];
      const v = await this.get('videos', { part: 'snippet,statistics,contentDetails', id: ids.join(',') });
      return (v.items || []).map(x => ({
        id: x.id, title: x.snippet.title, channel: x.snippet.channelTitle,
        view_count: +x.statistics.viewCount || 0, duration_string: durStr(isoDur(x.contentDetails.duration)),
        thumbnail: x.snippet.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${x.id}/mqdefault.jpg`,
      })).sort((a, b) => b.view_count - a.view_count);
    },
  };

  /* ───────── 마크다운 (가벼운 렌더러) ───────── */
  App.md = function md(src) {
    const esc = App.esc;
    const inline = s => esc(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, '$1<em>$2</em>')
      .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    const lines = String(src || '').replace(/\r/g, '').split('\n');
    const isList = l => /^\s*([-*+]|\d+[.)])\s+/.test(l);
    const row = s => s.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
    let html = '', i = 0, m;
    while (i < lines.length) {
      const l = lines[i];
      if (/^```/.test(l)) { const buf = []; i++; while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]); i++; html += `<pre><code>${esc(buf.join('\n'))}</code></pre>`; continue; }
      if (!l.trim()) { i++; continue; }
      if ((m = l.match(/^(#{1,4})\s+(.*)/))) { const n = m[1].length; html += `<h${n}>${inline(m[2])}</h${n}>`; i++; continue; }
      if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(l)) { html += '<hr>'; i++; continue; }
      if (/^>\s?/.test(l)) { const buf = []; while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, '')); html += `<blockquote>${md(buf.join('\n'))}</blockquote>`; continue; }
      if (/^\|.*\|\s*$/.test(l) && /^\|?\s*:?-{2,}/.test(lines[i + 1] || '')) {
        const head = row(l); i += 2; const body = [];
        while (i < lines.length && /^\|/.test(lines[i])) body.push(row(lines[i++]));
        html += `<table><thead><tr>${head.map(h => `<th>${inline(h)}</th>`).join('')}</tr></thead><tbody>${body.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
        continue;
      }
      if (isList(l)) {
        const ordered = /^\s*\d/.test(l); const buf = [];
        while (i < lines.length && (isList(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && buf.length))) {
          if (isList(lines[i])) buf.push(lines[i].replace(/^\s*([-*+]|\d+[.)])\s+/, '')); else buf[buf.length - 1] += ' ' + lines[i].trim();
          i++;
        }
        html += `<${ordered ? 'ol' : 'ul'}>${buf.map(b => `<li>${inline(b)}</li>`).join('')}</${ordered ? 'ol' : 'ul'}>`;
        continue;
      }
      const buf = [];
      while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|>|```|\|)/.test(lines[i]) && !isList(lines[i])) buf.push(lines[i++]);
      if (!buf.length) buf.push(lines[i++]);
      html += `<p>${buf.map(inline).join('<br>')}</p>`;
    }
    return html;
  };

  /* ───────── UI 헬퍼 ───────── */
  App.ui = {
    progress(el, title, steps, i, sub = '') {
      const pct = Math.min(100, Math.round(((i + 0.5) / steps.length) * 100));
      el.innerHTML = `
        <div class="panel progress">
          <h3 class="sec-title" style="margin:0 0 12px">${App.esc(title)}</h3>
          <div class="bar"><i style="width:${pct}%"></i></div>
          <ul class="steps">${steps.map((s, k) => `<li class="${k < i ? 'done' : k === i ? 'active' : ''}"><span class="st">${k < i ? '✓' : k === i ? '<span class="spin" style="width:12px;height:12px"></span>' : k + 1}</span>${App.esc(s)}${k === i && sub ? `<small>${App.esc(sub)}</small>` : ''}</li>`).join('')}</ul>
        </div>`;
    },
    empty(el, { icon = 'spark', title, text, items = [] }) {
      el.innerHTML = `
        <div class="panel empty">
          <div class="orb">${App.icon[icon] || App.icon.spark}</div>
          <h3>${App.esc(title)}</h3>
          <p>${text}</p>
          ${items.length ? `<div class="mini-grid">${items.map((t, k) => `<div><b>${String(k + 1).padStart(2, '0')}</b>${App.esc(t)}</div>`).join('')}</div>` : ''}
        </div>`;
    },
    busy(btn, on, label) {
      if (!btn) return;
      if (on) { btn.dataset.label = btn.innerHTML; btn.disabled = true; btn.innerHTML = `<span class="spin"></span> ${label || '처리 중…'}`; }
      else { btn.disabled = false; if (btn.dataset.label) btn.innerHTML = btn.dataset.label; }
    },
    err(el, msg) { if (!el) return; el.innerHTML = msg ? `<div class="err">${App.esc(msg)}</div>` : ''; },
    options(list, selected, placeholder) {
      return (placeholder ? `<option value="">${App.esc(placeholder)}</option>` : '') +
        list.map(([v, t]) => `<option value="${App.esc(v)}" ${String(v) === String(selected) ? 'selected' : ''}>${App.esc(t)}</option>`).join('');
    },
    pageHead(eyebrow, titleHtml, desc) {
      return `<header class="page-head"><span class="eyebrow">${App.esc(eyebrow)}</span><h2>${titleHtml}</h2><p>${desc}</p></header>`;
    },
    /** 라디오 세그먼트. opts: [[value, label, sub?], ...] */
    seg(name, opts, selected) {
      return `<div class="seg" role="radiogroup">${opts.map(([v, t, s]) => {
        const id = `${name}_${String(v).replace(/[^\w-]/g, '_')}`;
        return `<input type="radio" name="${name}" id="${id}" value="${App.esc(v)}" ${String(v) === String(selected) ? 'checked' : ''}><label for="${id}">${App.esc(t)}${s ? `<small>${App.esc(s)}</small>` : ''}</label>`;
      }).join('')}</div>`;
    },
    segVal(root, name) { const r = root.querySelector(`input[name="${name}"]:checked`); return r ? r.value : ''; },
    setSeg(root, name, v) { const r = root.querySelector(`input[name="${name}"][value="${v}"]`); if (r) r.checked = true; },
  };

  /* ───────── 탭 / 라우터 ───────── */
  const TAB_META = {
    channel: { no: '00', label: '채널 세팅' },
    analyze: { no: '01', label: '영상 분석' },
    plan: { no: '02', label: '기획 · 나레이션' },
    produce: { no: '03', label: '제작 · 업로드' },
    marketing: { no: '04', label: '마케팅 & SNS' },
  };
  App.register = (name, mod) => { App.modules[name] = mod; };
  App.go = (name, payload) => {
    const mod = App.modules[name];
    if (!mod || !(C.tabs || Object.keys(TAB_META)).includes(name)) return;
    App.$$('.nav button').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
    App.$$('.pane').forEach(p => p.classList.toggle('active', p.id === 'tab-' + name));
    const pane = App.$('#tab-' + name);
    if (!mod._mounted) { mod.mount(pane); mod._mounted = true; }
    mod.show && mod.show(payload);
    App.state.tab = name;
    if (location.hash !== '#' + name) history.replaceState(null, '', '#' + name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ───────── 설정 모달 ───────── */
  App.openSettings = () => {
    const s = App.settings.load();
    const wrap = document.createElement('div');
    wrap.className = 'modal';
    wrap.innerHTML = `
      <div class="panel modal-card" role="dialog" aria-modal="true" aria-labelledby="setTitle">
        <button class="x" data-x aria-label="닫기">×</button>
        <h3 id="setTitle">API 키 설정</h3>
        <p class="hint" style="margin:0 0 16px">키는 이 브라우저에만 저장되며 Google API로만 직접 전송됩니다. 사이트 서버로는 전송되지 않습니다.</p>
        <div class="keybox">
          <div class="field" style="margin:0">
            <label for="kGemini">Gemini API 키 <span class="req" id="kGemReq">*</span></label>
            <div class="keyrow"><input id="kGemini" class="input mono" type="password" value="${App.esc(s.gemini)}" placeholder="AIza..." autocomplete="off" spellcheck="false">
              <button class="btn btn-sm" data-eye="kGemini" type="button">보기</button></div>
            <span class="hint">분석 · 기획 · 이미지 · 나레이션 · 마케팅 전체에 사용. <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Google AI Studio에서 무료 발급 ↗</a></span>
          </div>
        </div>
        <div class="keybox">
          <div class="field" style="margin:0">
            <label>텍스트 AI 엔진</label>
            ${App.ui.seg('kEngine', [['gemini', 'Gemini (클라우드)', 'API 키'], ['local', '로컬 LLM', 'LM Studio · Ollama · 무료']], App.settings.llmEngine)}
            <span class="hint" style="margin-top:8px">로컬을 고르면 <b>채널 세팅 · 기획 대본 · 마케팅 글</b>을 내 PC의 LM Studio / Ollama가 만듭니다. <b>영상 분석 · 이미지/영상 생성 · Gemini 음성</b>은 항상 Gemini를 씁니다.</span>
          </div>
          <div id="kLocal" style="margin-top:14px" ${App.settings.llmEngine === 'local' ? '' : 'hidden'}>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
              <div class="field" style="margin:0;grid-column:1/-1"><label for="kBackend">백엔드</label>
                <select id="kBackend" class="select">${App.ui.options([['auto', '자동 (LM Studio 우선)'], ['lmstudio', 'LM Studio'], ['ollama', 'Ollama']], App.settings.llmBackend)}</select></div>
              <div class="field" style="margin:0"><label for="kLmsUrl">LM Studio 주소</label>
                <input id="kLmsUrl" class="input mono" value="${App.esc(s.lmstudioUrl)}" placeholder="${App.esc(App.settings.lmstudioUrl)}" spellcheck="false"></div>
              <div class="field" style="margin:0"><label for="kOllUrl">Ollama 주소</label>
                <input id="kOllUrl" class="input mono" value="${App.esc(s.ollamaUrl)}" placeholder="${App.esc(App.settings.ollamaUrl)}" spellcheck="false"></div>
              <div class="field" style="margin:0;grid-column:1/-1"><label for="kLmsTok">LM Studio API 토큰 <span class="opt">'Require API token'을 켠 경우만</span></label>
                <input id="kLmsTok" class="input mono" type="password" value="${App.esc(s.lmstudioToken || '')}" placeholder="비워 두면 토큰 없이 연결" autocomplete="off" spellcheck="false"></div>
              <div class="field" style="margin:0"><label for="kLmsModel">LM Studio 모델</label>
                <select id="kLmsModel" class="select"><option value="">자동 (첫 번째 로드된 모델)</option></select></div>
              <div class="field" style="margin:0"><label for="kOllModel">Ollama 모델</label>
                <select id="kOllModel" class="select"><option value="">자동 (첫 번째 모델)</option></select></div>
            </div>
            <div class="row between" style="margin-top:10px;gap:8px"><div id="kLocalStat" class="col" style="gap:4px;font-size:12.5px"></div>
              <button class="btn btn-sm" data-detect type="button" style="flex-shrink:0">${App.icon.redo || ''}다시 감지</button></div>
            <details class="hint" style="margin-top:8px"><summary style="cursor:pointer">연결이 안 될 때 (CORS)</summary>
              <div style="line-height:1.7;margin-top:6px">· <b>LM Studio</b>: Developer 탭 → Local Server <b>Start</b> → Settings에서 <b>Enable CORS</b> 켜기 → 모델 로드<br>
              · <b>Ollama</b>: 이 페이지가 localhost가 아니면 환경변수 <code class="c">OLLAMA_ORIGINS=${App.esc(location.origin)}</code> 설정 후 Ollama 재시작. 모델은 <code class="c">ollama pull gemma3</code><br>
              · 권장 모델: 한국어 잘하는 7B 이상 (gemma3, qwen3, exaone 등). 작은 모델은 JSON 형식을 자주 틀립니다.<br>
              · Chrome이 '로컬 네트워크 접근' 권한을 물으면 허용해주세요.</div></details>
          </div>
        </div>
        <div class="keybox">
          <div class="field" style="margin:0">
            <label for="kYoutube">YouTube Data API 키 <span class="opt">선택</span></label>
            <div class="keyrow"><input id="kYoutube" class="input mono" type="password" value="${App.esc(s.youtube)}" placeholder="AIza..." autocomplete="off" spellcheck="false">
              <button class="btn btn-sm" data-eye="kYoutube" type="button">보기</button></div>
            <span class="hint">조회수·좋아요·댓글 수집과 키워드 검색에 사용. Google Cloud Console에서 <b>YouTube Data API v3</b>를 사용 설정한 키 (Gemini 키와 같은 프로젝트라면 같은 키를 넣어도 됩니다).</span>
          </div>
        </div>
        <div class="keybox">
          <div class="field" style="margin:0">
            <label for="kOauth">OAuth 클라이언트 ID <span class="opt">선택 · 업로드용</span></label>
            <input id="kOauth" class="input mono" type="text" value="${App.esc(s.oauth)}" placeholder="1234-abc.apps.googleusercontent.com" autocomplete="off" spellcheck="false">
            <span class="hint">③ 탭의 유튜브 업로드에만 필요. 유형 <b>웹 애플리케이션</b>, 승인된 JavaScript 원본에 <code class="c">${App.esc(location.origin)}</code> 등록.</span>
          </div>
        </div>
        <div class="field">
          <label for="kModel">텍스트 모델 <span class="opt">선택</span></label>
          <input id="kModel" class="input mono" type="text" value="${App.esc(s.model)}" placeholder="비우면 자동 선택 (최신 gemini-*-flash)">
        </div>
        <div class="field">
          <label for="kVoice">내 목소리 서버 주소 <span class="opt">선택 · Qwen3-TTS</span></label>
          <input id="kVoice" class="input mono" type="text" value="${App.esc(s.voiceServer)}" placeholder="${App.esc(C.voiceServer || 'http://127.0.0.1:8805')}">
          <span class="hint">'내 PC' 방식 내 목소리 클로닝용. 내 PC에서 <code class="c">voice-server/run_voice_server.bat</code>을 실행하면 기본 주소로 연결됩니다. 설치 없는 <b>클라우드</b> 방식(DashScope 키)은 ② 기획 → <b>내 목소리</b>에서 설정합니다.</span>
        </div>
        <label class="check" style="margin-bottom:16px"><input type="checkbox" id="kRemember" ${s.remember ? 'checked' : ''}> 이 브라우저에 키 기억하기 (공용 PC에서는 끄세요)</label>
        <div id="kMsg"></div>
        <div class="row between" style="margin-top:14px">
          <button class="btn btn-sm btn-danger" data-wipe type="button">${App.icon.trash}모든 데이터 삭제</button>
          <div class="row">
            <button class="btn" data-test type="button">연결 테스트</button>
            <button class="btn btn-primary" data-save type="button">저장</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(wrap);
    const close = () => wrap.remove();
    const read = () => ({
      gemini: App.$('#kGemini', wrap).value.trim(), youtube: App.$('#kYoutube', wrap).value.trim(),
      oauth: App.$('#kOauth', wrap).value.trim(), model: App.$('#kModel', wrap).value.trim(), voiceServer: App.$('#kVoice', wrap).value.trim(), remember: App.$('#kRemember', wrap).checked,
      llmEngine: App.ui.segVal(wrap, 'kEngine') || 'gemini', llmBackend: App.$('#kBackend', wrap).value,
      lmstudioUrl: App.$('#kLmsUrl', wrap).value.trim(), ollamaUrl: App.$('#kOllUrl', wrap).value.trim(),
      lmstudioModel: App.$('#kLmsModel', wrap).value, ollamaModel: App.$('#kOllModel', wrap).value, lmstudioToken: App.$('#kLmsTok', wrap).value.trim(),
    });
    const msg = (html, bad) => { App.$('#kMsg', wrap).innerHTML = html ? `<div class="${bad ? 'err' : 'note'}" style="margin:0">${html}</div>` : ''; };
    /* 로컬 LLM 감지 → 상태 · 모델 목록 채우기 (입력한 주소를 임시 적용해 확인) */
    async function detectLocal() {
      const stat = App.$('#kLocalStat', wrap); stat.innerHTML = '<span class="vchk warn">감지 중…</span>';
      const v = read(); const saved = App.settings.load(); const prev = { lmstudioUrl: saved.lmstudioUrl, ollamaUrl: saved.ollamaUrl, lmstudioToken: saved.lmstudioToken };
      Object.assign(saved, { lmstudioUrl: v.lmstudioUrl, ollamaUrl: v.ollamaUrl, lmstudioToken: v.lmstudioToken });
      const p = await App.local.probeAll();
      Object.assign(saved, prev);
      const fill = (id, key, models) => {
        const sel = App.$(id, wrap); const cur = sel.value || saved[key + 'Model'] || '';
        const list = [...new Set([...(cur ? [cur] : []), ...models])];
        sel.innerHTML = `<option value="">자동 (첫 번째 모델)</option>` + list.map(m => `<option value="${App.esc(m)}" ${m === cur ? 'selected' : ''}>${App.esc(m)}${models.includes(m) ? '' : ' (없음)'}</option>`).join('');
      };
      fill('#kLmsModel', 'lmstudio', p.lmstudio.models); fill('#kOllModel', 'ollama', p.ollama.models);
      const row = (name, r, help) => `<span class="vchk ${r.online && !r.auth ? (r.models.length ? 'ok' : 'warn') : r.auth ? 'warn' : 'bad'}">${name} · ${r.auth ? 'API 토큰 필요' : r.online ? (r.models.length ? `연결됨 (모델 ${r.models.length}개)` : '실행 중 · 모델 없음') : `꺼짐 / 접근 불가`}</span>${r.online && !r.auth && r.models.length ? '' : `<span class="hint" style="margin:0">${r.auth ? 'LM Studio → Developer → Server Settings의 API 토큰을 위에 입력' : help}</span>`}`;
      stat.innerHTML = row('LM Studio', p.lmstudio, 'Local Server 시작 + Enable CORS + 모델 로드') + row('Ollama', p.ollama, p.ollama.online ? 'ollama pull gemma3' : 'Ollama 실행 (필요시 OLLAMA_ORIGINS)');
    }
    const syncEngine = () => { const local = App.ui.segVal(wrap, 'kEngine') === 'local'; App.$('#kLocal', wrap).hidden = !local; App.$('#kGemReq', wrap).textContent = local ? '(영상 분석·이미지용)' : '*'; if (local) detectLocal(); };
    wrap.addEventListener('change', e => { if (e.target.name === 'kEngine') syncEngine(); });
    wrap.addEventListener('click', async e => {
      if (e.target === wrap || e.target.closest('[data-x]')) return close();
      const eye = e.target.closest('[data-eye]');
      if (eye) { const inp = App.$('#' + eye.dataset.eye, wrap); const show = inp.type === 'password'; inp.type = show ? 'text' : 'password'; eye.textContent = show ? '숨김' : '보기'; return; }
      if (e.target.closest('[data-detect]')) return detectLocal();
      if (e.target.closest('[data-save]')) {
        const v = read();
        if (!v.gemini && v.llmEngine !== 'local') { msg('Gemini API 키를 입력하거나 텍스트 AI 엔진을 로컬 LLM으로 고르세요.', true); return; }
        App.settings.save(v); App.toast('설정을 저장했습니다'); close(); return;
      }
      if (e.target.closest('[data-test]')) {
        const btn = e.target.closest('[data-test]'); const v = read();
        if (!v.gemini && v.llmEngine !== 'local') { msg('Gemini API 키를 입력해주세요.', true); return; }
        App.settings.save(v); App.ui.busy(btn, true, '테스트 중');
        const out = [];
        try {
          if (v.llmEngine === 'local') {
            try { const r = await App.local.chat([{ role: 'user', content: 'Reply with {"ok":true} only.' }], { maxTokens: 300, json: true, maxContinues: 1 }); out.push(`✅ 로컬 LLM — <b>${App.esc(r.model)}</b>`); }
            catch (er) { out.push(`❌ 로컬 LLM — ${App.esc(er.message)}`); }
          }
          if (v.gemini) {
            try {
              App.ai.reset(); const m = (await App.ai.listModels()).text[0];
              await App.ai.call(m, { contents: [{ role: 'user', parts: [{ text: 'Reply with {"ok":true}' }] }], generationConfig: { maxOutputTokens: 50, responseMimeType: 'application/json' } });
              out.push(`✅ Gemini — <b>${App.esc(m)}</b>`);
            }
            catch (er) { out.push(`❌ Gemini — ${App.esc(App.ai.friendly(er))}`); }
          }
          if (v.youtube) { try { await App.yt.get('videos', { part: 'id', id: 'dQw4w9WgXcQ' }); out.push('✅ YouTube Data API'); } catch (er) { out.push(`❌ YouTube Data API (${App.esc(er.message)})`); } }
          msg(out.join('<br>'), out.some(x => x.startsWith('❌')));
        } finally { App.ui.busy(btn, false); }
        return;
      }
      if (e.target.closest('[data-wipe]')) {
        if (!confirm('이 사이트에 저장된 분석·기획·채널·마케팅 기록, 이미지·음성 파일, API 키를 모두 삭제합니다. 되돌릴 수 없습니다. 계속할까요?')) return;
        Object.keys(localStorage).filter(k => k.startsWith(P)).forEach(k => localStorage.removeItem(k));
        sessionStorage.removeItem(P + KEY_STORE);
        try { await App.db.clear(); } catch {}
        App.toast('모든 데이터를 삭제했습니다'); setTimeout(() => location.reload(), 600);
      }
    });
    document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); } });
    setTimeout(() => App.$('#kGemini', wrap).focus(), 50);
    if (App.settings.llmEngine === 'local') syncEngine();
  };

  /* ───────── 초기화 ───────── */
  function applyBrand() {
    const b = C.brand || {};
    document.documentElement.style.setProperty('--h', String(C.theme?.hue ?? 174));
    if (b.name) document.title = `${b.name} — ${b.tagline || 'AI 콘텐츠 자동화'}`;
    const desc = document.querySelector('meta[name=description]');
    if (desc && b.description) desc.setAttribute('content', b.description);
    App.$('#brandName').textContent = b.name || 'SNS AI 마케팅 자동화';
    App.$('#brandTag').textContent = b.tagline || '';
    App.$('#brandLogo').innerHTML = b.logoUrl ? `<img src="${App.esc(b.logoUrl)}" alt="">` : App.esc(b.short || 'AI');
    const f = C.footer || {};
    App.$('#footer').innerHTML = `${App.esc(f.text || '')}${(f.links || []).map(l => `<a href="${App.esc(l.url)}" target="_blank" rel="noopener">${App.esc(l.label)}</a>`).join('')}
      <div style="margin-top:6px">Powered by <a href="https://ai.google.dev/" target="_blank" rel="noopener" style="margin:0">Google Gemini</a></div>`;
  }
  function buildNav() {
    const tabs = (C.tabs || Object.keys(TAB_META)).filter(t => TAB_META[t]);
    App.$('#nav').innerHTML = tabs.map(t => `<button data-tab="${t}" type="button"><span class="no">${TAB_META[t].no}</span>${TAB_META[t].label}</button>`).join('');
    App.$('#panes').innerHTML = tabs.map(t => `<section class="pane" id="tab-${t}" aria-label="${TAB_META[t].label}"></section>`).join('');
    App.$('#nav').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) App.go(b.dataset.tab); });
    return tabs;
  }
  function refreshKeyState() {
    const local = App.settings.llmEngine === 'local', gem = !!App.settings.gemini;
    const has = gem || local;
    const pill = App.$('#keyPill');
    pill.className = 'pill ' + (has ? 'on' : 'off');
    pill.innerHTML = `<span class="dot"></span>${local ? (gem ? '로컬 LLM + Gemini' : '로컬 LLM') : gem ? 'Gemini 연결됨' : 'API 키 필요'}`;
    pill.title = local ? '텍스트는 LM Studio / Ollama, 영상 분석·이미지는 Gemini' : '';
    App.$('#keyBanner').hidden = has;
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyBrand();
    const tabs = buildNav();
    App.$('#keyPill').addEventListener('click', App.openSettings);
    App.$('#bannerKeyBtn').addEventListener('click', App.openSettings);
    App.on('settings', refreshKeyState);
    refreshKeyState();
    const fromHash = location.hash.replace('#', '');
    App.go(tabs.includes(fromHash) ? fromHash : (tabs.includes(C.defaultTab) ? C.defaultTab : tabs[0]));
    window.addEventListener('hashchange', () => { const h = location.hash.replace('#', ''); if (tabs.includes(h) && h !== App.state.tab) App.go(h); });
  });
})();
