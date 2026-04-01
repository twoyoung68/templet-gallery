import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Share2 } from 'lucide-react';
import { AdminModePanel } from './components/AdminModePanel';
import { BackupToolbar } from './components/BackupToolbar';
import { DesignModal } from './components/DesignModal';
import { GalleryGrid } from './components/GalleryGrid';
import { UploadSection } from './components/UploadSection';
import { readAdminSession } from './lib/adminSession';
import { deleteDesignRemote, fetchDesignsRemote, uploadDesignRemote } from './lib/designsRemote';
import { deleteDesign, getAllDesigns, saveDesign } from './lib/db';
import { seedSampleDesignsIfEmpty } from './lib/seed';
import { isSupabaseConfigured } from './lib/supabaseClient';
import type { StoredDesign } from './types';

export default function App() {
  const [designs, setDesigns] = useState<StoredDesign[]>([]);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [seedWarning, setSeedWarning] = useState<string | null>(null);
  const [modalDesign, setModalDesign] = useState<StoredDesign | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => readAdminSession());
  const remote = isSupabaseConfigured();

  const refresh = useCallback(async () => {
    try {
      if (remote) {
        setDesigns(await fetchDesignsRemote());
      } else {
        setDesigns(await getAllDesigns());
      }
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : '데이터를 불러오지 못했습니다.');
    }
  }, [remote]);

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
      try {
        if (remote) {
          await deleteDesignRemote(d);
        } else {
          await deleteDesign(d.id);
        }
        await refresh();
        if (modalDesign?.id === d.id) setModalDesign(null);
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : '삭제에 실패했습니다.');
      }
    })();
  };

  const handleSaved = (design: StoredDesign) => {
    void (async () => {
      try {
        if (remote) {
          if (!design.pdfBlob) throw new Error('PDF 데이터가 없습니다.');
          await uploadDesignRemote({
            id: design.id,
            title: design.title,
            author: design.author,
            yaml: design.yaml,
            thumbnailDataUrl: design.thumbnailDataUrl,
            pdfBlob: design.pdfBlob,
            isSample: design.isSample,
          });
        } else {
          await saveDesign(design);
        }
        await refresh();
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : '저장에 실패했습니다.');
      }
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
              {remote
                ? 'Supabase에 연결되어 있습니다. 누구나 브라우저에서 같은 갤러리를 보고, 템플릿을 공유할 수 있습니다.'
                : '팀이 공유한 PDF 첫 장을 미리보고, 상세에서 전체 슬라이드와 YAML 규칙을 확인하세요. (.env에 Supabase를 넣으면 전역 공유 모드로 전환됩니다.)'}
            </p>
          </div>
          <BackupToolbar designs={designs} onImported={() => void refresh()} />
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {!remote && (
          <div
            className="mb-6 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-900"
            role="status"
          >
            <strong className="font-semibold">로컬 모드</strong> — 데이터는 이 브라우저 IndexedDB에만
            저장됩니다. 전역 공유를 원하면 프로젝트 루트에{' '}
            <code className="rounded bg-white/80 px-1 text-xs">.env</code> 파일에{' '}
            <code className="rounded bg-white/80 px-1 text-xs">VITE_SUPABASE_URL</code>,{' '}
            <code className="rounded bg-white/80 px-1 text-xs">VITE_SUPABASE_ANON_KEY</code> 를 설정한 뒤{' '}
            <code className="rounded bg-white/80 px-1 text-xs">supabase/schema.sql</code> 과 Storage 버킷을 준비하세요.
          </div>
        )}

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
            {seedWarning}{' '}
            {remote
              ? 'Supabase Storage 버킷·RLS SQL이 올바른지 확인하세요.'
              : '네트워크를 확인하거나 JSON 복구로 데이터를 넣을 수 있습니다.'}
          </div>
        )}
        {loadError && (
          <div
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
            role="alert"
          >
            {loadError}
            {!remote && ' (시크릿 모드에서는 IndexedDB가 제한될 수 있습니다.)'}
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
        Deep Blue 포인트 #004B91 · {remote ? 'Supabase 공유 저장소' : '로컬 저장'} · Vite + React
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
