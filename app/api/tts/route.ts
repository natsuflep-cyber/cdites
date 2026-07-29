import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

export const runtime = "nodejs";
export const maxDuration = 60;

function toSignedPercent(value: number): string {
  const v = Math.max(-100, Math.min(100, Math.round(value)));
  return `${v >= 0 ? "+" : ""}${v}%`;
}

export async function POST(req: NextRequest) {
  try {
    const { text, voice = "pt-BR-AntonioNeural", rate = 0, pitch = 0 } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Informe o texto da narração." }, { status: 400 });
    }
    if (text.length > 10000) {
      return NextResponse.json({ error: "Texto excede o limite de 10.000 caracteres." }, { status: 400 });
    }

    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    const { audioStream } = tts.toStream(text, {
      rate: toSignedPercent(rate),
      pitch: `${pitch >= 0 ? "+" : ""}${Math.round(pitch)}Hz`,
      volume: "+0%",
    });

    const chunks: Buffer[] = [];
    for await (const chunk of audioStream as unknown as AsyncIterable<Buffer>) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const audioBuffer = Buffer.concat(chunks);

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message ?? "Erro ao gerar áudio (edge-tts)." }, { status: 500 });
  }
}
