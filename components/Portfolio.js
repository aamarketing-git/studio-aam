"use client";
import { useState } from "react";
import { PORTFOLIO } from "@/lib/portfolio";

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

  return (
    <section className="section portfolio-section" id="work">
      <div className="wrap">
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
