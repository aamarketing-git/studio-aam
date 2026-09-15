import PlannerPanel from "./PlannerPanel";

export default function Planner() {
  return (
    <section className="section planner" id="planner">
      <div className="wrap">
        <div className="section-head">
          <p className="label">
            <span className="pulse-dot" />{" "}
            Interactive Brand Diagnosis
          </p>
          <h2>7분 AI 기획실</h2>
          <p>복잡한 문의 양식 대신, 실제 인터뷰를 나누듯 핵심 브랜드 스토리를 정리합니다.</p>
        </div>

        <div className="planner-layout">
          {/* 좌측: AAM 홍보영상 */}
          <div className="planner-video">
            <video
              controls
              playsInline
              preload="metadata"
              poster="/hero-bg.jpg"
              style={{ width: "100%", borderRadius: 14, background: "#000" }}
            >
              <source src="/video/aam-promo.mp4" type="video/mp4" />
            </video>
            <p className="planner-video-caption">
              AAM 홍보영상 — 당신의 사업에는 이미 이야기가 있습니다
            </p>
          </div>

          {/* 우측: 기획 채팅 패널 */}
          <div className="planner-panel-wrap">
            <PlannerPanel />
          </div>
        </div>
      </div>
    </section>
  );
}
