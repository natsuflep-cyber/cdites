"use client";

import { Type } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CaptionStyle } from "@/lib/types";

const FONTS: CaptionStyle["fontFamily"][] = ["Montserrat", "Poppins", "Inter", "Anton"];
const POSITIONS: { value: CaptionStyle["position"]; label: string }[] = [
  { value: "top", label: "Topo" },
  { value: "middle", label: "Meio" },
  { value: "bottom", label: "Rodapé" },
];

export function CaptionStyleControls({
  style,
  onChange,
}: {
  style: CaptionStyle;
  onChange: (s: CaptionStyle) => void;
}) {
  return (
    <Card>
      <CardTitle className="flex items-center gap-2">
        <Type className="h-4 w-4 text-primary-light" /> Legendas dinâmicas
      </CardTitle>

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-2 block text-xs text-muted">Fonte</label>
            <Select value={style.fontFamily} onValueChange={(v) => onChange({ ...style, fontFamily: v as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONTS.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-xs text-muted">Posição</label>
            <Select value={style.position} onValueChange={(v) => onChange({ ...style, position: v as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POSITIONS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <div className="mb-2 flex justify-between text-xs text-muted">
            <span>Tamanho</span>
            <span>{style.fontSize}px</span>
          </div>
          <Slider
            min={32}
            max={96}
            step={2}
            value={[style.fontSize]}
            onValueChange={([fontSize]) => onChange({ ...style, fontSize })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-2 block text-xs text-muted">Cor do texto</label>
            <input
              type="color"
              value={style.color}
              onChange={(e) => onChange({ ...style, color: e.target.value })}
              className="h-10 w-full cursor-pointer rounded-lg border border-border bg-surface2"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs text-muted">Cor de destaque</label>
            <input
              type="color"
              value={style.highlightColor}
              onChange={(e) => onChange({ ...style, highlightColor: e.target.value })}
              className="h-10 w-full cursor-pointer rounded-lg border border-border bg-surface2"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
