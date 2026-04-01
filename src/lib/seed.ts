import type { StoredDesign } from '../types';
import { getAllDesigns, saveDesign } from './db';
import { renderFirstPageThumbnail } from './pdfThumbnail';

const SAMPLE_PDF_URL =
  'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';

const YAML_A = `# EPC 경영·요약 템플릿 (샘플)
theme:
  primary: "#004B91"
  accent: "#0A5BA8"
  background: "#FFFFFF"

slides:
  cover:
    title_zone: { max_lines: 2, align: center }
  content:
    title: { font_weight: semibold }
    body: { bullet_style: disc }
    footer: { show_page: true, brand: "DAEWOO E&C" }

export:
  format: pdf
  margins_mm: [12, 12, 12, 12]
`;

const YAML_B = `# EPC 기술·부록 템플릿 (샘플)
theme:
  primary: "#004B91"
  code_background: "#F1F5F9"

slides:
  figure_slide:
    caption_position: below
    figure_max_width_pct: 88
  table_slide:
    header_row: true
    zebra: true

figures:
  allowed_formats: [png, svg, pdf]
  min_dpi: 150
`;

async function fetchSampleBlob(): Promise<Blob> {
  const res = await fetch(SAMPLE_PDF_URL);
  if (!res.ok) throw new Error('샘플 PDF를 가져오지 못했습니다.');
  return res.blob();
}

let seedInFlight: Promise<void> | null = null;

export async function seedSampleDesignsIfEmpty(): Promise<void> {
  if (seedInFlight) return seedInFlight;
  seedInFlight = (async () => {
    const existing = await getAllDesigns();
    if (existing.length > 0) return;

    const blob = await fetchSampleBlob();
    const thumb = await renderFirstPageThumbnail(blob);

    const now = Date.now();
    const samples: StoredDesign[] = [
      {
        id: crypto.randomUUID(),
        title: '경영 요약 보고 (샘플)',
        author: 'EPC 갤러리',
        yaml: YAML_A,
        pdfBlob: blob,
        thumbnailDataUrl: thumb,
        createdAt: now,
        isSample: true,
      },
      {
        id: crypto.randomUUID(),
        title: '기술 부록 레이아웃 (샘플)',
        author: 'EPC 갤러리',
        yaml: YAML_B,
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
