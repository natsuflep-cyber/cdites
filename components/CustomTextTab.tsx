"use client";

import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

const MAX_CHARS = 10000;

export function CustomTextTab({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Card className="animate-slide-up">
      <label className="mb-2 block text-sm font-medium text-muted">Cole seu próprio roteiro</label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
        placeholder="Cole aqui o texto que será narrado no vídeo..."
        rows={10}
        className="resize-none"
      />
      <div className="mt-2 flex justify-end">
        <span className={`text-xs ${value.length > MAX_CHARS * 0.95 ? "text-primary-light" : "text-muted"}`}>
          {value.length} / {MAX_CHARS}
        </span>
      </div>
    </Card>
  );
}
