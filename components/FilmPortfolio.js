"use client";

import { useState } from "react";

// AAM의 영상 PD 고혁주(ianko.vercel.app)가 대만에서 만들어 온 작품들.
// 목록을 누르면 위 플레이어의 영상이 바뀐다.
const WORKS = [
  {
    id: "GteUuV1ZAFU",
    img: "/shots/film-malice.jpg",
    title: "《malice in eyes》",
    meta: "2026 金電光 뮤직비디오 공모전 본선 · 촬영감독",
  },
  {
    id: "F-CX5h_Gndc",
    img: "/shots/film-oum.jpg",
    title: "〈月牙灣〉 중한 이중언어 LIVE",
    meta: "한국 채널 〈OUMU〉 대만 현장 시리즈 · 촬영감독",
  },
  {
    id: "M8XbYZ8F2CI",
    img: "/shots/film-nccu.jpg",
    title: "Our Life at NCCU",
    meta: "정치대 국제처 공모 1위 · 감독·촬영",
  },
  {
    id: "_DY5pLChqmM",
    img: "/shots/film-etti.jpg",
    title: "〈할 말이 많은데〉 Etti [MV]",
    meta: "뮤직비디오 · 감독",
  },
];

export default function FilmPortfolio() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const active = WORKS[activeIdx];

  const pick = (i) => {
    setActiveIdx(i);
    setPlaying(false);
  };

  return (
    <section className="section film-section" id="film-portfolio">
      <div className="wrap">
        <div className="section-head">
          <p className="label">Video Production</p>
          <h2>영상제작 포트폴리오</h2>
          <p>
            웹사이트에 올릴 한 편의 영상부터 뮤직비디오·라이브 무대까지. AAM의 영상 PD가 대만에서
            직접 찍고 편집한 작품을 그대로 보실 수 있습니다.
          </p>
        </div>

        <div className="film-grid">
          <div className="film-player-wrap">
          <div className="film-player">
            {playing ? (
              <iframe
                key={active.id}
                src={`https://www.youtube-nocookie.com/embed/${active.id}?autoplay=1&rel=0&playsinline=1`}
                title={active.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                className="film-poster"
                onClick={() => setPlaying(true)}
                aria-label={`${active.title} 영상 재생`}
              >
                <img src={active.img} alt={`${active.title} 스틸컷`} loading="lazy" />
                <span className="film-play" aria-hidden="true">
                  ▶
                </span>
                <span className="film-caption">
                  <strong>{active.title}</strong>
                  <em>{active.meta}</em>
                </span>
              </button>
            )}
          </div>
            <a
              className="film-ext"
              href={`https://www.youtube.com/watch?v=${active.id}`}
              target="_blank"
              rel="noreferrer"
            >
              유튜브에서 바로 보기 ↗
            </a>
          </div>

          <div className="film-side">
            <p className="film-kicker">Director · DP · Editor</p>
            <h3>고혁주 (Ian Ko)</h3>
            <p className="film-desc">
              대만 타이베이에서 뮤직비디오·라이브 무대·브랜드 필름을 만드는 영상 감독입니다. 촬영감독으로
              참여한 《malice in eyes》가 2026 金電光 뮤직비디오 공모전 본선에 올랐고, 한국 채널
              〈OUMU〉 대만 현장 시리즈는 연출과 촬영을 함께 맡았습니다. 13편의 작품을 한 페이지에
              모아 두었습니다.
            </p>

            <ul className="film-list">
              {WORKS.map((w, i) => (
                <li key={w.id}>
                  <button
                    type="button"
                    className={`film-item${i === activeIdx ? " active" : ""}`}
                    onClick={() => pick(i)}
                    aria-pressed={i === activeIdx}
                  >
                    <span className="film-thumb">
                      <img src={w.img} alt="" loading="lazy" />
                    </span>
                    <span className="film-item-text">
                      <strong>{w.title}</strong>
                      <em>{w.meta}</em>
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <a
              className="btn small ghost"
              href="https://ianko.vercel.app/"
              target="_blank"
              rel="noreferrer"
            >
              작품 13편 전체 보기 ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
