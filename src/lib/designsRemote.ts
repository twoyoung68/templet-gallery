import type { StoredDesign } from '../types';
import { DESIGN_BUCKET, getSupabaseClient } from './supabaseClient';
import { YAML_SAMPLE_A, YAML_SAMPLE_B, fetchSamplePdfBlob } from './sampleContent';
import { renderFirstPageThumbnail } from './pdfThumbnail';

type DbDesignRow = {
  id: string;
  title: string;
  author: string;
  yaml: string;
  thumbnail_data_url: string | null;
  pdf_path: string;
  is_sample: boolean;
  created_at: string;
};

function publicUrlForPath(path: string): string {
  const { data } = getSupabaseClient().storage.from(DESIGN_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function mapRow(row: DbDesignRow): StoredDesign {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    yaml: row.yaml,
    thumbnailDataUrl: row.thumbnail_data_url ?? '',
    pdfPublicUrl: publicUrlForPath(row.pdf_path),
    pdfStoragePath: row.pdf_path,
    createdAt: new Date(row.created_at).getTime(),
    isSample: row.is_sample,
  };
}

export async function countDesignsRemote(): Promise<number> {
  const { count, error } = await getSupabaseClient()
    .from('designs')
    .select('id', { count: 'exact', head: true });
  if (error) throw error;
  return count ?? 0;
}

export async function fetchDesignsRemote(): Promise<StoredDesign[]> {
  const { data, error } = await getSupabaseClient()
    .from('designs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as DbDesignRow[]).map(mapRow);
}

export type UploadDesignInput = {
  title: string;
  author: string;
  yaml: string;
  thumbnailDataUrl: string;
  pdfBlob: Blob;
  isSample?: boolean;
  /** JSON 가져오기 등 기존 id 유지 시 */
  id?: string;
};

export async function uploadDesignRemote(input: UploadDesignInput): Promise<string> {
  const id = input.id ?? crypto.randomUUID();
  const pdfPath = `pdfs/${id}.pdf`;
  const sb = getSupabaseClient();

  const { error: upErr } = await sb.storage.from(DESIGN_BUCKET).upload(pdfPath, input.pdfBlob, {
    contentType: 'application/pdf',
    upsert: true,
  });
  if (upErr) throw upErr;

  const { error: insErr } = await sb.from('designs').upsert(
    {
      id,
      title: input.title,
      author: input.author,
      yaml: input.yaml,
      thumbnail_data_url: input.thumbnailDataUrl,
      pdf_path: pdfPath,
      is_sample: input.isSample ?? false,
    },
    { onConflict: 'id' }
  );
  if (insErr) throw insErr;

  return id;
}

export async function deleteDesignRemote(design: StoredDesign): Promise<void> {
  const sb = getSupabaseClient();
  const path = design.pdfStoragePath;
  if (path) {
    const { error: stErr } = await sb.storage.from(DESIGN_BUCKET).remove([path]);
    if (stErr) throw stErr;
  }
  const { error: delErr } = await sb.from('designs').delete().eq('id', design.id);
  if (delErr) throw delErr;
}

let seedRemoteInFlight: Promise<void> | null = null;

export async function seedSamplesRemoteIfEmpty(): Promise<void> {
  if (seedRemoteInFlight) return seedRemoteInFlight;
  seedRemoteInFlight = (async () => {
    const n = await countDesignsRemote();
    if (n > 0) return;

    const blob = await fetchSamplePdfBlob();
    const thumb = await renderFirstPageThumbnail(blob);

    await uploadDesignRemote({
      title: '경영 요약 보고 (샘플)',
      author: 'EPC 갤러리',
      yaml: YAML_SAMPLE_A,
      thumbnailDataUrl: thumb,
      pdfBlob: blob,
      isSample: true,
    });

    await uploadDesignRemote({
      title: '기술 부록 레이아웃 (샘플)',
      author: 'EPC 갤러리',
      yaml: YAML_SAMPLE_B,
      thumbnailDataUrl: thumb,
      pdfBlob: blob.slice(0, blob.size, blob.type),
      isSample: true,
    });
  })();
  try {
    await seedRemoteInFlight;
  } finally {
    seedRemoteInFlight = null;
  }
}
