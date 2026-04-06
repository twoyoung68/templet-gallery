import { StoredDesign } from '../types';
import { Calendar, ArrowUpRight, Loader2, MessageSquareText } from 'lucide-react';
import { useState } from 'react';

interface Props {
  design: StoredDesign;
  onClick: () => void;
}

export function DesignCard({ design, onClick }: Props) {
  const [isLoaded, setIsLoaded] = useState(false);

  // 구글 뷰어 (속도 최적화 모드)
  const previewUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(design.pdf_url)}&embedded=true&chrome=false`;

  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:border-[#004c97] hover:shadow-xl transition-all duration-300 flex flex-col h-full relative"
    >
      {/* 🖼️ 미리보기 영역 (배경 화이트 고정) */}
      <div className="aspect-[4/3] bg-white relative overflow-hidden flex items-center justify-center border-b border-slate-50">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <Loader2 className="animate-spin text-slate-200" size={18} />
          </div>
        )}

        {design.pdf_url && (
          <iframe
            src={previewUrl}
            onLoad={() => setIsLoaded(true)}
            className={`w-[125%] h-[125%] border-0 pointer-events-none transition-all duration-700 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            scrolling="no"
          />
        )}
        
        {/* 대우건설 블루 호버 필터 */}
        <div className="absolute inset-0 bg-[#004c97]/0 group-hover:bg-[#004c97]/5 transition-colors" />
      </div>
      
      {/* 텍스트 정보 영역 (분위기 기입란 포함) */}
      <div className="p-3 bg-white flex flex-col flex-1">
        <div className="flex justify-between items-start mb-0.5">
          <h3 className="text-[11.5px] font-bold text-slate-800 line-clamp-1 group-hover:text-[#004c97] transition-colors">
            {design.title}
          </h3>
          <ArrowUpRight size={11} className="text-slate-300 group-hover:text-[#004c97] mt-0.5" />
        </div>

        {/* 💡 분위기(설명) 기입 공간: 폰트 사이즈를 줄여 촘촘함을 유지했습니다 */}
        <div className="flex items-start gap-1 mb-2">
          <MessageSquareText size={9} className="text-slate-300 mt-0.5 shrink-0" />
          <p className="text-[9.5px] text-slate-400 font-medium line-clamp-1 leading-tight">
            {design.description || '등록된 분위기 정보가 없습니다.'}
          </p>
        </div>
        
        <div className="mt-auto pt-2 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center text-[8.5px] text-slate-400 font-bold uppercase">
            <Calendar size={9} className="mr-1 text-[#004c97]" />
            {new Date(design.created_at).toLocaleDateString()}
          </div>
          <span className="text-[8px] font-black text-[#004c97] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
            PDF DATA
          </span>
        </div>
      </div>
    </div>
  );
}