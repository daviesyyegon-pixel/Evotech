/**
 * AI provider abstraction.
 *
 * Nothing in the rest of the app (website-generator.ts, website-editor.ts,
 * API routes) talks to Anthropic or OpenAI directly. They call
 * `getAIProvider().complete(...)`, which returns a structured JSON object
 * validated against a Zod schema.
 *
 * To add a new provider: implement the `AIProvider` interface below and
 * register it in `getAIProvider()`.
 */

import { z } from "zod";

export interface AICompletionRequest {
  system: string;
  prompt: string;
  /** Zod schema the JSON response must satisfy. */
  schema: z.ZodTypeAny;
  maxTokens?: number;
}

export interface AIProvider {
  name: string;
  complete<T>(req: AICompletionRequest): Promise<T>;
}

class AIProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIProviderError";
  }
}

/**
 * Strips markdown code fences some models wrap JSON in, then parses.
 */
function parseJSON(raw: string): unknown {
  const cleaned = raw.replace(/^```json\s*|^```\s*|```$/gm, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new AIProviderError(
      "AI response was not valid JSON. Raw output logged server-side for debugging."
    );
  }
}

/** Anthropic (Claude) provider. Requires ANTHROPIC_API_KEY. */
class AnthropicProvider implements AIProvider {
  name = "anthropic";
  private apiKey = process.env.ANTHROPIC_API_KEY;
  private model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

  async complete<T>({ system, prompt, schema, maxTokens = 4096 }: AICompletionRequest): Promise<T> {
    if (!this.apiKey) {
      throw new AIProviderError(
        "ANTHROPIC_API_KEY is not set. Add it to .env.local — EvoTech AI will not fake a response."
      );
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: maxTokens,
        system: `${system}\n\nRespond with ONLY valid JSON. No markdown fences, no preamble, no commentary.`,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new AIProviderError(`Anthropic API error (${res.status}): ${errBody}`);
    }

    const data = await res.json();
    const textBlock = (data.content || []).find((b: any) => b.type === "text");
    if (!textBlock) throw new AIProviderError("Anthropic response contained no text block.");

    const parsed = parseJSON(textBlock.text);
    const result = schema.safeParse(parsed);
    if (!result.success) {
      throw new AIProviderError(
        `AI response failed schema validation: ${result.error.message}`
      );
    }
    return result.data as T;
  }
}

/** OpenAI provider (alternative backend). Requires OPENAI_API_KEY. */
class OpenAIProvider implements AIProvider {
  name = "openai";
  private apiKey = process.env.OPENAI_API_KEY;
  private model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  async complete<T>({ system, prompt, schema, maxTokens = 4096 }: AICompletionRequest): Promise<T> {
    if (!this.apiKey) {
      throw new AIProviderError(
        "OPENAI_API_KEY is not set. Add it to .env.local — EvoTech AI will not fake a response."
      );
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new AIProviderError(`OpenAI API error (${res.status}): ${errBody}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new AIProviderError("OpenAI response contained no content.");

    const parsed = parseJSON(content);
    const result = schema.safeParse(parsed);
    if (!result.success) {
      throw new AIProviderError(
        `AI response failed schema validation: ${result.error.message}`
      );
    }
    return result.data as T;
  }
}

let cachedProvider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cachedProvider) return cachedProvider;

  const choice = (process.env.AI_PROVIDER || "anthropic").toLowerCase();
  if (choice === "openai") {
    cachedProvider = new OpenAIProvider();
  } else if (choice === "anthropic") {
    cachedProvider = new AnthropicProvider();
  } else {
    throw new AIProviderError(`Unknown AI_PROVIDER "${choice}". Use "anthropic" or "openai".`);
  }
  return cachedProvider;
}

export { AIProviderError };
