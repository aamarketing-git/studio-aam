"use client";

import { useEffect, useRef } from "react";

/*
 * Remotion <Trail layers={8} lagInFrames={1}> + <CameraMotionBlur> 느낌을
 * 웹에서 의존성 없이 재현한 컴포넌트.
 * - 3초(90프레임 @30fps) 주기로 카드가 휙 들어와 한 바퀴 돌고 휙 나갑니다.
 * - 직전 프레임들의 위치에 잔상 레이어를 겹쳐 "모션 블러 꼬리"를 만듭니다.
 */

const FPS = 30;
const CYCLE = 90; // frames
const LAYERS = 8;
const LAG = 1; // frames
const TRAIL_OPACITY = 0.8;

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Remotion interpolate(…, {extrapolate: 'clamp', easing}) 와 같은 구간 보간
function interpolate(p, input, output) {
  if (p <= input[0]) return output[0];
  if (p >= input[input.length - 1]) return output[output.length - 1];
  for (let i = 0; i < input.length - 1; i++) {
    if (p >= input[i] && p <= input[i + 1]) {
      const t = easeInOutCubic((p - input[i]) / (input[i + 1] - input[i]));
      return output[i] + (output[i + 1] - output[i]) * t;
    }
  }
  return output[output.length - 1];
}

function poseAt(frame) {
  const p = (((frame % CYCLE) + CYCLE) % CYCLE) / CYCLE;
  return {
    x: interpolate(p, [0, 0.25, 0.65, 0.9], [-105, 0, 0, 105]), // 패널 폭 대비 %
    spin: interpolate(p, [0.28, 0.6], [0, 360]),
  };
}

export default function MotionBlurCard({ label, icon, hook, offsetFrames = 0 }) {
  const panelRef = useRef(null);
  const layerRefs = useRef([]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const layers = layerRefs.current;

    const apply = (frame) => {
      layers.forEach((el, i) => {
        if (!el) return;
        const { x, spin } = poseAt(frame - i * LAG);
        el.style.transform = `translateX(${x}%)`;
        el.firstChild.style.transform = `translate(-50%, -50%) rotate(${spin}deg)`;
      });
    };

    if (reduce) {
      apply(CYCLE * 0.45); // 가운데 정지 상태
      layers.forEach((el, i) => el && i > 0 && (el.style.display = "none"));
      return;
    }

    let raf = 0;
    let visible = false;
    let start = null;

    const tick = (now) => {
      if (start === null) start = now;
      apply(((now - start) / 1000) * FPS + offsetFrames);
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !visible) {
        visible = true;
        start = null;
        raf = requestAnimationFrame(tick);
      } else if (!entry.isIntersecting && visible) {
        visible = false;
        cancelAnimationFrame(raf);
      }
    });
    if (panelRef.current) io.observe(panelRef.current);
    apply(offsetFrames);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [offsetFrames]);

  return (
    <div className="mb-panel" ref={panelRef}>
      <div className="mb-stage" aria-hidden="true">
        {Array.from({ length: LAYERS }).map((_, i) => (
          <div
            key={i}
            className="mb-layer"
            ref={(el) => {
              layerRefs.current[i] = el;
            }}
            style={{
              opacity: i === 0 ? 1 : TRAIL_OPACITY * (1 - i / LAYERS) * 0.55,
              filter: i === 0 ? "none" : `blur(${Math.min(i, 4)}px)`,
              zIndex: LAYERS - i,
            }}
          >
            <div className="mb-card">
              {icon}
              <span>{label}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="mb-hook">{hook}</p>
    </div>
  );
}
