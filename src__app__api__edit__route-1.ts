import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { EditRequestSchema } from "@/lib/validation";
import { editWebsite } from "@/lib/ai/website-editor";
import { SiteDataSchema } from "@/lib/ai/schema";
import { assertWithinPlanLimit, recordUsage } from "@/lib/usage";
import { AIProviderError } from "@/lib/ai/provider";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    const rl = checkRateLimit(`edit:${user.id}`, { limit: 30, windowMs: 10 * 60 * 1000 });
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = EditRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    const { websiteId, instruction } = parsed.data;

    const website = await db.website.findUnique({ where: { id: websiteId } });
    if (!website || website.userId !== user.id) {
      return NextResponse.json({ error: "Website not found." }, { status: 404 });
    }

    const dbUser = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    await assertWithinPlanLimit(user.id, dbUser.plan, "edit");

    const currentSiteData = SiteDataSchema.parse(website.siteData);
    const { siteData: updatedSiteData, summaryOfChanges } = await editWebsite(currentSiteData, instruction);

    const updated = await db.website.update({
      where: { id: website.id },
      data: {
        siteData: updatedSiteData as any,
        name: updatedSiteData.businessName,
        generations: {
          create: {
            type: "edit",
            prompt: instruction,
            provider: process.env.AI_PROVIDER || "anthropic",
            model: process.env.ANTHROPIC_MODEL || process.env.OPENAI_MODEL || "unknown",
            success: true,
          },
        },
      },
    });

    await recordUsage(user.id, "edit");

    return NextResponse.json({ website: updated, summaryOfChanges });
  } catch (err: any) {
    return handleApiError(err);
  }
}

function handleApiError(err: any) {
  if (err?.name === "UNAUTHENTICATED") {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  if (err?.name === "PLAN_LIMIT_EXCEEDED") {
    return NextResponse.json({ error: err.message }, { status: 402 });
  }
  if (err instanceof AIProviderError || err?.name === "AIProviderError") {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
  console.error(err);
  return NextResponse.json({ error: "Something went wrong applying that edit." }, { status: 500 });
}
