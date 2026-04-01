/** 샘플 시드용 공통 내용 */

export const SAMPLE_PDF_URL =
  'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';

export const YAML_SAMPLE_A = `# EPC 경영·요약 템플릿 (샘플)
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

export const YAML_SAMPLE_B = `# EPC 기술·부록 템플릿 (샘플)
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

export async function fetchSamplePdfBlob(): Promise<Blob> {
  const res = await fetch(SAMPLE_PDF_URL);
  if (!res.ok) throw new Error('샘플 PDF를 가져오지 못했습니다.');
  return res.blob();
}
