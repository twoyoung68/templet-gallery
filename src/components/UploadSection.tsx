// src/components/UploadSection.tsx (창고 이름 수정본)
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Upload } from 'lucide-react';

export function UploadSection({ onComplete }: { onComplete: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: '', category: '공통', description: '', yaml: '' });
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('PDF를 선택하세요.');
    setLoading(true);

    try {
      // 💡 창고 이름을 'gallery-designs'로 변경했습니다.
      const BUCKET_NAME = 'gallery-designs'; 
      const fileName = `${Math.random()}.pdf`;
      
      const { error: fileError } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file);
      if (fileError) throw fileError;

      const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('designs').insert([{
        title: formData.title,
        category: formData.category,
        description: formData.description,
        pdf_url: publicUrl,
        yaml_content: formData.yaml,
        thumbnail_url: 'https://via.placeholder.com/400x300?text=PDF+Template'
      }]);

      if (dbError) throw dbError;
      alert('새 도면이 성공적으로 등록되었습니다!');
      onComplete();
    } catch (err: any) { 
      alert('등록 실패: ' + err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <form onSubmit={handleUpload} className="bg-white p-6 rounded-2xl border-2 border-blue-50 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 shadow-sm">
      <div className="space-y-3">
        <h4 className="font-bold text-slate-700 flex items-center gap-2"><Upload size={18}/> 도면 정보 및 파일</h4>
        <input type="text" placeholder="도면 명칭" required className="w-full p-2.5 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setFormData({...formData, title: e.target.value})} />
        <textarea placeholder="도면 상세 설명" className="w-full p-2.5 bg-slate-50 rounded-lg h-24 outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setFormData({...formData, description: e.target.value})} />
        <input type="file" accept=".pdf" className="text-xs text-slate-500" onChange={e => setFile(e.target.files?.[0] || null)} />
      </div>
      <div className="space-y-3 flex flex-col">
        <h4 className="font-bold text-slate-700">YAML 데이터 입력</h4>
        <textarea placeholder="YAML 코드를 여기에 붙여넣으세요" className="flex-1 p-3 bg-slate-900 text-green-400 font-mono text-[10px] rounded-xl outline-none" onChange={e => setFormData({...formData, yaml: e.target.value})} />
        <button disabled={loading} className="bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">{loading ? '서버 전송 중...' : '도면 시스템 등록'}</button>
      </div>
    </form>
  );
}