// src/components/GalleryGrid.tsx
import { StoredDesign } from '../types';
import { DesignCard } from './DesignCard';

interface Props {
  designs: StoredDesign[];
  onSelect: (index: number) => void;
}

export function GalleryGrid({ designs, onSelect }: Props) {
  if (designs.length === 0) {
    return <div className="text-center py-20 text-slate-400">등록된 도면이 없습니다.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {designs.map((design, index) => (
        <DesignCard 
          key={design.id} 
          design={design} 
          onClick={() => onSelect(index)} 
        />
      ))}
    </div>
  );
}