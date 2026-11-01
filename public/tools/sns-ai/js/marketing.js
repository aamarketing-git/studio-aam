/* ==========================================================================
   04 마케팅 & SNS — 주제/분석/기획 → 스레드·X 연재 글 · SEO 블로그 · 뉴스레터를 원클릭으로
   ========================================================================== */
(function () {
  'use strict';
  const { $, esc, icon, ui } = App;
  const S = { camp: null, view: 'threads', busy: false, blogRaw: false, coverUrl: null };
  let root;

  const TONES = [['viral_hook', '바이럴 훅'], ['storytelling', '스토리텔링'], ['actionable_tips', '실전 팁'], ['contrarian', '역발상'], ['monetization', '수익화·전환']];
  const TONE_GUIDE = {
    viral_hook: '첫 줄에 강한 호기심 훅, 짧은 문장, 공유하고 싶게',
    storytelling: '개인 경험/사례 중심의 서사, 감정선, 마지막에 깨달음',
    actionable_tips: '바로 따라 할 수 있는 번호 목록형 팁, 구체적 수치',
    contrarian: '통념을 뒤집는 주장으로 시작해 근거로 설득',
    monetization: '문제 → 해결책 → 혜택 → 행동 유도, 전환 중심',
  };
  const PLATFORM_RULE = {
    threads: { name: 'Threads', min: 250, max: 450, limit: 500, rule: '게시물당 250~450자, 줄바꿈으로 가독성, 해시태그는 마지막에 1~3개' },
    twitter: { name: 'X (Twitter)', min: 120, max: 240, limit: 280, rule: '게시물당 120~240자(한글은 2자로 계산되어 280 가중치 한도), 해시태그 0~2개' },
  };
  const BLOG = [['naver', '네이버 블로그'], ['tistory', '티스토리'], ['medium_velog', 'Medium · velog'], ['general', '일반 웹 블로그']];
  const BLOG_GUIDE = {
    naver: '네이버 검색(C-Rank·D.I.A.) 최적화: 친근한 경험형 문체, 소제목마다 키워드 자연 반복, 2,000자 이상, 이미지 위치 안내 [이미지: 설명]',
    tistory: '구글·다음 SEO: 명확한 H2/H3 구조, 목차, 키워드를 제목·첫 문단·소제목에 배치, 1,800자 이상',
    medium_velog: '인사이트형 에세이 + 실무 예시, 간결한 문장, 코드/표 활용 가능',
    general: '일반 SEO 모범 사례: 검색 의도 충족, H2/H3, FAQ, 내부 링크 제안',
  };
  const NEWS = [['weekly', '주간 인사이트'], ['launch', '신규 콘텐츠 알림'], ['curation', '큐레이션'], ['story', '스토리 레터']];
  const xLen = s => { let n = 0; for (const ch of String(s)) { const c = ch.codePointAt(0); n += (c <= 4351 || (c >= 8192 && c <= 8205) || (c >= 8208 && c <= 8223) || (c >= 8242 && c <= 8247)) ? 1 : 2; } return n; };

  function mount(el) {
    root = el;
    el.innerHTML = `
      ${ui.pageHead('STEP 04 · MARKETING & SNS', '하나의 콘텐츠를 <span class="grad">모든 채널</span>로',
        '스레드 · X 연재 글, 검색 상위 노출용 <b>SEO 블로그</b>, 구독자용 <b>뉴스레터</b>를 버튼 하나로 동시에 만듭니다.')}
      <div class="grid-side">
        <aside class="panel pad sticky" id="mkForm">
          <div class="field"><label for="mkTopic">주제 <span class="req">*</span></label><input id="mkTopic" class="input" placeholder="예: 난지도 쓰레기 산이 하늘공원이 된 이야기"></div>
          <div class="field"><label for="mkSrc">불러오기 <span class="opt">선택</span></label><select id="mkSrc" class="select"></select></div>
          <div class="field"><label for="mkCtx">핵심 내용 · 참고 자료</label><textarea id="mkCtx" class="textarea" rows="5" placeholder="영상 대본, 핵심 메시지, 제품 설명 등을 붙여넣으세요. 분석·기획을 불러오면 자동으로 채워집니다."></textarea></div>
          <div class="field"><label for="mkAud">타깃 독자</label><input id="mkAud" class="input" placeholder="예: 도시·건축에 관심 많은 20~30대"></div>
          <details class="more" open><summary>스레드 · X</summary><div class="inner">
            <div class="field">${ui.seg('mkPlat', [['threads', 'Threads'], ['twitter', 'X']], 'threads')}</div>
            <div class="f2"><div class="field"><label for="mkTone">톤</label><select id="mkTone" class="select">${ui.options(TONES, 'viral_hook')}</select></div>
              <div class="field"><label for="mkCount">게시물 수</label><input id="mkCount" class="input" type="number" min="3" max="10" value="5"></div></div>
          </div></details>
          <details class="more"><summary>SEO 블로그</summary><div class="inner">
            <div class="f2"><div class="field"><label for="mkBlogP">플랫폼</label><select id="mkBlogP" class="select">${ui.options(BLOG, 'naver')}</select></div>
              <div class="field"><label for="mkBlogT">톤</label><select id="mkBlogT" class="select">${ui.options([['friendly', '친근한'], ['expert', '전문가'], ['news', '뉴스형']], 'friendly')}</select></div></div>
          </div></details>
          <details class="more"><summary>뉴스레터</summary><div class="inner">
            <div class="field"><label for="mkNewsT">유형</label><select id="mkNewsT" class="select">${ui.options(NEWS, 'weekly')}</select></div>
            <div class="field"><label for="mkCta">CTA 링크 <span class="opt">선택</span></label><input id="mkCta" class="input" type="url" placeholder="https://youtu.be/..."></div>
          </div></details>
          <button id="mkAll" class="btn btn-primary btn-block" type="button">${icon.spark}원클릭 전채널 올인원 생성</button>
          <div class="f3" style="margin-top:8px">
            <button class="btn btn-sm" data-one="threads" type="button">${icon.thread}SNS</button>
            <button class="btn btn-sm" data-one="blog" type="button">${icon.doc}블로그</button>
            <button class="btn btn-sm" data-one="newsletter" type="button">${icon.mail}뉴스레터</button>
          </div>
          <div style="text-align:center"><button id="mkSample" class="link-btn" type="button">샘플 캠페인 보기</button></div>
          <div id="mkErr"></div>
          <div class="sec-title" style="margin-top:22px">캠페인 기록</div>
          <div class="history" id="mkHist"></div>
        </aside>
        <section id="mkOut" class="col" aria-live="polite"></section>
      </div>`;
    $('#mkAll', el).addEventListener('click', () => generate(['threads', 'blog', 'newsletter']));
    el.querySelectorAll('[data-one]').forEach(b => b.addEventListener('click', () => generate([b.dataset.one])));
    $('#mkSrc', el).addEventListener('change', e => { importFrom(e.target.value); e.target.value = ''; });
    $('#mkSample', el).addEventListener('click', () => { S.camp = App.campaigns.put(sample()); S.view = 'threads'; render(); });
    $('#mkHist', el).addEventListener('click', e => { const b = e.target.closest('[data-camp]'); if (b) { S.camp = App.campaigns.get(b.dataset.camp); S.viewSet = false; render(); } });
    $('#mkOut', el).addEventListener('click', onClick);
    App.on('coll:campaigns', fillHist); App.on('coll:analyses', fillSrc); App.on('coll:plans', fillSrc);
    fillSrc(); fillHist();
    const last = App.campaigns.list()[0];
    if (last) { S.camp = last; render(); } else renderEmpty();
  }
  function show(p) {
    if (p?.analysisId) importFrom('a:' + p.analysisId);
    if (p?.planId) importFrom('p:' + p.planId);
  }
  function fillSrc() {
    const a = App.analyses.list(), p = App.plans.list();
    $('#mkSrc', root).innerHTML = '<option value="">분석 · 기획에서 가져오기</option>' +
      (a.length ? `<optgroup label="① 영상 분석">${a.map(x => `<option value="a:${esc(x.id)}">${esc((x.info.title || x.id).slice(0, 40))}</option>`).join('')}</optgroup>` : '') +
      (p.length ? `<optgroup label="② 기획">${p.map(x => `<option value="p:${esc(x.id)}">${esc(x.title.slice(0, 40))}</option>`).join('')}</optgroup>` : '');
  }
  function fillHist() {
    const l = App.campaigns.list();
    $('#mkHist', root).innerHTML = l.length ? l.map(c => `<button data-camp="${esc(c.id)}" type="button"><span>${esc(c.topic.slice(0, 30))}</span><small>${new Date(c.created_at).toLocaleDateString('ko-KR')}</small></button>`).join('') : '<p class="hint" style="margin:0">아직 캠페인이 없습니다.</p>';
  }
  function importFrom(v) {
    if (!v) return;
    const [k, id] = [v.slice(0, 1), v.slice(2)];
    if (k === 'a') {
      const a = App.analyses.get(id); if (!a) return; const vi = a.visual || {};
      $('#mkTopic', root).value = vi.channel_strategy?.recommended_new_channel_topic || a.info.title || '';
      $('#mkCtx', root).value = [`원본 영상: ${a.info.title || ''} (${a.info.url})`, `핵심 메시지: ${vi.core_message || ''}`, `훅: ${vi.hook?.part_a || ''} / ${vi.hook?.part_b || ''}`,
        `전개: ${(vi.stages || []).map(s => `${s.name}-${s.summary}`).join(' → ')}`, `키워드: ${(vi.keywords || []).join(' ')}`, '', (a.report || '').slice(0, 1800)].join('\n');
      if (!$('#mkCta', root).value) $('#mkCta', root).value = a.info.url || '';
    } else {
      const p = App.plans.get(id); if (!p) return;
      $('#mkTopic', root).value = p.title;
      $('#mkCtx', root).value = [`기획 의도: ${p.logline || ''}`, `설명: ${p.description?.summary || ''} ${p.description?.insight || ''}`, `해시태그: ${(p.description?.hashtags || []).join(' ')}`, '', '[대본]', ...p.scenes.map(s => s.narration)].join('\n').slice(0, 4000);
    }
    App.toast('내용을 불러왔습니다');
  }
  function renderEmpty() {
    ui.empty($('#mkOut', root), { icon: 'thread', title: '원소스 멀티유즈 마케팅', text: '주제와 핵심 내용을 넣고 <b>원클릭 전채널 올인원 생성</b>을 누르세요. 분석·기획 결과를 불러오면 더 정확해집니다.',
      items: ['스레드 연재', 'X 스레드', '훅 점수', '해시태그', 'SEO 블로그', '메타 태그', '커버 이미지', '뉴스레터 HTML'] });
  }

  /* ───────── 생성 ───────── */
  const SYS = 'You are a senior Korean growth marketer and SEO copywriter. Reply with valid JSON only.';
  async function genThreads(base, cfg) {
    const pr = PLATFORM_RULE[cfg.platform];
    const { data } = await App.ai.json({ system: SYS, temperature: 0.9, prompt: `${base}
[과제] ${pr.name} 연재 게시물 ${cfg.count}개를 한국어로 작성.
- 플랫폼 규칙: ${pr.rule}
- 톤: ${TONE_GUIDE[cfg.tone]}
- 구성: 1번은 훅(스크롤을 멈추게), 중간은 본문(하나의 포인트씩), 마지막은 CTA(팔로우·댓글·링크 유도)
- 이모지는 절제, 과장·허위 금지
JSON: {"hook_formula":"사용한 훅 공식 한 줄","hook_score":85,"posts":[{"role":"hook|body|cta","text":"","hashtags":["#태그"]}]}` });
    return {
      platform: cfg.platform, tone: cfg.tone, hook_formula: App.str(data.hook_formula, 200), hook_score: Math.max(0, Math.min(100, parseInt(data.hook_score, 10) || 0)),
      posts: (Array.isArray(data.posts) ? data.posts : []).filter(x => x && x.text).slice(0, 10).map(x => ({ role: App.str(x.role, 10), text: App.str(x.text, 1200), hashtags: App.toList(x.hashtags).map(h => '#' + String(h).trim().replace(/^#/, '')).filter(h => h.length > 1).slice(0, 4) })),
    };
  }
  async function genBlog(base, cfg) {
    const { data } = await App.ai.json({ system: SYS, temperature: 0.7, maxTokens: 12000, prompt: `${base}
[과제] ${BLOG.find(b => b[0] === cfg.platform)[1]}용 SEO 블로그 글을 한국어로 작성.
- 플랫폼 가이드: ${BLOG_GUIDE[cfg.platform]}
- 문체: ${{ friendly: '친근한 존댓말', expert: '전문가의 신뢰감 있는 설명체', news: '객관적 기사체' }[cfg.tone]}
- 구조: 도입(검색 의도 공감) → H2 3~5개(각 H3 포함 가능) → 요약 표 또는 체크리스트 → FAQ 3개 → 마무리 CTA
- 마크다운으로 작성, 제목(H1)은 markdown_content에 넣지 말 것
JSON: {"meta":{"title":"60자 이내 SEO 제목","description":"150자 이내 메타 설명","keywords":["핵심","키워드"],"slug":"english-url-slug","reading_time":"5분"},
"cover_image_prompt":"English prompt for a 16:9 blog cover image, no text","markdown_content":"## ...","tags":["태그"]}` });
    const m = data.meta || {};
    return {
      platform: cfg.platform, tone: cfg.tone,
      meta: { title: App.str(m.title, 120), description: App.str(m.description, 300), keywords: App.toList(m.keywords).map(x => String(x).trim()).filter(Boolean).slice(0, 12), slug: App.str(m.slug, 80), reading_time: App.str(m.reading_time, 20) },
      cover_image_prompt: App.str(data.cover_image_prompt, 600), markdown: App.str(data.markdown_content || data.markdown), tags: App.toList(data.tags).map(x => String(x).trim()).filter(Boolean).slice(0, 12),
    };
  }
  async function genNews(base, cfg) {
    const { data } = await App.ai.json({ system: SYS, temperature: 0.75, prompt: `${base}
[과제] ${NEWS.find(n => n[0] === cfg.type)[1]} 이메일 뉴스레터를 한국어로 작성.
- 제목 A/B 2안(각 40자 이내, 하나는 호기심형, 하나는 혜택형), 프리헤더 60자 이내
- 본문: 인사 → 핵심 이야기 2~3 섹션(각 소제목 + 3~5문장) → 한 줄 요약 → CTA 버튼 문구
JSON: {"subjects":["",""],"preheader":"","greeting":"","sections":[{"heading":"","body":""}],"summary":"","cta_text":"","sign_off":""}` });
    const nl = {
      type: cfg.type, cta_url: cfg.cta, subjects: App.toList(data.subjects).map(x => App.str(x, 80)).filter(Boolean).slice(0, 2), preheader: App.str(data.preheader, 120),
      greeting: App.str(data.greeting, 300), sections: (Array.isArray(data.sections) ? data.sections : []).filter(s => s && (s.heading || s.body)).slice(0, 4).map(s => ({ heading: App.str(s.heading, 80), body: App.str(s.body, 1200) })),
      summary: App.str(data.summary, 300), cta_text: App.str(data.cta_text || '자세히 보기', 30), sign_off: App.str(data.sign_off, 200),
    };
    return nl;
  }

  async function generate(kinds) {
    if (S.busy) return;
    ui.err($('#mkErr', root), '');
    const topic = $('#mkTopic', root).value.trim();
    if (!topic) { $('#mkTopic', root).classList.add('invalid'); $('#mkTopic', root).focus(); return; }
    $('#mkTopic', root).classList.remove('invalid');
    if (!App.requireKey('text')) return;
    const ctx = $('#mkCtx', root).value.trim(), aud = $('#mkAud', root).value.trim();
    const base = `[주제] ${topic}\n[타깃 독자] ${aud || '일반 대중'}\n[브랜드] ${App.config.brand?.name || ''}\n[핵심 내용·참고 자료]\n${ctx.slice(0, 5000) || '(없음 — 주제만으로 작성하되 사실이 불확실한 수치는 쓰지 말 것)'}`;
    const cfg = {
      threads: { platform: ui.segVal(root, 'mkPlat') || 'threads', tone: $('#mkTone', root).value, count: Math.max(3, Math.min(10, parseInt($('#mkCount', root).value, 10) || 5)) },
      blog: { platform: $('#mkBlogP', root).value, tone: $('#mkBlogT', root).value },
      newsletter: { type: $('#mkNewsT', root).value, cta: $('#mkCta', root).value.trim() },
    };
    // 같은 주제의 현재 캠페인이 있으면 그 위에 채널을 추가
    const camp = S.camp && S.camp.topic === topic && !S.camp.sample ? { ...S.camp } : { id: App.uid('camp'), topic, context: ctx, audience: aud, created_at: Date.now() };
    const label = { threads: 'SNS 연재 글', blog: 'SEO 블로그', newsletter: '뉴스레터' };
    const steps = kinds.map(k => label[k]);
    const out = $('#mkOut', root); const btns = [$('#mkAll', root), ...root.querySelectorAll('[data-one]')];
    S.busy = true; btns.forEach(b => (b.disabled = true));
    const errs = [];
    try {
      for (const [i, k] of kinds.entries()) {
        ui.progress(out, '마케팅 콘텐츠 생성 중', steps, i);
        try {
          if (k === 'threads') camp.threads = await genThreads(base, cfg.threads);
          if (k === 'blog') { camp.blog = await genBlog(base, cfg.blog); camp.blog.cover = false; }
          if (k === 'newsletter') camp.newsletter = await genNews(base, cfg.newsletter);
        } catch (e) { if (e.status === 401 || e.status === 403 || (e.status === 400 && /api key/i.test(e.message))) throw e; errs.push(`${label[k]}: ${App.ai.friendly(e)}`); }
      }
      if (!camp.threads && !camp.blog && !camp.newsletter) throw new Error(errs.join(' / ') || '생성에 실패했습니다.');
      S.camp = App.campaigns.put(camp); S.view = kinds[0]; S.viewSet = true;
      render();
      if (errs.length) ui.err($('#mkErr', root), errs.join(' / ')); else App.toast('마케팅 콘텐츠를 만들었습니다');
    } catch (e) { console.error(e); ui.err($('#mkErr', root), App.ai.friendly(e)); S.camp ? render() : renderEmpty(); }
    finally { S.busy = false; btns.forEach(b => (b.disabled = false)); }
  }

  /* ───────── 렌더링 ───────── */
  function render() {
    const c = S.camp; if (!c) return renderEmpty();
    const tabs = [['threads', icon.thread, 'SNS 연재'], ['blog', icon.doc, 'SEO 블로그'], ['newsletter', icon.mail, '뉴스레터']];
    if (!S.viewSet) { S.view = tabs.find(t => c[t[0]])?.[0] || 'threads'; S.viewSet = true; }
    $('#mkOut', root).innerHTML = `
      <div class="row between">
        <div class="tabs">${tabs.map(([k, ic, t]) => `<button data-view="${k}" class="${S.view === k ? 'on' : ''}" type="button">${ic}${t}${c[k] ? '' : ' <span class="muted">·</span>'}</button>`).join('')}</div>
        <div class="row">${c.sample ? '<span class="tag accent">🧪 샘플</span>' : ''}<span class="tag">${esc(c.topic.slice(0, 30))}</span>
          <button class="btn btn-sm" data-act="dl-json" type="button">${icon.dl}JSON</button>
          <button class="btn btn-sm btn-danger" data-act="del" type="button" aria-label="캠페인 삭제">${icon.trash}</button></div>
      </div>
      <div id="mkView"></div>`;
    renderView();
  }
  function renderView() {
    const c = S.camp, el = $('#mkView', root);
    const missing = (k, t) => `<div class="panel empty"><div class="orb">${icon.spark}</div><h3>${t}이(가) 아직 없습니다</h3><p>왼쪽 설정을 확인하고 생성 버튼을 누르세요.</p><button class="btn btn-soft" data-gen="${k}" type="button">${icon.spark}${t} 생성</button></div>`;
    if (S.view === 'threads') {
      const t = c.threads; if (!t) { el.innerHTML = missing('threads', 'SNS 연재 글'); return; }
      const pr = PLATFORM_RULE[t.platform] || PLATFORM_RULE.threads;
      el.innerHTML = `<div class="col">
        <div class="panel pad row between">
          <div class="row"><span class="tag accent">${esc(pr.name)}</span><span class="tag">${esc((TONES.find(x => x[0] === t.tone) || ['', t.tone])[1])}</span>${t.hook_score ? `<span class="vchk ${t.hook_score >= 80 ? 'ok' : 'warn'}">훅 점수 ${t.hook_score}</span>` : ''}</div>
          <div class="row"><button class="btn btn-sm" data-act="copy-thread" type="button">${icon.copy}전체 복사</button><button class="btn btn-sm" data-act="dl-thread" type="button">${icon.dl}.txt</button></div>
          ${t.hook_formula ? `<div class="hint" style="width:100%">훅 공식: ${esc(t.hook_formula)}</div>` : ''}
        </div>
        ${t.posts.map((p, i) => { const full = postText(p); const n = t.platform === 'twitter' ? xLen(full) : [...full].length; const over = n > pr.limit;
          return `<article class="panel post card" style="animation-delay:${i * 50}ms"><div class="post-meta"><div class="row"><span class="num">${i + 1}</span><span class="tag">${esc(p.role || '')}</span></div>
            <div class="row"><span class="count ${over ? 'over' : ''}">${n} / ${pr.limit}${t.platform === 'twitter' ? ' (가중치)' : '자'}</span><button class="btn btn-xs" data-copy-post="${i}" type="button">${icon.copy}복사</button></div></div>
            <div class="txt">${esc(p.text)}</div>${p.hashtags.length ? `<div class="chips">${p.hashtags.map(h => `<span class="tag accent">${esc(h)}</span>`).join('')}</div>` : ''}</article>`; }).join('')}
      </div>`;
      return;
    }
    if (S.view === 'blog') {
      const b = c.blog; if (!b) { el.innerHTML = missing('blog', 'SEO 블로그'); return; }
      el.innerHTML = `<div class="col">
        <div class="panel pad col" style="gap:10px">
          <div class="row between"><h3 class="sec-title" style="margin:0;flex:1">SEO 메타</h3><span class="tag accent">${esc((BLOG.find(x => x[0] === b.platform) || ['', b.platform])[1])}</span>${b.meta.reading_time ? `<span class="tag">⏱ ${esc(b.meta.reading_time)}</span>` : ''}</div>
          <table class="kv"><tbody>
            <tr><th>제목 <span class="count ${b.meta.title.length > 60 ? 'over' : ''}">${b.meta.title.length}/60</span></th><td><b>${esc(b.meta.title)}</b> <button class="btn btn-xs" data-copy="${esc(b.meta.title)}" type="button">${icon.copy}</button></td></tr>
            <tr><th>메타 설명 <span class="count ${b.meta.description.length > 160 ? 'over' : ''}">${b.meta.description.length}/160</span></th><td>${esc(b.meta.description)} <button class="btn btn-xs" data-copy="${esc(b.meta.description)}" type="button">${icon.copy}</button></td></tr>
            <tr><th>키워드</th><td>${b.meta.keywords.map(k => `<code class="c">${esc(k)}</code>`).join('')}</td></tr>
            ${b.meta.slug ? `<tr><th>URL 슬러그</th><td><code class="c">${esc(b.meta.slug)}</code></td></tr>` : ''}
          </tbody></table>
          <div class="grid-2" style="align-items:start">
            <div class="media r169" id="mkCover">${b.cover ? '' : `<div class="ph">${icon.img}커버 이미지</div>`}</div>
            <div class="col" style="gap:8px"><div class="plabel">COVER PROMPT <button class="btn btn-xs" data-copy="${esc(b.cover_image_prompt)}" type="button">${icon.copy}</button></div><div class="prompt-sm">${esc(b.cover_image_prompt)}</div>
              <div class="row"><button class="btn btn-sm btn-soft" data-act="cover" type="button">${icon.spark}${b.cover ? '다시 생성' : 'AI 커버 생성'}</button>${b.cover ? `<button class="btn btn-sm" data-act="dl-cover" type="button">${icon.dl}PNG</button>` : ''}</div></div>
          </div>
        </div>
        <div class="row between">
          <div class="tabs"><button data-raw="0" class="${S.blogRaw ? '' : 'on'}" type="button">미리보기</button><button data-raw="1" class="${S.blogRaw ? 'on' : ''}" type="button">마크다운</button></div>
          <div class="row"><button class="btn btn-sm" data-act="copy-md" type="button">${icon.copy}마크다운</button><button class="btn btn-sm" data-act="copy-html" type="button">${icon.copy}HTML</button><button class="btn btn-sm" data-act="dl-md" type="button">${icon.dl}.md</button></div>
        </div>
        ${S.blogRaw ? `<pre class="box mono tall">${esc(blogMd(b))}</pre>` : `<article class="panel pad md">${App.md(blogMd(b))}</article>`}
      </div>`;
      if (b.cover) App.db.get(`cover:${c.id}`).then(r => { if (!r || S.camp !== c) return; if (S.coverUrl) URL.revokeObjectURL(S.coverUrl); S.coverUrl = URL.createObjectURL(r); const box = $('#mkCover', root); if (box) box.innerHTML = `<img src="${S.coverUrl}" alt="블로그 커버">`; }).catch(() => {});
      return;
    }
    const n = c.newsletter; if (!n) { el.innerHTML = missing('newsletter', '뉴스레터'); return; }
    el.innerHTML = `<div class="col">
      <div class="panel pad col" style="gap:8px">
        <h3 class="sec-title" style="margin:0 0 4px">제목 A/B 테스트</h3>
        ${n.subjects.map((s, i) => `<div class="subject"><span class="num">${'AB'[i]}</span><b>${esc(s)}</b><button class="btn btn-xs" data-copy="${esc(s)}" type="button">${icon.copy}</button></div>`).join('')}
        <div class="hint">프리헤더: ${esc(n.preheader)}</div>
      </div>
      <div class="row between"><span class="hint">이메일 미리보기 (스티비 · 메일침프 · Gmail에 붙여넣기 가능한 인라인 스타일 HTML)</span>
        <div class="row"><button class="btn btn-sm" data-act="copy-email" type="button">${icon.copy}HTML 복사</button><button class="btn btn-sm" data-act="copy-plain" type="button">${icon.copy}텍스트</button><button class="btn btn-sm" data-act="dl-email" type="button">${icon.dl}.html</button></div></div>
      <iframe class="email-frame" id="mkFrame" title="뉴스레터 미리보기" sandbox=""></iframe>
    </div>`;
    $('#mkFrame', root).srcdoc = emailHtml(n, c);
  }
  const postText = p => p.text + (p.hashtags.length && !p.hashtags.every(h => p.text.includes(h)) ? '\n\n' + p.hashtags.filter(h => !p.text.includes(h)).join(' ') : '');
  const blogMd = b => `# ${b.meta.title}\n\n${b.markdown}${b.tags?.length ? `\n\n---\n${b.tags.map(t => '#' + t.replace(/^#/, '')).join(' ')}` : ''}`;
  function emailHtml(n, c) {
    const h = App.config.theme?.hue ?? 174;
    const accent = `hsl(${h},70%,36%)`, soft = `hsl(${h},60%,95%)`;
    const brand = esc(App.config.brand?.name || '');
    const p = s => esc(s).replace(/\n/g, '<br>');
    return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(n.subjects[0] || '')}</title></head>
<body style="margin:0;padding:0;background:#eef3f3;font-family:'Apple SD Gothic Neo','Malgun Gothic',Arial,sans-serif;color:#1f2a2a">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(n.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef3f3;padding:24px 0"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden">
<tr><td style="background:${accent};padding:22px 28px;color:#fff;font-size:14px;font-weight:700;letter-spacing:.5px">${brand}</td></tr>
<tr><td style="padding:30px 28px 6px"><h1 style="margin:0 0 14px;font-size:22px;line-height:1.4;color:#0f1f1f">${esc(n.subjects[0] || c.topic)}</h1>
<p style="margin:0;font-size:15px;line-height:1.75">${p(n.greeting)}</p></td></tr>
${n.sections.map(s => `<tr><td style="padding:18px 28px 0"><h2 style="margin:0 0 8px;font-size:17px;color:${accent}">${esc(s.heading)}</h2><p style="margin:0;font-size:15px;line-height:1.75">${p(s.body)}</p></td></tr>`).join('')}
${n.summary ? `<tr><td style="padding:22px 28px 0"><div style="background:${soft};border-left:4px solid ${accent};padding:14px 16px;border-radius:8px;font-size:14.5px;line-height:1.6"><b>한 줄 요약</b><br>${p(n.summary)}</div></td></tr>` : ''}
${n.cta_url ? `<tr><td align="center" style="padding:26px 28px 6px"><a href="${esc(n.cta_url)}" style="display:inline-block;background:${accent};color:#fff;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:10px;font-size:15px">${esc(n.cta_text)}</a></td></tr>` : ''}
<tr><td style="padding:22px 28px 30px;font-size:14px;line-height:1.7;color:#4a5a5a">${p(n.sign_off)}</td></tr>
<tr><td style="background:#f6f9f9;padding:16px 28px;font-size:12px;color:#8a9a9a">이 메일은 ${brand || '뉴스레터'} 구독자에게 발송되었습니다. · 수신 거부</td></tr>
</table></td></tr></table></body></html>`;
  }
  const emailPlain = n => [n.subjects[0], '', n.greeting, '', ...n.sections.map(s => `■ ${s.heading}\n${s.body}\n`), n.summary ? `요약: ${n.summary}` : '', n.cta_url ? `${n.cta_text}: ${n.cta_url}` : '', '', n.sign_off].join('\n');

  async function onClick(e) {
    const c = S.camp;
    const v = e.target.closest('[data-view]'); if (v) { S.view = v.dataset.view; return render(); }
    const raw = e.target.closest('[data-raw]'); if (raw) { S.blogRaw = raw.dataset.raw === '1'; return renderView(); }
    const g = e.target.closest('[data-gen]'); if (g) return generate([g.dataset.gen]);
    const cp = e.target.closest('[data-copy]'); if (cp) return App.copy(cp.dataset.copy);
    const cpp = e.target.closest('[data-copy-post]'); if (cpp) return App.copy(postText(c.threads.posts[+cpp.dataset.copyPost]), `${+cpp.dataset.copyPost + 1}번 게시물 복사`);
    const a = e.target.closest('[data-act]'); if (!a || !c) return;
    const name = App.slug(c.topic);
    const thread = () => c.threads.posts.map((p, i) => `${i + 1}/${c.threads.posts.length}\n${postText(p)}`).join('\n\n---\n\n');
    switch (a.dataset.act) {
      case 'copy-thread': return App.copy(thread(), '전체 게시물 복사');
      case 'dl-thread': return App.download(`sns_${name}.txt`, thread());
      case 'copy-md': return App.copy(blogMd(c.blog), '마크다운 복사');
      case 'copy-html': return App.copy(App.md(blogMd(c.blog)), 'HTML 복사');
      case 'dl-md': return App.download(`blog_${name}.md`, blogMd(c.blog), 'text/markdown');
      case 'copy-email': return App.copy(emailHtml(c.newsletter, c), '이메일 HTML 복사');
      case 'copy-plain': return App.copy(emailPlain(c.newsletter), '텍스트 복사');
      case 'dl-email': return App.download(`newsletter_${name}.html`, emailHtml(c.newsletter, c), 'text/html');
      case 'dl-json': return App.download(`campaign_${name}.json`, JSON.stringify(c, null, 2), 'application/json');
      case 'del':
        if (!confirm('이 캠페인을 삭제할까요?')) return;
        App.campaigns.remove(c.id); App.db.del(`cover:${c.id}`).catch(() => {});
        S.camp = App.campaigns.list()[0] || null; return S.camp ? render() : renderEmpty();
      case 'cover': {
        if (!App.requireKey()) return;
        const box = $('#mkCover', root); box?.classList.add('loading'); ui.busy(a, true, '생성 중');
        try {
          const url = await App.ai.image(c.blog.cover_image_prompt || `${c.topic}, editorial blog cover, no text`, '16:9');
          await App.db.set(`cover:${c.id}`, await App.dataURLToBlob(url));
          c.blog.cover = true; App.campaigns.put(c); renderView(); App.toast('커버 이미지를 만들었습니다');
        } catch (er) { App.toast(App.ai.friendly(er), true); box?.classList.remove('loading'); ui.busy(a, false); }
        return;
      }
      case 'dl-cover': { const r = await App.db.get(`cover:${c.id}`).catch(() => null); if (r) App.download(`cover_${name}.png`, r); return; }
    }
  }

  function sample() {
    return {
      id: 'sample_campaign', sample: true, topic: '난지도 쓰레기 산이 하늘공원이 된 이야기', audience: '도시·건축에 관심 많은 20~30대', context: '', created_at: Date.now(),
      threads: { platform: 'threads', tone: 'viral_hook', hook_score: 86, hook_formula: '익숙한 장소 × 충격적 정체 공개',
        posts: [
          { role: 'hook', text: '매일 산책하던 하늘공원.\n그 언덕 높이가 아파트 30층이라는 거 알고 계셨나요?\n\n사실 그건 산이 아니라\n15년 동안 쌓인 서울의 쓰레기입니다. 🧵', hashtags: [] },
          { role: 'body', text: '1978년부터 1993년까지,\n서울에서 나온 쓰레기는 전부 난지도로 갔습니다.\n\n그 양이 무려 9,200만 톤.\n덤프트럭 900만 대 분량이에요.', hashtags: [] },
          { role: 'body', text: '문제는 치울 방법이 없었다는 것.\n\n옮기기엔 너무 많고,\n태우면 유독가스,\n그대로 두면 침출수가 한강으로.', hashtags: [] },
          { role: 'body', text: '그래서 서울은 발상을 바꿨습니다.\n\n✔️ 흙으로 덮고\n✔️ 차수벽으로 가두고\n✔️ 메탄가스는 모아서 난방 에너지로\n\n없앨 수 없다면, 관리하면 된다.', hashtags: [] },
          { role: 'cta', text: '그럼 지금 우리가 버리는 쓰레기는 어디로 갈까요?\n\n도시의 숨은 이야기, 다음 편에서 이어갑니다.\n팔로우하고 놓치지 마세요 👀', hashtags: ['#난지도', '#하늘공원', '#도시이야기'] },
        ] },
      blog: { platform: 'naver', tone: 'friendly', cover: false, cover_image_prompt: 'Aerial view of a lush green hill park with silver grass at golden hour, cross-section revealing layered waste underneath, miniature diorama style, 16:9, no text',
        meta: { title: '하늘공원의 정체, 9,200만 톤 쓰레기 산이 공원이 되기까지', description: '서울 하늘공원이 원래 난지도 쓰레기 매립지였다는 사실과, 치울 수 없던 쓰레기 산을 공원으로 바꾼 도시공학 이야기를 쉽게 정리했습니다.', keywords: ['하늘공원', '난지도', '쓰레기 매립지', '서울 공원', '도시공학'], slug: 'nanjido-sky-park-story', reading_time: '5분' },
        markdown: '하늘공원 억새축제, 다들 한 번쯤 가보셨죠? 그런데 그 언덕이 **원래 쓰레기 산**이었다는 사실, 알고 계셨나요?\n\n## 난지도는 어떤 곳이었을까\n1978년부터 15년 동안 서울의 모든 쓰레기가 이곳에 묻혔습니다.\n\n### 숫자로 보는 난지도\n| 항목 | 수치 |\n|---|---|\n| 매립 기간 | 1978~1993 |\n| 쓰레기 양 | 약 9,200만 톤 |\n| 높이 | 아파트 약 30층 |\n\n## 왜 치우지 못했을까\n- 옮기려면 덤프트럭 수백만 대\n- 소각하면 유독가스\n- 방치하면 침출수\n\n## 서울의 역발상: 덮고, 가두고, 활용하고\n> 없앨 수 없다면 관리하면 된다.\n\n## 자주 묻는 질문\n**Q. 지금도 가스가 나오나요?**\n네, 포집해 인근 지역 난방에 활용합니다.\n\n**Q. 산책해도 안전한가요?**\n복토와 차수 시설로 안전하게 관리되고 있습니다.\n\n## 마무리\n다음에 하늘공원에 가신다면, 발밑의 이야기를 한 번 떠올려 보세요.', tags: ['하늘공원', '난지도', '서울여행'] },
      newsletter: { type: 'weekly', cta_url: 'https://www.youtube.com/watch?v=ws1Clj0vOAM', subjects: ['매일 걷던 그 공원, 사실 쓰레기 산이었습니다', '이번 주 도시 이야기: 9,200만 톤의 반전'], preheader: '치울 수 없던 쓰레기를 서울은 어떻게 했을까요?',
        greeting: '안녕하세요! 이번 주도 도시의 숨은 이야기를 들고 왔어요.', sections: [{ heading: '하늘공원의 정체', body: '억새로 유명한 하늘공원은 사실 15년간 쌓인 서울의 쓰레기 산입니다. 높이는 무려 아파트 30층.' }, { heading: '치울 수 없었던 이유', body: '옮기기엔 너무 많고, 태우면 유독가스가 나왔죠. 그대로 두면 침출수가 한강으로 흘러들었습니다.' }, { heading: '도시의 역발상', body: '서울은 쓰레기를 덮고, 가두고, 메탄가스를 에너지로 바꾸는 길을 택했습니다.' }],
        summary: '없앨 수 없는 문제는 관리하는 것이 답이다.', cta_text: '영상으로 보기', sign_off: '다음 주에도 흥미로운 도시 이야기로 찾아올게요.\n고맙습니다!' },
    };
  }

  App.register('marketing', { mount, show });
})();
