-- 1. สร้างตาราง Profile สำหรับ Admin
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  role text default 'admin', -- กำหนดไว้เผื่อขยายสเกล
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- ตั้งค่า Row Level Security (RLS) ให้เฉพาะเจ้าของข้อมูลหรือ Admin ดูได้
alter table public.profiles enable row level security;

-- 2. ตารางหมวดหมู่ (เช่น กินไรดี, ลางานมุกไหน)
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  icon_name text, -- สำหรับเก็บชื่อ Lucide icon เช่น "Utensils", "Briefcase"
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. ตารางตัวเลือกและคำด่า (Options & Insults)
create table public.decisions_pool (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references public.categories(id) on delete cascade,
  content text not null, -- ข้อความผลลัพธ์ เช่น "กะเพราไข่ดาว"
  insult_text text,      -- คำด่าที่พ่วงมาด้วย
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. ตารางประวัติการสุ่ม (Logs)
create table public.usage_logs (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references public.categories(id),
  result_content text,
  user_context jsonb, -- เก็บ { "time": "20:00", "weather": "Rainy", "city": "Bangkok" }
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. ตารางการโดเนท (Manual Confirm หรือจาก Webhook)
create table public.donations (
  id uuid default gen_random_uuid() primary key,
  display_name text default 'ผู้ใจบุญที่ไม่ประสงค์ออกนาม',
  amount numeric not null,
  message text,
  status text default 'pending', -- 'completed', 'failed'
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. ตาราง settings สำหรับเก็บการตั้งค่าระบบ
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);