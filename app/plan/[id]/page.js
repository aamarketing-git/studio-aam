import { getAdminClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import PlanViewActions from "@/components/PlanViewActions";

export const revalidate = 0; // 항상 최신 데이터를 가져옵니다.

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

export default async function PlanView(props) {
  const params = await props.params;
  const { id } = params;
  const db = getAdminClient();

  if (!db) {
    return (
      <main className="wrap section" style={{ minHeight: "100vh", paddingTop: 120 }}>
        <h2>데이터베이스 연결 필요</h2>
        <p>기획서 저장 기능이 설정되지 않아 불러올 수 없습니다.</p>
        <Link href="/" className="btn">홈으로 돌아가기</Link>
      </main>
    );
  }

  const { data, error } = await db
    .from("plan_sessions")
    .select("plan_markdown, updated_at")
    .eq("id", id)
    .single();

  if (error || !data || !data.plan_markdown) {
    return notFound();
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--ivory)", padding: "120px 20px 60px" }}>
      <div className="panel" style={{ maxWidth: 800, margin: "0 auto" }}>
        <div className="panel-header">
          <div className="indicator">
            <span className="dot" />
            <span>AAM 브랜드 1차 기획서</span>
          </div>
          <span style={{ fontSize: 13, color: "var(--ink-muted)" }}>
            {new Date(data.updated_at).toLocaleDateString()}
          </span>
        </div>
        
        <div className="plan-doc" style={{ borderTop: "none", marginTop: 0, paddingTop: 0 }}>
          {renderPlan(data.plan_markdown)}
        </div>

        <PlanViewActions />
      </div>
    </main>
  );
}
