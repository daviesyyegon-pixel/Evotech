import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPlan } from "@/lib/config/pricing";
import { getMonthlyUsage } from "@/lib/usage";
import WebsiteCard from "@/components/dashboard/WebsiteCard";
import RatioBar from "@/components/ui/RatioBar";
import Button from "@/components/ui/Button";

export default async function DashboardPage() {
  let user;
  try {
    user = await requireUser();
  } catch {
    redirect("/login?next=/dashboard");
  }

  const dbUser = await db.user.findUniqueOrThrow({ where: { id: user!.id } });
  const plan = getPlan(dbUser.plan);
  const websites = await db.website.findMany({
    where: { userId: user!.id },
    orderBy: { createdAt: "desc" },
  });
  const generationsUsed = await getMonthlyUsage(user!.id, "generation");

  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink">My Websites</h1>
            <p className="mt-1 text-sm text-ink/60">
              {plan.label} plan &middot; {websites.length}/{plan.maxWebsites} websites used
            </p>
          </div>
          <Link href="/create">
            <Button>+ New Website</Button>
          </Link>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
          <div>
            {websites.length === 0 ? (
              <div className="rounded-xl2 border border-dashed border-ink/20 p-12 text-center">
                <p className="text-sm text-ink/60">You haven't built a website yet.</p>
                <Link href="/create" className="mt-4 inline-block">
                  <Button>Create My Website</Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {websites.map((w) => (
                  <WebsiteCard
                    key={w.id}
                    id={w.id}
                    name={w.name}
                    status={w.status}
                    createdAt={w.createdAt.toISOString()}
                  />
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl2 border border-ink/10 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">AI usage this month</p>
              <p className="mt-2 font-display text-2xl font-bold text-ink">
                {generationsUsed}
                <span className="text-sm font-normal text-ink/50"> / {plan.aiGenerationsPerMonth}</span>
              </p>
              <div className="mt-4">
                <RatioBar
                  humanPercent={5}
                  aiPercent={95}
                  humanLabel="Your input"
                  aiLabel="AI generation"
                />
              </div>
            </div>

            <div className="rounded-xl2 border border-ink/10 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Plan</p>
              <p className="mt-2 font-display text-lg font-bold text-ink">{plan.label}</p>
              {plan.id === "FREE" && (
                <Link href="/#pricing" className="mt-3 inline-block text-sm font-semibold text-indigo hover:underline">
                  Upgrade to Gold →
                </Link>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
