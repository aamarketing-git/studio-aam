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
    let globalY = 0; // 0이면 top: 100% 이므로 화면 최하단 밖에서 시작됨
    const speed = 1.5; // 스크롤 속도
    let isPaused = false;
    let pauseEndTime = 0;

    const animate = () => {
      const now = Date.now();

      if (isPaused) {
        if (now >= pauseEndTime) {
          // 5초 정지 후 처음부터 다시 시작
          isPaused = false;
          globalY = 0; 
        }
      } else {
        globalY += speed;
      }

      if (containerRef.current) {
        // 전체 컨테이너를 기울인 상태에서 위로 스크롤
        containerRef.current.style.transform = `rotateX(40deg) translateY(${-globalY}px)`;
      }

      const screenCenter = window.innerHeight / 2;
      let lastLineReachedCenter = false;

      // 각 줄의 화면상 위치를 계산하여 중앙에 왔을 때 효과 부여
      linesRef.current.forEach((lineNode, index) => {
        if (!lineNode) return;

        const rect = lineNode.getBoundingClientRect();
        // 각 줄의 Y축 중앙값
        const lineCenter = rect.top + rect.height / 2;
        // 화면 중앙과의 거리
        const dist = Math.abs(lineCenter - screenCenter);

        let scale = 1;
        let color = '#333';
        let textShadowColor = '#ccc';

        // 화면 중앙 부근(거리 120 이내)에 진입하면 2배 커지고 파란색으로 전환
        if (dist < 120) {
          scale = 2;
          color = '#0055ff'; // 블루
          textShadowColor = '#b3ccff'; // 그림자도 살짝 푸른빛이 돌게 변경
        }

        lineNode.style.transform = `scale(${scale})`;
        lineNode.style.color = color;
        // 동적 그림자 색상 적용 (기본 3D 입체 유지)
        lineNode.style.textShadow = `
          0 1px 0 ${textShadowColor}, 
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
          0 20px 20px rgba(0,0,0,.15)
        `;

        // 마지막 문장 체크 (LINES의 마지막 인덱스)
        const isLastLine = index === LINES.length - 1;
        
        // 마지막 줄이 화면 중앙에 도달하면 일시정지 (오차 범위 보정)
        if (isLastLine && !isPaused && lineCenter <= screenCenter + 2 && lineCenter > 0) {
          lastLineReachedCenter = true;
        }
      });

      if (lastLineReachedCenter) {
        isPaused = true;
        pauseEndTime = Date.now() + 5000; // 5초간 정지
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    // 초기 마운트 시 애니메이션 시작
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
        perspective: '800px', 
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
            top: 100%; /* 첫 문장이 화면 맨 아래 밖에서 시작하도록 설정 */
            padding-bottom: 50vh; /* 마지막 문장이 중앙에 올 수 있도록 하단 여백 추가 */
          }
          .text-3d {
            font-weight: 800;
            font-size: 1.5rem;
            text-align: center;
            margin: 1.5rem 0;
            line-height: 1.4;
            letter-spacing: -0.5px;
            /* 크기와 색상이 변할 때 부드럽게 전환되도록 CSS Transition 설정 */
            transition: all 0.4s ease-out; 
            transform-origin: center center;
          }
          .text-empty {
            height: 5rem; /* 문단 간 여백 */
          }
          @media (max-width: 768px) {
            .text-3d {
              font-size: 1rem;
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
