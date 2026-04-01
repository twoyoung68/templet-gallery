import type { DesignExportPayload, StoredDesign } from '../types';
import { saveDesign } from './db';
import { renderFirstPageThumbnail } from './pdfThumbnail';

function dataUrlToBase64(dataUrl: string): string {
  const i = dataUrl.indexOf(',');
  return i >= 0 ? dataUrl.slice(i + 1) : dataUrl;
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(dataUrlToBase64(reader.result as string));
    reader.onerror = () => reject(reader.error ?? new Error('read failed'));
    reader.readAsDataURL(blob);
  });
}

function base64ToBlob(base64: string, mime = 'application/pdf'): Blob {
  const binary = atob(base64);
  const n = binary.length;
  const bytes = new Uint8Array(n);
  for (let i = 0; i < n; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export async function exportDesignsJson(designs: StoredDesign[]): Promise<string> {
  const designsOut = await Promise.all(
    designs.map(async (d) => ({
      id: d.id,
      title: d.title,
      author: d.author,
      yaml: d.yaml,
      thumbnailDataUrl: d.thumbnailDataUrl,
      createdAt: d.createdAt,
      isSample: d.isSample,
      pdfBase64: await blobToBase64(d.pdfBlob),
    }))
  );

  const payload: DesignExportPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    designs: designsOut,
  };

  return JSON.stringify(payload, null, 2);
}

export function downloadJsonFile(filename: string, json: string): void {
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importDesignsFromJsonText(text: string): Promise<number> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('JSON 형식이 올바르지 않습니다.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('백업 파일 구조가 올바르지 않습니다.');
  }

  const payload = parsed as Partial<DesignExportPayload>;
  if (payload.version !== 1 || !Array.isArray(payload.designs)) {
    throw new Error('지원하지 않는 백업 버전이거나 designs 배열이 없습니다.');
  }

  let count = 0;
  for (const row of payload.designs) {
    if (
      !row ||
      typeof row !== 'object' ||
      typeof (row as { id?: string }).id !== 'string' ||
      typeof (row as { title?: string }).title !== 'string' ||
      typeof (row as { author?: string }).author !== 'string' ||
      typeof (row as { yaml?: string }).yaml !== 'string' ||
      typeof (row as { pdfBase64?: string }).pdfBase64 !== 'string'
    ) {
      continue;
    }

    const r = row as DesignExportPayload['designs'][number];
    const pdfBlob = base64ToBlob(r.pdfBase64);
    let thumbnailDataUrl = r.thumbnailDataUrl;
    if (!thumbnailDataUrl || thumbnailDataUrl.length < 32) {
      thumbnailDataUrl = await renderFirstPageThumbnail(pdfBlob);
    }

    const design: StoredDesign = {
      id: r.id,
      title: r.title,
      author: r.author,
      yaml: r.yaml,
      pdfBlob,
      thumbnailDataUrl,
      createdAt: typeof r.createdAt === 'number' ? r.createdAt : Date.now(),
      isSample: r.isSample,
    };

    await saveDesign(design);
    count += 1;
  }

  return count;
}
