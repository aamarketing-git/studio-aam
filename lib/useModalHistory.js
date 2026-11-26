"use client";
import { useCallback, useEffect, useRef } from "react";

// 모달이 열릴 때 히스토리 항목을 하나 쌓아 두고,
// 브라우저·모바일 뒤로가기(popstate)가 그 항목을 소비하면 모달만 닫는다.
// X 버튼이나 바깥 터치로 닫을 때는 쌓아 둔 항목을 같이 되돌려
// 뒤로가기를 한 번 더 눌러야 하는(히스토리가 꼬이는) 상태를 만들지 않는다.
const MARK = "aamModal";

export default function useModalHistory(open, setOpen) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!open) {
      pushed.current = false;
      return undefined;
    }

    if (!pushed.current) {
      const base =
        typeof window.history.state === "object" && window.history.state
          ? window.history.state
          : {};
      window.history.pushState({ ...base, [MARK]: true }, "");
      pushed.current = true;
    }

    const onPop = () => {
      pushed.current = false;
      setOpen(null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [open, setOpen]);

  // 모달을 직접 닫을 때 쓰는 함수. 쌓아 둔 히스토리 항목이 있으면 함께 정리한다.
  return useCallback(() => {
    const state = window.history.state;
    const ours = Boolean(state && typeof state === "object" && state[MARK]);
    pushed.current = false;
    setOpen(null);
    if (ours) window.history.back();
  }, [setOpen]);
}
