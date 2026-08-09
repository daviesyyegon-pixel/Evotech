/**
 * Transcript Agent — runs server-side only, holds the real API key.
 * Takes the current transcript segments plus a natural-language command
 * and returns updated segments. Never fabricates words — only cleans up,
 * reformats, or reorganizes what's already there.
 */

import type { Segment } from "@/lib/timestamp-engine";

const SYSTEM_PROMPT = `You are the Transcript Agent inside a professional transcription editor.

You receive a transcript as a JSON array of segments:
{ "id": string, "speaker": string, "startMs": number, "endMs": number, "text": string }[]

...and a natural-language command. You ALWAYS respond with a single JSON object and nothing else — no prose, no markdown fences:

{ "segments": [ ...updated segments, same shape... ], "summary": "one short sentence describing what changed" }

CRITICAL RULES:
- NEVER invent, add, or guess words that were not already in the transcript text. You may only remove, reorder, correct spelling/grammar/punctuation of, or reformat existing words.
- If a command only affects certain segments (e.g. "change Speaker_1 to Male_1"), modify ONLY those fields — leave startMs/endMs/id untouched unless the command is specifically about timestamps.
- Preserve segment "id", "startMs", "endMs" exactly unless the command explicitly asks to change timing (e.g. merge/split), since the app's timestamp engine depends on these being stable.
- "Edited verbatim" means: remove filler words (um, uh, like, you know), remove false starts and repetition, fix grammar/punctuation, but preserve the speaker's meaning and don't rewrite their voice into something fancier than what they said.
- "Expand contractions" means simple word-for-word expansion (they're -> they are, can't -> cannot), nothing else changes.
- For a quality check command, don't change segments — instead set "summary" to a report of issues found (e.g. overlapping timestamps, repeated words, missing punctuation).`;

export async function runTranscriptAgent(params: {
  command: string;
  segments: Segment[];
}): Promise<{ segments: Segment[]; summary: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set on the server.");
  }

  const userMessage = `Transcript segments:\n${JSON.stringify(params.segments)}\n\nCommand: ${params.command}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Transcript Agent request failed (${response.status}): ${detail}`);
  }

  const data = await response.json();
  const textBlock = data.content?.find((b: any) => b.type === "text");
  if (!textBlock) throw new Error("Transcript Agent returned no text content");

  const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("Transcript Agent returned invalid JSON");
  }
}
