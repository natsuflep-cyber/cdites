import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Pollinations.ai: geração de imagem por IA, gratuita, sem chave e sem cota. */
function pollinationsUrl(prompt: string, seed: number) {
  const encoded = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encoded}?width=1080&height=1920&seed=${seed}&nologo=true`;
}

async function searchUnsplash(query: string, key: string) {
  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=portrait&per_page=1`,
    { headers: { Authorization: `Client-ID ${key}` } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.results?.[0]?.urls?.regular ?? null;
}

async function searchPexels(query: string, key: string) {
  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=portrait&per_page=1`,
    { headers: { Authorization: key } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.photos?.[0]?.src?.portrait ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, source = "ai", seed = Math.floor(Math.random() * 100000) } = await req.json();
    if (!prompt) return NextResponse.json({ error: "Informe um prompt." }, { status: 400 });

    if (source === "unsplash" && process.env.UNSPLASH_ACCESS_KEY) {
      const url = await searchUnsplash(prompt, process.env.UNSPLASH_ACCESS_KEY);
      if (url) return NextResponse.json({ url, source: "unsplash" });
    }

    if (source === "pexels" && process.env.PEXELS_API_KEY) {
      const url = await searchPexels(prompt, process.env.PEXELS_API_KEY);
      if (url) return NextResponse.json({ url, source: "pexels" });
    }

    // Padrão / fallback: Pollinations.ai (não precisa de chave, sem limite artificial)
    const url = pollinationsUrl(prompt, seed);
    return NextResponse.json({ url, source: "pollinations" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message ?? "Erro ao gerar imagem." }, { status: 500 });
  }
}
