/* ==========================================================================
   03 제작 · 업로드 — 씬별 이미지(AI 생성/직접 업로드) + 나레이션 → 브라우저에서 영상 합성 → 유튜브 업로드
   서버 없이 canvas + WebAudio + MediaRecorder 로 실시간 렌더링합니다 (렌더링 중에는 탭을 띄워두세요).
   ========================================================================== */
(function () {
  'use strict';
  const { $, $$, esc, icon, ui } = App;
  const S = { plan: null, media: {}, audio: {}, urls: [], out: null, busy: false, bgm: null, token: null, cancel: false };
  let root;

  function mount(el) {
    root = el;
    el.innerHTML = `
      ${ui.pageHead('STEP 03 · PRODUCTION & UPLOAD', '버튼 하나로 <span class="grad">영상 완성 → 업로드</span>',
        '씬마다 AI 이미지를 만들거나 직접 올린 사진·영상을 쓰고, 나레이션 · 자막 · BGM을 합쳐 <b>브라우저에서 바로 영상 파일</b>로 만듭니다.')}
      <div class="grid-side">
        <aside class="panel pad sticky" id="pdForm">
          <div class="field"><label for="pdPlan">기획 선택</label><select id="pdPlan" class="select"></select>
            <span class="hint">② 기획 · 나레이션에서 만든 기획을 불러옵니다.</span></div>
          <div class="field"><span class="lbl">해상도</span>${ui.seg('pdRes', [['720', '720p', '빠름'], ['1080', '1080p', '고화질']], '1080')}</div>
          <label class="check" style="margin-bottom:8px"><input type="checkbox" id="pdSub" checked> 자막 넣기</label>
          <label class="check" style="margin-bottom:8px"><input type="checkbox" id="pdKb" checked> 켄 번즈 (천천히 확대·이동)</label>
          <label class="check" style="margin-bottom:14px"><input type="checkbox" id="pdFade" checked> 장면 전환 크로스페이드</label>
          <details class="more"><summary>배경음악 (BGM)</summary><div class="inner">
            <div class="field"><label for="pdBgm">음악 파일 <span class="opt">mp3 · wav</span></label><input id="pdBgm" type="file" accept="audio/*" class="input" style="padding:8px"></div>
            <div class="field"><label for="pdBgmVol">볼륨 <span class="count" id="pdBgmVolV">25%</span></label><input id="pdBgmVol" type="range" min="0" max="100" value="25" style="accent-color:var(--a400)"></div>
            <label class="check"><input type="checkbox" id="pdDuck" checked> 나레이션 중 BGM 자동 낮춤</label>
          </div></details>
          <div class="col" style="gap:8px">
            <button id="pdAll" class="btn btn-primary btn-block" type="button">${icon.film}원클릭 영상 완성</button>
            <div class="f2"><button id="pdImgs" class="btn btn-sm" type="button">${icon.img}이미지 일괄 생성</button><button id="pdTts" class="btn btn-sm" type="button">${icon.mic}누락 음성 생성</button></div>
            <button id="pdRender" class="btn btn-sm btn-soft" type="button">${icon.play}지금 소재로 렌더링만</button>
          </div>
          <p class="hint" style="margin:12px 0 0">원클릭: 비어 있는 씬 이미지 생성 → 누락 음성 생성 → 영상 합성. 렌더링은 영상 길이만큼 실시간으로 걸리며 그동안 이 탭을 열어두어야 합니다.</p>
          <div id="pdErr"></div>
        </aside>
        <section id="pdOut" class="col" aria-live="polite"></section>
      </div>`;
    $('#pdPlan', el).addEventListener('change', e => load(e.target.value));
    $('#pdAll', el).addEventListener('click', oneClick);
    $('#pdImgs', el).addEventListener('click', () => run(genImages));
    $('#pdTts', el).addEventListener('click', () => run(genAudio));
    $('#pdRender', el).addEventListener('click', () => run(renderVideo));
    $('#pdBgm', el).addEventListener('change', e => { S.bgm = e.target.files[0] || null; });
    $('#pdBgmVol', el).addEventListener('input', e => { $('#pdBgmVolV', el).textContent = e.target.value + '%'; });
    $('#pdOut', el).addEventListener('click', onClick);
    $('#pdOut', el).addEventListener('change', onFile);
    ['dragover', 'dragleave', 'drop'].forEach(t => $('#pdOut', el).addEventListener(t, onDrag));
    App.on('coll:plans', fillPlans);
    App.on('settings', () => { if (App.settings.oauth) loadGis().catch(() => {}); });
    if (App.settings.oauth) loadGis().catch(() => {});
    fillPlans();
  }
  function show(p) {
    fillPlans();
    const id = p?.planId || S.plan?.id || App.plans.list()[0]?.id;
    if (id && !S.busy) { $('#pdPlan', root).value = id; load(id); }
    else if (!id) renderEmpty();
  }
  function fillPlans() {
    const l = App.plans.list(); const sel = $('#pdPlan', root);
    sel.innerHTML = l.length ? l.map(p => `<option value="${esc(p.id)}">${esc(p.title.slice(0, 40))} · ${p.scenes.length}씬 ${esc(p.aspect)}</option>`).join('') : '<option value="">기획이 없습니다</option>';
    if (S.plan) sel.value = S.plan.id;
  }
  function renderEmpty() {
    ui.empty($('#pdOut', root), { icon: 'film', title: '먼저 기획을 만들어주세요', text: '② 기획 · 나레이션 탭에서 대본과 나레이션을 만들면 여기서 영상으로 완성합니다.<br><button class="btn btn-soft" style="margin-top:14px" data-go="plan" type="button">② 기획하러 가기</button>' });
  }

  /* ───────── 데이터 로드 ───────── */
  async function load(id) {
    const p = App.plans.get(id); if (!p) return renderEmpty();
    S.urls.forEach(u => URL.revokeObjectURL(u)); S.urls = [];
    S.plan = p; S.media = {}; S.audio = {};
    for (const s of p.scenes) {
      const m = await App.db.get(`media:${p.id}:${s.n}`).catch(() => null);
      if (m) { m.url = URL.createObjectURL(m.blob); S.urls.push(m.url); S.media[s.n] = m; }
      const a = s.audio ? await App.db.get(`audio:${p.id}:${s.n}`).catch(() => null) : null;
      if (a) S.audio[s.n] = a;
    }
    if (S.plan !== p) return;
    render();
  }
  const ratio = p => (p.aspect === '16:9' ? 'r169' : 'r916');
  function render() {
    const p = S.plan;
    const imgs = p.scenes.filter(s => S.media[s.n]).length, auds = p.scenes.filter(s => S.audio[s.n]).length;
    const d = p.description || {};
    $('#pdOut', root).innerHTML = `
      <div class="panel pad col" style="gap:12px">
        <div class="row between"><h3 class="sec-title" style="margin:0;flex:1">씬 소재 · ${esc(p.title)}</h3>
          <div class="row"><span id="pdImgCnt" class="vchk ${imgs === p.scenes.length ? 'ok' : 'warn'}">이미지 ${imgs}/${p.scenes.length}</span><span id="pdAudCnt" class="vchk ${auds === p.scenes.length ? 'ok' : 'warn'}">음성 ${auds}/${p.scenes.length}</span></div></div>
        <p class="hint" style="margin:0">카드에 이미지·영상 파일을 끌어다 놓거나 ⬆ 버튼으로 올릴 수 있습니다. 비워 두면 AI가 이미지 프롬프트로 생성합니다.</p>
        <div class="prod-grid ${p.aspect === '9:16' ? 'v' : ''}" id="pdGrid">${p.scenes.map(s => prodCard(p, s)).join('')}</div>
      </div>
      <div class="panel pad col" style="gap:12px" id="pdRenderBox">
        <h3 class="sec-title" style="margin:0">영상 합성</h3>
        <div class="render-box">
          <div class="stage" id="pdStage">${S.out ? `<video src="${S.out.url}" controls playsinline></video>` : `<div class="empty" style="padding:40px 20px"><div class="orb">${icon.film}</div><p>원클릭 영상 완성을 누르면 여기에 미리보기가 나타납니다.</p></div>`}</div>
          <div class="col" style="gap:10px">
            <div id="pdProg" class="col" style="gap:8px"></div>
            ${S.out ? `<div class="note">✅ <span><b>${esc(S.out.ext.toUpperCase())}</b> · ${(S.out.blob.size / 1048576).toFixed(1)}MB · ${App.fmtTime(S.out.duration)}</span></div>
              <button class="btn btn-primary" data-act="dl-video" type="button">${icon.dl}영상 다운로드</button>` : ''}
            <div class="note">ⓘ <span>브라우저가 MP4 녹화를 지원하면 MP4, 아니면 WebM으로 저장됩니다. 유튜브는 두 형식 모두 업로드할 수 있습니다.</span></div>
          </div>
        </div>
      </div>
      <div class="panel pad col" style="gap:4px">
        <h3 class="sec-title">${icon.yt.replace('<svg', '<svg style="width:16px;height:16px"')} 유튜브 업로드</h3>
        <div class="field"><label for="upTitle">제목</label><input id="upTitle" class="input" maxlength="100" value="${esc(p.title)}"></div>
        <div class="field"><label for="upDesc">설명</label><textarea id="upDesc" class="textarea" rows="5">${esc([d.summary, d.insight, d.cta, (d.hashtags || []).join(' ')].filter(Boolean).join('\n\n'))}</textarea></div>
        <div class="f2">
          <div class="field"><label for="upTags">태그 <span class="opt">쉼표 구분</span></label><input id="upTags" class="input" value="${esc((d.hashtags || []).map(h => h.replace(/^#/, '')).join(', '))}"></div>
          <div class="field"><label for="upCat">카테고리</label><select id="upCat" class="select">${ui.options([['27', '교육'], ['28', '과학기술'], ['24', '엔터테인먼트'], ['22', '인물/블로그'], ['26', '노하우/스타일'], ['25', '뉴스/정치'], ['19', '여행/이벤트']], '27')}</select></div>
        </div>
        <div class="field"><span class="lbl">공개 범위</span>${ui.seg('upPriv', [['private', '비공개', '검토 후 공개'], ['unlisted', '일부 공개'], ['public', '공개']], 'private')}</div>
        <div class="field"><label for="upFile">업로드할 파일 <span class="opt">선택</span></label><input id="upFile" type="file" accept="video/*" class="input" style="padding:8px">
          <span class="hint">비워두면 위에서 합성한 영상을 업로드합니다.</span></div>
        ${App.settings.oauth ? '' : `<div class="note" style="margin-bottom:10px">🔒 <span>업로드하려면 설정에서 <b>OAuth 클라이언트 ID</b>를 등록하세요. <button class="link-btn" data-act="settings" type="button">설정 열기</button></span></div>`}
        <button class="btn btn-primary" data-act="upload" type="button" ${App.settings.oauth ? '' : 'disabled'}>${icon.upload}YouTube에 업로드</button>
        <div id="upMsg"></div>
      </div>`;
  }
  function prodCard(p, s) {
    const m = S.media[s.n], a = S.audio[s.n];
    return `<article class="panel prod" data-n="${s.n}">
      <div class="media ${ratio(p)}" data-drop="${s.n}">
        ${m ? (m.type === 'video' ? `<video src="${m.url}" muted loop playsinline autoplay></video>` : `<img src="${m.url}" alt="${s.n}번 씬">`) : `<div class="ph">${icon.img}이미지 없음<br><small>${esc(s.visual || '').slice(0, 40)}</small></div>`}
        <span class="badge-tl">#${s.n} ${esc(s.stage)}</span>
      </div>
      <div class="narr">${esc(s.narration)}</div>
      <div class="row between">
        <span class="tag ${a ? 'accent' : ''}">${a ? `🔊 ${a.duration.toFixed(1)}초` : '🔇 음성 없음'}</span>
        <div class="row" style="gap:4px">
          <button class="btn btn-xs" data-img="${s.n}" type="button" title="AI 이미지 생성">${icon.spark}</button>
          <label class="btn btn-xs" title="파일 올리기">${icon.upload}<input type="file" accept="image/*,video/*" data-file="${s.n}" hidden></label>
          ${m ? `<button class="btn btn-xs btn-danger" data-rm="${s.n}" type="button" title="소재 삭제">${icon.trash}</button>` : ''}
        </div>
      </div>
    </article>`;
  }
  function refreshCard(n) {
    const old = $(`.prod[data-n="${n}"]`, root); if (!old) return;
    const s = S.plan.scenes.find(x => x.n === n);
    old.outerHTML = prodCard(S.plan, s);
    updateBadges();
  }

  async function setMedia(n, blob, type, source) {
    const p = S.plan;
    await App.db.set(`media:${p.id}:${n}`, { blob, type, source });
    if (S.media[n]?.url) URL.revokeObjectURL(S.media[n].url);
    const url = URL.createObjectURL(blob); S.urls.push(url);
    S.media[n] = { blob, type, source, url };
    refreshCard(n);
  }
  async function aiImage(s) {
    const p = S.plan;
    const prompt = s.image_prompt || `${s.visual || s.narration}. cinematic, high detail, no text`;
    const dataUrl = await App.ai.image(prompt, p.aspect);
    await setMedia(s.n, await App.dataURLToBlob(dataUrl), 'image', 'ai');
  }

  /* ───────── 작업 실행 ───────── */
  async function run(fn) {
    if (S.busy || !S.plan) return;
    ui.err($('#pdErr', root), '');
    S.busy = true; setButtons(true);
    try { await fn(); }
    catch (e) { console.error(e); ui.err($('#pdErr', root), App.ai.friendly(e)); prog(''); }
    finally { S.busy = false; setButtons(false); }
  }
  const setButtons = on => ['#pdAll', '#pdImgs', '#pdTts', '#pdRender'].forEach(id => { $(id, root).disabled = on; });
  function prog(title, pct, sub) {
    const el = $('#pdProg', root); if (!el) return;
    el.innerHTML = title ? `<b style="font-size:13.5px">${esc(title)}</b><div class="bar"><i style="width:${Math.round(pct || 0)}%"></i></div>${sub ? `<span class="hint">${esc(sub)}</span>` : ''}` : '';
  }
  async function genImages() {
    const p = S.plan; const todo = p.scenes.filter(s => !S.media[s.n]);
    if (!todo.length) return App.toast('모든 씬에 소재가 있습니다');
    if (!App.requireKey()) return;
    for (const [k, s] of todo.entries()) {
      prog('AI 이미지 생성', (k / todo.length) * 100, `${s.n}번 씬 (${k + 1}/${todo.length})`);
      const box = $(`.prod[data-n="${s.n}"] .media`, root); box?.classList.add('loading');
      try { await aiImage(s); }
      catch (e) { box?.classList.remove('loading'); if (e.status === 401 || e.status === 403) throw e; App.toast(`${s.n}번 씬 이미지 실패: ${App.ai.friendly(e).slice(0, 60)}`, true); }
    }
    prog('AI 이미지 생성 완료', 100);
    updateBadges();
  }
  async function genAudio() {
    const p = S.plan; const todo = p.scenes.filter(s => !S.audio[s.n] || s.stale);
    if (!todo.length) return App.toast('모든 씬에 음성이 있습니다');
    if (!(await App.ensureVoiceReady(p))) return;
    for (const [k, s] of todo.entries()) {
      prog(App.isCloneVoice(p.voice) ? '내 목소리로 나레이션 생성 (Qwen3-TTS)' : 'AI 나레이션 생성', (k / todo.length) * 100, `${s.n}번 씬 (${k + 1}/${todo.length})`);
      const r = await App.narrate(s.narration, p);
      await App.db.set(`audio:${p.id}:${s.n}`, { blob: r.blob, duration: r.duration });
      S.audio[s.n] = { blob: r.blob, duration: r.duration };
      s.audio = true; s.stale = false; s.duration = Math.round(r.duration * 10) / 10;
      App.plans.put(p); refreshCard(s.n);
    }
    prog('나레이션 생성 완료', 100);
    updateBadges();
  }
  function updateBadges() {
    const p = S.plan; if (!p) return; const N = p.scenes.length;
    const imgs = p.scenes.filter(s => S.media[s.n]).length, auds = p.scenes.filter(s => S.audio[s.n]).length;
    const a = $('#pdImgCnt', root), b = $('#pdAudCnt', root);
    if (a) { a.textContent = `이미지 ${imgs}/${N}`; a.className = 'vchk ' + (imgs === N ? 'ok' : 'warn'); }
    if (b) { b.textContent = `음성 ${auds}/${N}`; b.className = 'vchk ' + (auds === N ? 'ok' : 'warn'); }
  }
  async function oneClick() {
    await run(async () => {
      if (!App.requireKey()) return;
      await genImages(); await genAudio(); await renderVideo();
    });
  }

  /* ───────── 렌더링 ───────── */
  const loadImg = url => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('이미지를 불러오지 못했습니다')); i.src = url; });
  const loadVid = url => new Promise((res, rej) => { const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.loop = true; v.preload = 'auto'; v.onloadeddata = () => res(v); v.onerror = () => rej(new Error('영상 소재를 불러오지 못했습니다')); v.src = url; });
  function pickMime() {
    const c = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4;codecs=avc1,mp4a', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
    return c.find(t => window.MediaRecorder && MediaRecorder.isTypeSupported(t)) || '';
  }
  function wrapLines(ctx, text, maxW) {
    const words = String(text).replace(/\s+/g, ' ').trim().split(' '); const lines = []; let cur = '';
    for (const w of words) {
      const t = cur ? cur + ' ' + w : w;
      if (ctx.measureText(t).width <= maxW) { cur = t; continue; }
      if (cur) lines.push(cur);
      if (ctx.measureText(w).width > maxW) { let part = ''; for (const ch of w) { if (ctx.measureText(part + ch).width > maxW) { lines.push(part); part = ch; } else part += ch; } cur = part; }
      else cur = w;
    }
    if (cur) lines.push(cur);
    return lines;
  }

  async function renderVideo() {
    const p = S.plan;
    if (!window.MediaRecorder) throw new Error('이 브라우저는 영상 녹화(MediaRecorder)를 지원하지 않습니다. 최신 Chrome / Edge를 사용해주세요.');
    const res = +ui.segVal(root, 'pdRes') || 1080;
    const W = p.aspect === '16:9' ? Math.round(res * 16 / 9) : res, H = p.aspect === '16:9' ? res : Math.round(res * 16 / 9);
    const opt = { sub: $('#pdSub', root).checked, kb: $('#pdKb', root).checked, fade: $('#pdFade', root).checked, vol: +$('#pdBgmVol', root).value / 100, duck: $('#pdDuck', root).checked };
    prog('소재 준비 중', 2);
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    const items = [];
    for (const s of p.scenes) {
      const m = S.media[s.n]; let el = null;
      if (m) el = m.type === 'video' ? await loadVid(m.url) : await loadImg(m.url);
      let buf = null;
      if (S.audio[s.n]) { try { buf = await ac.decodeAudioData(await S.audio[s.n].blob.arrayBuffer()); } catch (e) { console.warn(e); } }
      items.push({ s, el, video: m?.type === 'video', buf, dur: buf ? Math.max(2, buf.duration + 0.45) : p.sceneSec });
    }
    let t = 0; items.forEach(it => { it.start = t; t += it.dur; });
    const total = t + 0.3;

    // 캔버스 + 자막 준비
    const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
    const g = canvas.getContext('2d');
    const fs = Math.round((p.aspect === '9:16' ? W * 0.058 : H * 0.05));
    g.font = `800 ${fs}px 'Pretendard Variable', Pretendard, 'Malgun Gothic', sans-serif`;
    items.forEach(it => {
      const lines = wrapLines(g, it.s.narration, W * (p.aspect === '9:16' ? 0.82 : 0.78));
      const caps = []; for (let i = 0; i < lines.length; i += 2) caps.push(lines.slice(i, i + 2));
      const tot = caps.reduce((n, c) => n + c.join('').length, 0) || 1; const span = it.buf ? it.buf.duration : it.dur;
      let acc = 0; it.caps = caps.map(c => { const st = acc; acc += (c.join('').length / tot) * span; return { lines: c, start: st, end: acc }; });
    });
    const stage = $('#pdStage', root); stage.innerHTML = ''; stage.appendChild(canvas);
    canvas.style.cssText = 'width:100%;height:auto;max-height:70vh;object-fit:contain';

    // 오디오 그래프
    const dest = ac.createMediaStreamDestination();
    const voice = ac.createGain(); voice.connect(dest);
    let bgmSrc = null, bgmGain = null;
    if (S.bgm) {
      try {
        const bb = await ac.decodeAudioData(await S.bgm.arrayBuffer());
        bgmSrc = ac.createBufferSource(); bgmSrc.buffer = bb; bgmSrc.loop = true;
        bgmGain = ac.createGain(); bgmSrc.connect(bgmGain).connect(dest);
      } catch { App.toast('BGM 파일을 읽지 못해 제외합니다', true); }
    }
    const vstream = canvas.captureStream(30);
    const stream = new MediaStream([...vstream.getVideoTracks(), ...dest.stream.getAudioTracks()]);
    const mime = pickMime();
    const rec = new MediaRecorder(stream, { mimeType: mime || undefined, videoBitsPerSecond: res >= 1080 ? 8e6 : 5e6, audioBitsPerSecond: 160000 });
    const chunks = []; rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    const stopped = new Promise(r => { rec.onstop = r; });

    await ac.resume();
    const t0 = ac.currentTime + 0.25;
    items.forEach(it => { if (it.buf) { const src = ac.createBufferSource(); src.buffer = it.buf; src.connect(voice); src.start(t0 + it.start + 0.15); } });
    if (bgmSrc) {
      const gg = bgmGain.gain; gg.setValueAtTime(opt.vol, t0);
      if (opt.duck) items.forEach(it => { if (!it.buf) return; const a = t0 + it.start + 0.1, b = a + it.buf.duration + 0.1; gg.setTargetAtTime(opt.vol * 0.3, a - 0.2, 0.08); gg.setTargetAtTime(opt.vol, b, 0.25); });
      gg.setTargetAtTime(0, t0 + total - 1.2, 0.35);
      bgmSrc.start(t0);
    }

    const drawMedia = (it, local, alpha, idx) => {
      g.globalAlpha = alpha;
      if (!it.el) {
        const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, `hsl(${App.config.theme?.hue ?? 174} 70% 14%)`); gr.addColorStop(1, `hsl(${App.config.theme?.hue ?? 174} 80% 5%)`);
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
        g.fillStyle = 'rgba(255,255,255,.18)'; g.textAlign = 'center'; g.font = `700 ${Math.round(fs * 0.7)}px sans-serif`; g.fillText(`#${it.s.n} ${it.s.stage}`, W / 2, H * 0.3);
      } else {
        const sw = it.video ? it.el.videoWidth : it.el.naturalWidth, sh = it.video ? it.el.videoHeight : it.el.naturalHeight;
        if (sw && sh) {
          const prog = Math.min(1, Math.max(0, local / it.dur));
          const k = opt.kb && !it.video ? 1.04 + 0.1 * prog : 1;
          const sc = Math.max(W / sw, H / sh) * k; const dw = sw * sc, dh = sh * sc;
          const dir = idx % 2 ? -1 : 1; const dx = opt.kb && !it.video ? dir * (prog - 0.5) * (dw - W) * 0.8 : 0;
          g.drawImage(it.el, (W - dw) / 2 + dx, (H - dh) / 2, dw, dh);
        }
      }
      g.globalAlpha = 1;
    };
    const drawSub = (it, local) => {
      const c = it.caps.find(x => local - 0.15 >= x.start && local - 0.15 < x.end + 0.25) || null; if (!c) return;
      g.font = `800 ${fs}px 'Pretendard Variable', Pretendard, 'Malgun Gothic', sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      const lh = fs * 1.32; const baseY = p.aspect === '9:16' ? H * 0.70 : H * 0.86;
      c.lines.forEach((ln, i) => {
        const y = baseY + (i - (c.lines.length - 1) / 2) * lh;
        g.lineJoin = 'round'; g.lineWidth = fs * 0.2; g.strokeStyle = 'rgba(0,0,0,.85)'; g.strokeText(ln, W / 2, y);
        g.fillStyle = '#fff'; g.fillText(ln, W / 2, y);
      });
    };

    S.cancel = false;
    const onHide = () => { if (document.hidden) App.toast('렌더링 중에는 이 탭을 띄워두세요. 화면이 멈출 수 있습니다.', true); };
    document.addEventListener('visibilitychange', onHide);
    rec.start(500);
    let active = -1;
    await new Promise(resolve => {
      const tick = () => {
        const now = ac.currentTime - t0;
        if (now >= total || S.cancel) return resolve();
        const tt = Math.max(0, now);
        let idx = items.findIndex(it => tt >= it.start && tt < it.start + it.dur); if (idx < 0) idx = items.length - 1;
        const it = items[idx], local = tt - it.start;
        if (idx !== active) { if (items[active]?.video) items[active].el.pause(); active = idx; if (it.video) { it.el.currentTime = 0; it.el.play().catch(() => {}); } }
        g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
        const FD = 0.5;
        if (opt.fade && idx > 0 && local < FD) { drawMedia(items[idx - 1], items[idx - 1].dur, 1, idx - 1); drawMedia(it, local, local / FD, idx); }
        else drawMedia(it, local, 1, idx);
        if (opt.sub) drawSub(it, local);
        prog('영상 합성 중 (실시간)', (tt / total) * 100, `${App.fmtTime(tt)} / ${App.fmtTime(total)} · ${idx + 1}번 씬`);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    rec.stop(); await stopped;
    document.removeEventListener('visibilitychange', onHide);
    items.forEach(it => { if (it.video) it.el.pause(); });
    try { bgmSrc && bgmSrc.stop(); } catch {}
    ac.close();
    const type = (mime || 'video/webm').split(';')[0];
    const blob = new Blob(chunks, { type });
    if (S.out?.url) URL.revokeObjectURL(S.out.url);
    S.out = { blob, url: URL.createObjectURL(blob), ext: type.includes('mp4') ? 'mp4' : 'webm', duration: total, planId: p.id };
    prog('');
    render();
    App.toast('영상을 완성했습니다');
    $('#pdRenderBox', root)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ───────── 유튜브 업로드 ───────── */
  function loadGis() {
    return new Promise((res, rej) => {
      if (window.google?.accounts?.oauth2) return res();
      let s = document.getElementById('gisScript');
      if (!s) { s = document.createElement('script'); s.id = 'gisScript'; s.src = 'https://accounts.google.com/gsi/client'; s.async = true; document.head.appendChild(s); }
      s.addEventListener('load', () => res()); s.addEventListener('error', () => rej(new Error('Google 로그인 스크립트를 불러오지 못했습니다.')));
    });
  }
  async function getToken() {
    if (S.token && S.token.exp > Date.now()) return S.token.v;
    await loadGis();
    return new Promise((res, rej) => {
      const c = google.accounts.oauth2.initTokenClient({
        client_id: App.settings.oauth, scope: 'https://www.googleapis.com/auth/youtube.upload',
        callback: r => { if (r.error) return rej(new Error(r.error_description || r.error)); S.token = { v: r.access_token, exp: Date.now() + ((r.expires_in || 3600) - 60) * 1000 }; res(r.access_token); },
        error_callback: e => rej(new Error(e?.type === 'popup_closed' ? '로그인 창이 닫혔습니다.' : (e?.message || '구글 로그인에 실패했습니다.'))),
      });
      c.requestAccessToken();
    });
  }
  async function upload(btn) {
    const msg = $('#upMsg', root);
    const file = $('#upFile', root).files[0];
    const blob = file || S.out?.blob;
    if (!blob) return ui.err(msg, '업로드할 영상이 없습니다. 먼저 영상을 합성하거나 파일을 선택해주세요.');
    const title = $('#upTitle', root).value.trim();
    if (!title) return ui.err(msg, '제목을 입력해주세요.');
    ui.busy(btn, true, '구글 로그인');
    try {
      const tok = await getToken();
      btn.innerHTML = '<span class="spin"></span> 업로드 준비';
      const meta = {
        snippet: { title: title.slice(0, 100), description: $('#upDesc', root).value.slice(0, 4900), tags: App.toList($('#upTags', root).value).map(x => x.trim()).filter(Boolean).slice(0, 30), categoryId: $('#upCat', root).value },
        status: { privacyStatus: ui.segVal(root, 'upPriv') || 'private', selfDeclaredMadeForKids: false },
      };
      const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': blob.type || 'video/webm', 'X-Upload-Content-Length': String(blob.size) },
        body: JSON.stringify(meta),
      });
      if (!init.ok) { let m = `HTTP ${init.status}`; try { m = (await init.json()).error.message; } catch {} if (init.status === 401) S.token = null; throw new Error(m); }
      const loc = init.headers.get('Location'); if (!loc) throw new Error('업로드 주소를 받지 못했습니다.');
      const out = await new Promise((res, rej) => {
        const x = new XMLHttpRequest(); x.open('PUT', loc); x.setRequestHeader('Content-Type', blob.type || 'video/webm');
        x.upload.onprogress = e => { if (e.lengthComputable) { const pc = Math.round(e.loaded / e.total * 100); btn.innerHTML = `<span class="spin"></span> 업로드 ${pc}%`; msg.innerHTML = `<div class="bar" style="margin-top:10px"><i style="width:${pc}%"></i></div>`; } };
        x.onload = () => { if (x.status >= 200 && x.status < 300) { try { res(JSON.parse(x.responseText)); } catch { res({}); } } else { let m = `HTTP ${x.status}`; try { m = JSON.parse(x.responseText).error.message; } catch {} rej(new Error(m)); } };
        x.onerror = () => rej(new Error('네트워크 오류로 업로드가 중단되었습니다.'));
        x.send(blob);
      });
      const url = out.id ? `https://youtu.be/${out.id}` : '';
      msg.innerHTML = `<div class="note" style="margin-top:10px">✅ <span>업로드 완료! ${url ? `<a href="${url}" target="_blank" rel="noopener">${url}</a> · <a href="https://studio.youtube.com/video/${out.id}/edit" target="_blank" rel="noopener">스튜디오에서 열기 ↗</a>` : ''}</span></div>`;
      App.toast('유튜브 업로드 완료');
    } catch (e) { console.error(e); ui.err(msg, '업로드 실패: ' + e.message); }
    finally { ui.busy(btn, false); }
  }

  /* ───────── 이벤트 ───────── */
  async function onClick(e) {
    const go = e.target.closest('[data-go]'); if (go) return App.go(go.dataset.go);
    if (!S.plan) return;
    const im = e.target.closest('[data-img]');
    if (im) {
      if (S.busy || !App.requireKey()) return;
      const n = +im.dataset.img; const s = S.plan.scenes.find(x => x.n === n);
      const box = $(`.prod[data-n="${n}"] .media`, root); box?.classList.add('loading'); ui.busy(im, true, '');
      try { await aiImage(s); App.toast(`${n}번 씬 이미지 생성`); }
      catch (er) { App.toast(App.ai.friendly(er), true); box?.classList.remove('loading'); ui.busy(im, false); }
      return;
    }
    const rm = e.target.closest('[data-rm]');
    if (rm) { const n = +rm.dataset.rm; await App.db.del(`media:${S.plan.id}:${n}`); delete S.media[n]; return refreshCard(n); }
    const act = e.target.closest('[data-act]'); if (!act) return;
    switch (act.dataset.act) {
      case 'dl-video': return S.out && App.download(`${App.slug(S.plan.title)}.${S.out.ext}`, S.out.blob);
      case 'settings': return App.openSettings();
      case 'upload': return upload(act);
    }
  }
  async function useFile(n, f) {
    if (!f) return;
    const type = f.type.startsWith('video') ? 'video' : f.type.startsWith('image') ? 'image' : null;
    if (!type) return App.toast('이미지 또는 영상 파일만 사용할 수 있습니다', true);
    if (f.size > 200 * 1048576) return App.toast('200MB 이하 파일만 사용할 수 있습니다', true);
    await setMedia(n, f, type, 'upload');
  }
  function onFile(e) { const inp = e.target.closest('[data-file]'); if (inp) useFile(+inp.dataset.file, inp.files[0]); }
  function onDrag(e) {
    const box = e.target.closest('[data-drop]'); if (!box) return;
    e.preventDefault();
    if (e.type === 'dragover') box.classList.add('drop');
    else box.classList.remove('drop');
    if (e.type === 'drop') useFile(+box.dataset.drop, e.dataTransfer.files[0]);
  }

  App.on('settings', () => { if (S.plan && root && App.state.tab === 'produce' && !S.busy) render(); });
  App.register('produce', { mount, show });
})();
