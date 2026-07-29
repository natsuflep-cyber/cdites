"use client";

import { Mic } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VOICE_OPTIONS, type VoiceSettings } from "@/lib/types";

export function VoiceSettingsPanel({
  settings,
  onChange,
}: {
  settings: VoiceSettings;
  onChange: (s: VoiceSettings) => void;
}) {
  return (
    <Card>
      <CardTitle className="flex items-center gap-2">
        <Mic className="h-4 w-4 text-primary-light" /> Narração (edge-tts)
      </CardTitle>

      <div className="flex flex-col gap-5">
        <div>
          <label className="mb-2 block text-xs text-muted">Voz neural PT-BR</label>
          <Select value={settings.voice} onValueChange={(v) => onChange({ ...settings, voice: v as any })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VOICE_OPTIONS.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.label} · {v.gender}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="mb-2 flex justify-between text-xs text-muted">
            <span>Velocidade</span>
            <span>{settings.rate > 0 ? "+" : ""}{settings.rate}%</span>
          </div>
          <Slider
            min={-50}
            max={50}
            step={5}
            value={[settings.rate]}
            onValueChange={([rate]) => onChange({ ...settings, rate })}
          />
        </div>

        <div>
          <div className="mb-2 flex justify-between text-xs text-muted">
            <span>Tom (pitch)</span>
            <span>{settings.pitch > 0 ? "+" : ""}{settings.pitch}Hz</span>
          </div>
          <Slider
            min={-50}
            max={50}
            step={5}
            value={[settings.pitch]}
            onValueChange={([pitch]) => onChange({ ...settings, pitch })}
          />
        </div>
      </div>
    </Card>
  );
}
