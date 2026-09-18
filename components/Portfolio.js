"use client";
import { useState } from "react";
import { PORTFOLIO } from "@/lib/portfolio";
import { ImageStreamHero } from "@/components/ui/image-stream-hero";

function Card({ item, onOpen }) {
  return (
    <button className="work" onClick={() => onOpen(item)} aria-label={`${item.title} 자세히 보기`}>
      <span className="thumb">
        <img src={item.images[0]} alt={item.title} loading="lazy" />
        <span className="badge">상세보기</span>
      </span>
      <span className="meta">
        <strong>{item.title}</strong>
        <span>{item.tag}</span>
      </span>
    </button>
  );
}

function Row({ items, reverse, onOpen }) {
  const loop = [...items, ...items];
  return (
    <div className={`marquee${reverse ? " rev" : ""}`}>
      <div className="marquee-track">
        {loop.map((it, i) => (
          <Card key={`${it.id}-${i}`} item={it} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}

export default function Portfolio() {
  const [open, setOpen] = useState(null);
  const half = Math.ceil(PORTFOLIO.length / 2);

  // 포트폴리오 데이터에서 이미지들을 추출하여 ImageStreamHero에 전달할 데이터 생성
  // 각 프로젝트의 메인 썸네일(첫 번째 이미지)들을 모아서 보여줍니다.
  const streamImages = PORTFOLIO.map(p => ({
    src: p.images[0],
    alt: p.title
  }));

  // 만약 이미지가 부족하다면 서브 이미지들도 추가
  if (streamImages.length < 8) {
    PORTFOLIO.forEach(p => {
      if (p.images[1]) streamImages.push({ src: p.images[1], alt: p.title });
    });
  }

  return (
    <section className="section portfolio-section" id="work" style={{ paddingTop: 0 }}>
      {/* 
        새롭게 추가된 ImageStreamHero 영역
        고객님의 실제 작업물 이미지(PORTFOLIO)들이 입체적으로 흘러나옵니다.
      */}
      <ImageStreamHero
        images={streamImages}
        style={{ 
          height: '600px', 
          width: '100%',
          backgroundColor: '#fdfbf7', 
          borderBottom: '1px solid #eaeaea' 
        }}
      >
        <div style={{ 
          position: 'relative', 
          zIndex: 10, 
          display: 'flex', 
          height: '100%', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '4rem 0', 
          textAlign: 'center' 
        }}>
          <div style={{ padding: '0 1.5rem', marginTop: '2rem' }}>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 800, 
              letterSpacing: '-0.025em', 
              color: '#333',
              lineHeight: 1.2
            }}>
              우리가 만들어 온<br />
              브랜드 경험들.
            </h1>
          </div>
          <p style={{ 
            maxWidth: '28rem', 
            padding: '0 1.5rem', 
            fontSize: '0.875rem', 
            color: '#666', 
            lineHeight: 1.6,
            marginBottom: '2rem'
          }}>
            단순히 화려한 디자인을 넘어서, 브랜드의 진짜 '이야기'가 사람들에게 전달되도록 설계된 작업물들을 만나보세요.
          </p>
        </div>
      </ImageStreamHero>

      <div className="wrap" style={{ marginTop: '5rem' }}>
        <div className="section-head">
          <p className="label">Selected Works</p>
          <h2>이미 만들어 온 것들</h2>
          <p>작업물을 눌러보세요. 누가 쓰고 있는지, 어떤 기능이 들어갔는지 보여드립니다.</p>
        </div>
      </div>

      <Row items={PORTFOLIO.slice(0, half)} onOpen={setOpen} />
      <div style={{ height: 24 }} />
      <Row items={PORTFOLIO.slice(half)} reverse onOpen={setOpen} />

      {open && (
        <div className="modal-bg" onClick={() => setOpen(null)} role="dialog" aria-modal="true">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setOpen(null)} aria-label="닫기">×</button>
            <span className="tag-badge">{open.tag}</span>
            <h3>{open.title}</h3>

            <div className="shots">
              {open.images.map((src) => (
                <img key={src} src={src} alt={`${open.title} 화면`} loading="lazy" />
              ))}
            </div>

            <div className="info-grid">
              <div className="info-card">
                <p className="label">누가 쓰고 있나요</p>
                <p>{open.who || "내용을 입력해주세요."}</p>
              </div>
              <div className="info-card">
                <p className="label">어떤 기능이 들어갔나요</p>
                <ul>
                  {open.features.filter(Boolean).length
                    ? open.features.filter(Boolean).map((f, i) => <li key={i}>{f}</li>)
                    : <li>내용을 입력해주세요.</li>}
                </ul>
              </div>
            </div>

            <div className="build">
              {open.youCanBuild || "이 작업물로 당신이 무엇을 만들 수 있는지 한 줄로 적어주세요."}
            </div>

            {open.liveUrl && (
              <p style={{ marginTop: 22, textAlign: "center" }}>
                <a className="btn small" href={open.liveUrl} target="_blank" rel="noreferrer">실제 사이트 보기</a>
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
