// 작업물 데이터. 실제 운영 중인 사이트를 직접 캡처해 public/shots/ 에 넣었다.
//
// images : 2~4컷 (메인 화면 / 핵심 기능 / 업무 화면)
// who    : 누가 쓰는가 — 한 줄
// features: 어떤 기능이 들어갔나 — 3개, 기술용어 없이
// youCanBuild : 이걸로 당신은 무엇을 만들 수 있나 — 한 줄 (전환 문장)
// liveUrl : 실제 사이트 주소 (비어 있으면 상세창에 버튼이 나오지 않는다)

export const PORTFOLIO = [
  {
    id: "laellab",
    title: "레엘랩 LAEL LAB",
    tag: "스피치 코칭 · 온라인 클래스",
    images: ["/shots/laellab-01.jpg", "/shots/laellab-02.jpg"],
    who: "면접과 발표를 앞둔 사람을 가르치는 프리미엄 스피치 코칭 브랜드",
    features: [
      "강사 소개부터 커리큘럼까지 한 페이지에 담은 브랜드 사이트",
      "대입 면접 패키지·온라인 특강·전자책을 상품별로 나눈 신청 동선",
      "혼자서도 면접을 연습하도록 만든 AI 면접 프로그램",
    ],
    youCanBuild: "당신의 강의와 노하우를, 신청과 결제까지 이어지는 온라인 클래스로 만들 수 있습니다.",
    liveUrl: "https://www.laellab.com",
  },
  {
    id: "shabu74",
    title: "샤브74",
    tag: "로컬 F&B · 브랜드 웹 & 쇼룸",
    images: [
      "/shots/shabu74-01.jpg",
      "/shots/shabu74-02.jpg",
      "/shots/shabu74-showroom-01.jpg",
      "/shots/shabu74-showroom-02.jpg",
    ],
    who: "진주 평거동에서 한우 샤브샤브를 내는 동네 매장",
    features: [
      "매장 이야기·메뉴·가격·예약을 한 페이지에 담은 브랜드 사이트",
      "직접 기르는 채소 이야기를 사진으로 보여주는 소개 화면",
      "스크롤하면 가게 안을 걸어 들어가는 2D·3D 쇼룸 체험",
    ],
    youCanBuild: "동네 매장 하나로도 '가보고 싶은 가게'가 되는 웹과 쇼룸을 만들 수 있습니다.",
    liveUrl: "https://shabu74-a9wn.vercel.app/",
  },
  {
    id: "alfs",
    title: "알프스 AL.F.S",
    tag: "브랜드 커머스 · 팀 업무 앱",
    images: ["/shots/alfs-01.jpg", "/shots/alfs-02.jpg", "/shots/alfs-work-01.jpg"],
    who: "오륜미네랄·효소세상을 유통하는 웰니스 사업자",
    features: [
      "상품 소개부터 구매·배송·환불 안내까지 갖춘 자사몰",
      "AI 마케팅 상담으로 이어지는 브랜드 사이트",
      "직원이 일정·비용·고객을 한 화면에서 보는 업무 앱",
    ],
    youCanBuild: "물건을 파는 일과 팀을 굴리는 일을, 하나의 브랜드 아래에서 함께 할 수 있습니다.",
    liveUrl: "https://alfs.kr",
  },
  {
    id: "enzyme-world",
    title: "효소세상",
    tag: "건강식품 · 제품 카탈로그",
    images: ["/shots/enzyme-01.jpg", "/shots/enzyme-02.jpg"],
    who: "발효 효소를 만들고 총판으로 유통하는 제품 회사",
    features: [
      "제품의 규격·역가·가격을 한눈에 비교하는 카탈로그",
      "원료와 OEM 상담으로 이어지는 기업 문의 동선",
      "대리점·총판 모집과 파트너 로그인을 나눠 둔 구조",
    ],
    youCanBuild: "도매와 소매를 함께 하는 제품 카탈로그를 만들 수 있습니다.",
    liveUrl: "https://enzyme-world.vercel.app/products.html",
  },
  {
    id: "aivo",
    title: "아이보 AIVO",
    tag: "개인 AI 비서 · 업무 앱",
    images: ["/shots/aivo-01.jpg"],
    who: "혼자 사업을 굴리는 1인 사업자",
    features: [
      "오늘 있었던 일을 말하면 AI가 할 일을 정리해 주는 홈",
      "콘텐츠·고객관리·교육을 한 화면에 모은 도구들",
      "휴대폰에 설치해 쓰는 앱 형태의 화면",
    ],
    youCanBuild: "'오늘 뭘 해야 하지'를 없애 주는 나만의 비서를 만들 수 있습니다.",
    liveUrl: "https://aibizplatform-aivo.vercel.app",
  },
  {
    id: "shortform-aam",
    title: "숏폼AAM",
    tag: "AI 영상 · 숏폼 자동화 · 제작 중",
    images: ["/shots/shortform-01.jpg"],
    who: "매일 쇼츠를 올려야 하는 1인 브랜드와 가게",
    features: [
      "한 줄 문장에서 대본·장면·성우·자막까지 이어지는 제작",
      "동물 캐릭터가 상황극을 연기하는 공감 쇼츠",
      "정해진 시간에 매일 자동으로 올리는 연재",
    ],
    youCanBuild: "콘텐츠를 만들 시간이 없어도, 매일 한 편씩 올라가는 채널을 만들 수 있습니다.",
    liveUrl: "https://story-shortform-ai.vercel.app/",
  },
  {
    id: "oryun-mineral",
    title: "오륜미네랄 브랜드 영상",
    tag: "브랜드 필름 · 유튜브",
    images: ["/shots/oryun-mineral-01.jpg"],
    who: "미네랄디톡스 유튜브 채널과 오륜미네랄을 함께 운영하는 팀",
    features: [
      "제품을 마시는 하루를 그린 브랜드 영상",
      "유튜브 채널에 올린 12분 분량의 제품 라인업 영상",
      "제품 소개 페이지와 상세 이미지에 그대로 쓰는 장면들",
    ],
    youCanBuild: "당신의 제품도 영상 한 편으로 '왜 이걸 사야 하는지'를 말하게 만들 수 있습니다.",
    liveUrl: "https://youtu.be/s4NerJjxdKs",
  },
];
