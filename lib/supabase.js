import { createClient } from "@supabase/supabase-js";

// Supabase 설정이 없으면 null을 돌려준다.
// 이 사이트는 DB 없이도 동작해야 한다. 저장만 안 될 뿐이다.
export function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export const hasDatabase = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
