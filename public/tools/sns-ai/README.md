# SNS AI 마케팅 자동화 — 기본 자동화 생성기 (BYO API Key)

서버가 필요 없는 **정적 웹앱**입니다. 이 폴더를 그대로 아무 웹사이트에 올리면 됩니다.
방문자가 **자신의 Gemini API 키**를 넣으면 브라우저에서 Google API를 직접 호출합니다.
키는 방문자 브라우저에만 저장되고, 사이트 서버로는 보내지 않습니다.

```
sns-ai-marketing/
├─ index.html        앱 화면 (상단 탭 · 설정 모달 · 푸터)
├─ config.js         ★ 사이트별 설정 (이 파일만 고치면 됨)
├─ css/style.css     디자인 시스템 (청록 기본, hue 하나로 전체 색 변경)
├─ js/
│  ├─ core.js        공통: 저장소 · Gemini/YouTube API · 라우터 · 설정 모달
│  ├─ voice.js       내 목소리 등록 · Qwen3-TTS 보이스 클로닝 클라이언트
│  ├─ channel.js     00 채널 세팅   (채널명 · 핸들 · 소개 · 프로필/배너 이미지)
│  ├─ analyze.js     01 영상 분석   (링크 → Gemini가 영상 직접 시청 → 흥행 공식)
│  ├─ plan.js        02 기획·나레이션 (제목 3안 · 5단계 씬 대본 · 프롬프트 · AI 음성 / 내 목소리)
│  ├─ produce.js     03 제작·업로드 (AI 이미지 · 브라우저 영상 합성 · 유튜브 업로드)
│  └─ marketing.js   04 마케팅 & SNS (스레드/X · SEO 블로그 · 뉴스레터)
└─ voice-server/     내 목소리 합성 서버 (방문자 PC에서 실행, 선택)
   ├─ qwen_voice_server.py      Qwen3-TTS 보이스 클로닝 로컬 서버 (http://127.0.0.1:8805)
   ├─ run_voice_server.bat      Windows 원클릭 실행 (처음 한 번 자동 설치)
   ├─ run_voice_server.command  macOS 실행
   └─ requirements.txt          torch · qwen-tts · soundfile · numpy
```

## 1. 다른 웹사이트에 넣기

1. 폴더 전체를 웹 서버에 올립니다. 경로는 아무 데나 괜찮습니다 (예: `https://내사이트.com/ai/`).
   - 정적 호스팅이면 됩니다: Netlify, Vercel, GitHub Pages, Cloudflare Pages, 카페24/가비아 웹호스팅, 아임웹·워드프레스의 파일 업로드 등.
2. 사이트 메뉴에서 `.../sns-ai-marketing/index.html`로 링크합니다.
3. 사이트마다 `config.js`만 바꿉니다.

| 항목 | 설명 |
|---|---|
| `brand.name / short / logoUrl / tagline` | 상단 로고와 이름, 문서 제목 |
| `theme.hue` | 전체 색상. 174 = 청록(기본), 200 = 하늘, 260 = 보라, 340 = 핑크, 30 = 오렌지 |
| `tabs` | 보여줄 탭과 순서. 예: `['analyze','marketing']`만 넣으면 분석 + 마케팅 전용 사이트가 됩니다 |
| `defaultTab` | 처음 열리는 탭 |
| `defaults` | 언어 · 화면 비율 · 씬 길이 · 씬 개수 · 기본 음성 |
| `storagePrefix` | **한 도메인에 여러 개를 올릴 때 사이트마다 다르게** 지정해야 기록이 섞이지 않습니다 |
| `footer` | 푸터 문구와 링크 |

> 로컬 PC에서는 `index.html`을 더블클릭해도 동작합니다 (`file://`).
> 유튜브 업로드(OAuth)만은 `http(s)://` 주소에서 열어야 합니다.

## 2. 방문자가 넣는 키

화면 오른쪽 위 **API 키 필요** 버튼을 누르면 설정 창이 열립니다.

| 키 | 필수 | 용도 | 발급 |
|---|---|---|---|
| Gemini API 키 | ✅ (로컬 LLM 모드면 영상 분석·이미지에만 필요) | 분석 · 기획 · 이미지 · 나레이션 · 마케팅 전부 | [Google AI Studio](https://aistudio.google.com/apikey) |
| YouTube Data API 키 | 선택 | 조회수 · 좋아요 · 댓글 수집, 키워드 검색 | Google Cloud Console → *YouTube Data API v3* 사용 설정 → API 키 |
| OAuth 클라이언트 ID | 선택 | ③ 탭의 유튜브 업로드 | Cloud Console → 사용자 인증 정보 → OAuth 클라이언트 ID (*웹 애플리케이션*) |

OAuth 클라이언트 ID를 만들 때는 **승인된 JavaScript 원본**에 사이트 주소(예: `https://내사이트.com`)를 넣어야 합니다.
OAuth 동의 화면이 *테스트* 상태면, 테스트 사용자로 등록한 구글 계정만 업로드할 수 있습니다.

- "이 브라우저에 키 기억하기"를 끄면 탭을 닫을 때 키가 지워집니다 (sessionStorage).
- 설정 창의 **모든 데이터 삭제**를 누르면 키, 기록, 이미지, 음성이 전부 지워집니다.

### 로컬 LLM (LM Studio · Ollama) — 원본 TubeInsight의 로컬 구동 옵션
설정 → **텍스트 AI 엔진 → 로컬 LLM**을 고르면 글 생성은 내 PC 모델이 맡고, Gemini 키 없이도 쓸 수 있습니다.

| 기능 | 로컬 LLM 모드에서 |
|---|---|
| 채널 세팅(이름·소개·키워드) · 기획 대본 · 교정 · 프롬프트 · 마케팅(SNS·블로그·뉴스레터) | **로컬 모델** |
| 영상 분석 · 이미지/썸네일/영상 생성 · Gemini AI 음성 | 항상 **Gemini** (키 필요) |
| 내 목소리 나레이션 | 클라우드 / 내 PC 방식 그대로 |

- 백엔드는 **자동(LM Studio 우선)**, LM Studio, Ollama 중에서 고릅니다. 모델도 각각 고를 수 있습니다 (설정 창에서 감지).
- **LM Studio**: Developer → Local Server **Start** → **Enable CORS** 켜기 → 모델 로드. 명령줄은 `lms server start --cors`. 서버 설정에 **Require API token**이 켜져 있으면 설정 창의 *LM Studio API 토큰*에 토큰을 넣어야 합니다. 토큰 없이 *자동* 모드로 두면 LM Studio를 건너뛰고 Ollama를 씁니다.
- **Ollama**: `ollama pull gemma3`. `http://localhost` / `127.0.0.1`에서 연 페이지는 바로 됩니다. 다른 주소의 사이트에서 쓰려면 `OLLAMA_ORIGINS=https://내사이트.com`을 설정하고 Ollama를 다시 시작합니다.
- 원본과 같이 동작합니다: 응답이 끊기면 자동으로 이어 쓰고, Ollama 컨텍스트를 16384로 늘리고, 깨진 JSON을 복구합니다. 추론 모델은 생각 과정을 빼고 답만 씁니다.
- 한국어를 잘하는 7B 이상 모델을 권장합니다. 1B 안팎 모델은 JSON이나 글 품질이 불안정합니다.

## 3. 내 목소리 나레이션 (Qwen3-TTS 보이스 클로닝)

방식은 두 가지이고, 방문자가 **② 기획 → 내 목소리** 창에서 고릅니다.

| | ☁️ 클라우드 (기본) | 💻 내 PC |
|---|---|---|
| 방문자 설치 | 없음 | torch · qwen-tts · 모델 (약 6GB) |
| 필요한 것 | 본인 Alibaba Model Studio(DashScope) API 키 + Workspace ID | `run_voice_server.bat` 실행 |
| 비용 | 목소리 등록 무료, 합성은 방문자 계정에 과금 | 무료 |
| 속도 | 빠름 | GPU 없으면 씬당 수십 초 |
| 사이트 운영자 준비 | `voice-proxy/` Worker 한 번 배포 → `config.js` `voiceProxy`에 주소 | 없음 |

### ☁️ 클라우드 방식 준비 (운영자 1회)
[`voice-proxy/README.md`](voice-proxy/README.md)대로 Cloudflare Worker를 배포하고 `config.js`에 주소를 넣습니다.
`voiceProxy`가 비어 있으면 클라우드 선택지는 숨겨지고 '내 PC' 방식만 보입니다.

### 💻 내 PC 방식
TubeInsight의 **내 목소리 등록** 기능을 웹 버전으로 옮겼습니다. 모델은 오픈소스 `Qwen/Qwen3-TTS-12Hz-0.6B-Base`이고, 방문자 PC에서 무료로 돌아갑니다.

1. `voice-server/run_voice_server.bat`을 더블클릭합니다 (Mac은 `run_voice_server.command`).
   - 처음 실행할 때는 가상환경을 만들고 torch · qwen-tts를 설치합니다 (수 GB).
   - 첫 합성 때 모델을 다운로드합니다.
2. 웹앱에서 **② 기획 → 내 목소리**를 누릅니다. 참조 문장을 5~20초 동안 읽으며 녹음하거나 음성 파일을 첨부한 뒤 저장합니다.
3. 나레이션 음성에서 **‘이름 (내 목소리)’**를 고릅니다.
   - 새 기획을 만들 때 고를 수 있고, 이미 만든 기획의 음성 선택란에서 바꿀 수도 있습니다.
   - 고른 뒤 **누락·수정 음성 생성**을 누르면 내 목소리로 나레이션을 만듭니다.

| 항목 | 내용 |
|---|---|
| 녹음 저장 위치 | 방문자 브라우저 (IndexedDB). 서버는 합성할 때만 참조 음성을 받아 임시로 캐시합니다 |
| 녹음 요령 | 조용한 방, 평소 말투로 녹음하세요. 녹음한 말과 참조 문장이 정확히 같을수록 비슷하게 나옵니다 |
| 속도 | NVIDIA GPU면 씬당 수 초, CPU만 있으면 씬당 수십 초 |
| GPU 가속 | `pip install torch --index-url https://download.pytorch.org/whl/cu124`로 CUDA 버전 torch를 설치하세요 |
| 더 높은 품질 | `run_voice_server.bat --model Qwen/Qwen3-TTS-12Hz-1.7B-Base` (GPU 권장) |
| 다른 주소의 서버 | 설정 → **내 목소리 서버 주소**에 https 주소를 넣거나, `config.js`의 `voiceServer`를 바꿉니다 |

> [!WARNING]
> 본인 목소리이거나 당사자의 동의를 받은 목소리만 클로닝하세요.

## 4. 원래 TubeInsight(Python)와 다른 점

| 기능 | TubeInsight (로컬 서버) | 이 버전 (브라우저 전용) |
|---|---|---|
| 영상 분석 | yt-dlp 다운로드 + 프레임 추출 | Gemini에 유튜브 링크를 직접 전달 (공개 영상만) |
| 나레이션 | Edge-TTS / Qwen3-TTS | Gemini TTS / Qwen3-TTS (voice-server 로컬 실행) |
| 영상 합성 | FFmpeg | canvas + MediaRecorder. 영상 길이만큼 실시간으로 렌더링되며, 그동안 탭을 띄워둬야 함. 저장 형식은 MP4, 지원하지 않는 브라우저는 WebM |
| 핸들 중복 확인 | 서버에서 자동 조회 | 브라우저 보안(CORS) 때문에 확인 링크를 제공 |
| 업로드 | 서버 OAuth | 방문자 본인 구글 계정 OAuth (GIS) |

## 5. 주의사항

- **API 사용 요금은 키 소유자(방문자)에게 청구됩니다.** 무료 키는 분당 요청 한도가 낮아서, 이미지나 음성을 여러 개 만들면 잠시 대기할 수 있습니다. 이 경우 앱이 자동으로 재시도합니다.
- 기록은 `localStorage`에 최근 40개까지 저장됩니다. 이미지와 음성은 `IndexedDB`에 저장되며, 모두 방문자 브라우저 안에만 있습니다.
- 지원 브라우저: 최신 Chrome / Edge. Safari는 영상 합성 형식에 제한이 있을 수 있습니다.
