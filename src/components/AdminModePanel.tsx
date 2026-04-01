import { useState } from 'react';
import { Lock, Shield, ShieldOff, X } from 'lucide-react';
import { getExpectedAdminPassword, writeAdminSession } from '../lib/adminSession';

type Props = {
  isAdmin: boolean;
  onAdminChange: (value: boolean) => void;
};

export function AdminModePanel({ isAdmin, onAdminChange }: Props) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password === getExpectedAdminPassword()) {
      writeAdminSession(true);
      onAdminChange(true);
      setPassword('');
      setOpen(false);
    } else {
      setError('비밀번호가 올바르지 않습니다.');
    }
  };

  const handleLogout = () => {
    writeAdminSession(false);
    onAdminChange(false);
    setOpen(false);
    setPassword('');
    setError(null);
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-1.5 sm:bottom-5 sm:right-5">
        {isAdmin && (
          <span className="rounded-full bg-daewoo/10 px-2 py-0.5 text-[10px] font-semibold text-daewoo ring-1 ring-daewoo/20">
            관리자
          </span>
        )}
        <button
          type="button"
          onClick={() => {
            if (isAdmin) {
              handleLogout();
            } else {
              setError(null);
              setOpen(true);
            }
          }}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/95 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 shadow-md shadow-slate-200/80 backdrop-blur transition hover:border-daewoo/40 hover:text-daewoo"
          title={isAdmin ? '관리자 종료 — 삭제 버튼 숨김' : '관리자 모드 — 비밀번호 입력'}
        >
          {isAdmin ? (
            <>
              <ShieldOff className="h-3.5 w-3.5 shrink-0 text-daewoo" aria-hidden />
              관리자 종료
            </>
          ) : (
            <>
              <Shield className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
              관리자 모드
            </>
          )}
        </button>
      </div>

      {open && !isAdmin && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/30 p-4 sm:items-center"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-mode-title"
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 id="admin-mode-title" className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Lock className="h-4 w-4 text-daewoo" aria-hidden />
                관리자 인증
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                aria-label="닫기"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-3 text-xs text-slate-500">
              삭제 권한이 필요하면 비밀번호를 입력하세요. 이 탭이 열려 있는 동안만 유지됩니다.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-daewoo focus:outline-none focus:ring-2 focus:ring-daewoo/20"
                placeholder="비밀번호"
              />
              {error && (
                <p className="text-xs text-red-600" role="alert">
                  {error}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-daewoo py-2 text-sm font-semibold text-white transition hover:bg-daewoo-dark"
                >
                  확인
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
