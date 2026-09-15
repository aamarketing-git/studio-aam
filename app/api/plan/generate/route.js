import OpenAI from "openai";
import { AAM_PLAN_PROMPT } from "@/lib/prompt";
import { getAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 60;

// 키가 없는 상태에서도 빌드가 통과해야 한다. 호출 시점에 만든다.
function client() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY가 설정되지 않았습니다. .env.local을 확인하세요.");
  return new OpenAI({ apiKey });
}

export async function POST(req) {
  try {
    const { history = [], slots = {}, sessionId } = await req.json();

    const transcript = history
      .map((m) => `${m.role === "user" ? "고객" : "기획자"}: ${m.content}`)
      .join("\n");

    const response = await client().responses.create({
      // 기획서는 한 세션에 한 번뿐이다. 여기만 상위 모델을 쓴다.
      model: process.env.MODEL_PLAN || process.env.MODEL_CHAT || "gpt-5.6-terra",
      instructions: AAM_PLAN_PROMPT,
      input: [
        {
          role: "user",
          content:
            `[상담 대화]\n${transcript}\n\n` +
            `[정리된 정보]\n${JSON.stringify(slots, null, 2)}\n\n` +
            `위 내용으로 AAM 1차 기획서를 작성해줘.`,
        },
      ],
      reasoning: { effort: "medium" },
    });

    const plan = response.output_text;

    const db = getAdminClient();
    if (db && sessionId) {
      try {
        await db
          .from("plan_sessions")
          .update({
            plan_markdown: plan,
            slots,
            status: "completed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", sessionId);
      } catch (e) {
        console.error("[plan/generate] save failed:", e?.message);
      }
    }

    return Response.json({ plan });
  } catch (error) {
    console.error("[plan/generate]", error);
    return Response.json(
      { error: "기획서를 만들지 못했습니다. 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
