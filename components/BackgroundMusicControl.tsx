"use client";

import { Music, X } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import type { BackgroundMusic } from "@/lib/types";

export function BackgroundMusicControl({
  music,
  onChange,
}: {
  music: BackgroundMusic;
  onChange: (m: BackgroundMusic) => void;
}) {
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange({ ...music, url, fileName: file.name });
  }

  return (
    <Card>
      <CardTitle className="flex items-center gap-2">
        <Music className="h-4 w-4 text-primary-light" /> Música de fundo
      </CardTitle>

      {music.url ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-lg bg-surface2 px-3 py-2 text-sm">
            <span className="truncate text-muted">{music.fileName}</span>
            <button onClick={() => onChange({ url: null, fileName: null, volume: music.volume })}>
              <X className="h-4 w-4 text-muted hover:text-white" />
            </button>
          </div>
          <div>
            <div className="mb-2 flex justify-between text-xs text-muted">
              <span>Volume da música</span>
              <span>{Math.round(music.volume * 100)}%</span>
            </div>
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={[music.volume]}
              onValueChange={([volume]) => onChange({ ...music, volume })}
            />
          </div>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-6 text-sm text-muted hover:border-primary-light/60">
          Clique para enviar um MP3
          <input type="file" accept="audio/*" className="hidden" onChange={handleFile} />
        </label>
      )}
    </Card>
  );
}
