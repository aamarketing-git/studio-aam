import { PenLine, Clapperboard, MonitorSmartphone } from "lucide-react";
import MotionBlurCard from "./MotionBlurCard";

const STEPS = [
  {
    n: "01",
    label: "스토리",
    icon: <PenLine size={26} strokeWidth={2.2} />,
    hook: "사장님 가게엔, 이미 이야기가 있습니다",
    title: "작가가 이야기를 찾습니다",
    body: "간판과 메뉴판 뒤에 숨은 ‘왜 이 일을 시작했는지’를 발굴합니다. 광고 문구보다 이유를 먼저 씁니다.",
  },
  {
    n: "02",
    label: "영상",
    icon: <Clapperboard size={26} strokeWidth={2.2} />,
    hook: "스크롤을 멈추는 단 3초",
    title: "영상 제작자가 이야기를 보이게 합니다",
    body: "찾아낸 이야기를 손님이 보고, 느끼고, 기억하는 영상으로 탄생시킵니다.",
  },
  {
    n: "03",
    label: "웹",
    icon: <MonitorSmartphone size={26} strokeWidth={2.2} />,
    hook: "가게 문을 닫아도, 웹은 일합니다",
    title: "웹이 연결하고, AI가 관리합니다",
    body: "스토리와 영상이 살아 있는 웹을 만들고, 문의·예약·주문 응대는 AI 자동화가 맡습니다.",
  },
];

export default function Approach() {
  return (
    <section className="section" id="method">
      <div className="wrap">
        <div className="section-head method-head">
          <p className="label">Our Method</p>
          <h2>세 개의 틀이, 한 번에 돌아갑니다</h2>
          <p>
            작가의 스토리에서 영상 제작자의 영상이 탄생하고, 사장님 가게의 브랜딩은 웹 자동화로
            이어집니다. 따로 맡기면 따로 놀던 세 가지가, 하나의 흐름으로 함께 움직입니다.
          </p>
        </div>
        <div className="steps">
          {STEPS.map((s) => (
            <div className="step" key={s.n}>
              {/* 세 카드가 같은 박자로 동시에 회전 → "한 번에 돌아가는" 하나의 흐름 */}
              <MotionBlurCard label={s.label} icon={s.icon} hook={s.hook} />
              <p className="n">{s.n}</p>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
        <p className="flow-note">
          사람이 만들고, AI가 관리하고, <strong>사람이 남습니다.</strong>
          <span>사장님은 손님 곁에만 계세요. 나머지 흐름은 AAM이 돌립니다.</span>
        </p>
      </div>
    </section>
  );
}
