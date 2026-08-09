import { db } from "./db";
import { getPlan, PlanId } from "./config/pricing";

/** Counts this month's usage events of a given kind for a user. */
export async function getMonthlyUsage(userId: string, kind: "generation" | "edit") {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  return db.usageEvent.count({
    where: { userId, kind, createdAt: { gte: startOfMonth } },
  });
}

export async function assertWithinPlanLimit(
  userId: string,
  planId: PlanId,
  kind: "generation" | "edit"
) {
  const plan = getPlan(planId);
  const used = await getMonthlyUsage(userId, kind);
  const limit = kind === "generation" ? plan.aiGenerationsPerMonth : plan.aiEditsPerMonth;

  if (used >= limit) {
    const err = new Error(
      `Monthly ${kind} limit reached (${used}/${limit}) for the ${plan.label} plan. Upgrade to Gold for more.`
    );
    err.name = "PLAN_LIMIT_EXCEEDED";
    throw err;
  }
}

export async function recordUsage(userId: string, kind: "generation" | "edit") {
  await db.usageEvent.create({ data: { userId, kind } });
}

export async function assertWithinWebsiteLimit(userId: string, planId: PlanId) {
  const plan = getPlan(planId);
  const count = await db.website.count({ where: { userId } });
  if (count >= plan.maxWebsites) {
    const err = new Error(
      `You've reached the ${plan.label} plan limit of ${plan.maxWebsites} website(s). Upgrade to Gold for more.`
    );
    err.name = "PLAN_LIMIT_EXCEEDED";
    throw err;
  }
}
