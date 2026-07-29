"use client";

import { useState } from "react";
import { v4 as uuid } from "uuid";
import { Wand2, Loader2, Sparkles } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ThemeTab } from "@/components/ThemeTab";
import { CustomTextTab } from "@/components/CustomTextTab";
import { VoiceSettingsPanel } from "@/components/VoiceSettingsPanel";
import { CaptionStyleControls } from "@/components/CaptionStyleControls";
import { BackgroundMusicControl } from "@/components/BackgroundMusicControl";
import { ScenesEditor } from "@/components/ScenesEditor";
import { PreviewPlayer } from "@/components/PreviewPlayer";
import { ExportButton } from "@/components/ExportButton";
import { splitIntoScenes, sceneToImagePrompt } from "@/lib/splitText";
import {
  DEFAULT_CAPTION_STYLE,
  DEFAULT_VOICE_SETTINGS,
  type ProjectState,
  type Scene,
} from "@/lib/types";

const initialProject: ProjectState = {
  scenes: [],
  fullText: "",
  narrationAudioUrl: null,
  narrationDuration: 0,
  voiceSettings: DEFAULT_VOICE_SETTINGS,
  captionStyle: DEFAULT_CAPTION_STYLE,
  transitionDuration: 0.6,
  backgroundMusic: { url: null, fileName: null, volume: 0.25 },
};

export function StudioApp() {
  const [customText, setCustomText] = useState("");
  const [project, setProject] = useState<ProjectState>(initialProject);
  const [building, setBuilding] = useState(false);
  const [buildStage, setBuildStage] = useState("");
  const [error, setError] = useState<string | null>(null);

  function patchProject(patch: Partial<ProjectState>) {
    setProject((p) => ({ ...p, ...patch }));
  }

  async function synthesizeNarration(text: string): Promise<{ url: string; duration: number }> {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        voice: project.voiceSettings.voice,
        rate: project.voiceSettings.rate,
        pitch: project.voiceSettings.pitch,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Falha ao gerar narração.");
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const duration = await new Promise<number>((resolve) => {
      const audio = new Audio(url);
      audio.addEventListener("loadedmetadata", () => resolve(audio.duration));
    });

    return { url, duration };
  }

  async function fetchImage(prompt: string): Promise<string> {
    const res = await fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, seed: Math.floor(Math.random() * 100000) }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Falha ao gerar imagem.");
    return data.url as string;
  }

  async function buildProject(text: string) {
    if (!text.trim()) {
      setError("Digite ou gere um roteiro antes de continuar.");
      return;
    }
    setBuilding(true);
    setError(null);

    try {
      setBuildStage("Sintetizando narração com edge-tts...");
      const { url: narrationAudioUrl, duration: narrationDuration } = await synthesizeNarration(text);

      setBuildStage("Dividindo roteiro em cenas...");
      const sceneTexts = splitIntoScenes(text);
      const totalChars = sceneTexts.reduce((acc, t) => acc + t.length, 0);

      let cursor = 0;
      const scenesSkeleton: Scene[] = sceneTexts.map((t) => {
        const proportion = t.length / totalChars;
        const duration = Math.max(narrationDuration * proportion, 1.2);
        const scene: Scene = {
          id: uuid(),
          text: t,
          imageUrl: null,
          imagePrompt: sceneToImagePrompt(t),
          duration,
          startTime: cursor,
        };
        cursor += duration;
        return scene;
      });

      setBuildStage("Gerando imagens para cada cena...");
      const scenesWithImages = await Promise.all(
        scenesSkeleton.map(async (scene) => ({
          ...scene,
          imageUrl: await fetchImage(scene.imagePrompt),
        }))
      );

      patchProject({
        scenes: scenesWithImages,
        fullText: text,
        narrationAudioUrl,
        narrationDuration,
      });
    } catch (e: any) {
      setError(e.message ?? "Erro ao montar o vídeo.");
    } finally {
      setBuilding(false);
      setBuildStage("");
    }
  }

  async function regenerateSceneImage(sceneId: string) {
    setProject((p) => ({
      ...p,
      scenes: p.scenes.map((s) => (s.id === sceneId ? { ...s, imageUrl: null } : s)),
    }));
    const scene = project.scenes.find((s) => s.id === sceneId);
    if (!scene) return;
    const url = await fetchImage(scene.imagePrompt);
    setProject((p) => ({
      ...p,
      scenes: p.scenes.map((s) => (s.id === sceneId ? { ...s, imageUrl: url } : s)),
    }));
  }

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="bg-gradient-to-r from-white to-primary-light bg-clip-text text-3xl font-extrabold text-transparent">
            Gerador de Curiosidades
          </h1>
          <p className="mt-1 text-sm text-muted">
            Crie vídeos verticais 9:16 com narração neural, imagens automáticas e legendas dinâmicas.
          </p>
        </header>

        <Tabs defaultValue="tema">
          <TabsList>
            <TabsTrigger value="tema">Gerar por tema</TabsTrigger>
            <TabsTrigger value="texto">Texto próprio</TabsTrigger>
          </TabsList>

          <TabsContent value="tema">
            <ThemeTab onGenerated={(text) => buildProject(text)} />
          </TabsContent>

          <TabsContent value="texto">
            <CustomTextTab value={customText} onChange={setCustomText} />
            <Button className="mt-4 w-full" size="lg" onClick={() => buildProject(customText)} disabled={building}>
              {building ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              Montar vídeo a partir deste texto
            </Button>
          </TabsContent>
        </Tabs>

        {building && (
          <Card className="flex items-center gap-3 border-primary-light/40">
            <Loader2 className="h-4 w-4 animate-spin text-primary-light" />
            <p className="text-sm text-muted">{buildStage}</p>
          </Card>
        )}

        {error && (
          <Card className="border-red-500/40 bg-red-500/5">
            <p className="text-sm text-red-400">{error}</p>
          </Card>
        )}

        <VoiceSettingsPanel settings={project.voiceSettings} onChange={(voiceSettings) => patchProject({ voiceSettings })} />
        <CaptionStyleControls style={project.captionStyle} onChange={(captionStyle) => patchProject({ captionStyle })} />
        <BackgroundMusicControl music={project.backgroundMusic} onChange={(backgroundMusic) => patchProject({ backgroundMusic })} />

        {project.scenes.length > 0 && (
          <ScenesEditor
            scenes={project.scenes}
            onRegenerateImage={regenerateSceneImage}
            transitionDuration={project.transitionDuration}
            onTransitionChange={(transitionDuration) => patchProject({ transitionDuration })}
          />
        )}
      </div>

      <div className="flex flex-col items-center gap-6 lg:sticky lg:top-10 lg:self-start">
        <Card className="w-full">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary-light" /> Prévia (9:16)
          </CardTitle>
          {project.scenes.length > 0 ? (
            <PreviewPlayer project={project} />
          ) : (
            <div className="flex aspect-[9/16] w-full max-w-[340px] mx-auto items-center justify-center rounded-2xl border border-dashed border-border text-center text-sm text-muted">
              Gere um roteiro para ver a prévia aqui
            </div>
          )}
        </Card>

        {project.scenes.length > 0 && (
          <Card className="w-full">
            <ExportButton project={project} />
          </Card>
        )}
      </div>
    </div>
  );
}
