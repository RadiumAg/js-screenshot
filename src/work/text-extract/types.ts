export interface TextExtractOptions {
  apiKey: string
  /** OpenAI API base URL, defaults to https://api.openai.com/v1 */
  baseUrl?: string
  /** Model to use for vision, defaults to gpt-4o */
  model?: string
  /** Language hint for OCR prompt, defaults to auto-detect */
  language?: string
  /** Custom fetch function for proxy/relay support */
  fetch?: typeof globalThis.fetch
}

export interface TextExtractResult {
  text: string
  /** Raw API response */
  raw?: any
}

export type TextExtractStatus = 'idle' | 'extracting' | 'success' | 'error';
