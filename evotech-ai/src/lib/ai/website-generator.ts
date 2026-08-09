import { getAIProvider } from "./provider";
import { SiteDataSchema, SiteData, Intake } from "./schema";
import { buildGenerationPrompt, WEBSITE_GENERATION_SYSTEM_PROMPT } from "./prompts";

export async function generateWebsite(intake: Intake): Promise<SiteData> {
  const provider = getAIProvider();
  return provider.complete<SiteData>({
    system: WEBSITE_GENERATION_SYSTEM_PROMPT,
    prompt: buildGenerationPrompt(intake),
    schema: SiteDataSchema,
    maxTokens: 4096,
  });
}
