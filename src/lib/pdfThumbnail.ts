import { pdfjs } from 'react-pdf';

/**
 * PDF 첫 페이지를 JPEG 데이터 URL로 렌더링 (갤러리 카드 썸네일용).
 */
export async function renderFirstPageThumbnail(blob: Blob, maxWidth = 360): Promise<string> {
  const data = new Uint8Array(await blob.arrayBuffer());
  const loadingTask = pdfjs.getDocument({ data });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = maxWidth / baseViewport.width;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  const renderTask = page.render({
    canvasContext: ctx,
    viewport,
  });
  await renderTask.promise;

  return canvas.toDataURL('image/jpeg', 0.85);
}
