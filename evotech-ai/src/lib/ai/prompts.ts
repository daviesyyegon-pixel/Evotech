import { Intake } from "./schema";

const JSON_CONTRACT = `
Return ONLY a single JSON object matching this shape (no markdown, no comments, no extra keys):

{
  "businessName": string,
  "tagline": string,
  "template": "business" | "restaurant" | "barber-salon" | "portfolio" | "ecommerce" |
              "professional-services" | "school" | "church-organization" | "real-estate" | "technology",
  "theme": { "primaryColor": "#hex", "style": "modern" | "bold" | "elegant" | "minimal" | "warm" | "corporate" },
  "nav": string[],
  "sections": [
    {
      "id": string,
      "type": "hero" | "about" | "services" | "products" | "gallery" | "testimonials" | "pricing" | "contact" | "cta",
      "heading": string,
      "subheading": string,
      "body": string,
      "items": [{ "title": string, "description": string, "price": string }],
      "testimonials": [{ "name": string, "quote": string, "role": string }],
      "ctas": [{ "label": string, "type": "whatsapp" | "call" | "email" | "link", "value": string }]
    }
  ],
  "contact": { "phone": string, "whatsapp": string, "location": string, "email": string }
}

Only include the fields on a section that are relevant to its type (e.g. "items" for services/products,
"testimonials" for testimonials). Only include sections that genuinely help this specific business —
do not pad with sections that add no value. 3-7 sections is typical.
`;

export const WEBSITE_GENERATION_SYSTEM_PROMPT = `You are the website-generation engine inside EvoTech AI, a
Kenyan/African AI website builder. Your job is to take a short, non-technical description of a small
business and turn it into a complete, professional website structure.

Rules:
- Write like a skilled local copywriter, not a generic template. Use the business's own details.
- Prices/currency: assume Kenyan Shillings (KSh) unless the business clearly operates elsewhere.
- Keep copy concise, benefit-led, and mobile-scannable — most visitors are on Android phones.
- Choose ONLY the sections that make sense for this business; do not force every possible section.
- If contact details (phone/WhatsApp/location) are missing, omit them rather than inventing them.
- Never include HTML, scripts, or markdown in text fields — plain text only.
${JSON_CONTRACT}`;

export function buildGenerationPrompt(intake: Intake): string {
  const facts = [
    intake.businessName && `Business name: ${intake.businessName}`,
    intake.businessType && `Business type: ${intake.businessType}`,
    intake.location && `Location: ${intake.location}`,
    intake.services && `Services/products: ${intake.services}`,
    intake.phone && `Phone: ${intake.phone}`,
    intake.whatsapp && `WhatsApp: ${intake.whatsapp}`,
    intake.preferredStyle && `Preferred style: ${intake.preferredStyle}`,
  ]
    .filter(Boolean)
    .join("\n");

  return `Business description (in the owner's own words):
"""
${intake.description}
"""

Additional details provided:
${facts || "(none provided — infer sensibly from the description)"}

Generate the full website JSON now.`;
}

export const WEBSITE_EDIT_SYSTEM_PROMPT = `You are the website-editing engine inside EvoTech AI. You receive
the CURRENT structured website JSON and a plain-language instruction from a non-technical business owner
(e.g. "make the homepage more professional", "add a WhatsApp button", "add a prices section"). Apply ONLY
the change requested, preserving everything else in the site exactly as-is unless the instruction implies
a broader change. Never remove content the user didn't ask you to remove.
${JSON_CONTRACT}

Additionally return:
{
  "siteData": <the full updated site JSON as specified above>,
  "summaryOfChanges": string   // one short plain-English sentence describing what changed
}`;

export function buildEditPrompt(currentSiteData: unknown, instruction: string): string {
  return `CURRENT SITE JSON:
${JSON.stringify(currentSiteData, null, 2)}

USER INSTRUCTION:
"${instruction}"

Apply the instruction and return the updated site JSON in the required { siteData, summaryOfChanges } shape.`;
}
