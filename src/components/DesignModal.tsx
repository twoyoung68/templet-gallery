import { useState } from 'react';
import { StoredDesign } from '../types';
import { X, FileText, Copy, Check, Trash2, ExternalLink, ShieldCheck } from 'lucide-react';

interface Props {
  design: StoredDesign;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export function DesignModal({ design, onClose, onDelete }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (design.yaml_content) {
      navigator.clipboard.writeText(design.yaml_content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[95vw] h-[94vh] rounded-[3rem] shadow-2xl flex overflow-hidden relative">
        <button onClick={onClose} className="absolute top-6 right-6 z-30 p-3 bg-white hover:bg-slate-100 rounded-2xl shadow-xl transition-all border border-slate-100 text-slate-400">
          <X size={24} />
        </button>

        {/* 왼쪽: PDF 뷰어 영역 */}
        <div className="flex-[3] bg-slate-50 border-r border-slate-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-3">
              <FileText className="text-[#004c97]" />
              <h2 className="text-xl font-black text-slate-800 tracking-tighter">{design.title}</h2>
            </div>
            <a href={design.pdf_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all">
              <ExternalLink size={14} /> 원본 PDF 열기
            </a>
          </div>
          <iframe src={`${design.pdf_url}#view=FitH`} className="w-full h-full rounded-3xl border-0 shadow-inner bg-white" title="PDF Viewer" />
        </div>

        {/* 오른쪽: 정보 및 YAML 영역 */}
        <div className="flex-1 p-10 overflow-y-auto bg-white flex flex-col justify-between">
          <div className="space-y-10">
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Description</h4>
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-sm text-slate-600 leading-relaxed font-medium">
                {design.description || '상세 정보가 등록되지 않았습니다.'}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">YAML Config</h4>
                {/* 📋 YAML 원클릭 복사 버튼 */}
                <button 
                  onClick={handleCopy}
                  className={`flex items-center gap-2 text-[11px] font-black px-4 py-2 rounded-xl transition-all shadow-sm ${copied ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-[#004c97] text-white shadow-blue-100 hover:bg-[#00356b]'}`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'COPIED!' : 'YAML COPY'}
                </button>
              </div>
              <pre className="bg-slate-900 text-emerald-400 p-8 rounded-[2.5rem] text-[13px] font-mono shadow-2xl border border-slate-800 leading-relaxed overflow-x-auto">
                {design.yaml_content || '# No Data Available'}
              </pre>
            </div>
          </div>

          {/* 🗑️ 하단 삭제 권한 안내 및 버튼 */}
          <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-between">
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={12} /> Data Management Policy
            </span>
            <button 
              onClick={() => onDelete(design.id)}
              className="flex items-center gap-2 text-red-300 hover:text-red-500 transition-colors text-[10px] font-black uppercase tracking-tighter"
            >
              <Trash2 size={14} /> Delete Entry (Admin Only)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}