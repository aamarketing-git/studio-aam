"use client";
import { useState } from "react";
import PlannerPanel from "./PlannerPanel";
import useModalHistory from "@/lib/useModalHistory";

// 기획실 섹션까지 내려오지 못하고 이탈하는 사람을 잡는다.
export default function FloatingPlanner() {
  const [open, setOpen] = useState(false);
  const closeModal = useModalHistory(open, setOpen);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn"
        style={{ position: "fixed", right: 20, bottom: 20, zIndex: 50, boxShadow: "0 8px 24px rgba(27,23,37,.28)" }}
      >
        AI 기획실
      </button>

      {open && (
        <div className="modal-bg" onClick={closeModal} role="dialog" aria-modal="true">
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 820, padding: 0, background: "transparent" }}
          >
            <button
              className="close"
              onClick={closeModal}
              aria-label="닫기"
              style={{ color: "#fff", zIndex: 2 }}
            >
              ×
            </button>
            <PlannerPanel />
          </div>
        </div>
      )}
    </>
  );
}
