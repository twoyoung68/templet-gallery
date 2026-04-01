import { LayoutGrid } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { StoredDesign } from '../types';
import { DesignCard } from './DesignCard';

type Props = {
  designs: StoredDesign[];
  onOpen: (d: StoredDesign) => void;
  onDelete: (d: StoredDesign) => void;
  canDelete?: boolean;
};

export function GalleryGrid({ designs, onOpen, onDelete, canDelete = false }: Props) {
  const sorted = [...designs].sort((a, b) => b.createdAt - a.createdAt);

  if (sorted.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center"
      >
        <LayoutGrid className="mb-4 h-12 w-12 text-slate-300" aria-hidden />
        <p className="text-lg font-medium text-slate-700">아직 공유된 디자인이 없습니다.</p>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          상단에서 PDF와 YAML을 올리거나, JSON 백업을 가져와 갤러리를 채워 보세요.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5 lg:gap-4">
      <AnimatePresence mode="popLayout">
        {sorted.map((d, i) => (
          <DesignCard
            key={d.id}
            design={d}
            index={i}
            canDelete={canDelete}
            onOpen={() => onOpen(d)}
            onDelete={() => onDelete(d)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
