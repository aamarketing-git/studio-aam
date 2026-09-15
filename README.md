# studio-aam.com

스토리 · 영상 · 웹을 하나로 연결하는 AAM Studio 웹사이트.
핵심은 **AI 기획실**이다. 방문자가 7분 대화 후 자기 브랜드 1차 기획서를 받아 가고,
그 과정이 그대로 AAM의 상담 리드가 된다.

---

## 1. 바로 실행하기

```bash
npm install
cp .env.example .env.local     # Windows: copy .env.example .env.local
# .env.local 을 열어 OPENAI_API_KEY 를 채운다
npm run dev
```

http://localhost:3000 이 열린다.

**Supabase 없이도 전부 동작한다.** 저장만 안 될 뿐 대화와 기획서 생성은 정상이다.
먼저 화면부터 확인하고, 저장은 나중에 붙여도 된다.

## 2. Supabase 연결 (2단계)

1. Supabase 프로젝트를 만들고 `supabase/schema.sql` 을 SQL Editor에 붙여넣어 실행
2. `.env.local` 에 `NEXT_PUBLIC_SUPABASE_URL` 과 `SUPABASE_SERVICE_ROLE_KEY` 를 채움

RLS를 켜두었고 정책을 만들지 않았다. 익명 키로는 아무도 상담 내용을 읽을 수 없고,
쓰기는 서버 라우트에서만 일어난다. **의도된 설정이니 정책을 함부로 추가하지 말 것.**

## 3. Vercel 배포

GitHub에 올리고 Vercel에서 Import → 환경변수 5개를 그대로 입력 → Deploy.

`OPENAI_API_KEY` 는 **절대 프론트엔드 코드에 넣지 않는다.**
`NEXT_PUBLIC_` 접두사가 붙은 변수만 브라우저에 노출되며, 키에는 붙이면 안 된다.

---

## 4. 내가 채워야 할 것

| 무엇 | 어디 |
|---|---|
| 히어로 루프 영상 (12~15초, 무음) | `public/video/hero-loop.mp4` |
| 나레이션 본편 (55~70초) | `public/video/film.mp4` + `components/Narration.js` 주석 해제 |
| 작업물 이미지 3~4컷 × 건수 | `public/shots/` |
| 작업물 설명 (누가·기능·무엇을 만들 수 있나) | `lib/portfolio.js` |
| 팀 사진 3장 | `public/team/` |
| 카카오 채널 주소 | `components/Contact.js` |
| 사업자 정보 | `components/Footer.js` |
| OG 이미지 (카톡 공유 썸네일) | `public/og.png` |

포트폴리오는 `lib/portfolio.js` 배열에 한 줄 추가하면 슬라이더와 상세창에 동시에 반영된다.
다른 파일은 건드릴 필요 없다.

---

## 5. 챗봇 손보기

- **말투·질문 순서** → `lib/prompt.js` 의 `AAM_SYSTEM_PROMPT`
- **기획서 구조** → `lib/prompt.js` 의 `AAM_PLAN_PROMPT`
- **모델 교체** → `.env.local` 의 `MODEL_CHAT` / `MODEL_PLAN`. 코드는 안 건드린다
- **턴 상한** → `lib/ratelimit.js` 의 `MAX_TURNS` (기본 25)

대화는 `MODEL_CHAT`(경제형)으로, 최종 기획서 한 번만 `MODEL_PLAN`(상위)으로 돈다.
MVP는 둘 다 같은 모델로 둬도 된다.

`reasoning: { effort: ... }` 파라미터가 쓰는 모델에서 지원되지 않으면
`app/api/plan/chat/route.js` 와 `generate/route.js` 에서 그 줄만 지우면 된다.

---

## 6. 구조

```
app/
  page.js                  섹션 조립
  layout.js                폰트 · OG 태그
  globals.css              디자인 토큰 (:root 에서 색·글꼴 변경)
  api/plan/chat/           상담 대화
  api/plan/generate/       최종 기획서 생성
  api/lead/                연락처 접수
components/                섹션별 컴포넌트
lib/prompt.js              챗봇 인격
lib/portfolio.js           작업물 데이터
supabase/schema.sql        DB
```

---

## 7. 안티그래비티에서 작업할 때

Stitch 디자인을 반영할 때는 **구조가 아니라 스타일만 교체**한다.

- 색·글꼴·여백 → `app/globals.css` 의 `:root` 와 각 클래스
- 마크업 → 각 컴포넌트의 JSX

`components/PlannerPanel.js` 의 상태 흐름(대화 → 요약 확인 → 기획서 → 연락처)은
그대로 두고 껍데기만 바꾸는 편이 안전하다. 여기가 이 사이트의 엔진이다.

작업 순서 권장: **정적 화면 전체 → 챗 API 확인 → Supabase 저장 → 리드 폼.**
챗봇을 먼저 만들면 화면이 없어서 테스트가 안 된다.
