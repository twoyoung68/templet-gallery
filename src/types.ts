export type StoredDesign = {
  id: string;
  title: string;
  author: string;
  yaml: string;
  pdfBlob: Blob;
  thumbnailDataUrl: string;
  createdAt: number;
  /** 시드된 샘플 여부 (선택) */
  isSample?: boolean;
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
