/* ==========================================================================
   00 채널 세팅 — 주제 한 줄 → 채널 개설 8대 항목 (명세: 유튜브 채널 세팅 자동 생성.md)
   ========================================================================== */
(function () {
  'use strict';
  const { $, esc, icon, ui } = App;
  const VALID_CAT = [1, 2, 10, 15, 17, 19, 20, 22, 23, 24, 25, 26, 27, 28, 29];
  const CATEGORIES = { 1: '영화/애니메이션', 2: '자동차/교통', 10: '음악', 15: '반려동물/동물', 17: '스포츠', 19: '여행/이벤트', 20: '게임', 22: '인물/블로그', 23: '코미디', 24: '엔터테인먼트', 25: '뉴스/정치', 26: '노하우/스타일', 27: '교육', 28: '과학기술', 29: '비영리/사회운동' };
  const LANGS = [['ko', '한국어'], ['en', 'English'], ['ja', '日本語'], ['zh', '中文'], ['es', 'Español'], ['fr', 'Français'], ['de', 'Deutsch'], ['pt', 'Português'], ['vi', 'Tiếng Việt'], ['th', 'ไทย'], ['id', 'Bahasa Indonesia']];
  const NON_LATIN = /^(ko|ja|zh|th|hi|ar|he|ru|uk|el)\b/i;
  const BCP47 = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/;
  const PERSONA = {
    character: { ko: '캐릭터', desc: '친근하고 개성 넘치는 2D/3D 캐릭터·마스코트 기반 브랜딩' },
    person: { ko: '실사 인물', desc: '전문적이고 신뢰할 수 있는 실사 인물·크리에이터 기반 브랜딩' },
    symbol: { ko: '심볼', desc: '미니멀하고 세련된 기하학적 심볼·로고형 그래픽 브랜딩' },
  };
  const S = { result: null, images: {}, bannerTab: 'text', busy: false };
  let root;

  const defaultSteps = () => [
    '구글 로그인 → YouTube → 프로필 → 채널 전환 → 모든 채널 보기 → 채널 만들기',
    '채널 이름과 핸들 입력 (위 후보 중 사용 가능한 것)',
    '프로필 이미지 업로드 (800×800, 4MB 이하)',
    '배너 이미지 업로드 (2048×1152, 6MB 이하 · 중앙 안전영역 확인)',
    '전화번호 인증 — 안 하면 15분 초과 영상과 커스텀 썸네일이 잠깁니다',
    '설정 → 채널 → 기본 정보에서 거주 국가와 키워드 설정',
    '설정 → 업로드 기본설정에서 제목·설명·태그 기본값 등록',
    '(선택) 신분증 인증 — 승인에 하루에서 이틀',
  ];

  function mount(el) {
    root = el;
    el.innerHTML = `
      ${ui.pageHead('STEP 00 · CHANNEL BUILDER', '주제 한 줄로 끝내는 <span class="grad">유튜브 채널 세팅</span>',
        '채널 이름 · 핸들 후보 · 설명 · 키워드 · 프로필/배너 이미지 · 업로드 기본값 · 개설 체크리스트까지. 채널 만들 재료를 완성해 드립니다.')}
      <div class="grid-side">
        <section class="panel pad sticky" aria-label="채널 정보 입력">
          <h3 class="sec-title">채널 정보</h3>
          <div class="field"><label for="chTopic">채널 주제 <span class="req">*</span></label>
            <input id="chTopic" class="input" maxlength="120" placeholder="예: 50대 은퇴자를 위한 AI 활용법"></div>
          <div class="f2">
            <div class="field"><label for="chLang">채널 언어 <span class="req">*</span></label>
              <select id="chLang" class="select"><option value="" disabled selected>언어 선택</option>${ui.options(LANGS)}<option value="custom">직접 입력…</option></select></div>
            <div class="field"><label for="chAudio">음성 언어</label>
              <select id="chAudio" class="select">${ui.options(LANGS, '', '채널 언어와 동일')}</select></div>
          </div>
          <div class="field" id="chCustomWrap" hidden><input id="chCustom" class="input" placeholder="BCP-47 코드 (예: es-MX, pt-BR)"></div>
          <div class="field"><span class="lbl">브랜딩 페르소나</span>
            <div class="seg">
              <input type="radio" name="chPersona" id="chP1" value="character" checked><label for="chP1">🧸 캐릭터<small>마스코트</small></label>
              <input type="radio" name="chPersona" id="chP2" value="person"><label for="chP2">🧑‍💼 실사<small>인물</small></label>
              <input type="radio" name="chPersona" id="chP3" value="symbol"><label for="chP3">◆ 심볼<small>로고형</small></label>
            </div></div>
          <details class="more"><summary>세부 설정 (선택)</summary><div class="inner">
            <div class="field"><label for="chAudience">타깃 시청자</label><input id="chAudience" class="input" placeholder="비우면 주제에서 추론"></div>
            <div class="field" style="margin:0"><label for="chTone">말투 · 분위기</label><input id="chTone" class="input" placeholder="예: 차분한, 유쾌한"></div>
          </div></details>
          <button id="chGen" class="btn btn-primary btn-block" type="button">${icon.spark}채널 세팅 생성하기</button>
          <div class="row" style="justify-content:center;margin-top:6px"><button id="chSample" class="link-btn" type="button">키 없이 예시 결과 보기</button></div>
          <div id="chErr"></div>
          <div id="chHistWrap" style="margin-top:18px"></div>
        </section>
        <section class="col" id="chOut" aria-live="polite"></section>
      </div>`;
    const lang = $('#chLang', el);
    lang.addEventListener('change', () => { $('#chCustomWrap', el).hidden = lang.value !== 'custom'; lang.classList.remove('invalid'); });
    lang.value = '';
    $('#chGen', el).addEventListener('click', generate);
    $('#chTopic', el).addEventListener('keydown', e => { if (e.key === 'Enter') generate(); });
    $('#chSample', el).addEventListener('click', () => { S.images = {}; S.result = sample(); render(); });
    $('#chOut', el).addEventListener('click', onClick);
    $('#chOut', el).addEventListener('change', onChange);
    App.on('coll:channels', renderHistory);
    renderHistory();
    const last = App.channels.list()[0];
    if (last) { S.result = last; render(); loadImages(); } else renderEmpty();
  }

  function show(payload) {
    if (payload?.topic) { $('#chTopic', root).value = payload.topic; if (!$('#chLang', root).value) $('#chLang', root).value = App.config.defaults?.lang || 'ko'; }
  }

  function renderHistory() {
    const list = App.channels.list();
    $('#chHistWrap', root).innerHTML = list.length ? `<h3 class="sec-title">최근 채널 기획</h3><div class="history">${list.slice(0, 10).map(c =>
      `<button data-hist="${c.id}" type="button"><span>${esc(c.channel_name)}</span><small>${esc(c.lang)}</small></button>`).join('')}</div>` : '';
    App.$$('[data-hist]', root).forEach(b => b.onclick = () => { S.result = App.channels.get(b.dataset.hist); S.images = {}; render(); loadImages(); });
  }

  async function loadImages() {
    if (!S.result || S.result.sample) return;
    const [a, b] = await Promise.all([App.db.get(`ch:${S.result.id}:avatar`), App.db.get(`ch:${S.result.id}:banner`)]).catch(() => []);
    if (a || b) { S.images.avatar = a; S.images.banner = b; render(false); }
  }

  function renderEmpty() {
    ui.empty($('#chOut', root), { icon: 'yt', title: '채널 만들 재료, 한 번에 완성', text: '왼쪽에 주제와 언어를 넣고 생성하면 아래 8개 항목이 유튜브 규격에 맞춰 만들어집니다.',
      items: ['채널 이름', '핸들 후보', '채널 설명', '키워드', '프로필 이미지', '배너 이미지', '업로드 기본값', '개설 체크리스트'] });
  }

  function readInputs() {
    let lang = $('#chLang', root).value;
    if (lang === 'custom') lang = $('#chCustom', root).value.trim();
    return {
      topic: $('#chTopic', root).value.trim(), lang, audio_lang: $('#chAudio', root).value || lang,
      audience: $('#chAudience', root).value.trim(), tone: $('#chTone', root).value.trim(),
      persona_type: (root.querySelector('input[name=chPersona]:checked') || {}).value || 'character',
    };
  }

  function buildPrompt(o) {
    const nonLatin = NON_LATIN.test(o.lang);
    return `당신은 100만 구독자 유튜브 채널을 브랜딩하는 최고의 유튜브 채널 기획자입니다.
주어진 주제와 조건에 맞추어 유튜브 채널 개설에 필요한 8대 세팅 데이터를 JSON으로 생성하세요.

[입력 정보]
- 주제: ${o.topic}
- 언어 코드(lang): ${o.lang} / 음성 언어(audio_lang): ${o.audio_lang}
- 타깃 시청자: ${o.audience || `주제(${o.topic})에서 자연스럽게 추론`}
- 말투·분위기: ${o.tone || '신뢰감 있고 매력적인 전문가 톤'}
- 페르소나 브랜딩 유형: ${PERSONA[o.persona_type].desc}

[언어 엄격 준수 규칙]
1. channel_name, description, keywords, upload_defaults의 텍스트, setup_steps는 반드시 '${o.lang}' 언어로만 작성. 다른 언어를 섞지 말 것.
2. handles는 영문 소문자·숫자·밑줄·하이픈·마침표만, 3~30자.${o.lang.startsWith('en') ? '' : ' 세 갈래로 후보: ① 로마자 발음 표기 ② 뜻을 옮긴 영어 ③ 짧은 직관적 조합.'}
3. avatar_prompt, banner_prompt, banner_prompt_notext는 반드시 영어 문장.
4. 배너에 글자를 넣는다면 '${o.lang}' 언어의 짧은 한 줄 문구를 프롬프트 안에 큰따옴표로 원문 그대로.${nonLatin ? ' 이 언어는 이미지 모델이 글자를 자주 뭉개므로 아주 짧게.' : ''}

[8대 출력 항목]
① channel_name: 50자 이내. 한글 기준 8자 이내로 기억에 남게. 검색어가 들어가되 설명문이 되지 않게.
② handles: 4~5개 후보 배열.
③ description: 1,000자 이내. 첫 두 줄에 누구를 위한 무슨 채널인지 → 도움이 되는 점 → 업로드 주기 → 연락처·링크. 줄바꿈(\\n) 사용.
④ keywords: 10~15개. 넓은 키워드와 좁은 롱테일을 섞고 합계 500자 이내.
⑤ avatar_prompt: 800x800 프로필용. simple solid-color background, single subject centered, fills over 60% of the frame, no text, no small details.
⑥ banner_prompt: 2048x1152 배너용. all text and key elements inside the central horizontal strip (mobile safe area), left and right edges background only, generous top and bottom margins. 텍스트는 한 줄로 짧게.
   banner_prompt_notext: 같은 구도, 글자 없는 버전 (끝에 "no text, no letters, no typography").
⑦ upload_defaults: title_template, description_template(5,000자 이내), tags(8~12개, 합계 500자 이내), category_id(27 교육/28 과학기술/22 인물·블로그/26 노하우·스타일/24 엔터테인먼트), privacy_status "private", made_for_kids false, default_language "${o.lang}", default_audio_language "${o.audio_lang}"
⑧ setup_steps: 사람이 직접 할 개설 절차 8단계 (번호 없이): 채널 만들기 / 이름·핸들 입력 / 프로필 업로드 / 배너 업로드 / 전화번호 인증(15분 초과 영상·커스텀 썸네일 해금) / 거주 국가·키워드 설정 / 업로드 기본값 등록 / (선택) 신분증 인증(1~2일)

[반환 형식 — 순수 JSON]
{"channel_name":"","handles":[""],"description":"","keywords":[""],"avatar_prompt":"","banner_prompt":"","banner_prompt_notext":"","upload_defaults":{"title_template":"","description_template":"","tags":[""],"category_id":27,"privacy_status":"private","made_for_kids":false,"default_language":"${o.lang}","default_audio_language":"${o.audio_lang}"},"setup_steps":[""]}`;
  }

  const capList = (list, max, sep) => { const out = []; let t = 0; for (const raw of App.toList(list)) { const s = String(raw).trim().replace(/^#/, ''); if (!s || out.includes(s)) continue; if (t + s.length + sep > max) break; out.push(s); t += s.length + sep; } return out; };
  function langOK(d, lang) {
    const t = `${d.channel_name || ''} ${d.description || ''}`;
    const hangul = /[\uac00-\ud7a3]/.test(t), kana = /[\u3040-\u30ff]/.test(t), han = /[\u4e00-\u9fff]/.test(t);
    if (lang.startsWith('ko')) return hangul;
    if (lang.startsWith('ja')) return kana || han;
    if (lang.startsWith('zh')) return han && !hangul && !kana;
    return !hangul && !kana;
  }
  function validate(data, o) {
    const issues = [];
    let name = String(data.channel_name || o.topic).trim();
    if (name.length > 50) { issues.push('name'); name = name.slice(0, 50).trim(); }
    const handles = [];
    for (let h of App.toList(data.handles)) {
      if (h && typeof h === 'object') h = h.handle;
      h = String(h || '').trim().toLowerCase().replace(/^@/, '').replace(/\s+/g, '-').replace(/[^a-z0-9_.-]/g, '');
      if (h.length >= 3 && h.length <= 30 && !handles.includes(h)) handles.push(h);
    }
    const base = (handles[0] || 'mychannel').replace(/[-_.]+$/, '').slice(0, 20);
    for (const sfx of ['-tv', '-lab', '-official']) { if (handles.length >= 3) break; if (!handles.includes(base + sfx)) handles.push(base + sfx); }
    let desc = String(data.description || '').trim(); if (desc.length > 1000) desc = desc.slice(0, 997) + '...';
    const keywords = capList(data.keywords, 500, 3);
    const ud = data.upload_defaults || {};
    let cat = parseInt(ud.category_id, 10); if (!VALID_CAT.includes(cat)) cat = 27;
    const fb = `Cinematic YouTube channel banner about ${o.topic}, all key elements inside the central horizontal strip, left and right edges background only, generous top and bottom margins`;
    const steps = App.toList(data.setup_steps).map(s => String(s).replace(/^\s*\d+[.)]\s*/, '').trim()).filter(Boolean);
    return {
      issues,
      data: {
        id: App.uid('ch'), topic: o.topic, lang: o.lang, audio_lang: o.audio_lang, persona_type: o.persona_type, audience: o.audience, tone: o.tone,
        channel_name: name, handles: handles.slice(0, 6).map(h => ({ handle: h, available: null })), description: desc, keywords,
        avatar_prompt: App.str(data.avatar_prompt) || `Minimalist iconic avatar for a channel about ${o.topic}, single centered subject filling over 60% of the frame, solid background, no text`,
        banner_prompt: App.str(data.banner_prompt) || fb,
        banner_prompt_notext: App.str(data.banner_prompt_notext) || fb + ', no text, no letters, no typography',
        upload_defaults: {
          title_template: App.str(ud.title_template, 100) || '{주제} — {한 줄 요약}', description_template: App.str(ud.description_template, 5000) || desc,
          tags: capList(ud.tags || keywords, 500, 1), category_id: cat, privacy_status: 'private', made_for_kids: ud.made_for_kids === true,
          default_language: o.lang, default_audio_language: o.audio_lang,
        },
        setup_steps: steps.length >= 4 ? steps : defaultSteps(), created_at: Date.now(),
      },
    };
  }

  async function generate() {
    if (S.busy) return;
    ui.err($('#chErr', root), '');
    const o = readInputs();
    if (!o.topic) { $('#chTopic', root).classList.add('invalid'); return ui.err($('#chErr', root), '채널 주제를 입력해주세요.'); }
    if (!o.lang) { $('#chLang', root).classList.add('invalid'); return ui.err($('#chErr', root), '채널 언어를 선택해주세요. 언어에 따라 결과 전체가 바뀝니다.'); }
    if (!BCP47.test(o.lang)) return ui.err($('#chErr', root), '언어 코드가 BCP-47 형식이 아닙니다. 예: ko, en, es-MX');
    if (!BCP47.test(o.audio_lang)) o.audio_lang = o.lang;
    if (!App.requireKey('text')) return;
    $('#chTopic', root).classList.remove('invalid');
    S.busy = true; S.images = {};
    const btn = $('#chGen', root); ui.busy(btn, true, '생성 중…');
    const steps = ['Gemini 연결', '채널 브랜딩 8대 항목 생성', '명세 규칙 검증 · 글자 수 최적화'];
    const out = $('#chOut', root);
    try {
      ui.progress(out, '채널 세팅 생성 중', steps, 0);
      await App.ai.listModels();
      let res;
      for (let attempt = 0; attempt < 2; attempt++) {
        ui.progress(out, '채널 세팅 생성 중', steps, 1, attempt ? '재생성' : '');
        const { data, model } = await App.ai.json({ prompt: buildPrompt(o), system: 'You are a professional YouTube channel branding expert. Always reply with valid JSON only.', temperature: 0.8 });
        ui.progress(out, '채널 세팅 생성 중', steps, 2);
        res = validate(data, o); res.data.model = model;
        if (attempt === 0 && (res.issues.includes('name') || !langOK(res.data, o.lang))) continue;
        break;
      }
      S.result = App.channels.put(res.data);
      render();
    } catch (e) {
      console.error(e); ui.err($('#chErr', root), App.ai.friendly(e));
      S.result ? render() : renderEmpty();
    } finally { S.busy = false; ui.busy(btn, false); }
  }

  const sumLen = (l, sep) => l.reduce((n, s) => n + s.length + sep, 0);
  const card = (n, title, sub, right, body, cls = '') => `
    <article class="panel card ${cls}"><div class="card-h"><div class="card-t"><span class="num">${n}</span><div>${title}<small>${sub}</small></div></div>${right || ''}</div>${body}</article>`;
  const cbtn = (act, label = '복사') => `<button class="btn btn-sm" data-act="${act}" type="button">${icon.copy}${label}</button>`;

  function render(scroll = true) {
    const d = S.result; if (!d) return renderEmpty();
    const ud = d.upload_defaults;
    const kwLen = sumLen(d.keywords, 3), tagLen = sumLen(ud.tags, 1);
    const checks = [
      [d.channel_name.length <= 50, `이름 ${d.channel_name.length}/50자`], [d.handles.length >= 3, `핸들 ${d.handles.length}개`],
      [d.description.length <= 1000, `설명 ${d.description.length}/1,000자`], [kwLen <= 500, `키워드 ${kwLen}/500자`],
      [tagLen <= 500, `태그 ${tagLen}/500자`], [VALID_CAT.includes(ud.category_id), `카테고리 ${ud.category_id}`], [langOK(d, d.lang), `언어 ${d.lang} 일치`],
    ];
    const descHtml = esc(d.description).split('\n').map((l, i, a) => i < 2 ? `<span style="display:block;border-left:2px solid var(--a400);padding-left:8px;margin-left:-10px;background:linear-gradient(90deg,hsl(var(--h) 66% 50% / .15),transparent)">${l || '&nbsp;'}</span>` : l + (i < a.length - 1 ? '\n' : '')).join('');
    const banner = S.bannerTab === 'notext' ? d.banner_prompt_notext : d.banner_prompt;
    const done = d.setup_steps.filter((_, i) => d._done?.[i]).length, pct = Math.round(done / d.setup_steps.length * 100);
    const imgBtn = k => `<button class="btn btn-sm btn-soft" data-act="gen-${k}" type="button" ${S.images[k + 'L'] ? 'disabled' : ''}>${S.images[k + 'L'] ? '<span class="spin"></span>생성 중' : icon.spark + 'AI 이미지 생성'}</button>`;
    $('#chOut', root).innerHTML = `
      <div class="panel pad">
        <div class="row between" style="align-items:flex-start">
          <div>
            <span class="tag mono">${d.sample ? 'SAMPLE · 예시' : 'GENERATED · ' + esc(d.model || 'gemini')}</span>
            <h3 class="grad-text" style="font:800 clamp(24px,3vw,32px)/1.2 var(--display);margin:8px 0 6px">${esc(d.channel_name)}</h3>
            <div class="row"><span class="tag">📌 ${esc(d.topic)}</span><span class="tag mono">lang ${esc(d.lang)} · audio ${esc(d.audio_lang)}</span><span class="tag">${esc(PERSONA[d.persona_type]?.ko || '')}</span></div>
          </div>
          <div class="row">
            <button class="btn btn-sm" data-act="dl-json" type="button">${icon.dl}JSON</button>
            <button class="btn btn-sm" data-act="dl-md" type="button">${icon.dl}기획서 .md</button>
            <button class="btn btn-sm btn-soft" data-act="copy-all" type="button">${icon.copy}전체 복사</button>
            <button class="btn btn-sm" data-act="to-analyze" type="button">${icon.search}벤치마크 찾기</button>
          </div>
        </div>
        <div class="row" style="margin-top:12px">${checks.map(([ok, t]) => `<span class="vchk ${ok ? 'ok' : 'warn'}">${t}</span>`).join('')}</div>
      </div>
      <div class="grid-2">
        ${card('①', '채널 이름', 'CHANNEL NAME · 50자 이내', `<span class="count">${d.channel_name.length}/50</span>`, `<div class="big-name">${esc(d.channel_name)}</div><div class="row">${cbtn('c-name')}</div>`)}
        ${card('②', '핸들 후보', 'HANDLES · 영문 소문자 3~30자', `<span class="count">${d.handles.length}개</span>`, `
          <div class="handles">${d.handles.map((h, i) => `<div class="h-row"><div class="h-name"><span>@</span>${esc(h.handle)}</div>
            <button class="h-st ${h.available === true ? 'yes' : h.available === false ? 'no' : ''}" data-act="cycle" data-i="${i}" type="button">${h.available === true ? '사용 가능' : h.available === false ? '선점됨' : '미확인'}</button>
            <a class="btn btn-xs" href="https://www.youtube.com/@${encodeURIComponent(h.handle)}" target="_blank" rel="noopener">${icon.ext}확인</a>
            <button class="btn btn-xs" data-act="c-handle" data-i="${i}" type="button" aria-label="복사">${icon.copy}</button></div>`).join('')}</div>
          <div class="note">ⓘ <span><b>확인</b>을 눌러 페이지가 없으면 사용 가능, 채널이 열리면 선점된 핸들입니다. 상태 버튼으로 결과를 기록하세요.</span></div>`)}
        ${card('③', '채널 설명', 'DESCRIPTION · 첫 두 줄이 미리보기 노출', `<span class="count ${d.description.length > 1000 ? 'over' : ''}">${d.description.length}/1,000</span>`, `<div class="box">${descHtml}</div><div class="row">${cbtn('c-desc')}</div>`, 'span-2')}
        ${card('④', '채널 키워드', 'KEYWORDS · 합계 500자 이내', `<span class="count">${kwLen}/500</span>`, `
          <div class="chips">${d.keywords.map((k, i) => `<button class="chip" data-act="c-kw" data-i="${i}" type="button">${esc(k)}</button>`).join('')}</div>
          <div class="row">${cbtn('c-kw-comma', '쉼표로 복사')}${cbtn('c-kw-api', 'API 형식 복사')}</div>`, 'span-2')}
        ${card('⑤', '프로필 이미지', 'AVATAR · 800×800 · 4MB 이하', '', `
          <div class="media r11 ${S.images.avatarL ? 'loading' : ''}" style="width:170px;border-radius:50%;margin:0 auto">${S.images.avatar ? `<img src="${S.images.avatar}" alt="AI 생성 프로필">` : `<div class="ph"><div>${icon.img}생성 전</div></div>`}</div>
          <div class="box mono">${esc(d.avatar_prompt)}</div>
          <div class="row">${imgBtn('avatar')}${cbtn('c-avatar', '프롬프트')}${S.images.avatar ? `<button class="btn btn-sm" data-act="dl-avatar" type="button">${icon.dl}저장</button>` : ''}</div>`)}
        ${card('⑥', '배너 이미지', 'BANNER · 2048×1152 · 6MB 이하', `<div class="tabs"><button data-act="tab-text" class="${S.bannerTab !== 'notext' ? 'on' : ''}" type="button">글자 포함</button><button data-act="tab-notext" class="${S.bannerTab === 'notext' ? 'on' : ''}" type="button">글자 없음</button></div>`, `
          <div class="media r169 ${S.images.bannerL ? 'loading' : ''}">${S.images.banner ? `<img src="${S.images.banner}" alt="AI 생성 배너">` : `<div class="ph"><div>${icon.img}생성 전</div></div>`}<div class="safe"><span>모바일 안전영역 1235×338</span></div></div>
          <div class="box mono">${esc(banner)}</div>
          <div class="row">${imgBtn('banner')}${cbtn('c-banner', '프롬프트')}${S.images.banner ? `<button class="btn btn-sm" data-act="dl-banner" type="button">${icon.dl}저장</button>` : ''}</div>
          ${NON_LATIN.test(d.lang) ? '<div class="note">ⓘ <span>이 언어는 이미지 모델이 글자를 뭉개기 쉬워 <b>글자 없음</b> 버전 후 직접 얹기를 권장합니다.</span></div>' : ''}`)}
        ${card('⑦', '업로드 기본값', 'UPLOAD DEFAULTS', cbtn('c-ud', 'JSON 복사'), `
          <div class="grid-2">
            <table class="kv"><tbody>
              <tr><th>title_template</th><td>${esc(ud.title_template)}</td></tr>
              <tr><th>tags (${tagLen}/500)</th><td>${ud.tags.map(t => `<code class="c">${esc(t)}</code>`).join('')}</td></tr>
              <tr><th>category_id</th><td><code class="c">${ud.category_id}</code> ${esc(CATEGORIES[ud.category_id] || '')}</td></tr>
              <tr><th>privacy_status</th><td><code class="c">${ud.privacy_status}</code> 비공개로 시작 권장</td></tr>
              <tr><th>language</th><td><code class="c">${esc(ud.default_language)}</code> · audio <code class="c">${esc(ud.default_audio_language)}</code></td></tr>
            </tbody></table>
            <div class="col" style="gap:8px"><div class="row between"><span class="count">description_template · ${ud.description_template.length}/5,000</span>${cbtn('c-udesc')}</div><div class="box">${esc(ud.description_template)}</div></div>
          </div>`, 'span-2')}
        ${card('⑧', '개설 체크리스트', 'SETUP STEPS · 직접 하는 일', `<span class="count">${done}/${d.setup_steps.length}</span>`, `
          <div class="row" style="gap:10px"><div class="bar" style="flex:1"><i style="width:${pct}%"></i></div><span class="count">${pct}%</span></div>
          <ul class="todo">${d.setup_steps.map((s, i) => `<li><label><input type="checkbox" data-todo="${i}" ${d._done?.[i] ? 'checked' : ''}><span><b class="muted" style="font-family:var(--mono);margin-right:6px">${String(i + 1).padStart(2, '0')}</b>${esc(s)}</span></label></li>`).join('')}</ul>
          <div class="note">ⓘ <span>채널 생성·이미지 업로드·핸들 변경은 API가 없어 직접 해야 합니다. 업로드는 API 할당량상 하루 약 6편이 상한입니다.</span></div>`, 'span-2')}
      </div>`;
    if (scroll && window.innerWidth < 1020) $('#chOut', root).scrollIntoView({ behavior: 'smooth' });
  }

  function save() { if (S.result && !S.result.sample) App.channels.put(S.result); }

  async function genImage(kind) {
    if (!App.requireKey()) return;
    const d = S.result;
    const prompt = kind === 'avatar' ? d.avatar_prompt : (S.bannerTab === 'notext' ? d.banner_prompt_notext : d.banner_prompt);
    S.images[kind + 'L'] = true; render(false);
    try {
      S.images[kind] = await App.ai.image(prompt, kind === 'avatar' ? '1:1' : '16:9');
      if (!d.sample) App.db.set(`ch:${d.id}:${kind}`, S.images[kind]).catch(() => {});
      App.toast(kind === 'avatar' ? '프로필 이미지 완성' : '배너 이미지 완성');
    } catch (e) { App.toast('이미지 생성 실패: ' + App.ai.friendly(e), true); }
    finally { S.images[kind + 'L'] = false; render(false); }
  }

  function exportMD(d) {
    const ud = d.upload_defaults;
    return `# 유튜브 채널 브랜딩 기획서 — ${d.channel_name}\n\n**주제**: ${d.topic}  \n**언어**: ${d.lang} (음성 ${d.audio_lang})\n\n## ① 채널 이름\n${d.channel_name}\n\n## ② 핸들 후보\n${d.handles.map(h => `- @${h.handle} — ${h.available === true ? '사용 가능' : h.available === false ? '선점됨' : '미확인'}`).join('\n')}\n\n## ③ 채널 설명\n${d.description}\n\n## ④ 키워드\n${d.keywords.join(', ')}\n\n## ⑤ 프로필 프롬프트\n${d.avatar_prompt}\n\n## ⑥ 배너 프롬프트\n${d.banner_prompt}\n\n(글자 없음) ${d.banner_prompt_notext}\n\n## ⑦ 업로드 기본값\n- 제목 템플릿: ${ud.title_template}\n- 태그: ${ud.tags.join(', ')}\n- 카테고리: ${ud.category_id} (${CATEGORIES[ud.category_id] || ''}) · ${ud.privacy_status}\n\n${ud.description_template}\n\n## ⑧ 개설 체크리스트\n${d.setup_steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n`;
  }

  function onClick(e) {
    const el = e.target.closest('[data-act]'); if (!el || !S.result) return;
    const d = S.result, ud = d.upload_defaults, i = +el.dataset.i;
    const map = {
      'c-name': () => App.copy(d.channel_name), 'c-handle': () => App.copy('@' + d.handles[i].handle), 'c-desc': () => App.copy(d.description),
      'c-kw': () => App.copy(d.keywords[i]), 'c-kw-comma': () => App.copy(d.keywords.join(', ')), 'c-kw-api': () => App.copy(d.keywords.map(k => /\s/.test(k) ? `"${k}"` : k).join(' ')),
      'c-avatar': () => App.copy(d.avatar_prompt), 'c-banner': () => App.copy(S.bannerTab === 'notext' ? d.banner_prompt_notext : d.banner_prompt),
      'c-ud': () => App.copy(JSON.stringify(ud, null, 2)), 'c-udesc': () => App.copy(ud.description_template), 'copy-all': () => App.copy(exportMD(d), '전체 기획서 복사'),
      'dl-json': () => { const { _done, sample, ...rest } = d; App.download(`channel_${App.slug(d.channel_name)}.json`, JSON.stringify(rest, null, 2), 'application/json'); },
      'dl-md': () => App.download(`channel_${App.slug(d.channel_name)}.md`, exportMD(d), 'text/markdown'),
      'dl-avatar': () => App.download(`avatar_${App.slug(d.channel_name)}.png`, S.images.avatar), 'dl-banner': () => App.download(`banner_${App.slug(d.channel_name)}.png`, S.images.banner),
      'gen-avatar': () => genImage('avatar'), 'gen-banner': () => genImage('banner'),
      'tab-text': () => { S.bannerTab = 'text'; render(false); }, 'tab-notext': () => { S.bannerTab = 'notext'; render(false); },
      cycle: () => { const h = d.handles[i]; h.available = h.available === null ? true : h.available === true ? false : null; save(); render(false); },
      'to-analyze': () => App.go('analyze', { query: d.topic }),
    };
    map[el.dataset.act] && map[el.dataset.act]();
  }
  function onChange(e) {
    const i = e.target.dataset.todo; if (i == null || !S.result) return;
    S.result._done = S.result._done || {}; S.result._done[i] = e.target.checked; save(); render(false);
  }

  function sample() {
    return {
      id: 'sample', sample: true, topic: '50대 은퇴자를 위한 AI 활용법', lang: 'ko', audio_lang: 'ko', persona_type: 'character',
      channel_name: '은퇴 후 AI 연구소',
      handles: ['retire-ai', 'ai-after50', 'seniorailab', 'euntoe-ai'].map(h => ({ handle: h, available: null })),
      description: '50대부터 시작하는 가장 쉬운 AI 활용법, 은퇴 후 AI 연구소입니다.\n어려운 용어 없이 스마트폰과 컴퓨터로 바로 따라 하는 AI 사용법을 알려드립니다.\n\n✔ 이런 분께 도움이 됩니다\n- 은퇴를 앞두고 새로운 기술을 배우고 싶은 분\n- ChatGPT·Gemini를 써보고 싶지만 어디서부터 시작할지 모르는 분\n\n📅 매주 화·금 오전 7시 업로드\n📮 문의: hello@retire-ai.kr',
      keywords: ['AI 입문', '50대 AI', '은퇴 준비', '시니어 AI', 'ChatGPT 사용법', 'Gemini 사용법', '스마트폰 AI', 'AI 글쓰기', '은퇴 후 취미', '디지털 배우기'],
      avatar_prompt: 'A friendly round robot mascot wearing reading glasses and a cozy cardigan, smiling warmly, single subject centered filling over 70% of the frame, simple solid teal background, soft 3D clay render, no text',
      banner_prompt: 'Wide cinematic YouTube banner, friendly round robot mascot with reading glasses beside a laptop, the short Korean title "은퇴 후 AI 연구소" in bold rounded letters, all text and key elements inside the central horizontal strip, left and right edges only a soft teal-to-cyan gradient, generous top and bottom margins, soft 3D style',
      banner_prompt_notext: 'Wide cinematic YouTube banner, friendly round robot mascot with reading glasses beside a laptop, all key elements inside the central horizontal strip, left and right edges only a soft teal-to-cyan gradient, generous margins, soft 3D style, no text, no letters, no typography',
      upload_defaults: { title_template: '{주제} — {한 줄 요약} | 은퇴 후 AI 연구소', description_template: '{이번 영상 요약}\n\n⏱ 목차\n{타임스탬프}\n\n━━━━━━━━\n은퇴 후 AI 연구소는 50대부터 시작하는 가장 쉬운 AI 활용법을 알려드립니다.\n🔔 구독하고 매주 함께 배워요\n\n#AI입문 #50대AI #은퇴준비', tags: ['AI 입문', '50대 AI', '은퇴 준비', '시니어', 'ChatGPT', 'Gemini', 'AI 사용법'], category_id: 27, privacy_status: 'private', made_for_kids: false, default_language: 'ko', default_audio_language: 'ko' },
      setup_steps: defaultSteps(), created_at: Date.now(),
    };
  }

  App.register('channel', { mount, show });
})();
