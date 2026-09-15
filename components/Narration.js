"use client";
import { useEffect, useRef } from "react";

const LINES = [
  "좋은 제품이 있고, 분명한 서비스가 있어도\n사람들에게 제대로 전달되지 않으면\n결국 수많은 브랜드 사이에서 묻히고 맙니다.",
  "무엇을 말해야 할지 모르겠고,\n어떻게 보여줘야 할지 막막하고,\n홈페이지와 영상, 콘텐츠는 따로 움직입니다.",
  "그래서 우리는 '무엇을 만들까'보다\n'무엇을 이야기할까'에서 시작합니다.",
  "작가는 당신의 사업 안에 숨어 있는 이야기를 찾고,\n영상 PD는 그 이야기를 사람들이 보고, 느끼고,\n기억할 수 있는 영상으로 만듭니다.",
  "그리고 그 스토리와 영상을 바탕으로\n당신의 브랜드가 가장 잘 보이는 웹사이트를 완성합니다.",
  "스토리, 영상, 웹사이트.\n각각 따로 만드는 것이 아니라\n하나의 브랜드 경험으로 연결합니다.",
  "AI의 빠른 기술력에\n사람만이 만들 수 있는 감각과 공감을 더해,\n빠르게 만들되 당신다움은 놓치지 않습니다.",
  "고객이 기억하는 것은 화려한 디자인만이 아닙니다.\n왜 이 브랜드가 존재하는지,\n왜 이 사람에게 맡겨야 하는지,\n그 이유가 담긴 이야기입니다.",
];

export default function Narration() {
  const ref = useRef(null);

  useEffect(() => {
    const nodes = ref.current?.querySelectorAll(".line");
    if (!nodes) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("on");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return (
    <section className="section narration" id="film" ref={ref}>
      <div className="wrap">
        <div className="divider" />
        {LINES.map((t, i) => (
          <p className="line" key={i}>{t}</p>
        ))}
        <p className="line finale">당신의 사업에는 이미 이야기가 있습니다.</p>
      </div>
    </section>
  );
}
