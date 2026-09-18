"use client";
import React from "react";

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
        background: '#fdfbf7', // 부드러운 배경색
        perspective: '800px',  // 3D 원근감 부여
        position: 'relative'
      }}
    >
      <style>
        {`
          @keyframes scrollUp3D {
            /* 아래쪽 화면 밖에서 시작해서 위쪽 화면 밖으로 사라지는 애니메이션 */
            0% { transform: rotateX(40deg) translateY(80vh) translateZ(0); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: rotateX(40deg) translateY(-150vh) translateZ(-300px); opacity: 0; }
          }
          .text-3d-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            transform-style: preserve-3d;
            animation: scrollUp3D 25s linear infinite;
            width: 100%;
            position: absolute;
          }
          .text-3d {
            color: #333;
            font-weight: 800;
            font-size: 2rem;
            text-align: center;
            margin: 0.8rem 0;
            line-height: 1.4;
            letter-spacing: -0.5px;
            
            /* CSS 3D 입체 폰트(두께감)를 완벽하게 구현하는 다중 그림자 효과 */
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
            height: 4rem; /* 문단 간격 */
          }
          @media (max-width: 768px) {
            .text-3d {
              font-size: 1.2rem;
            }
          }
        `}
      </style>
      
      <div className="text-3d-container">
        {LINES.map((text, i) => (
          text === "" ? (
            <div key={i} className="text-empty" />
          ) : (
            <p key={i} className="text-3d">{text}</p>
          )
        ))}
      </div>
    </section>
  );
}
