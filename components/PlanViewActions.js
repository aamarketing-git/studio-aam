"use client";
import Link from "next/link";

export default function PlanViewActions() {
  return (
    <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--line)", display: "flex", gap: 12, flexWrap: "wrap" }}>
      <Link href="/" className="btn ghost" style={{ color: "var(--ink)" }}>돌아가기</Link>
      <button className="btn ghost dark" style={{ color: "var(--ink)", borderColor: "var(--line)" }} onClick={() => window.print()}>
        인쇄 · PDF로 저장
      </button>
      <a href="http://pf.kakao.com/_axaUrX/chat" target="_blank" rel="noreferrer" className="btn" style={{ background: "#FEE500", color: "#191919", border: "none" }}>
        카카오톡 문의하기
      </a>
    </div>
  );
}
