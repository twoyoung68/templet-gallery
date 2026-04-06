// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('수파베이스 설정이 누락되었습니다. Vercel 환경변수를 확인하세요.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);