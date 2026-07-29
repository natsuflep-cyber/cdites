# Gerador de Curiosidades — Vídeos verticais automáticos

App pessoal para gerar vídeos 9:16 (Reels/TikTok/Shorts) de curiosidades: roteiro por IA
ou texto próprio, narração neural via **edge-tts** (Microsoft, gratuito, sem cota),
imagens automáticas por cena (Pollinations.ai / Unsplash / Pexels) e exportação MP4
**100% no navegador** via `ffmpeg.wasm` — isso significa que a renderização não passa
pelas funções serverless da Vercel, então não existe limite de tempo de execução.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Componentes estilo shadcn/ui (Radix UI) no tema roxo neon
- `msedge-tts` para TTS neural PT-BR
- `@ffmpeg/ffmpeg` (wasm) para composição e exportação do vídeo no cliente
- Pollinations.ai para geração de imagem por IA (sem chave), com fallback Unsplash/Pexels

## Como rodar localmente

```bash
npm install
cp .env.example .env.local
# preencha ao menos GROQ_API_KEY (grátis em console.groq.com) ou GEMINI_API_KEY
npm run dev
```

Acesse http://localhost:3000

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `GROQ_API_KEY` | uma das duas | Chave gratuita da Groq (console.groq.com) para gerar o roteiro por tema |
| `GEMINI_API_KEY` | uma das duas | Alternativa: chave gratuita do Google AI Studio |
| `UNSPLASH_ACCESS_KEY` | não | Fallback opcional de banco de imagens reais |
| `PEXELS_API_KEY` | não | Fallback opcional de banco de imagens reais |

A geração de imagem por IA (Pollinations.ai) **não precisa de chave** e é o modo padrão.

## Deploy na Vercel

1. Suba este projeto para um repositório no GitHub.
2. Em vercel.com → **New Project** → importe o repositório.
3. Em **Environment Variables**, adicione `GROQ_API_KEY` (recomendado, é grátis).
4. Deploy. Pronto — o app fica disponível no domínio gerado pela Vercel.

Não é necessário nenhuma configuração extra de `vercel.json`: as rotas de API já usam
`runtime = "nodejs"` (necessário para o `msedge-tts`) e a renderização de vídeo acontece
inteiramente no navegador do usuário.

## Como funciona o fluxo

1. **Roteiro**: gerado por IA (aba "Gerar por tema") ou colado manualmente (aba "Texto próprio", até 10.000 caracteres).
2. **Narração**: o texto completo é enviado para `/api/tts`, que usa `msedge-tts` para
   sintetizar o áudio neural (voz, velocidade e tom configuráveis na interface).
3. **Cenas**: o roteiro é fatiado em blocos curtos (`lib/splitText.ts`). A duração de
   cada cena é estimada proporcionalmente ao número de caracteres em relação à duração
   total do áudio.
4. **Imagens**: cada cena gera um prompt visual e busca uma imagem em `/api/generate-image`
   (Pollinations.ai por padrão). É possível regenerar a imagem de qualquer cena individualmente.
5. **Prévia**: o player 9:16 (`components/PreviewPlayer.tsx`) reproduz narração + imagens
   com crossfade + legendas dinâmicas sincronizadas por cena.
6. **Exportação**: `lib/ffmpeg.ts` baixa as imagens e áudios para a memória do `ffmpeg.wasm`,
   monta um `xfade` entre as cenas, mixa narração + música de fundo e exporta um MP4
   H.264 1080x1920 pronto para download — tudo no navegador, sem limite de tempo de função.

## Notas sobre "sem limites artificiais"

- **edge-tts**: motor gratuito da Microsoft, sem chave de API e sem cota de caracteres.
- **Pollinations.ai**: geração de imagem gratuita, sem chave.
- **Groq**: tier gratuito com limites generosos de requisições/minuto (ajuste o modelo em
  `app/api/generate-text/route.ts` se quiser trocar por outro disponível na sua conta).
- **Renderização client-side**: como o MP4 é montado no navegador via `ffmpeg.wasm`, não
  existe o limite de ~60s/300s das funções serverless da Vercel — a única limitação é o
  hardware do dispositivo que está gerando o vídeo.

## Estrutura de pastas

```
app/
  api/generate-text/route.ts   → roteiro por tema (Groq/Gemini)
  api/generate-image/route.ts  → imagem por cena (Pollinations/Unsplash/Pexels)
  api/tts/route.ts             → narração neural (edge-tts)
  layout.tsx / page.tsx / globals.css
components/
  StudioApp.tsx                → orquestra todo o fluxo (estado principal)
  ThemeTab.tsx / CustomTextTab.tsx
  VoiceSettingsPanel.tsx / CaptionStyleControls.tsx / BackgroundMusicControl.tsx
  ScenesEditor.tsx / PreviewPlayer.tsx / ExportButton.tsx
  ui/                          → botão, input, textarea, tabs, slider, select, card
lib/
  types.ts / utils.ts / splitText.ts / ffmpeg.ts
```

## Possíveis evoluções

- Legendas palavra-por-palavra com timestamps reais (exigiria um serviço de alinhamento
  de áudio/texto, já que o edge-tts não expõe *word boundaries* via API pública simples).
- Fila de histórico de projetos salvos (ex: IndexedDB no navegador).
- Templates de transição adicionais no `lib/ffmpeg.ts` (slide, zoom, etc.), além do fade atual.
