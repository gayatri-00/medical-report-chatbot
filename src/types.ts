export interface DocumentChunk {
  chunkId: number;
  pageNumber: number;
  text: string;
  charCount: number;
}

export interface MedicalReport {
  id: string;
  userId: string;
  filename: string;
  fileSizeKb: number;
  uploadedAt: number;
  totalPages: number;
  totalChunks: number;
  wordCount: number;
  detectedSections: string[];
  fullText: string;
  chunks: DocumentChunk[];
  summaryText?: string;
  isSample?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sourcePages?: number[];
  citations?: string[];
  retrievedChunks?: DocumentChunk[];
  timestamp: number;
}

export interface UserSession {
  userId: string;
  email: string;
  isDemo?: boolean;
}

export type TabType = "home" | "dashboard" | "upload" | "summary" | "chat" | "reports" | "code";
