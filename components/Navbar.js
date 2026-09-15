"use client";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "#film", label: "이야기" },
  { href: "#work", label: "포트폴리오" },
  { href: "#planner", label: "AI 기획실" },
  { href: "#team", label: "팀" },
  { href: "#process", label: "진행방식" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="nav-header" style={scrolled ? {} : { background: "transparent", boxShadow: "none" }}>
      <div className="nav-inner">
        <a className="nav-logo" href="#">
          AAM STUDIO
        </a>
        <nav className="nav-links">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </nav>
        <a className="nav-cta" href="#planner">
          7분 AI 기획실
        </a>
      </div>
    </header>
  );
}
