export type DictationStatus = 'idle' | 'listening' | 'paused' | 'processing' | 'error';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface TranscriptionNote {
  id: string;
  title: string;
  rawText: string;
  enhancedText?: string;
  createdAt: number;
  wordCount: number;
  characterCount: number;
  category: 'Diktat' | 'Ideja' | 'Sastanak' | 'Podsetnik' | 'Lično';
  tags: string[];
  language: string;
  audioDurationSeconds?: number;
}

export type AiActionType = 'cleanup' | 'summarize' | 'structure' | 'translate' | 'custom';

export interface AiEnhanceRequest {
  text: string;
  action: AiActionType;
  targetLanguage?: string;
  customPrompt?: string;
}

export interface AiEnhanceResponse {
  result: string;
  error?: string;
}
