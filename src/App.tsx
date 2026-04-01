import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Share2 } from 'lucide-react';
import { AdminModePanel } from './components/AdminModePanel';
import { BackupToolbar } from './components/BackupToolbar';
import { DesignModal } from './components/DesignModal';
import { GalleryGrid } from './components/GalleryGrid';
import { UploadSection } from './components/UploadSection';
import { readAdminSession } from './lib/adminSession';
import { deleteDesign, getAllDesigns, saveDesign } from './lib/db';
import { seedSampleDesignsIfEmpty } from './lib/seed';
import type { StoredDesign } from './types';

export default function App() {
  const [designs, setDesigns] = useState<StoredDesign[]>([]);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [seedWarning, setSeedWarning] = useState<string | null>(null);
  const [modalDesign, setModalDesign] = useState<StoredDesign | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => readAdminSession());

  const refresh = useCallback(async () => {
    try {
      const list = await getAllDesigns();
      setDesigns(list);
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : '데이터를 불러오지 못했습니다.');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await seedSampleDesignsIfEmpty();
      } catch (e) {
        if (!cancelled) {
          setSeedWarning(
            e instanceof Error
              ? `샘플 자동 추가 실패: ${e.message}`
              : '샘플 자동 추가에 실패했습니다.'
          );
        }
      }
      if (cancelled) return;
      await refresh();
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const handleOpen = (d: StoredDesign) => setModalDesign(d);

  const handleDelete = (d: StoredDesign) => {
    if (!isAdmin || !readAdminSession()) return;
    if (!window.confirm('정말로 이 템플릿을 삭제하시겠습니까?')) return;
    void (async () => {
      await deleteDesign(d.id);
      await refresh();
      if (modalDesign?.id === d.id) setModalDesign(null);
    })();
  };

  const handleSaved = (design: StoredDesign) => {
    void (async () => {
      await saveDesign(design);
      await refresh();
    })();
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200/80 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-daewoo">EPC Design Share</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              PPT·PDF 디자인 갤러리
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              팀이 공유한 PDF 첫 장을 미리보고, 상세에서 전체 슬라이드와 YAML 규칙을 확인하세요. 데이터는 이
              브라우저의 IndexedDB에만 저장됩니다.
            </p>
          </div>
          <BackupToolbar designs={designs} onImported={() => void refresh()} />
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-900">디자인 갤러리</h2>
          <button
            type="button"
            onClick={() => setUploadOpen((v) => !v)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-daewoo px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-daewoo/25 transition hover:bg-daewoo-dark"
          >
            <Share2 className="h-4 w-4" aria-hidden />
            나만의 스타일 공유하기
          </button>
        </div>

        <UploadSection
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onSaved={handleSaved}
        />

        {!ready && (
          <p className="mt-10 text-center text-sm text-slate-500">갤러리를 준비하는 중…</p>
        )}
        {seedWarning && (
          <div
            className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            role="status"
          >
            {seedWarning} 네트워크를 확인하거나 JSON 복구로 데이터를 넣을 수 있습니다.
          </div>
        )}
        {loadError && (
          <div
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
            role="alert"
          >
            {loadError} (시크릿 모드에서는 IndexedDB가 제한될 수 있습니다.)
          </div>
        )}
        {ready && !loadError && (
          <div className="mt-8">
            <GalleryGrid
              designs={designs}
              canDelete={isAdmin}
              onOpen={handleOpen}
              onDelete={handleDelete}
            />
          </div>
        )}
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        Deep Blue 포인트 #004B91 · 로컬 전용 저장 · Vite + React
      </footer>

      <AnimatePresence>
        {modalDesign && (
          <DesignModal key={modalDesign.id} design={modalDesign} onClose={() => setModalDesign(null)} />
        )}
      </AnimatePresence>

      <AdminModePanel isAdmin={isAdmin} onAdminChange={setIsAdmin} />
    </div>
  );
}
