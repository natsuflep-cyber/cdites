"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import type { CaptionStyle, ProjectState } from "@/lib/types";
import { formatSeconds } from "@/lib/utils";

const positionClass: Record<CaptionStyle["position"], string> = {
  top: "top-10 items-start",
  middle: "top-1/2 -translate-y-1/2 items-center",
  bottom: "bottom-14 items-end",
};

export function PreviewPlayer({ project }: { project: ProjectState }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const musicRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);

  const activeSceneIndex = useMemo(() => {
    const idx = project.scenes.findIndex(
      (s) => currentTime >= s.startTime && currentTime < s.startTime + s.duration
    );
    return idx === -1 ? project.scenes.length - 1 : idx;
  }, [currentTime, project.scenes]);

  const activeScene = project.scenes[activeSceneIndex];

  useEffect(() => {
    const audio = audioRef.current;
    const music = musicRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onEnded = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);

    if (music) music.volume = project.backgroundMusic.volume;

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
    };
  }, [project.backgroundMusic.volume]);

  function togglePlay() {
    const audio = audioRef.current;
    const music = musicRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      music?.pause();
    } else {
      audio.play();
      if (music && project.backgroundMusic.url) {
        music.currentTime = 0;
        music.play();
      }
    }
    setPlaying(!playing);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative aspect-[9/16] w-full max-w-[340px] overflow-hidden rounded-2xl border border-border bg-black shadow-neon"
        onClick={togglePlay}
      >
        {project.scenes.map((scene, i) => (
          <div
            key={scene.id}
            className="absolute inset-0 transition-opacity ease-linear"
            style={{
              opacity: i === activeSceneIndex ? 1 : 0,
              transitionDuration: `${project.transitionDuration}s`,
              backgroundImage: scene.imageUrl ? `url(${scene.imageUrl})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

        {activeScene && (
          <div className={`absolute inset-x-4 flex ${positionClass[project.captionStyle.position]}`}>
            <p
              className="w-full text-center leading-snug"
              style={{
                fontFamily: project.captionStyle.fontFamily,
                fontSize: `${project.captionStyle.fontSize / 3.2}px`,
                color: project.captionStyle.color,
                fontWeight: 700,
                WebkitTextStroke: project.captionStyle.strokeEnabled ? "1px rgba(0,0,0,0.6)" : undefined,
                textShadow: "0 2px 12px rgba(0,0,0,0.7)",
              }}
            >
              {activeScene.text}
            </p>
          </div>
        )}

        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="rounded-full bg-primary/90 p-4 shadow-neon">
              <Play className="h-7 w-7 fill-white text-white" />
            </div>
          </div>
        )}

        {project.narrationAudioUrl && <audio ref={audioRef} src={project.narrationAudioUrl} className="hidden" />}
        {project.backgroundMusic.url && (
          <audio ref={musicRef} src={project.backgroundMusic.url} loop className="hidden" />
        )}
      </div>

      <div className="flex w-full max-w-[340px] items-center gap-3">
        <button onClick={togglePlay} className="text-primary-light">
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface2">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-light"
            style={{ width: `${(currentTime / (project.narrationDuration || 1)) * 100}%` }}
          />
        </div>
        <span className="text-xs text-muted">
          {formatSeconds(currentTime)} / {formatSeconds(project.narrationDuration)}
        </span>
      </div>
    </div>
  );
}
