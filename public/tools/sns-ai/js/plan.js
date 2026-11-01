/* ==========================================================================
   02 기획 · 나레이션 — 주제(+벤치마크 분석) → 제목·설명 → 5단계 씬 대본 → 교정 → 영상/이미지 프롬프트 → AI 나레이션
   ========================================================================== */
(function () {
  'use strict';
  const { $, $$, esc, icon, ui } = App;
  const D = App.config.defaults || {};
  const S = { plan: null, busy: false, urls: [] };
  let root, saveT;

  const LANGS = { ko: { name: '한국어', cps: 6.6 }, en: { name: 'English', cps: 15 }, ja: { name: '日本語', cps: 7.5 } };
  const STAGES = ['도입', '갈등', '난제', '반전', '여운'];
  const REDLINE = 'realistic 3D miniature diorama, tilt-shift macro photography, faceless white mannequin workers, thin red engineering-diagram overlay lines with tiny annotations, soft studio lighting, ultra detailed, no text, no letters';
  const ASPECT_GUIDE = {
    '16:9': 'wide cinematic horizontal 16:9 composition',
    '9:16': 'vertical 9:16 composition, main subject centered in the middle safe area, empty space top and bottom',
  };
  const bounds = (sec, lang) => { const t = Math.round(sec * (LANGS[lang] || LANGS.ko).cps); return { min: Math.round(t * 0.79), target: t, max: Math.round(t * 1.29) }; };
  const stageOf = (i, n) => STAGES[Math.min(4, Math.floor((i / n) * 5))];

  function mount(el) {
    root = el;
    el.innerHTML = `
      ${ui.pageHead('STEP 02 · PLANNING & NARRATION', '주제 하나로 <span class="grad">대본 · 프롬프트 · 나레이션</span>까지',
        '제목 3안과 설명란, <b>도입 → 갈등 → 난제 → 반전 → 여운</b> 5단계 씬 대본, 영상/이미지 생성 프롬프트, AI 음성 나레이션을 한 번에 만듭니다.')}
      <div class="grid-side">
        <aside class="panel pad sticky" id="plForm">
          <div class="field"><label for="plTopic">영상 주제 <span class="req">*</span></label>
            <textarea id="plTopic" class="textarea" rows="2" style="min-height:64px" placeholder="예: 서울 지하철은 왜 한강 밑을 지나갈 수 있을까"></textarea></div>
          <div class="field"><label for="plRef">벤치마크 분석 <span class="opt">선택</span></label>
            <select id="plRef" class="select"></select>
            <span class="hint">① 영상 분석 결과의 제목 공식·전개 구조를 그대로 적용합니다.</span></div>
          <div class="field"><span class="lbl">화면 비율</span>${ui.seg('plAspect', [['9:16', '9:16', '쇼츠·릴스'], ['16:9', '16:9', '롱폼']], D.aspect || '9:16')}</div>
          <div class="field"><span class="lbl">씬 길이</span>${ui.seg('plSec', [['8', '8초', 'Veo·Kling'], ['15', '15초'], ['20', '20초']], String(D.sceneSeconds || 8))}</div>
          <div class="f2">
            <div class="field"><label for="plScenes">씬 개수</label><input id="plScenes" class="input" type="number" min="3" max="40" value="${D.scenes || 6}"></div>
            <div class="field"><label for="plLang">나레이션 언어</label><select id="plLang" class="select">${ui.options(Object.entries(LANGS).map(([k, v]) => [k, v.name]), D.lang || 'ko')}</select></div>
          </div>
          <div class="field"><label for="plVoice">나레이션 음성</label>
            <div class="keyrow"><select id="plVoice" class="select">${App.voiceOptions(D.voice || 'Kore')}</select>
              <button id="plMyVoice" class="btn btn-sm btn-soft" type="button" title="내 목소리 등록 (Qwen3-TTS 보이스 클로닝)">${icon.mic}내 목소리</button></div>
            <span class="hint" id="plVoiceHint"></span></div>
          <details class="more"><summary>고급 설정</summary><div class="inner">
            <div class="field"><label for="plVStyle">말투 지시 <span class="opt">선택</span></label><input id="plVStyle" class="input" placeholder="예: 차분한 다큐멘터리 내레이터처럼, 약간 빠르게"></div>
            <div class="field"><label for="plStyle">이미지 스타일 가이드 <span class="opt">선택</span></label>
              <textarea id="plStyle" class="textarea" rows="3" style="min-height:70px" placeholder="비우면 기본: 3D 미니어처 디오라마 + 레드라인 도면 스타일"></textarea></div>
            <div class="field"><label for="plGuide">대본 추가 지시 <span class="opt">선택</span></label>
              <textarea id="plGuide" class="textarea" rows="2" style="min-height:60px" placeholder="예: 첫 문장은 질문으로, 숫자를 자주 사용"></textarea></div>
          </div></details>
          <label class="check" style="margin-bottom:8px"><input type="checkbox" id="plProof" checked> AI 맞춤법·문장 교정</label>
          <label class="check" style="margin-bottom:16px"><input type="checkbox" id="plTts" checked> 나레이션 음성까지 생성</label>
          <button id="plGen" class="btn btn-primary btn-block" type="button">${icon.spark}기획 자동 생성</button>
          <div style="text-align:center"><button id="plSample" class="link-btn" type="button">샘플 기획 보기</button></div>
          <div id="plErr"></div>
          <div class="sec-title" style="margin-top:22px">기획 기록</div>
          <select id="plHist" class="select"></select>
        </aside>
        <section id="plOut" class="col" aria-live="polite"></section>
      </div>`;
    $('#plGen', el).addEventListener('click', generate);
    $('#plSample', el).addEventListener('click', () => { S.plan = App.plans.put(sample()); render(); });
    $('#plHist', el).addEventListener('change', e => { const p = App.plans.get(e.target.value); if (p) { S.plan = p; render(); } e.target.value = ''; });
    $('#plOut', el).addEventListener('click', onClick);
    $('#plOut', el).addEventListener('input', onInput);
    App.on('coll:plans', fillHist);
    App.on('coll:analyses', fillRef);
    App.on('coll:voices', () => { fillVoices(); if (S.plan && !S.busy) render(); });
    $('#plMyVoice', el).addEventListener('click', () => App.openVoiceModal(id => { fillVoices('clone:' + id); }));
    $('#plVoice', el).addEventListener('change', voiceHint);
    fillRef(); fillHist(); voiceHint();
    const last = App.plans.list()[0];
    if (last) { S.plan = last; render(); } else renderEmpty();
  }
  function show(p) {
    if (p?.reference) {
      fillRef(); $('#plRef', root).value = p.reference;
      const a = App.analyses.get(p.reference);
      if (a && !$('#plTopic', root).value.trim()) $('#plTopic', root).value = a.visual?.channel_strategy?.recommended_new_channel_topic || '';
      $('#plTopic', root).focus();
    }
    if (p?.topic) $('#plTopic', root).value = p.topic;
  }
  function fillRef() {
    const sel = $('#plRef', root); const cur = sel.value;
    sel.innerHTML = '<option value="">없음 (주제만으로 기획)</option>' + App.analyses.list().map(a => `<option value="${esc(a.id)}">${esc((a.info.title || a.id).slice(0, 44))}</option>`).join('');
    sel.value = cur;
  }
  function fillVoices(pick) {
    const sel = $('#plVoice', root); const cur = pick || sel.value;
    sel.innerHTML = App.voiceOptions(cur); if (pick) sel.value = pick;
    voiceHint();
  }
  function voiceHint() {
    const v = $('#plVoice', root).value;
    $('#plVoiceHint', root).innerHTML = App.isCloneVoice(v)
      ? (App.settings.voiceEngine === 'cloud' ? '🎙️ ☁️ 클라우드(내 DashScope 키)로 내 목소리를 합성합니다 (말투 지시는 적용되지 않음).' : '🎙️ 내 PC의 Qwen3-TTS 서버로 내 목소리를 합성합니다 (말투 지시는 적용되지 않음).')
      : 'Gemini AI 음성 · <b>내 목소리</b> 버튼으로 녹음하면 내 목소리로 나레이션할 수 있습니다.';
  }
  function fillHist() {
    const l = App.plans.list();
    $('#plHist', root).innerHTML = `<option value="">저장된 기획 (${l.length})</option>` + l.map(p => `<option value="${esc(p.id)}">${esc(p.title.slice(0, 40))} · ${App.fmtDate(p.created_at)}</option>`).join('');
  }
  function renderEmpty() {
    ui.empty($('#plOut', root), { icon: 'doc', title: '기획부터 음성까지 자동으로', text: '주제를 입력하고 <b>기획 자동 생성</b>을 누르세요. 벤치마크 분석을 고르면 흥행 공식을 반영합니다.',
      items: ['제목 3안', '설명란 · 해시태그', '5단계 씬 대본', 'AI 교정', '영상 프롬프트', '이미지 프롬프트', 'AI 나레이션', '전체 음성 WAV'] });
  }

  function refContext(a) {
    if (!a) return '';
    const v = a.visual || {};
    return `[벤치마크 영상 분석 — 구조와 공식만 참고하고 내용은 베끼지 말 것]
- 원본 제목: ${a.info.title || ''}
- 제목 공식: ${v.title_formula || ''}
- 훅 기제: ${v.hook?.mechanism || ''}
- 전개: ${(v.stages || []).map(s => `${s.name}(${s.summary})`).join(' → ')}
- 적용 포인트: ${(v.tips || []).map(t => `${t.title}: ${t.template}`).join(' / ')}`;
  }

  /* ───────── 생성 파이프라인 ───────── */
  async function generate() {
    if (S.busy) return;
    ui.err($('#plErr', root), '');
    const topic = $('#plTopic', root).value.trim();
    if (!topic) { $('#plTopic', root).classList.add('invalid'); $('#plTopic', root).focus(); return; }
    $('#plTopic', root).classList.remove('invalid');
    if (!App.requireKey('text')) return;
    const cfg = {
      topic, reference: $('#plRef', root).value || null,
      aspect: ui.segVal(root, 'plAspect') || '9:16', sceneSec: +ui.segVal(root, 'plSec') || 8,
      count: Math.max(3, Math.min(40, parseInt($('#plScenes', root).value, 10) || 6)),
      lang: $('#plLang', root).value, voice: $('#plVoice', root).value, voiceStyle: $('#plVStyle', root).value.trim(),
      style: $('#plStyle', root).value.trim(), guide: $('#plGuide', root).value.trim(),
      proof: $('#plProof', root).checked, tts: $('#plTts', root).checked,
    };
    const ref = cfg.reference ? App.analyses.get(cfg.reference) : null;
    if (cfg.tts && !(await App.ensureVoiceReady(cfg))) return; // Gemini 음성이면 키 확인, 내 목소리면 서버/클라우드 확인
    const b = bounds(cfg.sceneSec, cfg.lang);
    const langName = LANGS[cfg.lang].name;
    const steps = ['제목 · 설명란 기획', `씬 대본 작성 (${cfg.count}개)`, ...(cfg.proof ? ['AI 교정'] : []), '영상 · 이미지 프롬프트', ...(cfg.tts ? ['AI 나레이션 음성'] : [])];
    const out = $('#plOut', root); const btn = $('#plGen', root);
    let k = 0; const step = (sub) => ui.progress(out, '기획 생성 중', steps, k, sub);
    S.busy = true; ui.busy(btn, true, '생성 중');
    const SYS = 'You are a top YouTube scriptwriter and content strategist. Reply with valid JSON only.';
    try {
      // 1) 메타
      step();
      const meta = (await App.ai.json({ system: SYS, temperature: 0.85, prompt: `유튜브 ${cfg.aspect === '9:16' ? '쇼츠(세로)' : '롱폼(가로)'} 영상을 기획합니다. 총 길이 약 ${cfg.count * cfg.sceneSec}초.
주제: ${topic}
${refContext(ref)}
${cfg.guide ? '추가 지시: ' + cfg.guide : ''}
모든 텍스트는 ${langName}로 작성합니다. 제목은 40자 이내, 클릭을 부르되 낚시성 허위는 금지.
JSON 형식:
{"titles":[{"type":"대비형","text":"","reason":"한 줄"},{"type":"수치형","text":"","reason":""},{"type":"선언형","text":"","reason":""}],
 "recommended":0, "logline":"기획 의도 한 문장",
 "description":{"summary":"영상 요약 2~3문장","insight":"시청자가 얻는 핵심 인사이트 1~2문장","cta":"구독·댓글 유도 한 문장","hashtags":["#태그1","#태그2","#태그3","#태그4","#태그5"]}}` })).data;
      const titles = (Array.isArray(meta.titles) ? meta.titles : []).filter(t => t && t.text).slice(0, 3).map(t => ({ type: App.str(t.type, 10), text: App.str(t.text, 100), reason: App.str(t.reason, 160) }));
      if (!titles.length) titles.push({ type: '기본', text: topic.slice(0, 60), reason: '' });
      const rec = Math.max(0, Math.min(titles.length - 1, parseInt(meta.recommended, 10) || 0));
      const d = meta.description || {};
      const plan = {
        id: App.uid('plan'), created_at: Date.now(), ...cfg, title: titles[rec].text, titles, recommended: rec,
        logline: App.str(meta.logline, 200),
        description: { summary: App.str(d.summary, 600), insight: App.str(d.insight, 400), cta: App.str(d.cta, 200), hashtags: App.toList(d.hashtags).map(h => '#' + String(h).trim().replace(/^#/, '')).filter(h => h.length > 1).slice(0, 10) },
        scenes: [],
      };

      // 2) 씬 (8개씩)
      k++;
      for (let from = 0; from < cfg.count; from += 8) {
        const to = Math.min(cfg.count, from + 8);
        step(`${from + 1}~${to}번 씬`);
        const prev = plan.scenes.slice(-2).map(s => `#${s.n} ${s.narration}`).join('\n');
        const plan5 = Array.from({ length: to - from }, (_, j) => `씬${from + j + 1}: ${stageOf(from + j, cfg.count)}`).join(', ');
        const r = (await App.ai.json({ system: SYS, temperature: 0.8, maxTokens: 8192, prompt: `영상 제목: ${plan.title}
기획 의도: ${plan.logline}
주제: ${topic}
${refContext(ref)}
전체 ${cfg.count}개 씬 중 ${from + 1}~${to}번 씬을 작성하세요. 씬 1개 = ${cfg.sceneSec}초.
- 나레이션은 ${langName}, 씬마다 ${b.min}~${b.max}자 (목표 ${b.target}자). 소리 내어 읽기 자연스러운 구어체.
- 5단계 배치: ${plan5}
- 첫 씬은 3초 안에 호기심을 거는 훅, 마지막 씬은 여운과 질문으로 마무리.
- 사실이 불확실한 수치는 쓰지 말 것. 앞 씬과 자연스럽게 이어질 것.
${prev ? '[직전 씬]\n' + prev : ''}
${cfg.guide ? '추가 지시: ' + cfg.guide : ''}
JSON: {"scenes":[{"n":${from + 1},"stage":"도입","narration":"","visual":"화면에 보일 장면 설명 (한국어 1문장)"}]}` })).data;
        const list = Array.isArray(r.scenes) ? r.scenes : (Array.isArray(r) ? r : []);
        for (let j = 0; j < to - from; j++) {
          const s = list[j] || {};
          plan.scenes.push({ n: from + j + 1, stage: App.str(s.stage || stageOf(from + j, cfg.count), 6), narration: App.str(s.narration, 600), visual: App.str(s.visual, 300), video_prompt: '', image_prompt: '' });
        }
      }
      if (plan.scenes.every(s => !s.narration)) throw new Error('AI가 씬 대본을 만들지 못했습니다. 다시 시도해주세요.');

      // 3) 교정
      if (cfg.proof) {
        k++; step('맞춤법 · 어색한 표현');
        try {
          const r = (await App.ai.json({ system: SYS, temperature: 0.2, prompt: `다음 ${langName} 나레이션을 교정하세요. 맞춤법·띄어쓰기·어색한 표현만 최소한으로 고치고, 내용·톤·길이는 유지합니다. 씬마다 ${b.max}자를 넘으면 줄이세요.
${plan.scenes.map(s => `#${s.n} ${s.narration}`).join('\n')}
JSON: {"scenes":[{"n":1,"narration":""}]}` })).data;
          (r.scenes || []).forEach(x => { const s = plan.scenes.find(y => y.n === +x.n); if (s && x.narration && String(x.narration).length > s.narration.length * 0.6) s.narration = App.str(x.narration, 600); });
        } catch (e) { if (e.status === 401 || e.status === 403) throw e; console.warn('교정 생략', e); }
      }

      // 4) 프롬프트
      k++;
      const style = cfg.style || REDLINE;
      for (let from = 0; from < plan.scenes.length; from += 8) {
        const chunk = plan.scenes.slice(from, from + 8);
        step(`${from + 1}~${from + chunk.length}번 씬`);
        try {
          const r = (await App.ai.json({ system: SYS, temperature: 0.6, prompt: `For each scene, write two English prompts.
- video_prompt: for AI video tools (Runway / Kling / Veo). ${cfg.sceneSec}-second shot. Describe subject, action, camera movement, lighting, mood. ${ASPECT_GUIDE[cfg.aspect]}. Under 60 words.
- image_prompt: a single still frame for an image model. Visual style: ${style}. ${ASPECT_GUIDE[cfg.aspect]}. No text or letters in the image. Under 70 words.
Scenes:
${chunk.map(s => `#${s.n} [${s.stage}] narration: ${s.narration} | visual: ${s.visual}`).join('\n')}
JSON: {"scenes":[{"n":${chunk[0].n},"video_prompt":"","image_prompt":""}]}` })).data;
          (r.scenes || []).forEach((x, j) => { const s = plan.scenes.find(y => y.n === +x.n) || chunk[j]; if (s) { s.video_prompt = App.str(x.video_prompt, 900); s.image_prompt = App.str(x.image_prompt, 900); } });
        } catch (e) { if (e.status === 401 || e.status === 403) throw e; console.warn('프롬프트 생략', e); }
      }
      plan.scenes.forEach(s => { if (!s.image_prompt) s.image_prompt = `${s.visual}. ${style}. ${ASPECT_GUIDE[cfg.aspect]}`; });
      S.plan = App.plans.put(plan);

      // 5) 음성
      if (cfg.tts) {
        k++;
        for (const s of plan.scenes) {
          step(`${s.n} / ${plan.scenes.length}번 씬 음성`);
          try { await makeAudio(plan, s); }
          catch (e) { if (e.status === 401 || e.status === 403) throw e; console.warn('TTS 실패', e); App.toast(`${s.n}번 씬 음성 실패: ${App.ai.friendly(e).slice(0, 60)}`, true); break; }
        }
        App.plans.put(plan);
      }
      render();
      App.toast('기획을 완성했습니다');
    } catch (e) {
      console.error(e); ui.err($('#plErr', root), App.ai.friendly(e));
      S.plan ? render() : renderEmpty();
    } finally { S.busy = false; ui.busy(btn, false); }
  }

  async function makeAudio(plan, s) {
    const r = await App.narrate(s.narration, plan);
    await App.db.set(`audio:${plan.id}:${s.n}`, { blob: r.blob, duration: r.duration });
    s.audio = true; s.duration = Math.round(r.duration * 10) / 10; s.stale = false;
  }

  /* ───────── 렌더링 ───────── */
  function render() {
    const p = S.plan; if (!p) return renderEmpty();
    S.urls.forEach(u => URL.revokeObjectURL(u)); S.urls = [];
    const b = bounds(p.sceneSec, p.lang);
    const d = p.description;
    const total = p.scenes.reduce((n, s) => n + (s.duration || p.sceneSec), 0);
    $('#plOut', root).innerHTML = `
      <div class="panel pad col" style="gap:14px">
        <div class="row between">
          <div class="row"><span class="tag accent">${esc(p.aspect)}</span><span class="tag">${p.scenes.length}씬 × ${p.sceneSec}초</span><span class="tag mono">≈ ${App.fmtTime(total)}</span><span class="tag">${esc(App.voiceLabel(p.voice))}</span></div>
          <div class="row">
            <button class="btn btn-sm" data-act="copy-all" type="button">${icon.copy}전체 복사</button>
            <button class="btn btn-sm" data-act="dl-md" type="button">${icon.dl}.md</button>
            <button class="btn btn-sm" data-act="dl-json" type="button">${icon.dl}JSON</button>
            <button class="btn btn-sm btn-danger" data-act="del" type="button" aria-label="삭제">${icon.trash}</button>
          </div>
        </div>
        ${p.logline ? `<div class="quote" style="font-size:14.5px">${esc(p.logline)}</div>` : ''}
        <div class="grid-2">
          <div class="col" style="gap:8px"><div class="sec-title" style="margin:0">제목 3안</div>
            <div class="titles">${p.titles.map((t, i) => `<div class="title-opt ${i === p.recommended ? 'rec' : ''}"><div class="tt"><b>${esc(t.text)}</b><span>${esc(t.type)}${i === p.recommended ? ' · ⭐ 추천' : ''} — ${esc(t.reason)}</span></div>
              <div class="row" style="flex-wrap:nowrap"><button class="btn btn-xs" data-pick-title="${i}" type="button" title="이 제목으로 선택">${icon.check}</button><button class="btn btn-xs" data-copy="${esc(t.text)}" type="button" aria-label="복사">${icon.copy}</button></div></div>`).join('')}</div>
          </div>
          <div class="col" style="gap:8px"><div class="sec-title" style="margin:0">설명란 <button class="btn btn-xs" data-act="copy-desc" type="button" style="margin-left:auto">${icon.copy}복사</button></div>
            <div class="box" style="max-height:220px">${esc(descText(p))}</div>
          </div>
        </div>
      </div>
      <div class="panel pad row between">
        <div class="col" style="gap:2px"><b>나레이션 음성</b><span class="hint" id="plAudioSum"></span></div>
        <div class="row">
          <select id="plCurVoice" class="select" style="width:auto;padding:7px 34px 7px 12px;font-size:12.5px" aria-label="이 기획의 나레이션 음성">${App.voiceOptions(p.voice)}</select>
          <button class="btn btn-sm btn-soft" data-act="my-voice" type="button">${icon.mic}내 목소리 등록</button>
          <button class="btn btn-sm" data-act="tts-missing" type="button">${icon.mic}누락·수정 음성 생성</button>
          <button class="btn btn-sm" data-act="dl-wav" type="button">${icon.dl}전체 음성 WAV</button>
          <button class="btn btn-primary" data-act="to-produce" type="button">${icon.film}③ 영상 제작으로</button>
        </div>
      </div>
      <div class="scenes">${p.scenes.map((s, i) => sceneCard(p, s, i, b)).join('')}</div>`;
    loadAudio();
  }
  const descText = p => { const d = p.description; return [d.summary, d.insight, d.cta, d.hashtags.join(' ')].filter(Boolean).join('\n\n'); };
  function countInfo(p, s, b) {
    const len = s.narration.length; const est = len / (LANGS[p.lang] || LANGS.ko).cps;
    return { len, est, bad: len > b.max || len < b.min };
  }
  function sceneCard(p, s, i, b) {
    const c = countInfo(p, s, b);
    return `<article class="panel scene card" data-i="${i}" style="animation-delay:${Math.min(i, 10) * 40}ms">
      <div class="scene-h"><span class="sn">#${String(s.n).padStart(2, '0')}</span><span class="tag accent">${esc(s.stage)}</span>
        <span class="count ${c.bad ? 'over' : ''}" data-cnt="${i}">${c.len}자 · ≈${c.est.toFixed(1)}초</span>
        <button class="btn btn-xs" style="margin-left:auto" data-copy="${esc(s.narration)}" type="button" aria-label="나레이션 복사">${icon.copy}</button></div>
      <textarea class="textarea" data-narr="${i}" rows="3" style="min-height:84px;font-weight:600" aria-label="${s.n}번 씬 나레이션">${esc(s.narration)}</textarea>
      ${s.visual ? `<div class="hint">🎬 ${esc(s.visual)}</div>` : ''}
      ${s.video_prompt ? `<div class="plabel">VIDEO PROMPT <button class="btn btn-xs" data-copy="${esc(s.video_prompt)}" type="button">${icon.copy}</button></div><div class="prompt-sm">${esc(s.video_prompt)}</div>` : ''}
      ${s.image_prompt ? `<div class="plabel">IMAGE PROMPT <button class="btn btn-xs" data-copy="${esc(s.image_prompt)}" type="button">${icon.copy}</button></div><div class="prompt-sm">${esc(s.image_prompt)}</div>` : ''}
      <div class="audio-row" data-audio="${i}">${audioRow(s, i)}</div>
    </article>`;
  }
  function audioRow(s, i, url) {
    const regen = `<button class="btn btn-xs" data-tts="${i}" type="button">${s.audio ? icon.redo + '다시' : icon.mic + '음성 생성'}</button>`;
    if (!s.audio) return `<span class="hint" style="flex:1">음성 없음</span>${regen}`;
    return `<audio controls preload="none" ${url ? `src="${url}"` : ''}></audio>${s.stale ? '<span class="vchk warn">수정됨</span>' : ''}${regen}`;
  }
  async function loadAudio() {
    const p = S.plan; let have = 0, dur = 0;
    for (const [i, s] of p.scenes.entries()) {
      if (!s.audio) continue;
      try {
        const r = await App.db.get(`audio:${p.id}:${s.n}`);
        if (!r) { s.audio = false; } else { const u = URL.createObjectURL(r.blob); S.urls.push(u); have++; dur += r.duration; }
        const row = $(`[data-audio="${i}"]`, root); if (row) row.innerHTML = audioRow(s, i, S.urls[S.urls.length - 1]);
        if (!r && row) row.innerHTML = audioRow(s, i);
      } catch {}
      if (S.plan !== p) return;
    }
    const el = $('#plAudioSum', root);
    if (el) el.textContent = `${have} / ${p.scenes.length}개 씬 음성 준비됨${have ? ` · 총 ${App.fmtTime(dur)}` : ''}${p.scenes.some(s => s.stale) ? ' · 수정된 씬은 다시 생성하세요' : ''}`;
  }

  function changeVoice(v) {
    const p = S.plan; if (!p || !v || v === p.voice) return;
    p.voice = v; p.scenes.forEach(s => { if (s.audio) s.stale = true; });
    App.plans.put(p); render();
    App.toast(`음성을 ${App.voiceLabel(v)}(으)로 바꿨습니다. '누락·수정 음성 생성'을 누르면 새 목소리로 다시 만듭니다`);
  }
  function onInput(e) {
    if (e.target.id === 'plCurVoice') return changeVoice(e.target.value);
    const t = e.target.closest('[data-narr]'); if (!t || !S.plan) return;
    const i = +t.dataset.narr; const p = S.plan; const s = p.scenes[i];
    s.narration = t.value; if (s.audio) s.stale = true;
    const c = countInfo(p, s, bounds(p.sceneSec, p.lang)); const cnt = $(`[data-cnt="${i}"]`, root);
    cnt.textContent = `${c.len}자 · ≈${c.est.toFixed(1)}초`; cnt.classList.toggle('over', c.bad);
    clearTimeout(saveT); saveT = setTimeout(() => App.plans.put(p), 600);
  }

  async function onClick(e) {
    const cp = e.target.closest('[data-copy]'); if (cp) return App.copy(cp.dataset.copy);
    const p = S.plan; if (!p) return;
    const pt = e.target.closest('[data-pick-title]');
    if (pt) { p.recommended = +pt.dataset.pickTitle; p.title = p.titles[p.recommended].text; App.plans.put(p); render(); return App.toast('대표 제목을 바꿨습니다'); }
    const tt = e.target.closest('[data-tts]');
    if (tt) {
      if (!(await App.ensureVoiceReady(p))) return;
      const i = +tt.dataset.tts; const s = p.scenes[i];
      ui.busy(tt, true, '');
      try { await makeAudio(p, s); App.plans.put(p); render(); App.toast(`${s.n}번 씬 음성 생성`); }
      catch (er) { App.toast(App.ai.friendly(er), true); ui.busy(tt, false); }
      return;
    }
    const el = e.target.closest('[data-act]'); if (!el) return;
    switch (el.dataset.act) {
      case 'copy-desc': return App.copy(descText(p), '설명란 복사');
      case 'copy-all': return App.copy(toMarkdown(p), '기획 전체 복사');
      case 'dl-md': return App.download(`plan_${App.slug(p.title)}.md`, toMarkdown(p), 'text/markdown');
      case 'dl-json': return App.download(`plan_${App.slug(p.title)}.json`, JSON.stringify(p, null, 2), 'application/json');
      case 'del':
        if (!confirm('이 기획과 음성 파일을 삭제할까요?')) return;
        App.plans.remove(p.id); App.db.delPrefix(`audio:${p.id}:`).catch(() => {}); App.db.delPrefix(`media:${p.id}:`).catch(() => {});
        S.plan = App.plans.list()[0] || null; return S.plan ? render() : renderEmpty();
      case 'to-produce': return App.go('produce', { planId: p.id });
      case 'my-voice': return App.openVoiceModal(id => changeVoice('clone:' + id));
      case 'tts-missing': {
        if (!(await App.ensureVoiceReady(p))) return;
        const todo = p.scenes.filter(s => !s.audio || s.stale);
        if (!todo.length) return App.toast('모든 씬에 최신 음성이 있습니다');
        ui.busy(el, true, '음성 생성 중');
        try { for (const [k, s] of todo.entries()) { el.innerHTML = `<span class="spin"></span> ${k + 1}/${todo.length}`; await makeAudio(p, s); App.plans.put(p); } App.toast('음성을 생성했습니다'); }
        catch (er) { App.toast(App.ai.friendly(er), true); }
        finally { ui.busy(el, false); render(); }
        return;
      }
      case 'dl-wav': {
        const blobs = [];
        for (const s of p.scenes) { const r = s.audio ? await App.db.get(`audio:${p.id}:${s.n}`).catch(() => null) : null; if (r) blobs.push(r.blob); }
        if (!blobs.length) return App.toast('생성된 음성이 없습니다', true);
        if (blobs.length < p.scenes.length) App.toast(`${p.scenes.length - blobs.length}개 씬은 음성이 없어 제외됩니다`, true);
        return App.download(`narration_${App.slug(p.title)}.wav`, await App.audio.concatWav(blobs, 0.35));
      }
    }
  }

  function toMarkdown(p) {
    return `# ${p.title}

${p.logline ? `> ${p.logline}\n\n` : ''}## 제목 후보
${p.titles.map((t, i) => `${i + 1}. **${t.text}** (${t.type}${i === p.recommended ? ', 추천' : ''}) — ${t.reason}`).join('\n')}

## 설명란
${descText(p)}

## 씬 대본 (${p.aspect} · ${p.scenes.length}씬 × ${p.sceneSec}초)
${p.scenes.map(s => `### #${s.n} [${s.stage}]
**나레이션:** ${s.narration}
${s.visual ? `\n**화면:** ${s.visual}\n` : ''}${s.video_prompt ? `\n**Video prompt:** ${s.video_prompt}\n` : ''}${s.image_prompt ? `\n**Image prompt:** ${s.image_prompt}\n` : ''}`).join('\n')}
`;
  }

  function sample() {
    const n = ['서울 마포구, 억새가 흔들리는 하늘공원. 그런데 이 언덕, 원래는 산이 아니었습니다.',
      '1978년부터 15년 동안 서울의 쓰레기가 전부 이곳에 쌓였습니다. 높이는 아파트 30층.',
      '문제는 치울 방법이 없다는 것. 옮기려면 덤프트럭 900만 대가 필요했습니다.',
      '태우자니 유독가스, 그대로 두자니 침출수가 한강으로 흘러들었죠.',
      '그래서 서울은 발상을 바꿨습니다. 덮고, 가두고, 가스를 에너지로 바꾸기로요.',
      '지금 우리가 버린 쓰레기는 어디로 가고 있을까요? 다음 난지도는 어디일까요?'];
    const vis = ['억새 공원 전경 드론샷', '쓰레기 산 단면 미니어처', '덤프트럭 행렬', '침출수가 흐르는 단면도', '차수벽과 가스관 설치 장면', '현대 매립지 항공샷'];
    return {
      id: 'sample_plan', sample: true, created_at: Date.now(), topic: '난지도 쓰레기 산의 비밀', reference: 'sample_ws1Clj0vOAM', aspect: '9:16', sceneSec: 8, count: 6, lang: 'ko', voice: 'Kore', voiceStyle: '', style: '', guide: '', proof: true, tts: false,
      title: '매일 걷던 하늘공원, 사실 쓰레기 산이었습니다', recommended: 0, logline: '익숙한 공원의 정체를 통해 도시가 쓰레기를 다루는 방식을 보여준다',
      titles: [{ type: '대비형', text: '매일 걷던 하늘공원, 사실 쓰레기 산이었습니다', reason: '익숙함과 충격의 대비' }, { type: '수치형', text: '9,200만 톤 쓰레기를 서울은 어떻게 숨겼나', reason: '거대 수치로 호기심' }, { type: '선언형', text: '서울은 쓰레기를 치우지 않았다', reason: '단정적 선언으로 반전 예고' }],
      description: { summary: '하늘공원 아래에는 15년간 쌓인 서울의 쓰레기가 잠들어 있습니다.', insight: '없앨 수 없는 문제를 관리하는 도시의 역발상을 알아봅니다.', cta: '다음 도시 미스터리가 궁금하다면 구독!', hashtags: ['#난지도', '#하늘공원', '#도시공학', '#쇼츠'] },
      scenes: n.map((t, i) => ({ n: i + 1, stage: stageOf(i, 6), narration: t, visual: vis[i], video_prompt: `${vis[i]}, slow cinematic push-in, soft morning light, ${ASPECT_GUIDE['9:16']}`, image_prompt: `${vis[i]}, ${REDLINE}, ${ASPECT_GUIDE['9:16']}` })),
    };
  }

  App.register('plan', { mount, show });
})();
