import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT = `Você é um roteirista especialista em vídeos curtos de curiosidades para Reels/TikTok/Shorts.
Escreva em português do Brasil, tom envolvente e dinâmico, frases curtas e diretas, sem introduções genéricas como "você sabia".
Traga fatos verificáveis, específicos e surpreendentes sobre o tema pedido.
Não use markdown, não use emojis, não numere os parágrafos. Apenas o texto corrido do roteiro, entre 4 e 8 parágrafos curtos.`;

async function generateWithGroq(theme: string, apiKey: string) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Tema: ${theme}` },
      ],
      temperature: 0.9,
      max_tokens: 900,
    }),
  });
  if (!res.ok) throw new Error(`Groq falhou: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() as string;
}

async function generateWithGemini(theme: string, apiKey: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: `Tema: ${theme}` }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 900 },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini falhou: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() as string;
}

export async function POST(req: NextRequest) {
  try {
    const { theme } = await req.json();
    if (!theme || typeof theme !== "string") {
      return NextResponse.json({ error: "Informe um tema válido." }, { status: 400 });
    }

    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    let text: string | undefined;

    if (groqKey) {
      text = await generateWithGroq(theme, groqKey);
    } else if (geminiKey) {
      text = await generateWithGemini(theme, geminiKey);
    } else {
      return NextResponse.json(
        { error: "Nenhuma chave de IA configurada. Defina GROQ_API_KEY ou GEMINI_API_KEY no .env." },
        { status: 500 }
      );
    }

    if (!text) {
      return NextResponse.json({ error: "A IA não retornou conteúdo." }, { status: 502 });
    }

    return NextResponse.json({ text });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message ?? "Erro ao gerar texto." }, { status: 500 });
  }
}
