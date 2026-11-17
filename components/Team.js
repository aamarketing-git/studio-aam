// Stitch 디자인 참고: 팀원 사진은 프로젝트에서 생성된 포트레이트 이미지 활용
const MEMBERS = [
  {
    name: "고윤주",
    role: "스토리 작가 · 대표",
    photo: "https://lh3.googleusercontent.com/aida/AEtjO1U8Clxty9_2eQ39RROLCd1dCbumMOkPgEGyr9p1iymVGJQpPWUQ1Hjvunew9Zd5sUsmpfOjz-IWdf-H45mEEy44jz_8EAIWn6h8U6qQlWit8sjKhAxw5drhHnTX8wLqOsUKoPLwAcnZRO6zI8JIwK5w8PQbeDqzIeNMb5mrS46D4g6LglE_INPNo-3L6yKrG8IC5OThVlrYJH-nzUYST13mJPqbKvjMnQGaMYdqFCkjU2NYSR4KGffDqg",
    body: "당신의 사업에서 이야기를 찾는 사람입니다. 드라마와 시나리오를 써 온 작가가 브랜드의 서사를 직접 씁니다.",
  },
  {
    name: "고혁주",
    role: "총괄이사 · 영상 PD",
    photo: "https://lh3.googleusercontent.com/aida/AEtjO1WoaEX8A_lBIUSoi90GyWutPfnl0YdDprW4wL7xOCOXdGw1bMQ3Y1dhl43_SVx8sjGorcPdULJQy2gboknXtq-GDggDxUWji76kIKcNWdo0Bk2b_5um6UNr8xHT9hhCT_MOCoVLcjwQkQlw633QdXv1sOVbbWXWGzsV-QvkgYaWVvIr3KvTIcieZrdTByFp2DSeRdu_2r1TCleDZf1WwFEOqnCYDEDt0yFkPpj78J_D6GEwUWtqYura1g",
    body: "그 이야기를 보이게 만드는 사람입니다. 촬영과 AI 영상 제작을 총괄하고, 대만 현지에 머물며 통역과 대만 진출 마케팅의 다리를 놓습니다.",
  },
  {
    name: "이소영",
    role: "웹·AI 구축 · 사업총괄",
    photo: "https://lh3.googleusercontent.com/aida/AEtjO1X0wK22HuRxEIDdg92mGSoMbMEJ-kpuEz1uovLXMZ8NeQ0lHkSGf_d7gJqqNleCXuKF0mqH_6t8EJ4vAD3Xzva3VynjrwSR6Sfonte-qbA7_bw5Ep19_HuaoDmo45tP9vZsOJCRLbzT2YPFSpnLA1eMfvwJ0bNY5q6y2FnEi6FaEonk_b2TBuILZ5UvwlLC6pYWT927JYfUkSe21HsA566etgsSdwDHPhuABOTupMTuvrC43hWMgD4CEK4",
    body: "이야기가 실제 매출로 이어지게 만드는 사람입니다. 웹·앱·숏폼·AI 자동화를 직접 만들고, 알프스(AL.F.S) 같은 브랜드 커머스와 유통을 운영하며 검증한 방식으로 브랜드를 세웁니다.",
  },
];

export default function Team() {
  return (
    <section className="section team-section" id="team">
      <div className="wrap">
        <div className="section-head">
          <p className="label">The Creators</p>
          <h2>누가 만드는가</h2>
          <p>대행사에 맡기는 것이 아니라, 세 사람이 직접 만듭니다.</p>
        </div>
        <div className="team">
          {MEMBERS.map((m) => (
            <div className="member" key={m.name}>
              <img className="photo" src={m.photo} alt={m.name} loading="lazy" />
              <div>
                <p className="role">{m.role}</p>
                <div className="divider" />
                <p>{m.body}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="team-note">세 사람이 각자 하는 게 아니라, 한 사람의 브랜드를 함께 봅니다.</p>
      </div>
    </section>
  );
}
