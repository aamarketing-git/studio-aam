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
          소상공인 · 독립 브랜드를 위한 서사 기반 크리에이티브 스튜디오
        </div>

        <h1 className="hero-headline">
          <span className="hero-dim">홈페이지도 만들었고, SNS도 하고 있는데</span>
          <span className="hero-main">
            왜 고객은 우리를
            <br />
            기억하지 못할까요?
          </span>
        </h1>

        <p className="hero-sub">
          AAM은 &lsquo;무엇을 만들까&rsquo;보다 &lsquo;무엇을 이야기할까&rsquo;에서 시작합니다.
        </p>

        <div className="hero-actions">
          <a className="btn" href="#planner">7분 만에 내 브랜드 기획받기</a>
          <a className="btn ghost dark" href="#film">이야기 읽기</a>
        </div>
      </div>

      <div className="hero-bottom">
        <span>AAM STUDIO / SEOUL</span>
        <a className="scroll-hint" href="#film">
          아래로 내려 이야기를 읽어보세요 ↓
        </a>
      </div>
    </section>
  );
}
