// src/components/BackupToolbar.tsx
import { StoredDesign } from '../types';
import { exportToJSON, importFromJSON } from '../lib/backup';
import { Download, Upload, ShieldCheck } from 'lucide-react';

interface Props {
  designs: StoredDesign[];
  onImport: (designs: StoredDesign[]) => void;
}

export function BackupToolbar({ designs, onImport }: Props) {
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imported = await importFromJSON(file);
        onImport(imported);
        alert('백업 데이터를 성공적으로 가져왔습니다.');
      } catch (err) {
        alert('파일 형식이 잘못되었습니다.');
      }
    }
  };

  return (
    <div className="flex gap-4 p-4 bg-blue-50 rounded-2xl mb-8 items-center border border-blue-100">
      <div className="flex-1 flex items-center gap-2 text-blue-700 font-bold">
        <ShieldCheck size={20} />
        <span className="text-sm italic">데이터 백업 및 복구 도구</span>
      </div>
      
      <button 
        onClick={() => exportToJSON(designs)}
        className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-blue-600 hover:text-white transition-all"
      >
        <Download size={16} /> 백업 내보내기 (JSON)
      </button>

      <label className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm cursor-pointer hover:bg-blue-700 transition-all">
        <Upload size={16} /> 백업 불러오기
        <input type="file" accept=".json" onChange={handleImport} className="hidden" />
      </label>
    </div>
  );
}