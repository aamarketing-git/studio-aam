import OpenAI from "openai";
import { AAM_SYSTEM_PROMPT } from "@/lib/prompt";
import { getAdminClient } from "@/lib/supabase";
import { tooManyRequests, MAX_TURNS } from "@/lib/ratelimit";

export const runtime = "nodejs";

// 키가 없는 상태에서도 빌드가 통과해야 한다. 호출 시점에 만든다.
function client() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY가 설정되지 않았습니다. .env.local을 확인하세요.");
  return new OpenAI({ apiKey });
}

// 모델이 코드펜스를 붙여도 살아남게 파싱한다.
function parseModelJson(text) {
  const cleaned = String(text || "").replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try { return JSON.parse(cleaned.slice(start, end + 1)); } catch {}
    }
    // JSON이 아예 깨졌을 때도 대화는 끊기지 않게 한다.
    return { reply: cleaned, stage: 1, options: [], slots: {}, ready_for_summary: false };
  }
}

export async function POST(req) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    if (tooManyRequests(ip)) {
      return Response.json(
        { error: "요청이 너무 빠릅니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    const { message, history = [], sessionId } = await req.json();

    if (!message || !message.trim()) {
      return Response.json({ error: "메시지가 비어 있습니다." }, { status: 400 });
    }

    // 턴 상한. 무료 상담실이 무료 챗봇으로 쓰이는 것을 막는다.
    const turns = history.filter((m) => m.role === "user").length;
    if (turns >= MAX_TURNS) {
      return Response.json({
        reply:
          "여기까지 이야기 나눈 내용만으로도 충분합니다. 나머지는 AAM 제작팀과 직접 이야기하는 편이 훨씬 빠릅니다. 상담을 신청해 주세요.",
        stage: 10,
        options: [],
        slots: {},
        ready_for_summary: true,
        sessionId,
      });
    }

    const input = [...history, { role: "user", content: message }].map((m) => ({
      role: m.role,
      content: String(m.content),
    }));

    const response = await client().responses.create({
      model: process.env.MODEL_CHAT || "gpt-5.6-luna",
      // previous_response_id를 쓰더라도 instructions는 승계되지 않는다. 매번 보낸다.
      instructions: AAM_SYSTEM_PROMPT,
      input,
      reasoning: { effort: "low" },
    });

    const parsed = parseModelJson(response.output_text);

    // ── 저장 (Supabase가 설정된 경우에만) ──
    let sid = sessionId;
    const db = getAdminClient();
    if (db) {
      try {
        if (!sid) {
          const { data } = await db
            .from("plan_sessions")
            .insert({
              stage: parsed.stage ?? 1,
              slots: parsed.slots ?? {},
              turn_count: turns + 1,
              user_agent: req.headers.get("user-agent") || null,
            })
            .select("id")
            .single();
          sid = data?.id;
        } else {
          await db
            .from("plan_sessions")
            .update({
              stage: parsed.stage ?? 1,
              slots: parsed.slots ?? {},
              turn_count: turns + 1,
              updated_at: new Date().toISOString(),
            })
            .eq("id", sid);
        }
        if (sid) {
          await db.from("plan_messages").insert([
            { session_id: sid, role: "user", content: message },
            { session_id: sid, role: "assistant", content: parsed.reply || "" },
          ]);
        }
      } catch (e) {
        // 저장 실패로 대화를 끊지 않는다.
        console.error("[plan/chat] save failed:", e?.message);
      }
    }

    return Response.json({
      reply: parsed.reply || "",
      stage: parsed.stage ?? 1,
      options: Array.isArray(parsed.options) ? parsed.options.slice(0, 3) : [],
      slots: parsed.slots ?? {},
      readyForSummary: Boolean(parsed.ready_for_summary),
      sessionId: sid || null,
    });
  } catch (error) {
    console.error("[plan/chat]", error);
    return Response.json(
      { error: "AI 기획실에 연결하지 못했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
