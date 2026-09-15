// 아주 단순한 메모리 기반 제한. 서버리스에서는 인스턴스마다 따로 센다.
// 트래픽이 늘면 Upstash Redis 같은 외부 저장소로 옮긴다.
const hits = new Map();

export function tooManyRequests(key, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const rec = hits.get(key);
  if (!rec || now > rec.reset) {
    hits.set(key, { count: 1, reset: now + windowMs });
    return false;
  }
  rec.count += 1;
  return rec.count > limit;
}

export const MAX_TURNS = 25;
