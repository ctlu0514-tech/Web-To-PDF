export interface GenerationState {
  status: 'idle' | 'analyzing' | 'generating' | 'completed' | 'error';
  message?: string;
  error?: string;
}

export interface GeneratedResult {
  script: string;
  instructions: string;
  explanation: string;
}

export interface ScreenshotData {
  file: File;
  previewUrl: string;
  base64: string;
}
