"use client";
import React, { useEffect, useRef } from "react";

const LINES = [
  "좋은 제품이 있고, 분명한 서비스가 있어도",
  "사람들에게 제대로 전달되지 않으면",
  "결국 수많은 브랜드 사이에서 묻히고 맙니다.",
  "",
  "무엇을 말해야 할지 모르겠고,",
  "어떻게 보여줘야 할지 막막하고,",
  "홈페이지와 영상, 콘텐츠는 따로 움직입니다.",
  "",
  "그래서 우리는 '무엇을 만들까'보다",
  "'무엇을 이야기할까'에서 시작합니다.",
  "",
  "작가는 당신의 사업 안에 숨어 있는 이야기를 찾고,",
  "영상 PD는 그 이야기를 사람들이 보고, 느끼고,",
  "기억할 수 있는 영상으로 만듭니다.",
  "",
  "그리고 그 스토리와 영상을 바탕으로",
  "당신의 브랜드가 가장 잘 보이는 웹사이트를 완성합니다.",
  "",
  "스토리, 영상, 웹사이트.",
  "각각 따로 만드는 것이 아니라",
  "하나의 브랜드 경험으로 연결합니다.",
  "",
  "AI의 빠른 기술력에",
  "사람만이 만들 수 있는 감각과 공감을 더해,",
  "빠르게 만들되 당신다움은 놓치지 않습니다.",
  "",
  "고객이 기억하는 것은 화려한 디자인만이 아닙니다.",
  "왜 이 브랜드가 존재하는지,",
  "왜 이 사람에게 맡겨야 하는지,",
  "그 이유가 담긴 이야기입니다.",
  "",
  "당신의 사업에는 이미 이야기가 있습니다."
];

export default function Narration() {
  const containerRef = useRef(null);
  const linesRef = useRef([]);

  useEffect(() => {
    let animationFrameId;
    let globalY = 0; 
    // 기존(0.3)에서 다시 2배 빠르게 속도 상향
    const speed = 0.6; 
    let isPaused = false;
    let pauseEndTime = 0;

    const animate = () => {
      const now = Date.now();

      if (isPaused) {
        if (now >= pauseEndTime) {
          isPaused = false;
          globalY = 0; 
        }
      } else {
        globalY += speed;
      }

      if (containerRef.current) {
        // 3D 기울기를 너무 눕히지 않고 살짝만 주어 자연스러운 공간감 부여
        containerRef.current.style.transform = `rotateX(20deg) translateY(${-globalY}px)`;
      }

      const screenCenter = window.innerHeight / 2;
      let lastLineReachedCenter = false;

      linesRef.current.forEach((lineNode, index) => {
        if (!lineNode) return;

        const rect = lineNode.getBoundingClientRect();
        const lineCenter = rect.top + rect.height / 2;
        const dist = Math.abs(lineCenter - screenCenter);

        let scale = 1;
        let color = '#333';
        let opacity = 0.15;

        // 중앙 영역을 넉넉히 잡음 (거대한 글씨에 맞춤)
        if (dist < 280) {
          scale = 2;         
          color = '#0055ff'; 
          opacity = 1;       
        } else if (dist < 500) {
          opacity = 0.5;
        }

        lineNode.style.transform = `scale(${scale})`;
        lineNode.style.color = color;
        lineNode.style.opacity = opacity;

        const isLastLine = index === LINES.length - 1;
        
        // 마지막 문장이 중앙에 도착했을 때
        if (isLastLine && !isPaused && lineCenter <= screenCenter + 2 && lineCenter > 0) {
          lastLineReachedCenter = true;
        }
      });

      if (lastLineReachedCenter) {
        isPaused = true;
        pauseEndTime = Date.now() + 5000; // 5초 정지
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <section 
      className="section narration" 
      id="film" 
      style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        overflow: 'hidden',
        background: '#fdfbf7', 
        perspective: '1000px', 
        position: 'relative'
      }}
    >
      <style>
        {`
          .text-3d-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            transform-style: preserve-3d;
            width: 100%;
            position: absolute;
            top: 100%; 
            padding-bottom: 50vh; 
          }
          .text-3d {
            font-weight: 800;
            /* 기존 1.8rem에서 약 2배 가까운 3.5rem으로 대폭 확대 */
            font-size: 3.5rem; 
            text-align: center;
            /* 글자가 2배(7rem)로 커질 때 겹치지 않도록 간격 대폭 추가 */
            margin: 7rem 0; 
            line-height: 1.4;
            letter-spacing: -2px;
            /* 부드러운 전환 효과 유지 */
            transition: all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94); 
            transform-origin: center center;
            
            /* CSS 3D 입체 폰트(두께감) */
            text-shadow: 
              0 1px 0 #ccc, 
              0 2px 0 #c9c9c9, 
              0 3px 0 #bbb, 
              0 4px 0 #b9b9b9, 
              0 5px 0 #aaa, 
              0 6px 1px rgba(0,0,0,.1), 
              0 0 5px rgba(0,0,0,.1), 
              0 1px 3px rgba(0,0,0,.3), 
              0 3px 5px rgba(0,0,0,.2), 
              0 5px 10px rgba(0,0,0,.25), 
              0 10px 10px rgba(0,0,0,.2), 
              0 20px 20px rgba(0,0,0,.15);
          }
          .text-empty {
            height: 8rem; /* 문단 간 여백도 더 넓게 */
          }
          @media (max-width: 768px) {
            .text-3d {
              font-size: 2rem;
              margin: 4rem 0;
            }
          }
        `}
      </style>
      
      <div className="text-3d-container" ref={containerRef}>
        {LINES.map((text, i) => (
          text === "" ? (
            <div key={i} className="text-empty" />
          ) : (
            <p 
              key={i} 
              className="text-3d" 
              ref={el => linesRef.current[i] = el}
            >
              {text}
            </p>
          )
        ))}
      </div>
    </section>
  );
}
