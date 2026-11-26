"use client";
import { useMemo, useRef, useState } from "react";
import { PORTFOLIO } from "@/lib/portfolio";
import PortfolioCorridor from "@/components/PortfolioCorridor";
import useModalHistory from "@/lib/useModalHistory";

// 손가락으로 카드를 밀어 넘긴 뒤 손을 떼면 상세창이 열리지 않도록
// 누른 지점에서 조금이라도 움직였는지 기억한다.
const DRAG_TOLERANCE = 8;

function Card({ item, clone, onTouchStart, onTouchMove, onOpen }) {
  return (
    <button
      className={`work${clone ? " clone" : ""}`}
      onPointerDown={onTouchStart}
      onPointerMove={onTouchMove}
      onClick={() => onOpen(item)}
      aria-label={`${item.title} 자세히 보기`}
    >
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
  // 마키 애니메이션을 위해 한 벌을 더 붙인다. 모바일에서는 복제분을 숨기고 직접 스크롤한다.
  const loop = [...items, ...items];
  const drag = useRef({ x: 0, y: 0, moved: false });

  const onTouchStart = (e) => {
    drag.current = { x: e.clientX, y: e.clientY, moved: false };
  };

  const onTouchMove = (e) => {
    const d = drag.current;
    if (d.moved) return;
    if (Math.abs(e.clientX - d.x) > DRAG_TOLERANCE || Math.abs(e.clientY - d.y) > DRAG_TOLERANCE) {
      d.moved = true;
    }
  };

  const handleOpen = (item) => {
    if (drag.current.moved) return; // 밀어서 넘긴 동작이면 열지 않는다
    onOpen(item);
  };

  return (
    <div className={`marquee${reverse ? " rev" : ""}`}>
      <div className="marquee-track">
        {loop.map((it, i) => (
          <Card
            key={`${it.id}-${i}`}
            item={it}
            clone={i >= items.length}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onOpen={handleOpen}
          />
        ))}
      </div>
    </div>
  );
}

export default function Portfolio() {
  const [open, setOpen] = useState(null);
  const closeModal = useModalHistory(open, setOpen);
  const half = Math.ceil(PORTFOLIO.length / 2);

  // 3D 회랑에 흐르는 화면들 (첫 번째 이미지 = 대표 이미지)
  const corridorItems = useMemo(
    () =>
      PORTFOLIO.map((p) => ({
        img: p.images[0],
        title: p.title,
        item: p,
      })),
    []
  );

  return (
    <section className="section portfolio-section" id="portfolio" style={{ paddingTop: 0 }}>
      <PortfolioCorridor items={corridorItems} onOpen={setOpen} />

      <div className="wrap" style={{ marginTop: "4.5rem" }}>
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
        <div className="modal-bg" onClick={closeModal} role="dialog" aria-modal="true">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={closeModal} aria-label="닫기">
              ×
            </button>
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
                  {open.features.filter(Boolean).length ? (
                    open.features.filter(Boolean).map((f, i) => <li key={i}>{f}</li>)
                  ) : (
                    <li>내용을 입력해주세요.</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="build">
              {open.youCanBuild || "이 작업물로 당신이 무엇을 만들 수 있는지 한 줄로 적어주세요."}
            </div>

            {open.liveUrl && (
              <p style={{ marginTop: 22, textAlign: "center" }}>
                <a className="btn small" href={open.liveUrl} target="_blank" rel="noreferrer">
                  실제 사이트 보기
                </a>
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
