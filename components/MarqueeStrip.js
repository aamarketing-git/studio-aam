"use client";

const ITEMS = [
  "STORY", "FILM", "WEB", "AI", "HUMAN TOUCH",
  "BRAND", "EXPERIENCE", "MEMORY",
  "STORY", "FILM", "WEB", "AI", "HUMAN TOUCH",
  "BRAND", "EXPERIENCE", "MEMORY",
];

export default function MarqueeStrip() {
  return (
    <div className="marquee-strip" aria-hidden="true">
      <div className="marquee-strip-track">
        {ITEMS.map((word, i) => (
          <span className="item" key={i}>
            <span className="dot" />
            <span className={i % 3 === 0 ? "accent" : ""}>{word}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
