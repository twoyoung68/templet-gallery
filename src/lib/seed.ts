import type { StoredDesign } from '../types';
import { seedSamplesRemoteIfEmpty } from './designsRemote';
import { isSupabaseConfigured } from './supabaseClient';
import { getAllDesigns, saveDesign } from './db';
import { renderFirstPageThumbnail } from './pdfThumbnail';
import { fetchSamplePdfBlob, YAML_SAMPLE_A, YAML_SAMPLE_B } from './sampleContent';

let seedInFlight: Promise<void> | null = null;

/** Supabase 미설정 시에만 IndexedDB에 샘플 저장 */
export async function seedIndexedDbIfEmpty(): Promise<void> {
  if (seedInFlight) return seedInFlight;
  seedInFlight = (async () => {
    const existing = await getAllDesigns();
    if (existing.length > 0) return;

    const blob = await fetchSamplePdfBlob();
    const thumb = await renderFirstPageThumbnail(blob);

    const now = Date.now();
    const samples: StoredDesign[] = [
      {
        id: crypto.randomUUID(),
        title: '경영 요약 보고 (샘플)',
        author: 'EPC 갤러리',
        yaml: YAML_SAMPLE_A,
        pdfBlob: blob,
        thumbnailDataUrl: thumb,
        createdAt: now,
        isSample: true,
      },
      {
        id: crypto.randomUUID(),
        title: '기술 부록 레이아웃 (샘플)',
        author: 'EPC 갤러리',
        yaml: YAML_SAMPLE_B,
        pdfBlob: blob.slice(0, blob.size, blob.type),
        thumbnailDataUrl: thumb,
        createdAt: now + 1,
        isSample: true,
      },
    ];

    for (const d of samples) {
      await saveDesign(d);
    }
  })();
  try {
    await seedInFlight;
  } finally {
    seedInFlight = null;
  }
}

export async function seedSampleDesignsIfEmpty(): Promise<void> {
  if (isSupabaseConfigured()) {
    await seedSamplesRemoteIfEmpty();
    return;
  }
  await seedIndexedDbIfEmpty();
}
