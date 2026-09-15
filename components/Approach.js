const STEPS = [
  { n: "01", title: "작가가 이야기를 찾습니다", body: "사업 안에 숨어 있는 이유를 발굴합니다. 광고 문구를 먼저 쓰지 않습니다." },
  { n: "02", title: "PD가 보이게 만듭니다", body: "찾아낸 이야기를 보고 느끼고 기억할 수 있는 영상으로 만듭니다." },
  { n: "03", title: "개발자가 연결합니다", body: "스토리와 영상이 살아 있는, 문의와 주문으로 이어지는 웹으로 완성합니다." },
];

export default function Approach() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <p className="label">Our Method</p>
          <h2>세 사람이 하나의 흐름으로 만듭니다</h2>
          <p>스토리와 영상과 웹을 각각 다른 곳에 맡기면, 결국 따로 노는 세 개가 남습니다.</p>
        </div>
        <div className="steps">
          {STEPS.map((s) => (
            <div className="step" key={s.n}>
              <p className="n">{s.n}</p>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
        <p className="flow-note">각각 따로 만드는 것이 아니라, 하나의 브랜드 경험으로 연결합니다.</p>
      </div>
    </section>
  );
}
