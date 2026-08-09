import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireUser();
    const websites = await db.website.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        template: true,
        createdAt: true,
        publishedAt: true,
      },
    });
    return NextResponse.json({ websites });
  } catch (err: any) {
    if (err?.name === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ error: "Could not load websites." }, { status: 500 });
  }
}
