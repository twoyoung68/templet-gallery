import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return typeof url === 'string' && url.length > 0 && typeof key === 'string' && key.length > 0;
}

export function getSupabaseClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 설정되지 않았습니다.');
  }
  if (!client) {
    client = createClient(import.meta.env.VITE_SUPABASE_URL!, import.meta.env.VITE_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false },
    });
  }
  return client;
}

/** Storage 버킷 이름 — Supabase 대시보드에서 동일 이름의 공개(Public) 버킷 생성 */
export const DESIGN_BUCKET = 'gallery-designs';
