"use client";

import { useMemo, useState } from "react";

// 작업물 화면들이 어두운 3D 회랑을 따라 양쪽에서 중앙 지평선으로 모여들며 흐른다.
// 카드는 마우스를 올리면 잠시 멈추고, 누르면 해당 작업물의 상세창이 열린다.
const PER_WALL = 8;

function Wall({ side, items, onOpen, setPaused, interactive }) {
  const list = useMemo(() => [...items, ...items], [items]);

  return (
    <div className={`corr-wall ${side}`} aria-hidden={interactive ? undefined : true}>
      <div className="corr-strip">
        {list.map((it, i) => (
          <button
            key={`${side}-${i}`}
            type="button"
            className="corr-card"
            tabIndex={-1}
            aria-label={interactive ? `${it.title} 자세히 보기` : undefined}
            onClick={interactive ? () => onOpen(it.item) : undefined}
            onPointerEnter={interactive ? () => setPaused(true) : undefined}
            onFocus={interactive ? () => setPaused(true) : undefined}
            onBlur={interactive ? () => setPaused(false) : undefined}
          >
            <img src={it.img} alt="" loading="lazy" decoding="async" draggable={false} />
          </button>
        ))}
      </div>
    </div>
  );
}

function Hall({ items, onOpen, setPaused, interactive }) {
  // 양쪽 벽이 서로 다른 작품을 보여 주도록 한 칸씩 어긋나게 시작한다.
  const left = useMemo(() => items.slice(0, PER_WALL), [items]);
  const right = useMemo(() => {
    const out = [];
    for (let i = 0; i < PER_WALL; i++) out.push(items[(i + 3) % items.length]);
    return out;
  }, [items]);

  return (
    <div className="corr-hall">
      <Wall
        side="left"
        items={left}
        onOpen={onOpen}
        setPaused={setPaused}
        interactive={interactive}
      />
      <Wall
        side="right"
        items={right}
        onOpen={onOpen}
        setPaused={setPaused}
        interactive={interactive}
      />
    </div>
  );
}

export default function PortfolioCorridor({ items, onOpen }) {
  const [paused, setPaused] = useState(false);

  const screens = useMemo(
    () =>
      items.map((it) => ({
        img: it.img || (it.images && it.images[0]),
        title: it.title,
        item: it.item || it,
      })),
    [items]
  );

  if (!screens.length) return null;

  return (
    <div
      className={`corr${paused ? " is-paused" : ""}`}
      id="portfolio-showcase"
      onPointerLeave={() => setPaused(false)}
    >
      <div className="corr-stage" aria-hidden="true">
        <Hall items={screens} onOpen={onOpen} setPaused={setPaused} interactive />
      </div>

      <div className="corr-floor" aria-hidden="true">
        <div className="corr-stage mirror">
          <Hall items={screens} interactive={false} />
        </div>
      </div>

      <div className="corr-axis" aria-hidden="true" />
      <div className="corr-glow" aria-hidden="true" />
      <div className="corr-vignette" aria-hidden="true" />

      <div className="corr-copy">
        <p className="corr-label">Selected Works · 2026</p>
        <h2>
          우리가 만들어 온
          <br />
          브랜드 경험들.
        </h2>
        <p className="corr-sub">
          화려한 디자인을 넘어서, 브랜드의 진짜 ‘이야기’가 사람들에게 닿도록 만든 작업물입니다.
          <br className="corr-br" /> 흐르는 화면을 눌러 하나씩 열어 보세요.
        </p>
      </div>

      <div className="corr-cta">
        <a className="btn" href="#film-portfolio">
          영상제작 포트폴리오
        </a>
        <a className="btn ghost dark" href="#showroom-3d">
          3D 가상쇼룸 둘러보기
        </a>
      </div>
    </div>
  );
}
