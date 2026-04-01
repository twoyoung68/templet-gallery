import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileUp, Loader2 } from 'lucide-react';
import type { StoredDesign } from '../types';
import { renderFirstPageThumbnail } from '../lib/pdfThumbnail';

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: (design: StoredDesign) => void;
};

export function UploadSection({ open, onClose, onSaved }: Props) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [yaml, setYaml] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setTitle('');
    setAuthor('');
    setYaml('');
    setFile(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError('PDF 파일을 선택해 주세요.');
      return;
    }
    if (!title.trim()) {
      setError('스타일 이름을 입력해 주세요.');
      return;
    }
    if (!author.trim()) {
      setError('제작자 이름을 입력해 주세요.');
      return;
    }
    setBusy(true);
    try {
      const pdfBlob = new Blob([await file.arrayBuffer()], { type: 'application/pdf' });
      const thumbnailDataUrl = await renderFirstPageThumbnail(pdfBlob);
      const design: StoredDesign = {
        id: crypto.randomUUID(),
        title: title.trim(),
        author: author.trim(),
        yaml: yaml.trim() || '# (YAML 없음)',
        pdfBlob,
        thumbnailDataUrl,
        createdAt: Date.now(),
        isSample: false,
      };
      onSaved(design);
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드 처리 중 오류가 발생했습니다.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-slate-900">새 스타일 등록</h3>
              <button
                type="button"
                onClick={() => {
                  reset();
                  onClose();
                }}
                className="text-sm font-medium text-slate-500 hover:text-slate-800"
              >
                닫기
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    스타일 이름
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-daewoo focus:outline-none focus:ring-2 focus:ring-daewoo/20"
                    placeholder="예: 본사 표준 표지"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    제작자
                  </label>
                  <input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-daewoo focus:outline-none focus:ring-2 focus:ring-daewoo/20"
                    placeholder="이름 또는 팀"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  PDF 파일
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-6 transition hover:border-daewoo/50 hover:bg-daewoo/5">
                  <FileUp className="h-8 w-8 shrink-0 text-daewoo" aria-hidden />
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-medium text-slate-800">
                      {file ? file.name : '클릭하여 PDF 선택'}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">PPT에서 보낸 PDF 권장</p>
                  </div>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  YAML 규칙
                </label>
                <textarea
                  value={yaml}
                  onChange={(e) => setYaml(e.target.value)}
                  rows={10}
                  className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs leading-relaxed shadow-sm focus:border-daewoo focus:outline-none focus:ring-2 focus:ring-daewoo/20 sm:text-sm"
                  placeholder="theme: ..."
                />
              </div>
              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                  {error}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-daewoo px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-daewoo-dark disabled:opacity-60"
                >
                  {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                  갤러리에 공유하기
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
