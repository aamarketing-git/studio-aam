/* ==========================================================================
   내 목소리 — Qwen3-TTS 보이스 클로닝 (TubeInsight '내 목소리 등록' 기능의 웹 버전)
   · 목소리 프로필(참조 음성 + 참조 문장)은 브라우저(IndexedDB)에 저장
   · 합성은 방문자 PC에서 돌리는 voice-server/qwen_voice_server.py 가 담당 (기본 http://127.0.0.1:8805)
   · 또는 ☁️ 클라우드 방식: 방문자 본인 DashScope 키 + voice-proxy(Cloudflare Worker) 경유 Qwen 보이스 클로닝 (설치 없음)
   · App.narrate(text, plan) 하나로 Gemini 음성 / 내 목소리를 자동 분기
   ========================================================================== */
(function () {
  'use strict';
  const { $, esc, icon, ui } = App;

  App.GEMINI_VOICES = [['Kore', 'Kore · 차분한 여성'], ['Aoede', 'Aoede · 밝은 여성'], ['Leda', 'Leda · 젊은 여성'], ['Zephyr', 'Zephyr · 산뜻한 여성'],
    ['Charon', 'Charon · 신뢰감 남성'], ['Puck', 'Puck · 경쾌한 남성'], ['Fenrir', 'Fenrir · 힘있는 남성'], ['Orus', 'Orus · 단단한 남성'],
    ['Enceladus', 'Enceladus · 속삭이는'], ['Algenib', 'Algenib · 허스키']];
  const DEFAULT_REF = '안녕하세요. 오늘은 우리가 몰랐던 도시의 비밀을 하나씩 파헤쳐 보겠습니다. 끝까지 함께해 주세요.';
  App.voices = App.coll('voices');
  const isClone = v => String(v || '').startsWith('clone:');

  /* ───────── 보이스 선택 옵션 ───────── */
  App.voiceOptions = (selected) => {
    const mine = App.voices.list();
    return `<optgroup label="🎙️ 내 목소리 (Qwen3-TTS 클로닝)">${mine.length ? mine.map(v => `<option value="clone:${esc(v.id)}" ${selected === 'clone:' + v.id ? 'selected' : ''}>${esc(v.name)} (내 목소리)</option>`).join('') : '<option value="" disabled>— 아직 등록된 목소리가 없습니다 —</option>'}</optgroup>
      <optgroup label="Gemini AI 음성">${ui.options(App.GEMINI_VOICES, selected)}</optgroup>`;
  };
  App.voiceLabel = (v) => {
    if (isClone(v)) { const p = App.voices.get(v.slice(6)); return p ? `🎙️ ${p.name}` : '🎙️ 내 목소리(삭제됨)'; }
    return v || 'Kore';
  };
  App.isCloneVoice = isClone;

  /* ───────── 오디오 변환: 아무 형식 → 24kHz 모노 16bit WAV ───────── */
  App.audio.toWav24k = async (blob, maxSec = 30) => {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ac = new Ctx();
    let buf;
    try { buf = await ac.decodeAudioData(await blob.arrayBuffer()); }
    catch { throw new Error('오디오 파일을 읽을 수 없습니다. WAV · MP3 · M4A · WebM 파일을 사용해주세요.'); }
    finally { ac.close(); }
    const sec = Math.min(buf.duration, maxSec);
    const off = new OfflineAudioContext(1, Math.ceil(sec * 24000), 24000);
    const src = off.createBufferSource(); src.buffer = buf; src.connect(off.destination); src.start();
    const out = (await off.startRendering()).getChannelData(0);
    // 앞뒤 무음 정리 + 피크 정규화
    let a = 0, b = out.length - 1; const th = 0.01;
    while (a < b && Math.abs(out[a]) < th) a++;
    while (b > a && Math.abs(out[b]) < th) b--;
    a = Math.max(0, a - 2400); b = Math.min(out.length - 1, b + 2400);
    const seg = out.subarray(a, b + 1); let peak = 0; for (const x of seg) peak = Math.max(peak, Math.abs(x));
    const g = peak > 0 ? Math.min(4, 0.9 / peak) : 1;
    const pcm = new Int16Array(seg.length); for (let i = 0; i < seg.length; i++) pcm[i] = Math.max(-1, Math.min(1, seg[i] * g)) * 32767;
    return { blob: App.audio.pcmToWav(new Uint8Array(pcm.buffer), 24000), duration: seg.length / 24000, original: buf.duration };
  };

  /* ───────── 내 목소리 서버 클라이언트 ───────── */
  const refCache = {};
  App.clone = {
    url: () => App.settings.voiceServer,
    async health(timeout = 3000) {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), timeout);
      try {
        const r = await fetch(this.url() + '/health', { signal: ctl.signal });
        const j = await r.json(); return { reachable: true, ...j };
      } catch { return { reachable: false, ok: false }; }
      finally { clearTimeout(t); }
    },
    async refOf(id) {
      if (refCache[id]) return refCache[id];
      const p = App.voices.get(id); if (!p) throw new Error('목소리 프로필을 찾을 수 없습니다. 다시 등록해주세요.');
      const blob = await App.db.get('voice:' + id);
      if (!blob) throw new Error('목소리 녹음 파일이 이 브라우저에 없습니다. 다시 등록해주세요.');
      return (refCache[id] = { audio: await App.blobToDataURL(blob), text: p.ref_text || '' });
    },
    /** 내 목소리로 합성 → {blob(WAV 24k), duration} · 설정된 방식(클라우드/내 PC)으로 자동 분기 */
    tts(text, id, lang = 'ko') {
      return App.settings.voiceEngine === 'cloud' ? App.cloudVoice.tts(text, id) : this.localTts(text, id, lang);
    },
    /** 내 PC Qwen3-TTS 서버로 합성 */
    async localTts(text, id, lang = 'ko') {
      const ref = await this.refOf(id);
      let r;
      try {
        r = await fetch(this.url() + '/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, ref_audio: ref.audio, ref_text: ref.text, language: lang }) });
      } catch {
        const e = new Error(`내 목소리 서버(${this.url()})에 연결할 수 없습니다. 내 PC에서 voice-server/run_voice_server.bat 을 실행했는지 확인해주세요.`); e.code = 'VOICE_OFFLINE'; throw e;
      }
      if (!r.ok) { let m = `HTTP ${r.status}`; try { m = (await r.json()).error || m; } catch {} throw new Error(m); }
      const blob = await r.blob();
      const dur = parseFloat(r.headers.get('X-Audio-Duration')) || Math.max(0, blob.size - 44) / 48000;
      return { blob: blob.type ? blob : new Blob([blob], { type: 'audio/wav' }), duration: dur };
    },
    forget(id) { delete refCache[id]; },
  };

  /* ───────── ☁️ 클라우드 내 목소리 (DashScope Qwen 보이스 클로닝 · voice-proxy 경유) ─────────
     프로필(참조 음성)은 브라우저에 두고, 처음 합성할 때 방문자 계정에 voice_id를 만들어 프로필에 기억.
     voice_id는 계정 · 리전 · 워크스페이스 · 모델마다 따로 (DashScope에서 target_model에 묶임) */
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  App.cloudVoice = {
    ready: () => !!(App.settings.voiceProxy && App.settings.dsKey),
    slot() { const s = App.settings; return [s.dsRegion, s.dsWorkspace || '-', s.dsModel, s.dsKey.slice(-6)].join('|'); },
    async call(path, body, { raw = false } = {}) {
      const s = App.settings;
      if (!s.voiceProxy) throw new Error('클라우드 프록시 주소가 설정되지 않았습니다 (config.js → voiceProxy).');
      if (!s.dsKey) { const e = new Error('DashScope API 키(sk-...)를 입력해주세요.'); e.code = 'NO_DS_KEY'; throw e; }
      let r;
      try {
        r = await fetch(s.voiceProxy + path, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-DashScope-Key': s.dsKey }, body: JSON.stringify({ region: s.dsRegion, workspace: s.dsWorkspace, ...body }) });
      } catch { throw new Error(`클라우드 프록시(${s.voiceProxy})에 연결할 수 없습니다.`); }
      if (!r.ok) {
        let j = {}; try { j = await r.json(); } catch {}
        const m = j.error || `HTTP ${r.status}`;
        const e = new Error(r.status === 401 || /invalid.*api.?key|InvalidApiKey/i.test(m) ? `DashScope 키가 올바르지 않습니다 (${m})` : m);
        e.status = r.status; e.code = j.code; throw e;
      }
      return raw ? r : r.json();
    },
    /** 키 · 워크스페이스 확인 */
    test() { return this.call('/voice/list', { page_size: 1 }); },
    /** 프로필 → 클라우드 voice_id (없으면 등록 후 검토 완료까지 대기) */
    async ensureVoice(id, onStatus) {
      const p = App.voices.get(id); if (!p) throw new Error('목소리 프로필을 찾을 수 없습니다. 다시 등록해주세요.');
      const slot = this.slot(); const have = (p.cloud || {})[slot];
      if (have) return have;
      onStatus && onStatus('클라우드에 내 목소리 등록 중…');
      const ref = await App.clone.refOf(id);
      const { voice_id } = await this.call('/voice/create', { target_model: App.settings.dsModel, prefix: 'snsai', audio: ref.audio, language_hints: ['ko'] });
      for (let i = 0; i < 60; i++) {
        const q = await this.call('/voice/query', { voice_id });
        if (q.status === 'OK') break;
        if (q.status === 'UNDEPLOYED') throw new Error('클라우드 검토에서 목소리가 거절되었습니다. 잡음 없이 10~20초 똑똑하게 다시 녹음해주세요.');
        if (i === 59) throw new Error('클라우드 목소리 검토가 오래 걸리고 있습니다. 잠시 후 다시 시도해주세요.');
        onStatus && onStatus(`클라우드 목소리 검토 중… (${(i + 1) * 2}초)`);
        await sleep(2000);
      }
      const cur = App.voices.get(id);
      if (cur) App.voices.put({ ...cur, cloud: { ...(cur.cloud || {}), [slot]: voice_id } });
      return voice_id;
    },
    async tts(text, id, onStatus) {
      let voice = await this.ensureVoice(id, onStatus);
      const run = async v => {
        const r = await this.call('/tts', { model: App.settings.dsModel, voice: v, text }, { raw: true });
        const blob = await r.blob();
        const wav = blob.type === 'audio/wav' ? blob : new Blob([blob], { type: 'audio/wav' });
        let duration = 0;
        try { duration = (await App.audio.toWav24k(wav, 600)).original; } catch { duration = Math.max(0, wav.size - 44) / 48000; }
        return { blob: wav, duration };
      };
      try { return await run(voice); }
      catch (e) {
        // 클라우드에서 voice가 삭제됐으면 한 번 재등록
        if (!/voice/i.test(e.message) || !/not.?(found|exist)|invalid/i.test(e.message)) throw e;
        const cur = App.voices.get(id); if (cur && cur.cloud) { delete cur.cloud[this.slot()]; App.voices.put(cur); }
        voice = await this.ensureVoice(id, onStatus);
        return run(voice);
      }
    },
    /** 프로필 삭제 시 클라우드의 voice도 정리 (가능한 것만) */
    async remove(p) {
      if (!p || !p.cloud || !this.ready()) return;
      const mine = this.slot().split('|').slice(0, 2).join('|');
      for (const [slot, vid] of Object.entries(p.cloud)) {
        if (slot.startsWith(mine) && slot.endsWith(App.settings.dsKey.slice(-6))) { try { await this.call('/voice/delete', { voice_id: vid }); } catch {} }
      }
    },
  };

  /** 기획의 보이스 설정에 맞춰 나레이션 합성 (Gemini 음성 / 내 목소리) */
  App.narrate = (text, plan) => isClone(plan.voice)
    ? App.clone.tts(text, plan.voice.slice(6), plan.lang || 'ko')
    : App.ai.tts(text, plan.voice || 'Kore', plan.voiceStyle || '');
  /** 내 목소리를 쓰는 기획이면 서버 연결을 먼저 확인 */
  App.ensureVoiceReady = async (plan) => {
    if (!isClone(plan.voice)) return App.requireKey();
    if (!App.voices.get(plan.voice.slice(6))) { App.toast('선택한 내 목소리 프로필이 없습니다. 다시 등록해주세요.', true); return false; }
    if (App.settings.voiceEngine === 'cloud') {
      if (App.cloudVoice.ready()) return true;
      App.toast('클라우드 내 목소리를 쓰려면 DashScope API 키를 입력해주세요.', true);
      App.openVoiceModal();
      return false;
    }
    const h = await App.clone.health();
    if (h.reachable && h.ok) return true;
    App.toast(h.reachable ? '내 목소리 서버에 torch / qwen-tts가 설치되어 있지 않습니다.' : '내 목소리 서버가 꺼져 있습니다. voice-server/run_voice_server.bat 을 실행해주세요.', true);
    App.openVoiceModal();
    return false;
  };

  /* ───────── 내 목소리 등록 모달 ───────── */
  App.openVoiceModal = (onSaved) => {
    const st = { rec: null, stream: null, chunks: [], blob: null, timer: null, t0: 0, url: null, playing: [] };
    const wrap = document.createElement('div'); wrap.className = 'modal';
    wrap.innerHTML = `
      <div class="panel modal-card" role="dialog" aria-modal="true" aria-labelledby="vcTitle" style="max-width:640px">
        <button class="x" data-x aria-label="닫기">×</button>
        <h3 id="vcTitle">🎙️ 내 목소리 등록</h3>
        <p class="hint" style="margin:0 0 14px">아래 문장을 또렷하게 읽으며 <b>5~20초</b> 녹음하거나, 같은 문장을 읽은 음성 파일을 넣어주세요. 녹음한 말과 참조 문장이 정확히 같아야 품질이 좋습니다. 녹음은 이 브라우저에 저장되며, ☁️ 클라우드 방식일 때만 내 DashScope 계정으로 전송됩니다.</p>
        <div id="vcEngine"></div>
        <div class="keybox" id="vcServer"></div>
        <div class="field"><label for="vcName">프로필 이름</label><input id="vcName" class="input" value="내 목소리" maxlength="30"></div>
        <div class="field"><label for="vcRef">읽을 문장 (참조 텍스트)</label><textarea id="vcRef" class="textarea" rows="3" style="min-height:70px">${esc(DEFAULT_REF)}</textarea></div>
        <div class="keybox" style="text-align:center">
          <div class="row" style="justify-content:center;gap:10px">
            <button id="vcRec" class="btn btn-primary rec-btn" type="button"><span class="rec-dot"></span><span id="vcRecTxt">마이크 녹음 시작</span></button>
            <span class="muted" style="font-size:12px">또는</span>
            <label class="btn" style="cursor:pointer">${icon.upload}파일 첨부<input id="vcFile" type="file" accept="audio/*" hidden></label>
          </div>
          <div id="vcPrev" style="margin-top:12px"></div>
        </div>
        <div id="vcMsg"></div>
        <button id="vcSave" class="btn btn-primary btn-block" type="button" style="margin-top:6px">${icon.check}목소리 프로필 저장</button>
        <div class="sec-title" style="margin-top:22px">등록된 내 목소리</div>
        <div id="vcList" class="col" style="gap:8px"></div>
      </div>`;
    document.body.appendChild(wrap);
    const msg = (t, bad) => { $('#vcMsg', wrap).innerHTML = t ? `<div class="${bad ? 'err' : 'note'}" style="margin:8px 0 0">${t}</div>` : ''; };
    const stopAll = () => { try { st.rec && st.rec.state !== 'inactive' && st.rec.stop(); } catch {} st.stream && st.stream.getTracks().forEach(t => t.stop()); clearInterval(st.timer); st.playing.forEach(u => URL.revokeObjectURL(u)); };
    const close = () => { stopAll(); wrap.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = e => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);

    function renderEngine() {
      const el = $('#vcEngine', wrap);
      if (!App.settings.voiceProxy) { el.innerHTML = ''; return; } // 프록시 미설정 사이트 → 내 PC 방식만
      el.innerHTML = `<div class="field"><label>합성 방식</label>${ui.seg('vcEng', [['cloud', '☁️ 클라우드', '설치 없음 · 내 DashScope 키'], ['local', '💻 내 PC', '무료 · 설치 필요']], App.settings.voiceEngine)}</div>`;
    }
    async function renderServer() {
      if (App.settings.voiceEngine === 'cloud') return renderCloud();
      const box = $('#vcServer', wrap);
      box.innerHTML = `<div class="row between"><span class="vchk warn">서버 확인 중…</span></div>`;
      const h = await App.clone.health();
      const state = !h.reachable ? ['bad', '내 목소리 서버 꺼짐'] : !h.ok ? ['warn', '서버 실행 중 · 패키지 미설치'] : ['ok', `연결됨 · ${h.loaded ? (h.device || '').toUpperCase() + ' 준비 완료' : '첫 합성 때 모델 로드'}`];
      box.innerHTML = `
        <div class="row between"><span class="vchk ${state[0]}">${state[1]}</span>
          <div class="row" style="gap:6px"><input id="vcUrl" class="input mono" style="width:220px;padding:7px 10px" value="${esc(App.clone.url())}" aria-label="서버 주소"><button class="btn btn-sm" data-recheck type="button">${icon.redo}다시 확인</button></div></div>
        ${h.reachable && h.ok ? `<p class="hint" style="margin:8px 0 0">모델: <code class="c">${esc(h.model || '')}</code> GPU가 없으면 씬 하나에 수십 초 걸릴 수 있습니다.</p>` : `
        <div class="hint" style="margin-top:10px;line-height:1.7">
          <b>처음 한 번 설정</b> (내 PC에서 실행 · 무료 오픈소스 Qwen3-TTS)<br>
          1. ${App.config.voiceServerDownload ? `<a href="${esc(App.config.voiceServerDownload)}" download>voice-server.zip 내려받기</a> → 압축 풀고` : '사이트 파일의 <code class="c">voice-server</code> 폴더에서'} <code class="c">run_voice_server.bat</code> 더블클릭 (Mac: <code class="c">run_voice_server.command</code>)<br>
          2. 처음 실행 시 torch · qwen-tts 설치와 모델 다운로드로 수 분 걸립니다 (수 GB)<br>
          3. 창에 <code class="c">http://127.0.0.1:8805</code> 가 보이면 <b>다시 확인</b>을 누르세요
          ${h.reachable ? '<br>⚠️ 서버는 켜졌지만 <code class="c">pip install torch qwen-tts</code> 가 필요합니다.' : ''}
        </div>`}`;
    }
    function renderCloud(status) {
      const s = App.settings, box = $('#vcServer', wrap);
      const state = status || (s.dsKey ? ['warn', '키 입력됨 · 연결 확인 전'] : ['bad', 'DashScope 키 필요']);
      box.innerHTML = `
        <div class="row between" style="margin-bottom:10px"><span class="vchk ${state[0]}">${state[1]}</span>
          <a class="hint" href="https://modelstudio.console.alibabacloud.com/" target="_blank" rel="noopener">Model Studio에서 키 발급 ↗</a></div>
        <div class="field"><label for="vcDsKey">DashScope API 키 <span class="req">*</span></label>
          <div class="keyrow"><input id="vcDsKey" class="input mono" type="password" value="${esc(s.dsKey)}" placeholder="sk-..." autocomplete="off" spellcheck="false">
          <button class="btn btn-sm" data-dseye type="button">보기</button></div></div>
        <div class="grid2" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="field" style="margin:0"><label for="vcDsRegion">리전</label>
            <select id="vcDsRegion" class="select">${ui.options([['ap-southeast-1', '싱가포르 (국제)'], ['cn-beijing', '중국 베이징']], s.dsRegion)}</select></div>
          <div class="field" style="margin:0"><label for="vcDsWs">Workspace ID <span class="opt">권장</span></label>
            <input id="vcDsWs" class="input mono" value="${esc(s.dsWorkspace)}" placeholder="ws-... (콘솔 상단)" spellcheck="false"></div>
          <div class="field" style="margin:0;grid-column:1/-1"><label for="vcDsModel">합성 모델</label>
            <select id="vcDsModel" class="select">${ui.options([['qwen-audio-3.1-tts-flash', 'qwen-audio-3.1-tts-flash · 빠름·저렴'], ['qwen-audio-3.1-tts-plus', 'qwen-audio-3.1-tts-plus · 고품질']], s.dsModel)}</select></div>
        </div>
        <div class="row between" style="margin-top:12px"><span class="hint">키는 이 브라우저에만 저장되고, 사이트 프록시를 거쳐 DashScope로만 전달됩니다(저장 안 함). 목소리 등록은 무료, 합성은 내 계정에 과금.</span>
          <button class="btn btn-sm btn-soft" data-dssave type="button" style="flex-shrink:0">${icon.check}저장 · 연결 확인</button></div>`;
    }
    async function saveCloud(btn) {
      const v = { dsKey: $('#vcDsKey', wrap).value.trim(), dsRegion: $('#vcDsRegion', wrap).value, dsWorkspace: $('#vcDsWs', wrap).value.trim(), dsModel: $('#vcDsModel', wrap).value };
      if (!/^sk-/.test(v.dsKey)) return renderCloud(['bad', '키는 sk- 로 시작합니다']);
      App.settings.save(v); ui.busy(btn, true, '확인 중');
      try { await App.cloudVoice.test(); renderCloud(['ok', `연결됨 · ${v.dsModel}`]); App.toast('클라우드 내 목소리 연결 성공'); }
      catch (e) { renderCloud(['bad', esc(e.message).slice(0, 160)]); }
    }
    function renderPrev() {
      const el = $('#vcPrev', wrap);
      if (!st.blob) { el.innerHTML = ''; return; }
      if (st.url) URL.revokeObjectURL(st.url); st.url = URL.createObjectURL(st.blob); st.playing.push(st.url);
      el.innerHTML = `<audio controls src="${st.url}"></audio><div class="hint" id="vcDur" style="margin-top:4px"></div>`;
      const au = $('audio', el); au.onloadedmetadata = () => { const d = au.duration; if (isFinite(d)) $('#vcDur', wrap).innerHTML = `길이 ${d.toFixed(1)}초 ${d < 5 ? '<span style="color:var(--warn)">· 5초 이상 권장</span>' : d > 30 ? '· 앞 30초만 사용' : '· 좋아요 👍'}`; };
    }
    function renderList() {
      const list = App.voices.list(); const el = $('#vcList', wrap);
      el.innerHTML = list.length ? list.map(v => `<div class="h-row voice-item"><div class="col" style="gap:2px;flex:1;min-width:0"><b style="font-size:13.5px">${esc(v.name)}</b><span class="hint" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${v.duration ? v.duration.toFixed(1) + '초 · ' : ''}${esc(v.ref_text.slice(0, 40))}</span></div>
          <button class="btn btn-xs" data-play="${esc(v.id)}" type="button" title="녹음 듣기">${icon.play}</button>
          <button class="btn btn-xs btn-soft" data-test="${esc(v.id)}" type="button" title="내 목소리로 테스트 문장 합성">${icon.mic}테스트</button>
          <button class="btn btn-xs btn-danger" data-del="${esc(v.id)}" type="button" aria-label="삭제">${icon.trash}</button></div><div data-out="${esc(v.id)}"></div>`).join('')
        : '<p class="hint" style="margin:0">아직 등록된 목소리가 없습니다.</p>';
    }

    async function toggleRec() {
      const btn = $('#vcRec', wrap);
      if (st.rec && st.rec.state === 'recording') { st.rec.stop(); return; }
      try {
        st.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } });
      } catch { msg('마이크 권한이 필요합니다. 주소창의 🔒 아이콘에서 마이크를 허용해주세요. (https 또는 localhost 주소에서만 녹음할 수 있습니다)', true); return; }
      st.chunks = []; st.rec = new MediaRecorder(st.stream);
      st.rec.ondataavailable = e => { if (e.data.size) st.chunks.push(e.data); };
      st.rec.onstop = () => {
        st.blob = new Blob(st.chunks, { type: st.rec.mimeType || 'audio/webm' });
        st.stream.getTracks().forEach(t => t.stop()); clearInterval(st.timer);
        btn.classList.remove('on'); $('#vcRecTxt', wrap).textContent = '다시 녹음'; renderPrev();
      };
      st.rec.start(); st.t0 = Date.now(); btn.classList.add('on'); msg('');
      st.timer = setInterval(() => {
        const s = (Date.now() - st.t0) / 1000;
        $('#vcRecTxt', wrap).textContent = `녹음 중 ${s.toFixed(0)}초 · 끝나면 클릭`;
        if (s >= 30) st.rec.stop();
      }, 250);
    }

    async function save() {
      const btn = $('#vcSave', wrap);
      if (!st.blob) return msg('먼저 녹음하거나 음성 파일을 첨부해주세요.', true);
      const ref = $('#vcRef', wrap).value.trim();
      if (ref.length < 5) return msg('녹음한 문장(참조 텍스트)을 입력해주세요.', true);
      ui.busy(btn, true, '변환 중');
      try {
        const w = await App.audio.toWav24k(st.blob);
        if (w.duration < 3) throw new Error(`녹음이 너무 짧습니다 (${w.duration.toFixed(1)}초). 5초 이상 또렷하게 읽어주세요.`);
        const id = App.uid('voice');
        await App.db.set('voice:' + id, w.blob);
        App.voices.put({ id, name: $('#vcName', wrap).value.trim() || '내 목소리', ref_text: ref, duration: Math.round(w.duration * 10) / 10, created_at: Date.now() });
        App.toast('내 목소리를 등록했습니다');
        st.blob = null; renderPrev(); renderList(); $('#vcRecTxt', wrap).textContent = '마이크 녹음 시작';
        msg(`✅ 저장했습니다. 나레이션 음성 목록에서 <b>${esc($('#vcName', wrap).value.trim() || '내 목소리')} (내 목소리)</b>를 고르세요.`);
        onSaved && onSaved(id);
      } catch (e) { msg(esc(e.message), true); }
      finally { ui.busy(btn, false); }
    }

    wrap.addEventListener('click', async e => {
      if (e.target === wrap || e.target.closest('[data-x]')) return close();
      if (e.target.closest('#vcRec')) return toggleRec();
      if (e.target.closest('#vcSave')) return save();
      if (e.target.closest('[data-recheck]')) {
        const u = $('#vcUrl', wrap).value.trim().replace(/\/+$/, '');
        if (u && u !== App.clone.url()) App.settings.save({ voiceServer: u });
        return renderServer();
      }
      const ds = e.target.closest('[data-dssave]');
      if (ds) { await saveCloud(ds); return; }
      const eye = e.target.closest('[data-dseye]');
      if (eye) { const inp = $('#vcDsKey', wrap); const show = inp.type === 'password'; inp.type = show ? 'text' : 'password'; eye.textContent = show ? '숨김' : '보기'; return; }
      const pl = e.target.closest('[data-play]');
      if (pl) { const b = await App.db.get('voice:' + pl.dataset.play); if (!b) return App.toast('녹음 파일이 없습니다', true); const u = URL.createObjectURL(b); st.playing.push(u); new Audio(u).play(); return; }
      const del = e.target.closest('[data-del]');
      if (del) { if (!confirm('이 목소리 프로필을 삭제할까요?')) return; const p = App.voices.get(del.dataset.del); App.cloudVoice.remove(p).catch(() => {}); App.voices.remove(del.dataset.del); App.db.del('voice:' + del.dataset.del).catch(() => {}); App.clone.forget(del.dataset.del); return renderList(); }
      const te = e.target.closest('[data-test]');
      if (te) {
        const out = $(`[data-out="${te.dataset.test}"]`, wrap); ui.busy(te, true, '합성 중');
        const cloud = App.settings.voiceEngine === 'cloud';
        const note = t => { out.innerHTML = `<p class="hint" style="margin:4px 0 0">${esc(t)}</p>`; };
        note(cloud ? '☁️ 클라우드에서 내 목소리로 합성 중… (처음에는 목소리 등록·검토로 수십 초 걸릴 수 있습니다)' : '내 목소리로 합성 중… (처음에는 모델 로드로 1~3분 걸릴 수 있습니다)');
        try {
          const line = '반갑습니다. 이제부터 제 목소리로 나레이션을 들려드릴게요.';
          if (cloud && !App.cloudVoice.ready()) throw new Error('위에서 DashScope API 키를 입력하고 저장해주세요.');
          const r = cloud ? await App.cloudVoice.tts(line, te.dataset.test, note) : await App.clone.tts(line, te.dataset.test, 'ko');
          const u = URL.createObjectURL(r.blob); st.playing.push(u);
          out.innerHTML = `<audio controls autoplay src="${u}" style="margin-top:6px"></audio>`;
        } catch (er) { out.innerHTML = `<div class="err" style="margin-top:6px">${esc(er.message)}</div>`; }
        finally { ui.busy(te, false); }
      }
    });
    $('#vcFile', wrap).addEventListener('change', e => { const f = e.target.files[0]; if (!f) return; if (f.size > 20 * 1048576) return msg('20MB 이하 파일을 사용해주세요.', true); st.blob = f; msg(''); renderPrev(); });
    wrap.addEventListener('change', e => {
      if (e.target.name === 'vcEng') { App.settings.save({ voiceEngine: e.target.value }); renderServer(); }
    });
    renderEngine(); renderServer(); renderList();
  };
})();
