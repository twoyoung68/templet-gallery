import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { StoredDesign } from './types';
import { DesignCard } from './components/DesignCard';
import { DesignModal } from './components/DesignModal';
import { RegisterModal } from './components/RegisterModal';
import { BackupToolbar } from './components/BackupToolbar';
import { LayoutGrid, Loader2, Lock } from 'lucide-react';

const ENTRY_PASSWORD = "1207"; // 🔓 1차 입장 비밀번호
const ADMIN_DELETE_PASSWORD = "9206833"; // 🔒 2차 삭제 관리자 비밀번호

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [designs, setDesigns] = useState<StoredDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDesign, setSelectedDesign] = useState<StoredDesign | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // 🛠️ 데이터 불러오기 (인증 성공 시 실행)
  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('designs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDesigns(data || []);
    } catch (error: any) {
      console.error("데이터 로드 실패:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ 관리자 전용 삭제 로직 (비밀번호 9206833 확인)
  const handleDelete = async (id: string) => {
    const adminPass = window.prompt("⚠️ 보안 경고: 삭제 권한이 필요합니다.\n관리자 비밀번호를 입력하세요.");
    
    if (adminPass === ADMIN_DELETE_PASSWORD) {
      try {
        const { error } = await supabase.from('designs').delete().eq('id', id);
        if (error) throw error;
        alert("✅ 해당 PDF 데이터가 영구적으로 삭제되었습니다.");
        fetchDesigns();
        setSelectedDesign(null);
      } catch (err: any) {
        alert("❌ 삭제 실패: " + err.message);
      }
    } else if (adminPass !== null) {
      alert("🚫 권한 오류: 비밀번호가 틀립니다.");
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchDesigns();
  }, [isAuthenticated]);

  // 🔐 1차 관문: 입구 보안 (1207)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#004c97] flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl w-full max-w-md text-center border-4 border-blue-50">
          <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 text-[#004c97]">
            <Lock size={48} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter">TI-PLATFORM LOGIN</h2>
          <p className="text-slate-400 text-xs mb-10 font-bold uppercase tracking-widest italic">Daewoo E&C Plant TI Team</p>
          <input 
            type="password" 
            placeholder="Passcode"
            autoFocus
            className="w-full px-6 py-5 rounded-[1.5rem] border-2 border-slate-100 focus:border-[#004c97] focus:outline-none mb-6 text-center font-black text-2xl tracking-[0.8em]"
            onChange={(e) => {
              if (e.target.value === ENTRY_PASSWORD) setIsAuthenticated(true);
            }}
          />
          <div className="text-slate-300 text-[10px] font-bold">인증 번호를 입력하면 금고가 열립니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 relative pb-24">
      {/* 🏗️ 상단 헤더: 대우건설 블루 아이덴티티 */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-[#004c97] p-2.5 rounded-2xl text-white shadow-lg shadow-blue-100">
              <LayoutGrid size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-slate-800">
                PDF → PPT 변환 <span className="text-[#004c97] italic uppercase">Design Gallery</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-0.5">Plant Technology Innovation Team</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsRegisterOpen(true)}
            className="bg-[#004c97] text-white px-8 py-3.5 rounded-full font-black shadow-xl hover:bg-[#00356b] transition-all hover:scale-105 active:scale-95"
          >
            + 신규 PDF 등록
          </button>
        </div>
      </header>

      {/* 📊 메인 갤러리 섹션 */}
      <main className="max-w-[1600px] mx-auto px-8 py-10">
        <div className="mb-8">
          <BackupToolbar designs={designs} onImport={fetchDesigns} />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="animate-spin text-[#004c97] opacity-20" size={60} />
            <p className="mt-4 text-xs font-black text-slate-300 tracking-[0.4em]">SYNCING DATABASE...</p>
          </div>
        ) : designs.length === 0 ? (
          <div className="text-center py-40 bg-slate-50 rounded-[4rem] border border-slate-100">
            <p className="text-slate-400 font-bold text-xl tracking-tight">등록된 PDF 가 없습니다.</p>
          </div>
        ) : (
          /* 💡 30% 더 작고 촘촘한 고밀도 그리드 (최대 8열) */
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-5">
            {designs.map((design) => (
              <DesignCard 
                key={design.id} 
                design={design} 
                onClick={() => setSelectedDesign(design)} 
              />
            ))}
          </div>
        )}
      </main>

      {/* 👷 하단 우측: 대우건설 소속 표기 (고정) */}
      <footer className="fixed bottom-8 right-10 pointer-events-none z-0 text-right">
        <div className="opacity-30">
          <span className="text-[9px] font-black text-slate-400 tracking-[0.4em] mb-1">DATA REPOSITORY</span>
          <h3 className="text-lg font-black text-slate-800 tracking-tighter">
            DAEWOO E&C <span className="text-[#004c97]">PLANT TI TEAM</span>
          </h3>
        </div>
      </footer>

      {/* 모달 시스템 */}
      {selectedDesign && (
        <DesignModal 
          design={selectedDesign} 
          onClose={() => setSelectedDesign(null)} 
          onDelete={handleDelete} 
        />
      )}
      {isRegisterOpen && (
        <RegisterModal 
          onClose={() => setIsRegisterOpen(false)} 
          onSuccess={() => { setIsRegisterOpen(false); fetchDesigns(); }} 
        />
      )}
    </div>
  );
}

export default App;