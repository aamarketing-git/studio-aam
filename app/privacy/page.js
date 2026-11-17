import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata = {
  title: "개인정보처리방침 — AAM Studio",
  description: "주식회사 얼어바웃마케팅이 운영하는 studio-aam.com의 개인정보처리방침입니다.",
};

const SECTIONS = [
  {
    title: "1. 수집하는 개인정보 항목",
    body: [
      "AI 기획실 상담과 연락처 접수 과정에서 다음 항목을 수집합니다.",
    ],
    list: [
      "필수: 이름, 연락처(전화번호)",
      "선택: 이메일, 상담 메모",
      "AI 기획실에서 나눈 대화 내용과 그 대화로 만들어진 기획서",
      "서비스 이용 과정에서 자동으로 생성되는 접속 기록",
    ],
  },
  {
    title: "2. 개인정보의 수집·이용 목적",
    body: [
      "수집한 개인정보는 상담 응대와 기획서 전달, 서비스 개선을 위해서만 사용합니다. 광고성 정보 발송에 이용하지 않으며, 이용자의 동의 없이 제3자에게 판매하거나 제공하지 않습니다.",
    ],
  },
  {
    title: "3. 보유 및 이용 기간",
    body: [
      "수집한 개인정보는 상담 목적을 달성할 때까지 보관하고, 목적을 달성하면 지체 없이 파기합니다. 다만 관계 법령에 따라 보존해야 하는 경우에는 해당 기간 동안 보관합니다.",
      "이용자는 언제든지 자신의 개인정보 삭제를 요청할 수 있으며, 요청을 받으면 확인 후 지체 없이 삭제합니다.",
    ],
  },
  {
    title: "4. 개인정보 처리의 위탁",
    body: [
      "서비스 운영을 위해 아래 업체에 개인정보 처리를 위탁하고 있습니다.",
    ],
    list: [
      "Supabase — 상담 내용과 연락처의 보관",
      "OpenAI — AI 상담 응답과 기획서 생성",
    ],
  },
  {
    title: "5. 이용자의 권리",
    body: [
      "이용자는 언제든지 자신의 개인정보를 조회·정정·삭제하거나 처리 정지를 요청할 수 있습니다. 아래 문의처로 연락하시면 본인 확인 후 처리해 드립니다.",
    ],
  },
  {
    title: "6. 개인정보의 안전성 확보 조치",
    body: [
      "상담 내용은 접근 권한이 제한된 서버에 보관하며, 외부에 공개되지 않도록 접근을 통제하고 있습니다. 전송 구간은 암호화되어 있습니다.",
    ],
  },
  {
    title: "7. 개인정보 보호책임자 및 문의처",
    body: [
      "개인정보 처리에 관한 문의는 아래로 연락해 주세요.",
    ],
    list: [
      "개인정보 보호책임자: 고윤주 (대표)",
      "상호: 주식회사 얼어바웃마케팅",
      "이메일: hello@studio-aam.com",
      "주소: 경기도 김포시 김포한강10로133번길 107, 디원시티 시그니처 지식산업센터 9층 952호 (구래동)",
    ],
  },
  {
    title: "8. 고지의 의무",
    body: [
      "이 방침의 내용이 변경될 경우 시행 7일 전부터 이 페이지를 통해 알려 드립니다.",
      "시행일: 2026년 11월 17일",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main>
      <section className="section" style={{ paddingTop: 120, paddingBottom: 0 }}>
        <div className="wrap" style={{ maxWidth: 820 }}>
          <p className="label" style={{ letterSpacing: ".18em", fontSize: 12, color: "var(--ink-muted)", textTransform: "uppercase", marginBottom: 14 }}>
            Privacy Policy
          </p>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", marginBottom: 10 }}>개인정보처리방침</h1>
          <p style={{ color: "var(--ink-muted)", fontSize: 15 }}>
            주식회사 얼어바웃마케팅(AAM Studio)은 이용자의 개인정보를 소중히 다루며, 아래와 같이 처리 방침을 밝힙니다.
          </p>

          <div style={{ marginTop: 40, display: "grid", gap: 32 }}>
            {SECTIONS.map((s) => (
              <div key={s.title}>
                <h2 style={{ fontSize: 19, fontFamily: "var(--font-body)", fontWeight: 700, marginBottom: 10 }}>{s.title}</h2>
                {s.body.map((p, i) => (
                  <p key={i} style={{ fontSize: 15, color: "var(--ink-muted)", lineHeight: 1.8 }}>{p}</p>
                ))}
                {s.list && (
                  <ul style={{ marginTop: 4, display: "grid", gap: 6 }}>
                    {s.list.map((li, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: 15,
                          color: "var(--ink-muted)",
                          lineHeight: 1.8,
                          paddingLeft: 14,
                          position: "relative",
                        }}
                      >
                        <span style={{ position: "absolute", left: 0, color: "var(--lavender)" }}>•</span>
                        {li}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <p style={{ marginTop: 48 }}>
            <Link href="/" className="btn ghost small">← 처음으로</Link>
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
