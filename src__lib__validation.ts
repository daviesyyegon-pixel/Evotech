import { z } from "zod";
import { IntakeSchema } from "./ai/schema";

export const GenerateRequestSchema = z.object({
  intake: IntakeSchema,
});

export const EditRequestSchema = z.object({
  websiteId: z.string().min(1),
  instruction: z.string().min(2).max(500),
});

export const CreateWebsiteFromIntakeSchema = GenerateRequestSchema;

export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 50) || `site-${Date.now()}`
  );
}
