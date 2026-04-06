// src/types.ts

// 1. 수파베이스 장부(DB)와 100% 일치하는 데이터 구조
export interface StoredDesign {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail_url: string; // 💡 DB의 thumbnail_url과 일치
  pdf_url: string;       // 💡 DB의 pdf_url과 일치
  yaml_content: string;  // 💡 DB의 yaml_content와 일치
  created_at: string;
}

// 2. 백업(JSON 내보내기/가져오기)을 위한 구조
export interface DesignExportPayload {
  designs: StoredDesign[];
  exportDate: string;
}