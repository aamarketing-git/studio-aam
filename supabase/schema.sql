-- studio-aam AI 기획실 스키마
-- Supabase SQL Editor에 그대로 붙여넣어 실행한다.

create table if not exists plan_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  status text default 'in_progress',   -- in_progress | completed | abandoned
  stage int default 1,
  turn_count int default 0,
  slots jsonb default '{}'::jsonb,
  plan_markdown text,
  source text,
  user_agent text
);

create table if not exists plan_messages (
  id bigserial primary key,
  session_id uuid references plan_sessions(id) on delete cascade,
  role text,
  content text,
  created_at timestamptz default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references plan_sessions(id),
  name text,
  phone text,
  email text,
  privacy_agreed boolean not null default false,
  agreed_at timestamptz,
  crm_stage text default '1차상담',
  memo text,
  created_at timestamptz default now()
);

create index if not exists idx_messages_session on plan_messages(session_id);
create index if not exists idx_leads_stage on leads(crm_stage);

-- 고객 상담 내용이다. 익명 키로는 아무것도 읽지 못하게 막는다.
-- 쓰기는 서버 라우트(service role)에서만 일어난다.
alter table plan_sessions enable row level security;
alter table plan_messages enable row level security;
alter table leads enable row level security;
-- 정책을 만들지 않으면 anon 키로는 읽기·쓰기 모두 차단된다. 의도된 상태다.
