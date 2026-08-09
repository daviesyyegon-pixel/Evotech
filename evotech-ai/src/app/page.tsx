import Link from "next/link";
import { TEMPLATES } from "@/lib/config/templates";
import { PLANS } from "@/lib/config/pricing";
import RatioBar from "@/components/ui/RatioBar";

export default function HomePage() {
  return (
    <main>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(232,163,61,0.12),transparent_60%)]" />
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <nav className="mb-16 flex items-center justify-between">
            <span className="font-display text-lg font-bold tracking-tight">
              Evo<span className="text-gold">Tech</span> AI
            </span>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/dashboard" className="text-slate hover:text-paper transition-colors">
                Dashboard
              </Link>
              <Link
                href="/create"
                className="rounded-full bg-gold px-4 py-2 font-medium text-ink hover:bg-gold-light transition-colors"
              >
                Create My Website
              </Link>
            </div>
          </nav>

          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-emerald-light">
                For Kenyan &amp; African businesses
              </p>
              <h1 className="font-display text-4xl font-bold leading-[1.05] sm:text-6xl">
                Build your website
                <br />
                with <span className="text-gold">AI.</span>
              </h1>
              <p className="mt-6 max-w-md text-lg text-slate">
                Tell us about your business. AI does the technical work — the copy, the layout, the code,
                the mobile design. All of it.
              </p>

              <div className="mt-10">
                <RatioBar humanPercent={5} aiPercent={95} />
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/create"
                  className="rounded-full bg-gold px-7 py-3.5 text-base font-semibold text-ink hover:bg-gold-light transition-colors"
                >
                  Create My Website
                </Link>
                <Link
                  href="#how-it-works"
                  className="rounded-full border border-slate-dark px-7 py-3.5 text-base font-medium text-paper hover:border-gold hover:text-gold transition-colors"
                >
                  See how it works
                </Link>
              </div>
            </div>

            {/* Live-mockup style phone panel */}
            <div className="relative mx-auto w-full max-w-sm">
              <div className="rounded-[2.5rem] border border-indigo-light bg-indigo p-3 shadow-2xl shadow-black/40">
                <div className="rounded-[1.9rem] bg-paper p-4 text-ink">
                  <div className="mb-3 h-2 w-16 rounded-full bg-ink/10" />
                  <div className="rounded-xl2 bg-gradient-to-br from-indigo to-indigo-dark p-5 text-paper">
                    <p className="font-display text-sm font-bold">Fresh Cut Barber Shop</p>
                    <p className="mt-1 text-xs text-slate">Nakuru &middot; Est. quality fades</p>
                    <div className="mt-4 inline-block rounded-full bg-gold px-3 py-1.5 text-[11px] font-semibold text-ink">
                      Chat on WhatsApp
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {["Haircuts", "Beard", "Styling"].map((s) => (
                      <div key={s} className="rounded-lg bg-ink/5 p-2 text-center text-[10px] font-medium">
                        {s}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 h-16 rounded-lg bg-ink/5" />
                </div>
              </div>
              <p className="mt-4 text-center text-xs text-slate">
                Generated from one paragraph — edited by typing, not coding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-paper py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">
            What it does → how to use it → what you get.
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "Describe",
                copy: "Tell EvoTech AI about your business in your own words — like you're explaining it to a friend.",
              },
              {
                step: "Generate",
                copy: "AI writes your copy, builds your layout, and makes it mobile-friendly — in under a minute.",
              },
              {
                step: "Edit & publish",
                copy: 'Type changes like "add a WhatsApp button" — no code, ever. Then publish.',
              },
            ].map((item) => (
              <div key={item.step} className="rounded-xl2 border border-ink/10 bg-white p-6">
                <h3 className="font-display text-lg font-bold text-indigo">{item.step}</h3>
                <p className="mt-2 text-sm text-ink/70">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEMPLATES ────────────────────────────────────────────────── */}
      <section className="bg-indigo-dark py-20 text-paper">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Built for how African businesses work</h2>
          <p className="mt-3 max-w-2xl text-slate">
            AI picks the right starting point automatically based on your description.
          </p>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {TEMPLATES.map((t) => (
              <div
                key={t.id}
                className="rounded-xl border border-indigo-light bg-indigo p-4 hover:border-gold transition-colors"
              >
                <p className="font-display text-sm font-semibold">{t.label}</p>
                <p className="mt-1 text-xs text-slate">{t.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────── */}
      <section id="pricing" className="bg-paper py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-center font-display text-3xl font-bold text-ink sm:text-4xl">Simple pricing</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {Object.values(PLANS).map((plan) => (
              <div
                key={plan.id}
                className={`rounded-xl2 border p-8 ${
                  plan.id === "GOLD" ? "border-gold bg-ink text-paper" : "border-ink/10 bg-white text-ink"
                }`}
              >
                <p className="font-display text-xl font-bold">{plan.label}</p>
                <p className="mt-2 text-3xl font-bold">
                  {plan.priceKES === 0 ? "Free" : `KSh ${plan.priceKES.toLocaleString()}`}
                  {plan.billingPeriod === "month" && (
                    <span className="text-base font-normal opacity-60">/month</span>
                  )}
                </p>
                <ul className="mt-6 space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className={plan.id === "GOLD" ? "text-gold" : "text-emerald"}>&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/create"
                  className={`mt-8 block rounded-full px-6 py-3 text-center text-sm font-semibold transition-colors ${
                    plan.id === "GOLD" ? "bg-gold text-ink hover:bg-gold-light" : "bg-ink text-paper hover:bg-indigo"
                  }`}
                >
                  {plan.id === "GOLD" ? "Go Gold" : "Start Free"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-ink py-10 text-center text-xs text-slate">
        <p>EvoTech AI &middot; A Zentari / Hosanna Group product built for African entrepreneurs.</p>
      </footer>
    </main>
  );
}
