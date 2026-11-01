// AAM Studio 홈 섹션 — "AI 마케팅 체험" (SNS AI 마케팅 자동화로 연결)
// 방문자 본인 키(Gemini·YouTube) 또는 로컬 모델(LM Studio·Ollama)로만 동작 → 운영비 0원
// 실제 앱은 정적 파일로 /public/tools/sns-ai/ 에 들어 있고, /tools/sns-ai 로 열립니다.
// 스타일: app/globals.css 의 ".lab-" 블록 (사이트 디자인 토큰 사용)
const TOOL_URL = "/tools/sns-ai/index.html";

const FEATURES = [
  { no: "00", title: "채널 세팅", desc: "주제만 넣으면 채널명·소개글·키워드·프로필 이미지까지", tab: "channel" },
  { no: "01", title: "영상 분석", desc: "잘 되는 유튜브 링크로 후킹·구성·댓글 반응을 분석", tab: "analyze" },
  { no: "02", title: "기획 · 나레이션", desc: "쇼츠/롱폼 씬 대본과 AI 음성, 내 목소리 클로닝", tab: "plan" },
  { no: "03", title: "제작 · 업로드", desc: "씬 이미지 생성 → 영상 렌더 → 유튜브 업로드", tab: "produce" },
  { no: "04", title: "마케팅 & SNS", desc: "스레드·인스타·블로그·뉴스레터 글을 한 번에", tab: "marketing" },
];

const MODES = [
  { title: "내 API 키로", desc: "Google AI Studio에서 무료로 받은 Gemini 키(필수)와 YouTube Data API 키(선택)를 넣어 바로 사용" },
  { title: "내 PC 로컬 모델로", desc: "LM Studio · Ollama를 켜 두면 채널·기획·마케팅 글을 키 없이 내 컴퓨터가 생성" },
  { title: "데이터는 내 브라우저에만", desc: "키와 결과물은 방문자 브라우저에만 저장되고 AAM 서버로 전송되지 않습니다" },
];

export default function AiMarketingLab() {
  return (
    <section className="section lab" id="ai-lab">
      <div className="wrap">
        <div className="section-head lab-head">
          <p className="label">AI Marketing Lab</p>
          <h2>AI 마케팅 자동화, 직접 써보세요</h2>
          <p>
            AAM이 실제 작업에 쓰는 유튜브·SNS 자동화 도구를 공개합니다. 분석부터 기획, 영상 제작, 마케팅 글까지 —
            가입 없이 내 키나 내 PC의 로컬 모델로 바로 체험할 수 있습니다.
          </p>
        </div>

        <div className="lab-features">
          {FEATURES.map((f) => (
            <a key={f.no} className="lab-card" href={`${TOOL_URL}#${f.tab}`} target="_blank" rel="noopener">
              <span className="lab-no">{f.no}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <span className="lab-open">열기 →</span>
            </a>
          ))}
        </div>

        <div className="lab-modes">
          {MODES.map((m) => (
            <div key={m.title} className="lab-mode">
              <h4>{m.title}</h4>
              <p>{m.desc}</p>
            </div>
          ))}
        </div>

        <div className="lab-actions">
          <a className="btn" href={TOOL_URL} target="_blank" rel="noopener">AI 마케팅 자동화 시작하기</a>
          <a className="btn ghost dark" href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Gemini API 키 무료 발급 ↗</a>
          <a className="lab-link" href="#contact">우리 브랜드에 맞춰 세팅받기 →</a>
        </div>
      </div>
    </section>
  );
}
