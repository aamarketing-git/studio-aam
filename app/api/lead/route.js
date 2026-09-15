import { getAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { sessionId, name, phone, email, privacyAgreed, memo } = await req.json();

    if (!name || !phone) {
      return Response.json({ error: "이름과 연락처를 입력해주세요." }, { status: 400 });
    }
    // 동의 없이 저장하지 않는다. 법적 요건이다.
    if (!privacyAgreed) {
      return Response.json({ error: "개인정보 수집·이용에 동의해주세요." }, { status: 400 });
    }

    const db = getAdminClient();
    if (!db) {
      // DB 연결 전이어도 화면은 정상 완료 처리한다. 로그로 남긴다.
      console.log("[lead] (DB 미연결)", { name, phone, email });
      return Response.json({ ok: true, stored: false });
    }

    const { error } = await db.from("leads").insert({
      session_id: sessionId || null,
      name,
      phone,
      email: email || null,
      privacy_agreed: true,
      agreed_at: new Date().toISOString(),
      memo: memo || null,
    });

    if (error) throw error;
    return Response.json({ ok: true, stored: true });
  } catch (error) {
    console.error("[lead]", error);
    return Response.json({ error: "접수하지 못했습니다. 잠시 후 다시 시도해주세요." }, { status: 500 });
  }
}
