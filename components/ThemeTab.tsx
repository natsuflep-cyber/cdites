"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const SUGESTOES = ["Espaço e Universo", "História Antiga", "Oceano Profundo", "Corpo Humano", "Mistérios Não Resolvidos"];

export function ThemeTab({ onGenerated }: { onGenerated: (text: string) => void }) {
  const [theme, setTheme] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!theme.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao gerar texto.");
      onGenerated(data.text);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="animate-slide-up">
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-muted">Sobre qual tema você quer uma curiosidade?</label>
          <div className="flex gap-2">
            <Input
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Ex: Espaço e Universo, História Antiga..."
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            />
            <Button onClick={handleGenerate} disabled={loading || !theme.trim()} className="shrink-0">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Gerar
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {SUGESTOES.map((s) => (
            <button
              key={s}
              onClick={() => setTheme(s)}
              className="rounded-full border border-border bg-surface2 px-3 py-1.5 text-xs text-muted transition-colors hover:border-primary-light/60 hover:text-white"
            >
              {s}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </Card>
  );
}
