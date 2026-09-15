export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <strong>AAM Studio</strong>
        <div className="biz">
          상호 주식회사 AAM · 대표 고윤주<br />
          사업자등록번호 000-00-00000 · 통신판매업신고 제0000-000000호<br />
          주소 서울특별시 ○○구 ○○로 00 · 문의 0000-0000 · hello@studio-aam.com<br />
          <a href="/privacy">개인정보처리방침</a>
        </div>
        <p style={{ marginTop: 28, opacity: .7 }}>© {new Date().getFullYear()} AAM Studio</p>
      </div>
    </footer>
  );
}
