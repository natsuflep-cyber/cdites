export type VoiceId =
  | "pt-BR-AntonioNeural"
  | "pt-BR-FranciscaNeural"
  | "pt-BR-BrendaNeural"
  | "pt-BR-DonatoNeural"
  | "pt-BR-ElzaNeural"
  | "pt-BR-FabioNeural"
  | "pt-BR-GiovannaNeural"
  | "pt-BR-HumbertoNeural"
  | "pt-BR-JulioNeural"
  | "pt-BR-LeilaNeural"
  | "pt-BR-LeticiaNeural"
  | "pt-BR-ManuelaNeural"
  | "pt-BR-NicolauNeural"
  | "pt-BR-ValerioNeural"
  | "pt-BR-YaraNeural";

export interface VoiceOption {
  id: VoiceId;
  label: string;
  gender: "Masculina" | "Feminina";
}

export const VOICE_OPTIONS: VoiceOption[] = [
  { id: "pt-BR-AntonioNeural", label: "Antônio", gender: "Masculina" },
  { id: "pt-BR-FranciscaNeural", label: "Francisca", gender: "Feminina" },
  { id: "pt-BR-BrendaNeural", label: "Brenda", gender: "Feminina" },
  { id: "pt-BR-DonatoNeural", label: "Donato", gender: "Masculina" },
  { id: "pt-BR-ElzaNeural", label: "Elza", gender: "Feminina" },
  { id: "pt-BR-FabioNeural", label: "Fábio", gender: "Masculina" },
  { id: "pt-BR-GiovannaNeural", label: "Giovanna", gender: "Feminina" },
  { id: "pt-BR-HumbertoNeural", label: "Humberto", gender: "Masculina" },
  { id: "pt-BR-JulioNeural", label: "Júlio", gender: "Masculina" },
  { id: "pt-BR-LeilaNeural", label: "Leila", gender: "Feminina" },
  { id: "pt-BR-LeticiaNeural", label: "Letícia", gender: "Feminina" },
  { id: "pt-BR-ManuelaNeural", label: "Manuela", gender: "Feminina" },
  { id: "pt-BR-NicolauNeural", label: "Nicolau", gender: "Masculina" },
  { id: "pt-BR-ValerioNeural", label: "Valério", gender: "Masculina" },
  { id: "pt-BR-YaraNeural", label: "Yara", gender: "Feminina" },
];

export interface Scene {
  id: string;
  text: string;
  imageUrl: string | null;
  imagePrompt: string;
  /** duração estimada em segundos, calculada a partir do áudio da cena */
  duration: number;
  /** offset de início em segundos dentro do vídeo final */
  startTime: number;
}

export interface CaptionStyle {
  fontFamily: "Montserrat" | "Poppins" | "Inter" | "Anton";
  fontSize: number; // px, relativo a um canvas de 1080px de largura
  color: string; // hex
  highlightColor: string; // cor da palavra ativa
  position: "top" | "middle" | "bottom";
  strokeEnabled: boolean;
}

export const DEFAULT_CAPTION_STYLE: CaptionStyle = {
  fontFamily: "Montserrat",
  fontSize: 64,
  color: "#FFFFFF",
  highlightColor: "#A855F7",
  position: "bottom",
  strokeEnabled: true,
};

export interface BackgroundMusic {
  url: string | null;
  fileName: string | null;
  volume: number; // 0 a 1
}

export interface VoiceSettings {
  voice: VoiceId;
  rate: number; // -50 a +50 (%)
  pitch: number; // -50 a +50 (Hz relativo)
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  voice: "pt-BR-AntonioNeural",
  rate: 0,
  pitch: 0,
};

export interface ProjectState {
  scenes: Scene[];
  fullText: string;
  narrationAudioUrl: string | null;
  narrationDuration: number;
  voiceSettings: VoiceSettings;
  captionStyle: CaptionStyle;
  transitionDuration: number; // segundos
  backgroundMusic: BackgroundMusic;
}

export interface WordTimestamp {
  word: string;
  start: number; // segundos
  end: number; // segundos
}
