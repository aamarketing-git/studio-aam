import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://studio-aam.com"),
  title: "AAM Studio — 당신의 사업에는 이미 이야기가 있습니다",
  description:
    "홈페이지도 만들었고 SNS도 하는데 왜 기억되지 않을까요. AAM은 무엇을 만들까보다 무엇을 이야기할까에서 시작합니다. 스토리·영상·웹사이트를 하나의 브랜드 경험으로 연결합니다.",
  openGraph: {
    title: "AAM Studio — 당신의 사업에는 이미 이야기가 있습니다",
    description: "스토리·영상·웹사이트를 하나로 연결하는 브랜드 스튜디오",
    url: "https://studio-aam.com",
    siteName: "AAM Studio",
    images: ["/og.png"],
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600;700&family=Gowun+Batang:wght@400;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
