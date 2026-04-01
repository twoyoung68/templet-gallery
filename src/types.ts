export type StoredDesign = {
  id: string;
  title: string;
  author: string;
  yaml: string;
  thumbnailDataUrl: string;
  createdAt: number;
  /** 시드된 샘플 여부 (선택) */
  isSample?: boolean;
  /** 로컬(IndexedDB) 또는 방금 업로드한 직후 */
  pdfBlob?: Blob;
  /** Supabase Storage 공개 URL */
  pdfPublicUrl?: string;
  /** Storage 객체 경로 (삭제 시) */
  pdfStoragePath?: string;
};

export type DesignExportPayload = {
  version: 1;
  exportedAt: string;
  designs: Array<{
    id: string;
    title: string;
    author: string;
    yaml: string;
    thumbnailDataUrl: string;
    createdAt: number;
    isSample?: boolean;
    pdfBase64: string;
  }>;
};
