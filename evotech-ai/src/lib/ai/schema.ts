import { z } from "zod";

/**
 * The structured representation of a generated website.
 * The AI never returns raw HTML for the whole page — it returns this JSON,
 * which src/components/site-renderer/SiteRenderer.tsx turns into markup.
 * This keeps AI output safe (no arbitrary script injection), editable by
 * section, and reusable across templates.
 */

export const SectionTypeEnum = z.enum([
  "hero",
  "about",
  "services",
  "products",
  "gallery",
  "testimonials",
  "pricing",
  "contact",
  "cta",
]);

export const CallToActionSchema = z.object({
  label: z.string().min(1).max(40),
  type: z.enum(["whatsapp", "call", "email", "link"]),
  value: z.string().min(1), // phone number, email, or URL
});

export const ServiceItemSchema = z.object({
  title: z.string().min(1).max(80),
  description: z.string().max(300).optional(),
  price: z.string().max(40).optional(), // free text so "From KSh 500" works
});

export const TestimonialSchema = z.object({
  name: z.string().min(1).max(60),
  quote: z.string().min(1).max(400),
  role: z.string().max(80).optional(),
});

export const SectionSchema = z.object({
  id: z.string(),
  type: SectionTypeEnum,
  heading: z.string().max(120).optional(),
  subheading: z.string().max(240).optional(),
  body: z.string().max(1200).optional(),
  items: z.array(ServiceItemSchema).optional(),
  testimonials: z.array(TestimonialSchema).optional(),
  imageDescriptions: z.array(z.string()).optional(), // placeholder alt-text prompts, no external image gen assumed
  ctas: z.array(CallToActionSchema).optional(),
});

export const SiteDataSchema = z.object({
  businessName: z.string().min(1).max(100),
  tagline: z.string().max(160),
  template: z.enum([
    "business",
    "restaurant",
    "barber-salon",
    "portfolio",
    "ecommerce",
    "professional-services",
    "school",
    "church-organization",
    "real-estate",
    "technology",
  ]),
  theme: z.object({
    primaryColor: z.string(), // hex
    style: z.enum(["modern", "bold", "elegant", "minimal", "warm", "corporate"]),
  }),
  nav: z.array(z.string()).max(8),
  sections: z.array(SectionSchema).min(2).max(10),
  contact: z.object({
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    location: z.string().optional(),
    email: z.string().optional(),
  }),
});

export type SiteData = z.infer<typeof SiteDataSchema>;
export type Section = z.infer<typeof SectionSchema>;

/** Response shape for natural-language edit requests. */
export const EditResponseSchema = z.object({
  siteData: SiteDataSchema,
  summaryOfChanges: z.string().max(200),
});
export type EditResponse = z.infer<typeof EditResponseSchema>;

/** Intake form the user fills before generation. */
export const IntakeSchema = z.object({
  description: z.string().min(10).max(1000),
  businessName: z.string().max(100).optional(),
  businessType: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  services: z.string().max(500).optional(),
  phone: z.string().max(30).optional(),
  whatsapp: z.string().max(30).optional(),
  preferredStyle: z
    .enum(["modern", "bold", "elegant", "minimal", "warm", "corporate"])
    .optional(),
});
export type Intake = z.infer<typeof IntakeSchema>;
