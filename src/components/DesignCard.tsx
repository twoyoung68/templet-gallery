import { motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import type { StoredDesign } from '../types';

type Props = {
  design: StoredDesign;
  index: number;
  onOpen: () => void;
  onDelete: () => void;
  /** 관리자 인증 후에만 삭제 아이콘 표시 */
  canDelete?: boolean;
};

export function DesignCard({ design, index, onOpen, onDelete, canDelete = false }: Props) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.24) }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm shadow-slate-200/70 transition-all hover:border-daewoo/25 hover:shadow-md hover:shadow-slate-300/40"
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-daewoo focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
          <div className="absolute inset-0 m-1.5 overflow-hidden rounded-md border border-slate-200/90 shadow-sm shadow-slate-300/40 ring-1 ring-slate-100">
            <img
              src={design.thumbnailDataUrl}
              alt=""
              className="h-full w-full object-cover object-top"
            />
          </div>
          {design.isSample && (
            <span className="absolute left-2 top-2 z-[1] inline-flex items-center gap-0.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-daewoo shadow-sm ring-1 ring-slate-200/80">
              <Sparkles className="h-2.5 w-2.5" aria-hidden />
              샘플
            </span>
          )}
        </div>
        <div className="min-h-0 px-2.5 pb-2.5 pt-2">
          <h3 className="line-clamp-2 text-[11px] font-semibold leading-snug text-slate-900 sm:text-xs group-hover:text-daewoo">
            {design.title}
          </h3>
          <p className="mt-0.5 truncate text-[10px] text-slate-500 sm:text-[11px]">{design.author}</p>
        </div>
      </button>
      {canDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute right-1 top-1 z-[2] flex h-6 w-6 items-center justify-center rounded-md bg-white/95 text-red-500 shadow-sm ring-1 ring-red-100 transition hover:bg-red-50 hover:text-red-600"
          title="삭제"
          aria-label={`${design.title} 삭제`}
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
        </button>
      )}
    </motion.article>
  );
}
