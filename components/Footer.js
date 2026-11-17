export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <strong>AAM Studio</strong>
        <div className="biz">
          상호 주식회사 얼어바웃마케팅 · 대표 고윤주<br />
          사업자등록번호 860-86-03742 · 통신판매업신고 제 2026-경기김포-3844 호<br />
          주소 경기도 김포시 김포한강10로133번길 107, 디원시티 시그니처 지식산업센터 9층 952호 (구래동)
          <br />
          문의 hello@studio-aam.com<br />
          <a href="/privacy">개인정보처리방침</a>
        </div>
        <p style={{ marginTop: 28, opacity: .7 }}>© {new Date().getFullYear()} 얼어바웃마케팅</p>
      </div>
    </footer>
  );
}
