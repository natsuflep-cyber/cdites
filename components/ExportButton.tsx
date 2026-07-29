"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { renderVideo } from "@/lib/ffmpeg";
import type { ProjectState } from "@/lib/types";

export function ExportButton({ project }: { project: ProjectState }) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = project.scenes.length > 0 && project.scenes.every((s) => s.imageUrl) && !!project.narrationAudioUrl;

  async function handleExport() {
    if (!project.narrationAudioUrl) return;
    setRendering(true);
    setError(null);
    setProgress(0);
    try {
      const blob = await renderVideo({
        scenes: project.scenes,
        narrationAudioUrl: project.narrationAudioUrl,
        backgroundMusic: project.backgroundMusic,
        transitionDuration: project.transitionDuration,
        onProgress: (ratio, s) => {
          setProgress(ratio);
          setStage(s);
        },
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "video-curiosidade.mp4";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? "Erro ao renderizar o vídeo.");
    } finally {
      setRendering(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleExport} disabled={!ready || rendering} size="lg" className="w-full">
        {rendering ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
        {rendering ? "Renderizando..." : "Baixar vídeo (.mp4)"}
      </Button>

      {rendering && (
        <div className="flex flex-col gap-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-surface2">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary-light transition-all"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted">{stage}</p>
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
      {!ready && !rendering && (
        <p className="text-xs text-muted">Gere a narração e as imagens de todas as cenas para liberar o download.</p>
      )}
    </div>
  );
}
