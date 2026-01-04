export enum AnalysisMode {
  AUTO = 'auto',
  MASTERPIECE = 'masterpiece',
  CRITIQUE = 'critique'
}

export interface TechnicalSettings {
  iso: string;
  aperture: string;
  shutter_speed: string;
}

export interface Ratings {
  composition: number;
  lighting: number;
  creativity: number;
}

export interface CompositionGuide {
  type: 'line' | 'rect';
  x1?: number; // 0-100 percentage
  y1?: number;
  x2?: number;
  y2?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  label?: string;
  color?: string; // hex
}

export interface AnalysisData {
  technical_settings?: TechnicalSettings;
  ratings?: Ratings;
  keywords?: string[];
  color_palette?: string[];
  composition_guides?: CompositionGuide[];
  analysis_target_mode?: 'masterpiece' | 'critique';
}

export interface AnalysisState {
  status: 'idle' | 'analyzing' | 'generating_image' | 'complete' | 'error';
  originalImage: string | null;
  analysisText: string;
  analysisData?: AnalysisData;
  improvedImage: string | null;
  error: string | null;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  originalImage: string;
  analysisText: string;
  improvedImage: string | null;
  mode: AnalysisMode;
  analysisData?: AnalysisData;
}
