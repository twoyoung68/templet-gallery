// src/lib/backup.ts
import { StoredDesign, DesignExportPayload } from '../types';

export const exportToJSON = (designs: StoredDesign[]) => {
  const payload: DesignExportPayload = {
    designs,
    exportDate: new Date().toISOString(),
  };
  const dataStr = JSON.stringify(payload, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  const link = document.createElement('a');
  link.setAttribute('href', dataUri);
  link.setAttribute('download', `backup-${new Date().toISOString().split('T')[0]}.json`);
  link.click();
};

export const importFromJSON = async (file: File): Promise<StoredDesign[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const payload = JSON.parse(e.target?.result as string);
        resolve(payload.designs || []);
      } catch (err) { reject(err); }
    };
    reader.readAsText(file);
  });
};