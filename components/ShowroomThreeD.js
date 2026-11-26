import { SHOWROOMS } from "@/lib/showrooms";

export default function ShowroomThreeD() {
  return (
    <section className="section showroom-section" id="showroom-3d">
      <div className="wrap">
        <div className="section-head">
          <p className="label">3D Virtual Showroom</p>
          <h2>3D 가상쇼룸</h2>
          <p>
            매장을 그대로 옮긴 3D 공간 네 곳입니다. 링크를 누르면 설치 없이 브라우저에서 바로 열립니다.
          </p>
        </div>

        <div className="flow-lines">
          <p>
            링크를 누르면 설치 없이 브라우저에서 3D 공간이 열리고, 걸어 다니며 상품을 돌려 보고 가까이서
            확인합니다.
          </p>
          <p>
            둘러보던 그 자리에서 상담과 구매로 바로 이어집니다 — 매장에 오지 않아도, 매장에 온 것처럼.
          </p>
        </div>

        <div className="showroom-grid">
          {SHOWROOMS.map((s) => (
            <a
              key={s.url}
              className="showroom-card"
              href={s.url}
              target="_blank"
              rel="noreferrer"
            >
              <span className="showroom-thumb">
                <img src={s.img} alt={`${s.name} 3D 쇼룸 화면`} loading="lazy" />
                <span className="showroom-badge">{s.tag}</span>
              </span>
              <span className="showroom-body">
                <strong>{s.name}</strong>
                <em>{s.en}</em>
                <span className="showroom-desc">{s.desc}</span>
                <span className="showroom-go">쇼룸 열기 ↗</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
