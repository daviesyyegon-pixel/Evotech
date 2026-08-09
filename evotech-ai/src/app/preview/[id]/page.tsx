import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { SiteDataSchema } from "@/lib/ai/schema";
import { getPlan } from "@/lib/config/pricing";
import PreviewClient from "@/components/preview/PreviewClient";

export default async function PreviewPage({ params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireUser();
  } catch {
    redirect(`/login?next=/preview/${params.id}`);
  }

  const website = await db.website.findUnique({ where: { id: params.id } });
  if (!website || website.userId !== user!.id) notFound();

  const dbUser = await db.user.findUniqueOrThrow({ where: { id: user!.id } });
  const plan = getPlan(dbUser.plan);
  const site = SiteDataSchema.parse(website.siteData);

  return (
    <PreviewClient
      websiteId={website.id}
      initialSite={site}
      status={website.status}
      showBranding={!plan.removeBranding}
    />
  );
}
