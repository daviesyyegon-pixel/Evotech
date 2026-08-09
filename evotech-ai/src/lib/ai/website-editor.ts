import { getAIProvider } from "./provider";
import { EditResponseSchema, EditResponse, SiteData } from "./schema";
import { buildEditPrompt, WEBSITE_EDIT_SYSTEM_PROMPT } from "./prompts";

export async function editWebsite(
  currentSiteData: SiteData,
  instruction: string
): Promise<EditResponse> {
  const provider = getAIProvider();
  return provider.complete<EditResponse>({
    system: WEBSITE_EDIT_SYSTEM_PROMPT,
    prompt: buildEditPrompt(currentSiteData, instruction),
    schema: EditResponseSchema,
    maxTokens: 4096,
  });
}
