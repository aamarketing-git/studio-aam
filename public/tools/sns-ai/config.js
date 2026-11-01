/* ==========================================================================
   SNS AI 마케팅 자동화 — 사이트별 설정 파일
   --------------------------------------------------------------------------
   다른 웹사이트에 넣을 때는 "이 파일만" 고치면 됩니다.
   (브랜드명 · 색상 · 보이는 탭 · 기본값 · 푸터 링크)
   ========================================================================== */
window.SITE_CONFIG = {
  // ── 브랜드 ──────────────────────────────────────────────
  brand: {
    name: 'SNS AI 마케팅 자동화',          // 상단 로고 옆 이름 · 문서 제목
    short: 'SA',                           // 로고 박스 안 글자 (logoUrl이 없을 때)
    logoUrl: '',                           // 로고 이미지 경로 (예: 'assets/logo.png')
    tagline: '분석 → 기획 → 제작·업로드 → 마케팅',
    description: '유튜브 벤치마킹 분석부터 숏폼 기획·나레이션·영상 제작·업로드, SNS·블로그·뉴스레터 마케팅까지 내 Gemini API 키로 한 번에 자동화합니다.',
  },

  // ── 색상 테마 ──────────────────────────────────────────
  // hue: 174 = 청록(기본) · 200 = 하늘 · 260 = 보라 · 340 = 핑크 · 30 = 오렌지
  theme: { hue: 174 },

  // ── 보이는 탭과 순서 ──────────────────────────────────
  // 'channel'(채널 세팅) 'analyze'(영상 분석) 'plan'(기획·나레이션) 'produce'(제작·업로드) 'marketing'(마케팅 & SNS)
  tabs: ['channel', 'analyze', 'plan', 'produce', 'marketing'],
  defaultTab: 'channel',

  // ── 기본값 ────────────────────────────────────────────
  defaults: {
    lang: 'ko',            // 기획·마케팅 결과 언어
    aspect: '9:16',        // 기획 기본 비율 (16:9 / 9:16)
    sceneSeconds: 8,       // 씬 길이 (8 / 15 / 20)
    scenes: 6,             // 씬 개수
    voice: 'Kore',         // Gemini TTS 기본 음성
  },

  // ── 저장소 접두어 ─────────────────────────────────────
  // 한 도메인에 여러 사이트를 올릴 때 서로 데이터가 섞이지 않도록 사이트마다 다르게 지정
  storagePrefix: 'aam_snsai_',

  // ── 내 목소리 (Qwen3-TTS 보이스 클로닝) 서버 ──────────
  // 방문자 PC에서 voice-server/run_voice_server.bat 실행 시 기본 주소. GPU 서버를 따로 운영하면 그 https 주소로 변경
  voiceServer: 'http://127.0.0.1:8805',
  voiceServerDownload: 'voice-server.zip', // 방문자가 받을 '내 PC 목소리 서버' 묶음

  // ── 클라우드 내 목소리 (설치 없음 · 방문자 본인의 DashScope 키) ──
  // voice-proxy/worker.js 를 Cloudflare Workers에 배포한 주소. 비우면 클라우드 방식이 숨겨지고 '내 PC' 방식만 보입니다.
  voiceProxy: '',                          // 예: 'https://snsai-voice-proxy.내계정.workers.dev'
  voiceEngine: 'cloud',                    // 기본 방식: 'cloud'(설치 없음) · 'local'(내 PC Qwen3-TTS)
  cloudVoiceModel: 'qwen-audio-3.1-tts-flash', // 클라우드 합성 모델 (flash=저렴·빠름 / plus=고품질)

  // ── 로컬 LLM (LM Studio · Ollama) ──────────────────────
  // 채널 세팅 · 기획 대본 · 마케팅 글을 방문자 PC의 로컬 모델로 생성 (영상 분석 · 이미지/영상 생성은 항상 Gemini)
  localLLM: {
    defaultEngine: 'gemini',               // 첫 방문 기본값: 'gemini' | 'local'
    lmstudioUrl: 'http://127.0.0.1:1234',  // LM Studio Local Server (Enable CORS 필요)
    ollamaUrl: 'http://127.0.0.1:11434',   // Ollama (localhost 외 주소에서 열면 OLLAMA_ORIGINS 필요)
    numCtx: 16384,                         // Ollama 컨텍스트 길이 (기본 4096은 긴 프롬프트가 잘림)
  },

  // ── 푸터 ──────────────────────────────────────────────
  footer: {
    text: '© AAM Studio · SNS AI 마케팅 자동화',
    links: [
      { label: 'AAM Studio 홈', url: '/' },
      { label: '7분 AI 기획실', url: '/#planner' },
      { label: '카카오톡 상담', url: 'http://pf.kakao.com/_axaUrX/chat' },
    ],
  },
};
