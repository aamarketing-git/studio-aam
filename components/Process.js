const PHASES = [
  { n: "1", title: "상담", ours: "사업과 상황을 듣습니다. AI 기획실을 먼저 해보셨다면 그 내용에서 시작합니다.", yours: "지금 어려운 점과 하고 싶은 것" },
  { n: "2", title: "1차 기획", ours: "스토리 방향, 웹 구조, 영상 방향을 문서로 정리해 드립니다.", yours: "기획 내용 확인과 피드백" },
  { n: "3", title: "제작", ours: "각본과 카피, 영상 촬영·편집, 웹 디자인과 개발을 함께 진행합니다.", yours: "매장·제품 사진, 촬영 일정, 계정 정보" },
  { n: "4", title: "오픈과 보완", ours: "베타 확인 후 오픈하고, 열고 난 뒤에도 함께 다듬습니다.", yours: "실제 운영하며 느낀 점" },
];

export default function Process() {
  return (
    <section className="section" id="process">
      <div className="wrap">
        <div className="section-head">
          <p className="label">How It Works</p>
          <h2>어떻게 진행되나요</h2>
          <p>비용과 기간은 규모에 따라 달라집니다. 상담에서 정확하게 안내드립니다.</p>
        </div>
        <div className="phases">
          {PHASES.map((p) => (
            <div className="phase" key={p.n}>
              <p className="num">{p.n}단계</p>
              <div>
                <h3>{p.title}</h3>
                <p className="ours">{p.ours}</p>
              </div>
              <p className="yours"><span>이때 필요한 것</span>{p.yours}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
