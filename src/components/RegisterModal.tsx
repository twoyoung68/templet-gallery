import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Upload, FileText, CheckCircle2, Loader2 } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export function RegisterModal({ onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [yamlContent, setYamlContent] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return alert('제목과 PDF 파일은 필수입니다!');

    setLoading(true);
    try {
      // 1. Storage 업로드 (gallery-designs 버킷)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery-designs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. 공개 URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from('gallery-designs')
        .getPublicUrl(filePath);

      // 3. DB 기록 (카테고리는 자동으로 '공통' 입력)
      const { error: dbError } = await supabase
        .from('designs')
        .insert([
          {
            title,
            description,
            category: '공통', // 💡 팀장님 요청대로 카테고리 고정
            pdf_url: publicUrl,
            yaml_content: yamlContent,
            thumbnail_url: '', 
          },
        ]);

      if (dbError) throw dbError;

      alert('도면 등록이 성공적으로 완료되었습니다!');
      onSuccess(); // 목록 새로고침
    } catch (error: any) {
      alert('등록 중 에러가 발생했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
        
        {/* 상단 헤더 */}
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-100">
              <Upload size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-tighter">도면 입고 시스템</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* 입력 양식 */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* 제목 입력 */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Drawing Title</label>
            <input 
              required 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="도면 명칭을 입력하세요"
              className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:outline-none font-bold transition-all placeholder:text-slate-300" 
            />
          </div>

          {/* 설명 입력 */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
            <input 
              type="text" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="간략한 설명을 입력하세요 (선택)"
              className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-300" 
            />
          </div>

          {/* 파일 업로드 영역 */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PDF Document</label>
            <input 
              required 
              type="file" 
              accept=".pdf" 
              onChange={(e) => setFile(e.target.files?.[0] || null)} 
              className="hidden" 
              id="pdf-upload-final" 
            />
            <label 
              htmlFor="pdf-upload-final" 
              className="flex items-center justify-center gap-3 w-full py-6 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              {file ? (
                <div className="flex items-center gap-2 text-blue-600 font-bold">
                  <CheckCircle2 size={20} />
                  <span className="text-sm truncate max-w-[250px]">{file.name}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <FileText size={28} className="mb-1" />
                  <span className="text-xs font-bold uppercase tracking-tighter">Click to select PDF</span>
                </div>
              )}
            </label>
          </div>

          {/* YAML 입력 영역 */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">YAML Config</label>
            <textarea 
              rows={3} 
              value={yamlContent} 
              onChange={(e) => setYamlContent(e.target.value)} 
              placeholder="# YAML 설정을 여기에 입력하세요"
              className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:outline-none font-mono text-[13px] transition-all placeholder:text-slate-300" 
            />
          </div>

          {/* 하단 버튼 제어 */}
          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-4 rounded-2xl font-bold text-slate-400 bg-slate-100 hover:bg-slate-200 transition-all"
            >
              취소
            </button>
            <button 
              disabled={loading} 
              type="submit" 
              className="flex-[2] flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 disabled:bg-slate-300 transition-all active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
              {loading ? '등록 중...' : '도면 등록 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}