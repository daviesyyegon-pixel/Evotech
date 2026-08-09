/**
 * Single source of truth for plan pricing and limits.
 * Change numbers here — UI, API rate limits, and the pricing page all read
 * from this file instead of hard-coding values.
 */

export type PlanId = "FREE" | "GOLD";

export interface PlanConfig {
  id: PlanId;
  label: string;
  priceKES: number; // 0 = free
  billingPeriod: "month" | "one-time" | null;
  maxWebsites: number;
  aiGenerationsPerMonth: number;
  aiEditsPerMonth: number;
  removeBranding: boolean;
  customSections: boolean;
  exportEnabled: boolean;
  priorityGeneration: boolean;
  features: string[];
}

export const PLANS: Record<PlanId, PlanConfig> = {
  FREE: {
    id: "FREE",
    label: "Free",
    priceKES: 0,
    billingPeriod: null,
    maxWebsites: 1,
    aiGenerationsPerMonth: 5,
    aiEditsPerMonth: 15,
    removeBranding: false,
    customSections: false,
    exportEnabled: false,
    priorityGeneration: false,
    features: [
      "1 website",
      "Limited AI generations",
      "Live preview",
      "\"Built with EvoTech AI\" badge",
    ],
  },
  GOLD: {
    id: "GOLD",
    label: "Gold",
    priceKES: 1000,
    billingPeriod: "month",
    maxWebsites: 10,
    aiGenerationsPerMonth: 100,
    aiEditsPerMonth: 500,
    removeBranding: true,
    customSections: true,
    exportEnabled: true,
    priorityGeneration: true,
    features: [
      "Up to 10 websites",
      "100 AI generations / month",
      "Remove EvoTech branding",
      "Custom sections",
      "Export site code",
      "Priority generation queue",
    ],
  },
};

export function getPlan(planId: PlanId): PlanConfig {
  return PLANS[planId];
}
