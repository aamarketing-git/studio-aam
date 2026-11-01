/* ==========================================================================
   01 영상 분석 — 유튜브 링크 → Gemini가 영상을 직접 시청 + 메타데이터·댓글 → 흥행 공식 대시보드
   ========================================================================== */
(function () {
  'use strict';
  const { $, esc, icon, ui } = App;
  const S = { current: null, view: 'dash', busy: false };
  let root;

  function mount(el) {
    root = el;
    el.innerHTML = `
      ${ui.pageHead('STEP 01 · BENCHMARK ANALYSIS', '벤치마크할 <span class="grad">영상을 분석</span>합니다',
        '링크 하나로 Gemini가 영상을 직접 보고 <b>제목 훅 · 전개 구조 · 시청자 반응 · 적용 플레이북</b>을 정리합니다.')}
      <div class="search">
        <input id="azQuery" class="input" placeholder="유튜브 링크 또는 키워드 (예: https://youtu.be/... / 쓰레기 매립지 다큐)" autocomplete="off">
        <button id="azGo" class="btn btn-primary" type="button">${icon.spark}분석 시작</button>
      </div>
      <div class="row" style="justify-content:center;margin-top:12px;gap:14px">
        <label class="check"><input type="checkbox" id="azVideo" checked> 영상 직접 시청 분석</label>
        <label class="check"><input type="checkbox" id="azHigh"> 고화질 분석 <span class="muted">(토큰 3배)</span></label>
        <label class="check"><input type="checkbox" id="azFresh"> 캐시 무시하고 다시 분석</label>
        <select id="azRecent" class="select" style="width:auto;padding:7px 34px 7px 12px;font-size:12.5px"></select>
        <button id="azSample" class="link-btn" type="button">샘플 분석 보기</button>
      </div>
      <p class="hint" style="text-align:center;margin:8px 0 0">링크를 넣으면 바로 분석하고, 키워드를 넣으면 조회수 순 벤치마크 후보를 찾습니다 (키워드 검색·조회수·댓글은 YouTube Data API 키 필요).</p>
      <div id="azErr" style="max-width:820px;margin:0 auto"></div>
      <div id="azOut" style="margin-top:26px" aria-live="polite"></div>`;
    $('#azGo', el).addEventListener('click', go);
    $('#azQuery', el).addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
    $('#azSample', el).addEventListener('click', () => { const s = sample(); App.analyses.put(s); S.current = s; render(); });
    $('#azRecent', el).addEventListener('change', e => { const a = App.analyses.get(e.target.value); if (a) { S.current = a; render(); } e.target.value = ''; });
    $('#azOut', el).addEventListener('click', onClick);
    App.on('coll:analyses', fillRecent);
    fillRecent();
    const last = App.analyses.list()[0];
    if (last) { S.current = last; render(); } else renderEmpty();
  }
  function show(payload) {
    if (payload?.query) { $('#azQuery', root).value = payload.query; }
  }
  function fillRecent() {
    const list = App.analyses.list();
    $('#azRecent', root).innerHTML = `<option value="">최근 분석 (${list.length})</option>` + list.map(a => `<option value="${esc(a.id)}">${esc((a.info.title || a.id).slice(0, 40))}</option>`).join('');
  }
  function renderEmpty() {
    ui.empty($('#azOut', root), { icon: 'chart', title: '흥행 공식을 숫자와 구조로', text: '벤치마크할 영상 링크를 넣어보세요. 분석 결과는 ② 기획 · ④ 마케팅에서 그대로 이어 쓸 수 있습니다.',
      items: ['제목 · 훅 구조', '5단계 전개', '핵심 메시지', '댓글 여론', '적용 플레이북', '채널 전략', '핵심 스크립트', '리포트 전문'] });
  }

  async function go() {
    if (S.busy) return;
    ui.err($('#azErr', root), '');
    const q = $('#azQuery', root).value.trim();
    if (!q) { $('#azQuery', root).focus(); return; }
    const id = App.yt.id(q);
    if (id) return analyze(id);
    // 키워드 검색
    const out = $('#azOut', root); const btn = $('#azGo', root);
    ui.busy(btn, true, '검색 중');
    try {
      const list = await App.yt.search(q);
      out.innerHTML = `<div class="panel pad"><div class="row between" style="margin-bottom:14px"><h3 class="sec-title" style="margin:0;flex:1">“${esc(q)}” 벤치마크 후보 · 조회수 순</h3></div>
        ${list.length ? `<div class="cand">${list.map(v => `<button data-pick="${v.id}" type="button"><img src="${esc(v.thumbnail)}" alt="" loading="lazy"><div class="ci"><b>${esc(v.title)}</b><small>${esc(v.channel)} · 조회수 ${App.fmtShort(v.view_count)} · ${esc(v.duration_string)}</small></div></button>`).join('')}</div>` : '<p class="muted">검색 결과가 없습니다.</p>'}</div>`;
    } catch (e) { ui.err($('#azErr', root), App.ai.friendly(e)); }
    finally { ui.busy(btn, false); }
  }

  function buildContext(info, comments) {
    const cm = comments.slice(0, 15).map(c => `[👍${c.like_count}] ${c.text.slice(0, 140)}`).join('\n');
    return `[영상 정보]
- 제목: ${info.title || '(알 수 없음)'}
- 채널: ${info.channel || '(알 수 없음)'}${info.subscribers ? ` (구독자 ${App.fmtNum(info.subscribers)})` : ''}
${info.view_count != null ? `- 조회수: ${App.fmtNum(info.view_count)} · 좋아요: ${App.fmtNum(info.like_count)} · 댓글: ${App.fmtNum(info.comment_count)}\n` : ''}${info.duration_string ? `- 길이: ${info.duration_string} · 게시일: ${(info.published || '').slice(0, 10)}\n` : ''}
[설명란]
${(info.description || '(없음)').slice(0, 800)}

[상위 댓글]
${cm || '(댓글 데이터 없음 — 댓글 여론은 영상 내용으로 추정하지 말고 "데이터 없음"으로 표시)'}`;
  }

  const SCHEMA = `{
  "hook": {"part_a": "제목 앞부분 훅 요소(원문)", "part_b": "제목 뒷부분 훅 요소(원문)", "mechanism": "클릭을 만든 심리 기제 한 문장"},
  "title_formula": "[빈칸]이 있는 제목 템플릿",
  "stages": [{"name":"도입","time_range":"00:00~00:40","summary":"20자 내외"},{"name":"갈등",...},{"name":"난제",...},{"name":"반전",...},{"name":"여운",...}],
  "core_message": "핵심 메시지 한 문장(60자 내외)",
  "keywords": ["#키워드1","#키워드2","#키워드3","#키워드4"],
  "sentiment": {"summary": "댓글 여론 한 줄", "positive": 70, "neutral": 20, "negative": 10, "available": true},
  "tips": [{"title":"적용 포인트","summary":"왜 통했는지 한 줄","template":"바로 쓸 스크립트 템플릿"}],
  "channel_strategy": {"channel_name":"","positioning":"","core_tone":"","recommended_new_channel_topic":"","differentiation_point":""},
  "key_script": [{"time":"00:00","text":"영상 속 핵심 발화/장면"}],
  "report_markdown": "### 1. 제목·훅 구조 ... ### 6. 채널 전략 까지 마크다운 리포트"
}`;

  function buildPrompt(info, comments, withVideo) {
    return `당신은 유튜브 콘텐츠 기획 전문가입니다. ${withVideo ? '첨부된 유튜브 영상을 실제로 시청하고(음성·화면·자막),' : '아래 메타데이터만으로(영상 시청 불가 — 추정은 반드시 "추정"이라고 표시)'} 아래 데이터를 근거로 이 영상의 흥행 공식을 분석하세요.
사실이 아닌 내용을 지어내지 말고, 시간 구간은 실제 영상 타임스탬프를 근거로 적으세요. 모든 텍스트는 한국어로 작성합니다.

${buildContext(info, comments)}

[분석 항목]
1. 제목·훅 구조: 제목과 썸네일이 클릭을 유도한 심리 기제를 키워드 단위로 해체, 첫 30초에서 시청자를 붙잡는 장치(질문·대비·숫자·반전)
2. 전개 방식: 도입 → 갈등 → 난제 → 반전 → 여운 5단계로 구간을 나누고 각 구간의 역할, 리텐션 장치
3. 핵심 메시지: 시청자가 얻어가는 지식·감정
4. 댓글 여론: 상위 댓글의 반응·감정·반복 키워드 (댓글 데이터가 없으면 sentiment.available=false)
5. 내 영상에 적용할 점 3가지: 왜 통했는지 → 적용 방법 → 바로 쓸 스크립트 템플릿, 제목 공식은 [빈칸] 템플릿
6. 채널 전략: 원본 채널 포지셔닝·타깃, 벤치마킹한 추천 신규 채널 주제와 차별화 전략
key_script는 영상 흐름을 보여주는 핵심 발화/장면 12~25개.
report_markdown은 위 1~6 항목을 소제목(###)과 불릿으로 자세히 정리한 리포트 (1,500~3,000자).

반드시 아래 형식의 JSON 하나만 출력하세요:
${SCHEMA}`;
  }

  function sanitize(d, info) {
    d = d && typeof d === 'object' ? d : {};
    const title = info.title || '';
    const names = ['도입', '갈등', '난제', '반전', '여운'];
    const stages = names.map((n, i) => { const s = (Array.isArray(d.stages) ? d.stages : [])[i] || {}; return { name: App.str(s.name || n, 8), time_range: App.str(s.time_range, 20), summary: App.str(s.summary, 80) }; });
    const sent = d.sentiment || {};
    const num = v => { const n = parseInt(v, 10); return isNaN(n) ? 0 : Math.max(0, Math.min(100, n)); };
    const cs = d.channel_strategy || {};
    return {
      hook: { part_a: App.str(d.hook?.part_a || title.slice(0, title.length / 2), 80), part_b: App.str(d.hook?.part_b || title.slice(title.length / 2), 80), mechanism: App.str(d.hook?.mechanism, 240) },
      title_formula: App.str(d.title_formula, 120),
      stages,
      core_message: App.str(d.core_message, 160),
      keywords: App.toList(d.keywords).map(k => '#' + String(k).trim().replace(/^#/, '')).filter(k => k.length > 1).slice(0, 8),
      sentiment: { available: sent.available !== false, summary: App.str(sent.summary, 200), positive: num(sent.positive), neutral: num(sent.neutral), negative: num(sent.negative) },
      tips: (Array.isArray(d.tips) ? d.tips : []).filter(t => t && t.title).slice(0, 3).map(t => ({ title: App.str(t.title, 60), summary: App.str(t.summary, 200), template: App.str(t.template, 300) })),
      channel_strategy: {
        channel_name: App.str(cs.channel_name || info.channel, 50), positioning: App.str(cs.positioning, 160), core_tone: App.str(cs.core_tone, 80),
        recommended_new_channel_topic: App.str(cs.recommended_new_channel_topic, 120), differentiation_point: App.str(cs.differentiation_point, 200),
      },
      key_script: (Array.isArray(d.key_script) ? d.key_script : []).filter(x => x && x.text).slice(0, 40).map(x => ({ time: App.str(x.time, 8), text: App.str(x.text, 240) })),
      report: App.str(d.report_markdown || d.report),
    };
  }

  async function analyze(id) {
    if (S.busy) return;
    const cached = App.analyses.get(id);
    if (cached && !$('#azFresh', root).checked) { S.current = cached; render(); App.toast('저장된 분석을 불러왔습니다'); return; }
    if (!App.requireKey()) return;
    S.busy = true;
    const btn = $('#azGo', root); ui.busy(btn, true, '분석 중');
    const out = $('#azOut', root);
    const steps = ['영상 정보 수집', '댓글 수집', 'AI 영상 시청 · 흥행 공식 분석', '대시보드 정리'];
    const useVideo = $('#azVideo', root).checked;
    try {
      ui.progress(out, '영상 분석 중', steps, 0);
      const info = await App.yt.info(id);
      ui.progress(out, '영상 분석 중', steps, 1);
      const comments = await App.yt.comments(id);
      ui.progress(out, '영상 분석 중', steps, 2, useVideo ? '영상 길이에 따라 30초~2분' : '메타데이터 기반');
      let res, mode = useVideo ? 'video' : 'meta', note = '';
      try {
        res = await App.ai.json({ prompt: buildPrompt(info, comments, useVideo), video: useVideo ? info.url : null, cloudOnly: true, lowRes: !$('#azHigh', root).checked, temperature: 0.4, maxTokens: 12000,
          system: 'You are an expert YouTube content strategist. Reply with valid JSON only.' });
      } catch (e) {
        if (!useVideo || e.status === 401 || e.status === 403 || (e.status === 400 && /api key/i.test(e.message))) throw e;
        if (!info.title) throw new Error('영상을 직접 분석하지 못했고 제목 정보도 가져오지 못했습니다. 공개 영상인지 확인해주세요. (' + App.ai.friendly(e) + ')');
        note = '영상 직접 시청에 실패해 메타데이터 기반으로 분석했습니다 (' + App.ai.friendly(e).slice(0, 120) + ')';
        mode = 'meta';
        ui.progress(out, '영상 분석 중', steps, 2, '메타데이터 기반으로 재시도');
        res = await App.ai.json({ prompt: buildPrompt(info, comments, false), cloudOnly: true, temperature: 0.4, maxTokens: 10000, system: 'You are an expert YouTube content strategist. Reply with valid JSON only.' });
      }
      ui.progress(out, '영상 분석 중', steps, 3);
      const visual = sanitize(res.data, info);
      const report = `# 유튜브 영상 분석 리포트: ${info.title || id}\n\n${visual.report || ''}`;
      delete visual.report;
      S.current = App.analyses.put({ id, info, comments: comments.slice(0, 12), visual, report, mode, note, model: res.model, analyzed_at: Date.now() });
      S.view = 'dash';
      render();
      if (note) App.toast(note, true);
    } catch (e) {
      console.error(e); ui.err($('#azErr', root), App.ai.friendly(e));
      S.current ? render() : renderEmpty();
    } finally { S.busy = false; ui.busy(btn, false); }
  }

  /* ───────── 렌더링 ───────── */
  function render() {
    const a = S.current; if (!a) return renderEmpty();
    const info = a.info, v = a.visual;
    const tabs = [['dash', icon.chart, '핵심 분석'], ['report', icon.doc, '리포트 전문'], ['script', icon.list, '핵심 스크립트']];
    $('#azOut', root).innerHTML = `
      <div class="grid-side wide-left">
        <aside class="col">
          <article class="panel pad video-card col" style="gap:14px">
            <a class="thumb" href="${esc(info.url)}" target="_blank" rel="noopener"><img src="${esc(info.thumbnail)}" alt="${esc(info.title || '')}">${info.duration_string ? `<span class="dur">${esc(info.duration_string)}</span>` : ''}</a>
            ${a.sample ? '<span class="tag accent" style="align-self:flex-start">🧪 샘플 데이터</span>' : ''}
            <div><h3>${esc(info.title || a.id)}</h3>
              <div class="row" style="margin-top:8px"><span class="tag">${esc(info.channel || '-')}${info.subscribers ? ' · 구독자 ' + App.fmtShort(info.subscribers) : ''}</span>${info.published ? `<span class="tag mono">${esc(info.published.slice(0, 10))}</span>` : ''}</div></div>
            ${info.view_count != null ? `<div class="stats"><div class="stat"><b>${App.fmtShort(info.view_count)}</b><span>조회수</span></div><div class="stat"><b>${App.fmtShort(info.like_count)}</b><span>좋아요</span></div><div class="stat"><b>${App.fmtShort(info.comment_count)}</b><span>댓글</span></div></div>`
              : '<div class="note">ⓘ <span>조회수·좋아요·댓글 수치는 <b>YouTube Data API 키</b>를 등록하면 표시됩니다.</span></div>'}
            <div class="row"><span class="tag ${a.mode === 'video' ? 'accent' : ''}">${a.mode === 'video' ? '🎬 영상 직접 시청 분석' : '📄 메타데이터 기반 분석'}</span><span class="tag mono">${esc(a.model || '')}</span></div>
            ${a.note ? `<div class="note">⚠️ <span>${esc(a.note)}</span></div>` : ''}
          </article>
          <div class="panel pad col" style="gap:8px">
            <h3 class="sec-title" style="margin:0 0 4px">다음 단계로 이어가기</h3>
            <button class="btn btn-primary" data-act="to-plan" type="button">${icon.spark}이 공식으로 새 영상 기획하기</button>
            <button class="btn" data-act="to-channel" type="button">${icon.yt}벤치마킹 채널 세팅 만들기</button>
            <button class="btn" data-act="to-mkt" type="button">${icon.thread}이 영상으로 SNS 마케팅 만들기</button>
          </div>
          ${a.comments?.length ? `<div class="panel pad col" style="gap:8px"><h3 class="sec-title" style="margin:0 0 4px">상위 댓글</h3>${a.comments.slice(0, 6).map(c => `<div class="comment"><span class="lk">👍 ${App.fmtNum(c.like_count)}</span> ${esc(c.text.slice(0, 180))}</div>`).join('')}</div>` : ''}
        </aside>
        <section class="col">
          <div class="row between">
            <div class="tabs">${tabs.map(([k, ic, t]) => `<button data-view="${k}" class="${S.view === k ? 'on' : ''}" type="button">${ic}${t}</button>`).join('')}</div>
            <div class="row">
              <button class="btn btn-sm" data-act="copy-report" type="button">${icon.copy}리포트 복사</button>
              <button class="btn btn-sm" data-act="dl-md" type="button">${icon.dl}.md</button>
              <button class="btn btn-sm" data-act="dl-json" type="button">${icon.dl}JSON</button>
              <button class="btn btn-sm btn-danger" data-act="del" type="button" aria-label="삭제">${icon.trash}</button>
            </div>
          </div>
          <div id="azView"></div>
        </section>
      </div>`;
    renderView();
  }

  function renderView() {
    const a = S.current, v = a.visual, el = $('#azView', root);
    if (S.view === 'report') { el.innerHTML = `<article class="panel pad md">${App.md(a.report)}</article>`; return; }
    if (S.view === 'script') {
      el.innerHTML = `<article class="panel pad">${v.key_script.length ? v.key_script.map(s => `<div class="script-line"><span class="t">${esc(s.time)}</span><span>${esc(s.text)}</span></div>`).join('') : '<p class="muted">핵심 스크립트가 없습니다.</p>'}</article>`;
      return;
    }
    const s = v.sentiment, cs = v.channel_strategy;
    const card = (n, t, sub, body, cls = '') => `<article class="panel card ${cls}"><div class="card-h"><div class="card-t"><span class="num">${n}</span><div>${t}<small>${sub}</small></div></div></div>${body}</article>`;
    el.innerHTML = `<div class="grid-2">
      ${card('01', '제목 · 훅 구조', 'HOOK', `<div class="hook-ab"><div><small>훅 A</small>“${esc(v.hook.part_a)}”</div><div><small>훅 B</small>“${esc(v.hook.part_b)}”</div></div>
        <p style="margin:0;font-size:13.5px;color:var(--ink-2)">${esc(v.hook.mechanism)}</p>
        ${v.title_formula ? `<div class="plabel">제목 공식 <button class="btn btn-xs" data-copy="${esc(v.title_formula)}" type="button">${icon.copy}</button></div><div class="prompt-sm">${esc(v.title_formula)}</div>` : ''}`)}
      ${card('03', '핵심 메시지', 'MESSAGE', `<div class="quote">“${esc(v.core_message)}”</div><div class="chips">${v.keywords.map(k => `<span class="tag accent">${esc(k)}</span>`).join('')}</div>`)}
      ${card('02', '5단계 전개 타임라인', 'PACING', `<div class="timeline">${v.stages.map((st, i) => `<div class="tl" style="--i:${i}"><span class="t">${esc(st.time_range || '-')}</span><b>${esc(st.name)}</b><p>${esc(st.summary)}</p></div>`).join('')}</div>`, 'span-2')}
      ${card('04', '댓글 여론', 'SENTIMENT', s.available && (s.positive + s.neutral + s.negative) ? `
        <div class="senti"><i class="p" style="width:${s.positive}%"></i><i class="n" style="width:${s.neutral}%"></i><i class="x" style="width:${s.negative}%"></i></div>
        <div class="legend"><span style="--c:var(--ok)">긍정 ${s.positive}%</span><span style="--c:hsl(var(--h) 15% 45%)">중립 ${s.neutral}%</span><span style="--c:var(--bad)">부정 ${s.negative}%</span></div>
        <p style="margin:0;font-size:13.5px;color:var(--ink-2)">${esc(s.summary)}</p>` : `<p class="muted" style="margin:0;font-size:13px">댓글 데이터가 없습니다. 설정에서 <b>YouTube Data API 키</b>를 등록하면 상위 댓글을 수집해 여론을 분석합니다.</p>`)}
      ${card('05', '내 영상 적용 플레이북', 'PLAYBOOK', `<div class="tips">${v.tips.map(t => `<div><b>${esc(t.title)}</b><span>${esc(t.summary)}</span>${t.template ? `<div class="prompt-sm" style="margin-top:6px">${esc(t.template)}</div>` : ''}</div>`).join('') || '<p class="muted">-</p>'}</div>`)}
      ${card('06', '채널 전략', 'CHANNEL STRATEGY', `<table class="kv"><tbody>
        <tr><th>원본 채널</th><td>${esc(cs.channel_name)}</td></tr><tr><th>포지셔닝</th><td>${esc(cs.positioning)}</td></tr><tr><th>톤앤매너</th><td>${esc(cs.core_tone)}</td></tr>
        <tr><th>추천 신규 채널</th><td><b>${esc(cs.recommended_new_channel_topic)}</b></td></tr><tr><th>차별화 포인트</th><td>${esc(cs.differentiation_point)}</td></tr></tbody></table>`, 'span-2')}
    </div>`;
  }

  function onClick(e) {
    const pick = e.target.closest('[data-pick]'); if (pick) { $('#azQuery', root).value = `https://youtu.be/${pick.dataset.pick}`; return analyze(pick.dataset.pick); }
    const view = e.target.closest('[data-view]'); if (view) { S.view = view.dataset.view; App.$$('[data-view]', root).forEach(b => b.classList.toggle('on', b === view)); return renderView(); }
    const cp = e.target.closest('[data-copy]'); if (cp) return App.copy(cp.dataset.copy);
    const el = e.target.closest('[data-act]'); if (!el || !S.current) return;
    const a = S.current;
    switch (el.dataset.act) {
      case 'copy-report': return App.copy(a.report, '리포트 복사');
      case 'dl-md': return App.download(`analysis_${App.slug(a.info.title || a.id)}.md`, a.report, 'text/markdown');
      case 'dl-json': return App.download(`analysis_${App.slug(a.info.title || a.id)}.json`, JSON.stringify(a, null, 2), 'application/json');
      case 'del': if (confirm('이 분석 기록을 삭제할까요?')) { App.analyses.remove(a.id); S.current = App.analyses.list()[0] || null; S.current ? render() : renderEmpty(); } return;
      case 'to-plan': return App.go('plan', { reference: a.id });
      case 'to-channel': return App.go('channel', { topic: a.visual.channel_strategy.recommended_new_channel_topic || a.info.title });
      case 'to-mkt': return App.go('marketing', { analysisId: a.id });
    }
  }

  function sample() {
    return {
      id: 'sample_ws1Clj0vOAM', sample: true, mode: 'video', model: 'sample',
      info: { id: 'ws1Clj0vOAM', url: 'https://www.youtube.com/watch?v=ws1Clj0vOAM', thumbnail: 'https://i.ytimg.com/vi/ws1Clj0vOAM/hqdefault.jpg', title: '아파트 30층 높이 쓰레기 산, 서울은 결국 치우지 못했습니다', channel: '신비한 건축사전', subscribers: 700000, view_count: 1680000, like_count: 21000, comment_count: 2300, duration_string: '6:39', published: '2026-08-11' },
      comments: [{ text: '매일 지나다니던 하늘공원이 쓰레기산이었다니 충격이네요', like_count: 3200 }, { text: '메탄가스로 난방까지 한다는 게 진짜 신기함', like_count: 1800 }, { text: '이런 영상 더 만들어주세요. 설명이 너무 깔끔해요', like_count: 950 }],
      visual: {
        hook: { part_a: '아파트 30층 높이 쓰레기 산', part_b: '서울은 결국 치우지 못했습니다', mechanism: '아름다운 공원 풍경과 거대한 쓰레기 산이라는 추악한 현실의 대비로 문제의 심각성을 시각화하고 호기심을 극대화' },
        title_formula: '[익숙한 장소]의 숨겨진 정체, [도시/집단]은 결국 [해결하지 못한 것]',
        stages: [{ name: '도입', time_range: '00:00~00:40', summary: '평화로운 하늘공원 전경, 그 아래의 비밀' }, { name: '갈등', time_range: '00:40~02:10', summary: '15년간 쌓인 9,200만 톤의 쓰레기' }, { name: '난제', time_range: '02:10~03:40', summary: '옮길 수도 태울 수도 없는 이유' }, { name: '반전', time_range: '03:40~05:20', summary: '덮고 가두고 가스를 에너지로' }, { name: '여운', time_range: '05:20~06:39', summary: '지금 우리 쓰레기는 어디로 가는가' }],
        core_message: '도시의 부산물은 사라지지 않으며, 그 존재를 통제하고 관리하는 것이 현대 도시 생태계의 가장 중요한 임무다',
        keywords: ['#난지도', '#쓰레기관리', '#도시공학', '#지속가능성'],
        sentiment: { available: true, summary: '익숙한 장소의 반전에 대한 놀라움과 깔끔한 설명에 대한 호평이 다수', positive: 72, neutral: 21, negative: 7 },
        tips: [{ title: '익숙함 × 충격 대비 훅', summary: '누구나 아는 장소의 숨겨진 정체를 제목에 배치해 클릭을 유도', template: '"매일 보던 [장소], 사실 [충격적 정체]였습니다"' }, { title: '거대 수치의 체감화', summary: '9,200만 톤을 아파트 30층 높이로 환산해 스케일을 즉시 이해시킴', template: '"[수치]는 [익숙한 대상] [N]개를 쌓은 높이입니다"' }, { title: '해결 불가 → 역발상 해법', summary: '치울 수 없다는 난제 뒤에 덮고 활용하는 반전으로 리텐션 유지', template: '"없앨 수 없다면, [역발상 방법]하면 됩니다"' }],
        channel_strategy: { channel_name: '신비한 건축사전', positioning: '도시·건축의 숨은 이야기를 3D 시각화로 풀어주는 지식 채널', core_tone: '차분하고 신뢰감 있는 다큐 내레이션', recommended_new_channel_topic: '우리 동네 인프라의 숨은 정체를 파헤치는 도시 미스터리 채널', differentiation_point: '9:16 쇼츠 + 미니어처 디오라마 단면 시각화로 빠른 템포 구성' },
        key_script: [{ time: '00:00', text: '서울 마포구, 억새가 흔들리는 이 평화로운 공원' }, { time: '00:12', text: '그런데 이 언덕의 높이는 무려 아파트 30층입니다' }, { time: '00:40', text: '1978년부터 15년간 서울의 모든 쓰레기가 이곳에 묻혔습니다' }, { time: '02:10', text: '옮기려면 덤프트럭 900만 대가 필요합니다' }, { time: '03:40', text: '서울시는 치우는 대신, 덮고 가두기로 했습니다' }, { time: '05:20', text: '지금 우리가 버린 쓰레기는 어디로 가고 있을까요?' }],
      },
      report: '# 유튜브 영상 분석 리포트: 아파트 30층 높이 쓰레기 산\n\n### 1. 제목·훅 구조\n- **대비 훅**: “아파트 30층 높이” × “쓰레기 산” — 익숙한 단위로 스케일을 체감시킴\n- **미완결 선언**: “결국 치우지 못했습니다” — 실패의 이유를 궁금하게 만듦\n\n### 2. 전개 방식\n1. **도입** 평화로운 공원 → 정체 공개\n2. **갈등** 수치로 문제의 스케일 제시\n3. **난제** 옮길 수도 태울 수도 없는 이유\n4. **반전** 덮고·가두고·에너지화\n5. **여운** 현재 우리의 쓰레기 문제로 질문\n\n### 3. 핵심 메시지\n> 도시의 부산물은 사라지지 않는다. 관리할 뿐이다.\n\n### 4. 댓글 여론\n- 놀라움(“몰랐다”)과 설명 호평이 주류\n\n### 5. 적용 플레이북\n- 익숙함 × 충격 대비 제목\n- 거대 수치를 익숙한 단위로 환산\n- 해결 불가 → 역발상 해법 구조\n\n### 6. 채널 전략\n- 도시 인프라의 숨은 이야기 × 3D 단면 시각화',
      analyzed_at: Date.now(),
    };
  }

  App.register('analyze', { mount, show });
})();
