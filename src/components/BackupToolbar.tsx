import { useRef, useState } from 'react';
import { Download, Upload, Loader2 } from 'lucide-react';
import type { StoredDesign } from '../types';
import { downloadJsonFile, exportDesignsJson, importDesignsFromJsonText } from '../lib/backup';

type Props = {
  designs: StoredDesign[];
  onImported: () => void;
};

export function BackupToolbar({ designs, onImported }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = async () => {
    setMessage(null);
    try {
      const json = await exportDesignsJson(designs);
      const name = `epc-design-backup-${new Date().toISOString().slice(0, 10)}.json`;
      downloadJsonFile(name, json);
      setMessage('백업 파일을 저장했습니다.');
      window.setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage('보내기에 실패했습니다.');
    }
  };

  const handleImportFile = async (f: File) => {
    setBusy(true);
    setMessage(null);
    try {
      const text = await f.text();
      const n = await importDesignsFromJsonText(text);
      setMessage(`${n}개 항목을 복구했습니다.`);
      onImported();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '가져오기에 실패했습니다.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleExport}
          disabled={designs.length === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-daewoo hover:text-daewoo disabled:opacity-50"
        >
          <Download className="h-4 w-4" aria-hidden />
          JSON 백업
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-daewoo hover:text-daewoo disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Upload className="h-4 w-4" aria-hidden />}
          JSON 복구
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleImportFile(f);
          }}
        />
      </div>
      {message && <p className="text-xs text-slate-600 sm:ml-2">{message}</p>}
    </div>
  );
}
