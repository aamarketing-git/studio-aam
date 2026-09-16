"use client";
import { useEffect, useRef, useState } from "react";

const TOTAL_STAGES = 8;

function renderPlan(md) {
  const out = [];
  let list = [];
  const flush = (key) => {
    if (list.length) {
      out.push(<ul key={`ul-${key}`}>{list.map((t, i) => <li key={i}>{t}</li>)}</ul>);
      list = [];
    }
  };
  String(md || "").split("\n").forEach((raw, i) => {
    const line = raw.trimEnd();
    if (/^###\s+/.test(line)) { flush(i); out.push(<h3 key={i}>{line.replace(/^###\s+/, "")}</h3>); }
    else if (/^##\s+/.test(line)) { flush(i); out.push(<h2 key={i}>{line.replace(/^##\s+/, "")}</h2>); }
    else if (/^#\s+/.test(line)) { flush(i); out.push(<h1 key={i}>{line.replace(/^#\s+/, "")}</h1>); }
    else if (/^>\s?/.test(line)) { flush(i); out.push(<blockquote key={i}>{line.replace(/^>\s?/, "")}</blockquote>); }
    else if (/^[-*]\s+/.test(line)) { list.push(line.replace(/^[-*]\s+/, "")); }
    else if (line === "") { flush(i); }
    else { flush(i); out.push(<p key={i}>{line}</p>); }
  });
  flush("end");
  return out;
}

export default function PlannerPanel({ embedded = true }) {
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [options, setOptions] = useState([]);
  const [stage, setStage] = useState(1);
  const [slots, setSlots] = useState({});
  const [sessionId, setSessionId] = useState(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState("");
  const [error, setError] = useState("");
  const [lead, setLead] = useState({ name: "", phone: "", email: "", agree: false });
  const [leadDone, setLeadDone] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, busy]);

  async function send(text) {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    setError("");
    setInput("");
    setOptions([]);
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, { role: "user", content }]);
    setBusy(true);
    try {
      const res = await fetch("/api/plan/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, history, sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "연결에 실패했습니다.");
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      setOptions(data.options || []);
      setStage(data.stage || stage);
      setSlots(data.slots || slots);
      setReady(Boolean(data.readyForSummary));
      if (data.sessionId) setSessionId(data.sessionId);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function makePlan() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          slots,
          sessionId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "기획서를 만들지 못했습니다.");
      setPlan(data.plan);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitLead() {
    if (!lead.name || !lead.phone) return setError("이름과 연락처를 입력해주세요.");
    if (!lead.agree) return setError("개인정보 수집·이용에 동의해주세요.");
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lead, privacyAgreed: lead.agree, sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "접수하지 못했습니다.");
      setLeadDone(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  function begin() {
    setStarted(true);
    setMessages([
      {
        role: "assistant",
        content: "먼저 어떤 일을 하고 계신가요? 상품이나 서비스를 편하게 설명해주세요.",
      },
    ]);
  }

  // ── 시작 전 화면 ──
  if (!started) {
    return (
      <div className="panel">
        <div className="panel-header">
          <div className="indicator">
            <span className="dot" />
            <span>AAM 브랜드 상담실</span>
          </div>
        </div>
        <p className="intro-copy">
          홈페이지나 영상이 필요하다는 생각은 있는데,<br />
          정작 무엇을 어떻게 만들어야 할지 막막하신가요?
        </p>
        <p className="intro-sub">
          몇 가지 이야기를 나누면 당신의 브랜드에 필요한 웹·영상·콘텐츠 1차 기획안을 만들어드립니다.
          약 5~7분 걸립니다.
        </p>
        <div className="intro-checklist">
          <p className="label">대화 후 자동으로 전달되는 내용:</p>
          <div className="items">
            <span>브랜드 서사 1문장 정의</span>
            <span>추천 웹 기능 & 메뉴 구조</span>
            <span>필요 영상 씬 가이드라인</span>
          </div>
        </div>
        <div className="intro-actions">
          <button className="btn" onClick={begin}>기획 시작하기</button>
          <a className="btn ghost" href="#work" style={{ color: "var(--ink)" }}>작업물 먼저 보기</a>
          <a className="btn ghost" href="#contact" style={{ color: "var(--ink)" }}>상담 먼저 신청하기</a>
        </div>
      </div>
    );
  }

  const pct = Math.min(100, Math.round((stage / TOTAL_STAGES) * 100));

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="indicator">
          <span className="dot" />
          <span>AAM 브랜드 상담실</span>
        </div>
      </div>

      {!plan && (
        <div className="progress">
          <div className="top">
            <span className="stage-name">단계 {Math.min(stage, TOTAL_STAGES)}</span>
            <span className="stage-count">{Math.min(stage, TOTAL_STAGES)} / {TOTAL_STAGES}</span>
          </div>
          <span className="bar"><i style={{ width: `${pct}%` }} /></span>
        </div>
      )}

      <div className="chat" ref={chatRef}>
        {messages.map((m, i) => (
          <div className={`msg ${m.role === "user" ? "me" : "ai"}`} key={i}>
            <span className="sender">{m.role === "user" ? "대표님" : "AAM 기획 파트너"}</span>
            <div className="bubble">{m.content}</div>
          </div>
        ))}
        {busy && <p className="typing">기획실이 생각하고 있습니다…</p>}
      </div>

      {!plan && (
        <>
          {options.length > 0 && !busy && (
            <div className="chips">
              {options.map((o, i) => (
                <button className="chip" key={i} onClick={() => send(o)}>{o}</button>
              ))}
            </div>
          )}

          {ready && !busy && (
            <div className="chips">
              <button className="btn" onClick={makePlan}>네, 이 내용으로 기획서 받기</button>
            </div>
          )}

          <div className="composer">
            <textarea
              rows={2}
              value={input}
              placeholder="솔직한 생각을 편안하게 적어주세요..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
              }}
            />
            <button className="btn" onClick={() => send()} disabled={busy || !input.trim()}>보내기</button>
          </div>
        </>
      )}

      {error && <p className="notice">{error}</p>}

      {plan && (
        <div className="plan-doc">
          {renderPlan(plan)}

          {!leadDone ? (
            <div className="lead-form">
              <h4>이 기획서를 저장하거나, AAM 팀의 검토를 받아보세요</h4>
              <div className="row">
                <input type="text" placeholder="이름" value={lead.name}
                  onChange={(e) => setLead({ ...lead, name: e.target.value })} />
                <input type="tel" placeholder="연락처" value={lead.phone}
                  onChange={(e) => setLead({ ...lead, phone: e.target.value })} />
                <input type="email" placeholder="이메일 (선택)" value={lead.email}
                  onChange={(e) => setLead({ ...lead, email: e.target.value })} />
              </div>
              <label className="agree">
                <input type="checkbox" checked={lead.agree}
                  onChange={(e) => setLead({ ...lead, agree: e.target.checked })} />
                <span>
                  상담을 위한 개인정보(이름·연락처·이메일) 수집과 이용에 동의합니다.
                  보관 기간은 상담 종료 후 1년이며, 동의를 거부해도 기획서 열람에는 제한이 없습니다.
                </span>
              </label>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="btn" onClick={submitLead} disabled={busy}>AAM 팀에게 검토 요청하기</button>
                <button className="btn ghost" style={{ color: "var(--ink)" }} onClick={() => window.print()}>
                  인쇄 · PDF로 저장
                </button>
              </div>
            </div>
          ) : (
            <div className="lead-form">
              <h4>상담 접수가 완료되었습니다</h4>
              <p style={{ margin: "0 0 16px", color: "var(--ink-muted)", lineHeight: 1.6 }}>
                남겨주신 기획서를 AAM 팀이 꼼꼼히 확인한 뒤, 영업일 기준 1~2일 내에 연락드리겠습니다.<br />
                작성하신 기획서는 아래 고유 링크를 통해 고객님과 AAM 팀이 언제든 다시 열람할 수 있습니다.
              </p>

              {sessionId && (
                <div style={{ marginBottom: 20, padding: "12px 16px", background: "var(--surface-container)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <span style={{ fontSize: 14, fontFamily: "var(--font-mono)", color: "var(--ink)", wordBreak: "break-all" }}>
                    https://studio-aam.com/plan/{sessionId}
                  </span>
                  <button className="btn small ghost" style={{ flexShrink: 0 }} onClick={() => {
                    navigator.clipboard.writeText(`https://studio-aam.com/plan/${sessionId}`);
                    alert("링크가 복사되었습니다.");
                  }}>복사</button>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {sessionId && (
                  <a href={`/plan/${sessionId}`} target="_blank" rel="noreferrer" className="btn ghost" style={{ color: "var(--ink)", borderColor: "var(--line)" }}>
                    저장된 기획서 보기
                  </a>
                )}
                <a href="https://www.studio-aam.com/" target="_blank" rel="noreferrer" className="btn" style={{ background: "#FEE500", color: "#191919", border: "none" }}>
                  카카오톡 빠른 상담
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
