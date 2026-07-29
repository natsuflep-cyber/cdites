import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import type { Scene, BackgroundMusic } from "./types";

const CORE_VERSION = "0.12.10";
const CORE_BASE = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd`;

let ffmpegInstance: FFmpeg | null = null;

/** Carrega o núcleo do ffmpeg (wasm) sob demanda, direto do navegador. */
export async function getFFmpeg(onLog?: (msg: string) => void): Promise<FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance;

  const ffmpeg = new FFmpeg();
  if (onLog) {
    ffmpeg.on("log", ({ message }) => onLog(message));
  }

  await ffmpeg.load({
    coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, "application/wasm"),
  });

  ffmpegInstance = ffmpeg;
  return ffmpeg;
}

export interface RenderOptions {
  scenes: Scene[];
  narrationAudioUrl: string;
  backgroundMusic: BackgroundMusic;
  transitionDuration: number;
  fps?: number;
  width?: number;
  height?: number;
  onProgress?: (ratio: number, stage: string) => void;
}

/**
 * Renderiza o vídeo final 100% no navegador (sem passar por serverless da Vercel,
 * portanto sem limite de tempo de execução de função).
 *
 * Estratégia:
 *  1. Baixa cada imagem de cena e a narração já sintetizada.
 *  2. Monta um "concat" de imagens com crossfade (xfade) na duração de cada cena.
 *  3. Mixa a narração com a música de fundo (se houver) respeitando o volume.
 *  4. Exporta um MP4 H.264 1080x1920 pronto para download.
 */
export async function renderVideo(opts: RenderOptions): Promise<Blob> {
  const {
    scenes,
    narrationAudioUrl,
    backgroundMusic,
    transitionDuration,
    fps = 30,
    width = 1080,
    height = 1920,
    onProgress,
  } = opts;

  const ffmpeg = await getFFmpeg();

  onProgress?.(0.05, "Carregando imagens das cenas");
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    if (!scene.imageUrl) continue;
    const data = await fetchFile(scene.imageUrl);
    await ffmpeg.writeFile(`img${i}.png`, data);
  }

  onProgress?.(0.2, "Carregando narração");
  const narrationData = await fetchFile(narrationAudioUrl);
  await ffmpeg.writeFile("narration.mp3", narrationData);

  if (backgroundMusic.url) {
    onProgress?.(0.25, "Carregando música de fundo");
    const musicData = await fetchFile(backgroundMusic.url);
    await ffmpeg.writeFile("music.mp3", musicData);
  }

  // Constrói o filtro de vídeo: cada imagem vira um clipe estático com a duração
  // da cena, concatenados com crossfade (xfade) na duração escolhida pelo usuário.
  const inputs: string[] = [];
  const filterParts: string[] = [];
  scenes.forEach((scene, i) => {
    inputs.push("-loop", "1", "-t", scene.duration.toFixed(2), "-i", `img${i}.png`);
    filterParts.push(
      `[${i}:v]scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},setsar=1,fps=${fps}[v${i}]`
    );
  });

  let chain = "[v0]";
  let cumulative = scenes[0]?.duration ?? 0;
  for (let i = 1; i < scenes.length; i++) {
    const offset = Math.max(cumulative - transitionDuration, 0);
    filterParts.push(`${chain}[v${i}]xfade=transition=fade:duration=${transitionDuration}:offset=${offset.toFixed(2)}[vx${i}]`);
    chain = `[vx${i}]`;
    cumulative += scenes[i].duration - transitionDuration;
  }
  filterParts.push(`${chain}format=yuv420p[vout]`);

  // Áudio: narração + música de fundo (opcional) com ducking simples via volume fixo.
  let audioMap = "3:a";
  if (backgroundMusic.url) {
    filterParts.push(
      `[3:a]volume=1.0[narr]`,
      `[4:a]volume=${backgroundMusic.volume}[music]`,
      `[narr][music]amix=inputs=2:duration=first:dropout_transition=2[aout]`
    );
    audioMap = "aout";
  }

  const args = [
    ...inputs,
    "-i",
    "narration.mp3",
    ...(backgroundMusic.url ? ["-i", "music.mp3"] : []),
    "-filter_complex",
    filterParts.join(";"),
    "-map",
    "[vout]",
    "-map",
    `[${audioMap}]`,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "20",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-shortest",
    "output.mp4",
  ];

  onProgress?.(0.35, "Renderizando vídeo (isso pode levar alguns minutos)");
  ffmpeg.on("progress", ({ progress }) => {
    onProgress?.(0.35 + Math.min(progress, 1) * 0.6, "Renderizando vídeo");
  });

  await ffmpeg.exec(args);

  onProgress?.(0.97, "Finalizando arquivo");
  const data = await ffmpeg.readFile("output.mp4");
  onProgress?.(1, "Concluído");

  return new Blob([new Uint8Array(data as Uint8Array)], { type: "video/mp4" });
}
