import type { TextExtractOptions, TextExtractResult } from './types';

function buildPrompt(language?: string): string {
  const langHint = language
    ? ` The text is primarily in ${language}.`
    : '';
  return `Extract all visible text from this image.${langHint} Return the extracted text as-is, preserving the original layout and line breaks as much as possible. Do not add any commentary or explanation.`;
}

export async function extractTextFromImage(
  imageSource: string | Blob,
  options: TextExtractOptions,
): Promise<TextExtractResult> {
  const {
    apiKey,
    baseUrl = 'https://api.openai.com/v1',
    model = 'gpt-4o',
    language,
    fetch: customFetch = globalThis.fetch,
  } = options;

  let imageDataUrl: string;

  if (imageSource instanceof Blob) {
    imageDataUrl = await blobToDataUrl(imageSource);
  }
  else {
    imageDataUrl = imageSource;
  }

  const response = await customFetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: buildPrompt(language) },
            {
              type: 'image_url',
              image_url: {
                url: imageDataUrl,
                detail: 'high',
              },
            },
          ],
        },
      ],
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim() ?? '';

  return { text, raw: data };
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png',
  quality = 1,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob)
          resolve(blob);
        else reject(new Error('Failed to convert canvas to blob'));
      },
      format,
      quality,
    );
  });
}
