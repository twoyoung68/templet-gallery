import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
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
  const pdfUrl = usePdfObjectUrl(design.pdfBlob);
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const { ref, width } = useElementWidth<HTMLDivElement>();

  useEffect(() => {
    setPage(1);
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

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => (numPages ? Math.min(numPages, p + 1) : p));

  const mainPageWidth = Math.min(width - 16, 880);

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
            className="absolute right-3 top-3 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-daewoo hover:bg-[#004B91]/5 hover:text-daewoo focus:outline-none focus-visible:ring-2 focus-visible:ring-daewoo focus-visible:ring-offset-2"
            aria-label="닫기"
            title="닫기"
          >
            <X className="h-5 w-5 stroke-[2.5]" aria-hidden />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[1fr_minmax(280px,380px)] xl:grid-cols-[1fr_minmax(300px,400px)]">
          <div className="flex min-h-[min(50vh,420px)] flex-col border-b border-slate-100 bg-slate-50/90 lg:min-h-0 lg:border-b-0 lg:border-r">
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200/80 bg-white px-2 py-2 sm:px-3">
              <button
                type="button"
                onClick={goPrev}
                disabled={page <= 1}
                className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 disabled:opacity-35"
                aria-label="이전 슬라이드"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <span className="min-w-[5rem] text-center text-sm font-semibold text-daewoo">
                {numPages ? `${page} / ${numPages}` : '…'}
              </span>
              <button
                type="button"
                onClick={goNext}
                disabled={!numPages || page >= numPages}
                className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 disabled:opacity-35"
                aria-label="다음 슬라이드"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            <div ref={ref} className="min-h-0 flex-1 overflow-auto p-3 sm:p-4">
              <Document
                file={pdfUrl}
                onLoadSuccess={onLoadSuccess}
                loading={
                  <div className="flex min-h-[280px] items-center justify-center text-sm text-slate-500">
                    PDF 로딩 중…
                  </div>
                }
                className="flex justify-center"
              >
                {numPages ? (
                  <div className="rounded-lg border border-slate-200/90 bg-white p-1 shadow-md shadow-slate-300/30 ring-1 ring-slate-100">
                    <Page pageNumber={page} width={mainPageWidth} className="max-w-full" />
                  </div>
                ) : null}
              </Document>
            </div>

            {numPages != null && numPages > 1 && (
              <div className="shrink-0 border-t border-slate-200/80 bg-white px-2 py-2">
                <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  슬라이드 이동
                </p>
                <div className="flex max-w-full gap-1 overflow-x-auto pb-1 [scrollbar-width:thin]">
                  {Array.from({ length: numPages }, (_, i) => {
                    const n = i + 1;
                    const active = n === page;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPage(n)}
                        className={`min-w-[2rem] shrink-0 rounded-md border px-2 py-1.5 text-xs font-semibold transition ${
                          active
                            ? 'border-daewoo bg-daewoo text-white shadow-sm'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-daewoo/40 hover:text-daewoo'
                        }`}
                        aria-current={active ? 'true' : undefined}
                        aria-label={`${n}페이지로 이동`}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex max-h-[42vh] min-h-[200px] flex-col bg-white lg:max-h-none lg:min-h-0">
            <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3 sm:px-5">
              <button
                type="button"
                onClick={copyYaml}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-daewoo hover:text-daewoo"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-600" aria-hidden />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden />
                )}
                {copied ? '복사됨' : 'YAML 복사'}
              </button>
              <button
                type="button"
                onClick={copyYaml}
                className="inline-flex flex-1 items-center justify-center rounded-lg bg-daewoo px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-daewoo-dark min-[480px]:flex-none"
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
