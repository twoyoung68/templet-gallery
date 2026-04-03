import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Check } from 'lucide-react'; // 안 쓰는 버튼 아이콘 제거
import { Document, Page } from 'react-pdf';
import type { StoredDesign } from '../types';

type Props = {
  design: StoredDesign;
  onClose: () => void;
};

function usePdfObjectUrl(blob: Blob | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url;
}

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(560);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(Math.max(300, Math.floor(el.clientWidth))));
    ro.observe(el);
    setWidth(Math.max(300, Math.floor(el.clientWidth)));
    return () => ro.disconnect();
  }, []);
  return { ref, width };
}

export function DesignModal({ design, onClose }: Props) {
  const blobUrl = usePdfObjectUrl(design.pdfBlob ?? null);
  const pdfUrl = design.pdfPublicUrl ?? blobUrl;
  const [numPages, setNumPages] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const { ref, width } = useElementWidth<HTMLDivElement>();

  useEffect(() => {
    setNumPages(null);
  }, [design.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const onLoadSuccess = useCallback(({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
  }, []);

  const copyYaml = useCallback(async () => {
    await navigator.clipboard.writeText(design.yaml);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [design.yaml]);

  // 페이지 너비 계산 (좌우 여백 고려)
  const mainPageWidth = Math.min(width - 40, 880);

  if (!pdfUrl) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
        aria-label="닫기"
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="design-modal-title"
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ type: 'spring', damping: 30, stiffness: 360 }}
        className="relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl ring-1 ring-slate-200/60 xl:max-w-7xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 헤더 섹션 */}
        <div className="relative flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3 pr-14 sm:px-5 sm:py-4 sm:pr-16">
          <div className="min-w-0 pr-2">
            <h2 id="design-modal-title" className="truncate text-base font-semibold text-slate-900 sm:text-lg">
              {design.title}
            </h2>
            <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-sm">{design.author}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[#004B91] hover:bg-[#004B91]/5 hover:text-[#004B91]"
            aria-label="닫기"
          >
            <X className="h-5 w-5 stroke-[2.5]" aria-hidden />
          </button>
        </div>

        {/* 메인 콘텐츠 그리드 */}
        <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_380px]">
          
          {/* 왼쪽: PDF 뷰어 섹션 (세로 스크롤 개조 포인트) */}
          <div className="flex flex-col border-b border-slate-100 bg-slate-50/90 lg:border-b-0 lg:border-r">
            {/* 상단 정보바 */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-4 py-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">PDF 문서 프리뷰</span>
              <span className="text-sm font-semibold text-[#004B91]">
                총 {numPages || '...'} 장표
              </span>
            </div>

            {/* 스크롤 가능한 도면 영역 */}
            <div ref={ref} className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8 [scrollbar-width:thin]">
              <Document
                file={pdfUrl}
                onLoadSuccess={onLoadSuccess}
                loading={<div className="flex py-20 items-center justify-center text-sm text-slate-500">도면 로딩 중…</div>}
                className="flex flex-col items-center gap-8" // 장표 간 간격(gap-8) 추가
              >
                {/* 모든 장표를 세로로 나열 */}
                {numPages ? (
                  Array.from({ length: numPages }, (_, i) => (
                    <div 
                      key={`page_${i + 1}`} 
                      className="rounded-lg border border-slate-200/90 bg-white p-1 shadow-xl shadow-slate-300/20 ring-1 ring-slate-100"
                    >
                      <Page 
                        pageNumber={i + 1} 
                        width={mainPageWidth} 
                        className="max-w-full"
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                      />
                    </div>
                  ))
                ) : null}
              </Document>
            </div>
          </div>

          {/* 오른쪽: YAML 정보 섹션 (기존 유지) */}
          <div className="flex max-h-[42vh] min-h-[200px] flex-col bg-white lg:max-h-none lg:min-h-0">
            <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3 sm:px-5">
              <button
                type="button"
                onClick={copyYaml}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-[#004B91] hover:text-[#004B91]"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {copied ? '복사됨' : 'YAML 복사'}
              </button>
              <button
                type="button"
                onClick={copyYaml}
                className="inline-flex flex-1 items-center justify-center rounded-lg bg-[#004B91] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-110 min-[480px]:flex-none"
              >
                이 디자인 선택하기
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-5">
              <pre className="h-full min-h-[160px] rounded-xl border border-slate-200 bg-slate-900 p-4 text-left text-[11px] leading-relaxed text-slate-100 sm:text-xs">
                <code>{design.yaml}</code>
              </pre>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}