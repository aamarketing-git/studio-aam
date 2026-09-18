export default function Contact() {
  return (
    <section className="section contact" id="contact">
      <div className="wrap">
        <h2>기억될 무언가를, 함께 만들어요</h2>
        <p>
          AI 기획실에서 뽑은 기획서를 가지고 오셔도 좋고, 아직 아무것도 정해지지 않았어도 좋습니다.
          <br />
          편하게 이야기를 나눠보세요.
        </p>
        <div className="actions">
          <a className="btn" href="#planner">7분 AI 기획실 시작</a>
          <a
            className="btn ghost"
            style={{ color: "#fff", borderColor: "rgba(255,255,255,.6)" }}
            href="http://pf.kakao.com/_axaUrX/chat"
            target="_blank"
            rel="noreferrer"
          >
            카카오톡 상담
          </a>
        </div>
      </div>
    </section>
  );
}
