/**
 * Divide o roteiro em blocos curtos (1-2 frases) para que cada bloco
 * vire uma "cena" com sua própria imagem e legenda.
 */
export function splitIntoScenes(text: string, maxCharsPerScene = 160): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];

  // separa em frases, preservando o pontuador
  const sentences = clean.match(/[^.!?]+[.!?]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [clean];

  const scenes: string[] = [];
  let buffer = "";

  for (const sentence of sentences) {
    const candidate = buffer ? `${buffer} ${sentence}` : sentence;
    if (candidate.length > maxCharsPerScene && buffer) {
      scenes.push(buffer.trim());
      buffer = sentence;
    } else {
      buffer = candidate;
    }
  }
  if (buffer.trim()) scenes.push(buffer.trim());

  return scenes;
}

/** Gera um prompt de imagem mais visual a partir do texto de uma cena. */
export function sceneToImagePrompt(sceneText: string, theme?: string): string {
  const base = sceneText.replace(/["“”]/g, "").slice(0, 220);
  const context = theme ? `${theme}, ` : "";
  return `${context}${base}, cinematic, ultra detailed, dramatic lighting, 9:16 vertical composition, high quality`;
}
