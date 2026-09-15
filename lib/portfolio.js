// 작업물 데이터. Stitch 디자인에서 생성된 이미지를 활용한 데모 데이터.
// 실제 운영 시에는 public/shots/ 에 이미지를 넣고 경로를 교체한다.
//
// images : 3~4컷 (메인 화면 / 핵심 기능 / 모바일 / 관리자)
// who    : 누가 쓰는가 — 한 줄
// features: 어떤 기능이 들어갔나 — 3개, 기술용어 없이
// youCanBuild : 이걸로 당신은 무엇을 만들 수 있나 — 한 줄 (전환 문장)

export const PORTFOLIO = [
  {
    id: "orot-table",
    title: "오롯한 식탁",
    tag: "로컬 F&B · 예약시스템",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCoSdO37z0Q6kxLVZN679iiixRCx9zotdRbHluJPZooj0lC8L3rrlYomnLlXSTHmr1VoNxZFdScUVS-MUpQm0LS6QQl525fnG8-XB1dlOhPwKz6rrvWkGrY61jwRDmaCqjyMqssCL7viT5eRBxc0kYlNOZRo0vkmWVC_HZlBIuimq4BPPi2rIrOz_KHQi_woCvWI_bSbRK8cvrmgmzmxVLYY8NAjXdQByQ3gl_vrSS5Jpmh5KXlUVQJ",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC2-KabyCLuJ_3dfC47rBBB9_PRSganEckmbKdVoSthUB3rbuLTj8PGue7P7bCS-VhNriLnu1esLrFJf11IDNviQwFd-fpLu6dmXi-brjNhbx_DrGWQ87rk2N228f8XXMtz0XKkMcrrPjhIkeOAbA6jCmvgH9QTOxyTgBbvxdc2vVuHE8OEEPJdiNzZ9qS2mJhPH3VLP9nUAspllpnAfWDS8JU59lH-6bjD9_biVgt_q8nR-KCRcYYO",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCkUQxS_OuTyZYX957Yy5E31NsH68xWyUQ43AuNZ0orkiRvtAQpjcKejOvyoeKjlGe4sGh0LOEUggIv8RmLjjy0-wa9mtqqb7bHWny3L-yQpcLdS-uoUzaU-8jJIx4Ov4nrkhCuQbXrm-1WqjGUkJQ0DFbYgCcNBXbQJRLuoWJ99T65A-KiUhhjVB3cSqXNoS1xNUhPLK9Cvia76cpGmu4rKdDVpthntsNXMVX4NR9rFkhgRbZSskoR",
    ],
    who: "제주와 서울에 3개 지점을 둔 로컬 다이닝 브랜드",
    features: ["브랜드 철학을 담은 숏필름 인트로", "지점별 실시간 좌석 예약 및 알림톡 연동", "제철 식재료 스토리텔링 매거진"],
    youCanBuild: "지점이 여러 개라면, 고객이 자기 동네 매장에 바로 예약하는 구조를 똑같이 만들 수 있습니다.",
    liveUrl: "",
  },
  {
    id: "monologue",
    title: "모노로그 스튜디오",
    tag: "라이프스타일 · 브랜드필름",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBP8Aeh37Y5dOmlCnMtMfcReYooWUD6GW6uHLWwJ6dKsRWqMaCexpecwSbl0QqV6-fyT3jH2XabHxpv1jhQ9MmBwtNRDxZy2i9-hdxsNfgOhRKQ6NNOvf5Mp7ClnnBYjP8tyBKJR7Pg80T4p39xDzwyBPIdtcYTa0PC9d_DY7xtu3_himpWV96x07DmxSues8Fl_bwaShI52QBULSm2lZHhlQf13qu8eVEIZno_pGadehzVp57JYo3l",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBMm1RtP8hRjF9osq1vqesuHjC6alI1BBVPOLaxLkMdyFUfGA6SviFWSNekyE2i6_9NshVKLn-V1vol3eByTbgGcrPtSsQG4uVvtNDxh21ELvv6c7Lpvi8ZSM1TUiHNNGfN3G4yk-soPsquOjItQeD2nQmirwggZyoa4gyamYBZ75EgwJIXuf4XioQwmfoO9ZYaxcwulIb0WVW7Q9az1t4vUcozmMIh8bAKevNYYJ_e_PaEAzUHPrRc",
    ],
    who: "1인 가구 라이프스타일 편집 브랜드",
    features: ["브랜드 영상 1편 + 숏폼 시리즈", "뉴스레터 아카이빙 웹", "오프라인 팝업 예약 연동"],
    youCanBuild: "당신의 감성을 담은 라이프스타일 매거진형 웹사이트를 같은 방식으로 만들 수 있습니다.",
    liveUrl: "",
  },
  {
    id: "soso-dawon",
    title: "소소다원",
    tag: "전통차 · 브랜딩",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAx6TIwWtovYRqcb59BKJ-mT5IdSy9ovoeR77P-uHFLEJWkwDXstfp-CAZ4Fvl9RIkDC9t-ZBilCiF_Fb0HLEo1mSsYWAVPQw387uy4Sqxsde9ELQ8J76wahLOkzUXSWf71T5cIMJQfHlIt1BEakkDpw0dZuUK-j7WSemyW5Ww6gEybknK036ZcfHoZhllobydY7dPvOlJ5GsIjlOQsN6_BEZekMlilPYntMQ5_kG2_8jeZPRvNidvR",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDK1y4R_SYRp8OGHoJoHEQ8cOXEvsW6SgWmW9XBnj_vcvIj_DChP9pZA3gDo5s8hswUho4SYGAohIW7WouvYqoMXK3MOxgteo93yxMkrTPYVAu4GcxKbBW3N8vaDHOybvya5WS9oFNAPCGDbxBTqu5c8pMgUh7gXrRnu0he31XZ1tn28bRiFdSiqk7i_s2PY0hUH1GSRhl4Tj3SHhdqHY2aJm4dAGoC7udQ9t6SIIfDxMVis-OzJpNu",
    ],
    who: "전통차 브랜드를 운영하는 1인 창업가",
    features: ["정기 구독 아카이브", "차 종류별 스토리 페이지", "계절 한정 패키지 예약"],
    youCanBuild: "손님에게 '왜 이 차를 마셔야 하는지' 이야기하는 웹사이트를 만들 수 있습니다.",
    liveUrl: "",
  },
  {
    id: "atelier-gyeol",
    title: "아틀리에 결",
    tag: "수제가구 · 공방플랫폼",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDEY7TGkhCAXZConSevm1yR6vIrxIiO-M_VlYI4T_Lkus5gTu3mveBBaQubmbDN3l1BWNzNEgN2RhPDGyorLLT8gLP3LmPCVlOyc4UTHbQC5tTNlvRwtxmUl9rZqIzXHQxA-Vl155NqYz0RQEI-vs3v_EYtRCbyKcB1QyBWp_kIoiAMgYNNpVrrBDR4rgNUb62otCCn8oK1ulvdy8w4cWLdnUPZZs47b-W_DZ0vosmaSJ3Lc5fDKcEk",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAtWNFyfazMn5Y2yqqsSfESIcfs4HKtOmXv42SVeqnBG0cgTxfBG9rjQ07MMFLxAzb4TY1w3Bek_w71ExNJY-0hpT6t_D_NRE-egq5XuyZEDc4Dw_NpI2POVBrnJcb5i7KsCP1CTWuKaarrojpl8wzzTXZA0sHnDdJbolCii1YQUof-OxOtFroM0yFLzP7D1gRIQ4DTSJbLJoQtYXRRwfr25XAwhmEEozpK8ApBXrgwhHe8FvloDpfM",
    ],
    who: "주문제작 가구 공방을 운영하는 장인",
    features: ["수제 가구 포트폴리오 갤러리", "주문제작 견적 신청 폼", "제작 과정 다큐멘터리 영상"],
    youCanBuild: "당신의 공방 이야기를 보여주고, 견적까지 바로 받을 수 있는 구조를 만들 수 있습니다.",
    liveUrl: "",
  },
  {
    id: "ondo-archive",
    title: "온도 기록관",
    tag: "독립출판 · 스토리텔링",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCT-taxrgvqKdV0HRqUzZk1b8DpjZDIjmX8Y4VpciuXzvBTDxm8dzvX1Bess9GM7spRQFOrIgAl75jXEHns-bragcsH5EbiPOanXRwYXcKlptrkdCcpsckNzgfeNVdFkGpJaPLO8s85WqOkCaU7YwBHIACHjdos2LW0j2p8d4fbIbUUGFaZkBjn5-iYDlv4VIw4GadwmMzxcHpTHSN6xxG5WsfN8s6Eyy4gkiUE8BnzfAiT5ZI_s4vv",
    ],
    who: "독립 출판과 오디오북을 만드는 스토리텔러",
    features: ["오디오북 아카이브", "읽기 경험 중심 레이아웃", "저자 인터뷰 시리즈 페이지"],
    youCanBuild: "당신의 글과 목소리를 세상에 전하는 개인 미디어 플랫폼을 만들 수 있습니다.",
    liveUrl: "",
  },
  {
    id: "botanic-archive",
    title: "보타닉 아카이브",
    tag: "가드닝 · 구독서비스",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDOPKgSTNtdIBLIDgNxaUGAUh0D0mjy8JBsEBcjELfgnkod-VPvT93JuVpCcoRvDR-T_MZ6T2Yhox8dE-ExpudBfDaWZPPNEOp9pttatEYjp9U7CZ52iWtfEwJnRX9i-Qf-hUi173tMc3gfn_MxzDMHfkeufAyOtlhzSuYnI8YUr0g1Qbqpuq-IHkKqlmsD7h6w5Zyl6PtBCpO4-tu4BDhG9DyvTeIhm544LDXQMkjax6SzyrWGbvHz",
    ],
    who: "희귀 식물 큐레이션과 구독 서비스를 운영하는 플로리스트",
    features: ["식물 큐레이션 구독 시스템", "관리 가이드 콘텐츠", "시즌별 식물 스토리 페이지"],
    youCanBuild: "식물을 파는 게 아니라 '식물과 함께하는 삶'을 구독하게 만드는 플랫폼을 만들 수 있습니다.",
    liveUrl: "",
  },
];
