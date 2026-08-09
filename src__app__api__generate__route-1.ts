import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { GenerateRequestSchema, slugify } from "@/lib/validation";
import { generateWebsite } from "@/lib/ai/website-generator";
import { assertWithinPlanLimit, assertWithinWebsiteLimit, recordUsage } from "@/lib/usage";
import { AIProviderError } from "@/lib/ai/provider";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    // Rate limit: 10 generation requests per 10 minutes per user.
    const rl = checkRateLimit(`generate:${user.id}`, { limit: 10, windowMs: 10 * 60 * 1000 });
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = GenerateRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    const { intake } = parsed.data;

    const dbUser = await db.user.findUniqueOrThrow({ where: { id: user.id } });

    await assertWithinWebsiteLimit(user.id, dbUser.plan);
    await assertWithinPlanLimit(user.id, dbUser.plan, "generation");

    const siteData = await generateWebsite(intake);

    const baseSlug = slugify(intake.businessName || siteData.businessName);
    let slug = baseSlug;
    let attempt = 1;
    while (await db.website.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${++attempt}`;
    }

    const website = await db.website.create({
      data: {
        userId: user.id,
        name: siteData.businessName,
        slug,
        status: "READY",
        template: siteData.template,
        siteData: siteData as any,
        intake: intake as any,
        generations: {
          create: {
            type: "initial",
            prompt: intake.description,
            provider: process.env.AI_PROVIDER || "anthropic",
            model: process.env.ANTHROPIC_MODEL || process.env.OPENAI_MODEL || "unknown",
            success: true,
          },
        },
      },
    });

    await recordUsage(user.id, "generation");

    return NextResponse.json({ website }, { status: 201 });
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
  return NextResponse.json({ error: "Something went wrong generating your website." }, { status: 500 });
}
