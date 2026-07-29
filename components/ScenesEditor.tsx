"use client";

import Image from "next/image";
import { RefreshCw, ImageIcon } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import type { Scene } from "@/lib/types";

export function ScenesEditor({
  scenes,
  onRegenerateImage,
  transitionDuration,
  onTransitionChange,
}: {
  scenes: Scene[];
  onRegenerateImage: (sceneId: string) => void;
  transitionDuration: number;
  onTransitionChange: (v: number) => void;
}) {
  return (
    <Card>
      <CardTitle className="flex items-center gap-2">
        <ImageIcon className="h-4 w-4 text-primary-light" /> Cenas ({scenes.length})
      </CardTitle>

      <div className="mb-5">
        <div className="mb-2 flex justify-between text-xs text-muted">
          <span>Duração da transição entre imagens</span>
          <span>{transitionDuration.toFixed(1)}s</span>
        </div>
        <Slider
          min={0.2}
          max={2}
          step={0.1}
          value={[transitionDuration]}
          onValueChange={([v]) => onTransitionChange(v)}
        />
      </div>

      <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto pr-1">
        {scenes.map((scene, i) => (
          <div key={scene.id} className="flex gap-3 rounded-xl border border-border bg-surface2 p-2">
            <div className="relative h-24 w-14 shrink-0 overflow-hidden rounded-lg bg-black/40">
              {scene.imageUrl && (
                <Image src={scene.imageUrl} alt={`Cena ${i + 1}`} fill className="object-cover" unoptimized />
              )}
              <button
                onClick={() => onRegenerateImage(scene.id)}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100"
                title="Gerar outra imagem para esta cena"
              >
                <RefreshCw className="h-4 w-4 text-white" />
              </button>
            </div>
            <div className="flex-1">
              <p className="mb-1 text-xs font-medium text-primary-light">Cena {i + 1} · {scene.duration.toFixed(1)}s</p>
              <p className="line-clamp-3 text-xs text-muted">{scene.text}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
