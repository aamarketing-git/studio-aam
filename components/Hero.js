export default function Hero() {
  return (
    <section className="hero" id="hero">
      {/* 시네마틱 배경: 자영업자 → 브랜드 전환 분위기 */}
      <div className="hero-bg-cinematic">
        <video 
          src="/video/aam-promo.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline 
        />
      </div>
      <div className="veil" />

      <div className="hero-center">
        <div className="category-badge">
          <span className="dot" />
          웹·앱 · 3D 쇼룸 · 영상 · AI 직원 · 대만 마케팅까지
        </div>

        <h1 className="hero-headline">
          <span className="hero-dim">단순한 홈페이지가 아닙니다</span>
          <span className="hero-main">
            직접 일하고 파는
            <br />
            우리 브랜드 웹과 AI 직원
          </span>
        </h1>

        <p className="hero-sub">
          스토리 기획부터 웹·앱·3D 쇼룸·홍보영상 제작, AI 업무 자동화와 대만 진출·유통 연결까지
          AAM이 한 번에 세팅합니다.
        </p>

        <div className="hero-actions">
          <a className="btn" href="#portfolio">작업물 바로 보기</a>
          <a className="btn ghost dark" href="#planner">7분 만에 내 브랜드 기획받기</a>
        </div>
      </div>

      <div className="hero-bottom">
        <span>AAM STUDIO / SEOUL</span>
        <a className="scroll-hint" href="#portfolio">
          아래로 내려 실제 작업물을 확인해 보세요 ↓
        </a>
      </div>
    </section>
  );
}
