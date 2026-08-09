import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

async function loadOwnedWebsite(userId: string, id: string) {
  const website = await db.website.findUnique({ where: { id } });
  if (!website || website.userId !== userId) return null;
  return website;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const website = await loadOwnedWebsite(user.id, params.id);
    if (!website) return NextResponse.json({ error: "Website not found." }, { status: 404 });
    return NextResponse.json({ website });
  } catch (err: any) {
    if (err?.name === "UNAUTHENTICATED") return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Could not load website." }, { status: 500 });
  }
}

/** PATCH { action: "publish" | "unpublish" } */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const website = await loadOwnedWebsite(user.id, params.id);
    if (!website) return NextResponse.json({ error: "Website not found." }, { status: 404 });

    const { action } = await req.json();
    if (action === "publish") {
      const updated = await db.website.update({
        where: { id: website.id },
        data: { status: "PUBLISHED", publishedAt: new Date() },
      });
      return NextResponse.json({ website: updated });
    }
    if (action === "unpublish") {
      const updated = await db.website.update({
        where: { id: website.id },
        data: { status: "READY", publishedAt: null },
      });
      return NextResponse.json({ website: updated });
    }
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err: any) {
    if (err?.name === "UNAUTHENTICATED") return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Could not update website." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const website = await loadOwnedWebsite(user.id, params.id);
    if (!website) return NextResponse.json({ error: "Website not found." }, { status: 404 });

    await db.website.delete({ where: { id: website.id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err?.name === "UNAUTHENTICATED") return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Could not delete website." }, { status: 500 });
  }
}
