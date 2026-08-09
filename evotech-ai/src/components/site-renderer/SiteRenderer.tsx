import { SiteData, Section } from "@/lib/ai/schema";

/**
 * Renders the AI's structured siteData as real markup. Because the AI never
 * returns raw HTML (see src/lib/ai/schema.ts), there is nothing here to
 * sanitize against script injection — every field is plain text rendered
 * through React, which escapes it by default.
 */
export default function SiteRenderer({ site, showBranding }: { site: SiteData; showBranding: boolean }) {
  return (
    <div className="font-body text-ink" style={{ accentColor: site.theme.primaryColor }}>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-ink/10 bg-white/90 px-5 py-4 backdrop-blur">
        <span className="font-display text-sm font-bold">{site.businessName}</span>
        <nav className="hidden gap-5 text-xs font-medium text-ink/70 sm:flex">
          {site.nav.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </nav>
      </header>

      {site.sections.map((section) => (
        <SectionBlock key={section.id} section={section} accent={site.theme.primaryColor} />
      ))}

      <footer className="border-t border-ink/10 px-5 py-6 text-center text-xs text-ink/50">
        {site.contact.location && <p>{site.contact.location}</p>}
        {showBranding && <p className="mt-2">Built with EvoTech AI</p>}
      </footer>
    </div>
  );
}

function SectionBlock({ section, accent }: { section: Section; accent: string }) {
  switch (section.type) {
    case "hero":
      return (
        <section className="px-5 py-14 text-center" style={{ backgroundColor: `${accent}14` }}>
          {section.heading && <h1 className="font-display text-3xl font-bold">{section.heading}</h1>}
          {section.subheading && <p className="mx-auto mt-3 max-w-md text-sm text-ink/70">{section.subheading}</p>}
          <CTARow ctas={section.ctas} accent={accent} />
        </section>
      );

    case "services":
    case "products":
      return (
        <section className="px-5 py-12">
          {section.heading && <h2 className="font-display text-2xl font-bold">{section.heading}</h2>}
          {section.subheading && <p className="mt-2 text-sm text-ink/60">{section.subheading}</p>}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {(section.items || []).map((item) => (
              <div key={item.title} className="rounded-xl2 border border-ink/10 p-5">
                <p className="font-display text-sm font-bold">{item.title}</p>
                {item.description && <p className="mt-1 text-xs text-ink/60">{item.description}</p>}
                {item.price && (
                  <p className="mt-2 text-xs font-semibold" style={{ color: accent }}>
                    {item.price}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      );

    case "testimonials":
      return (
        <section className="bg-ink/[0.03] px-5 py-12">
          {section.heading && <h2 className="font-display text-2xl font-bold">{section.heading}</h2>}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {(section.testimonials || []).map((t) => (
              <div key={t.name} className="rounded-xl2 bg-white p-5 shadow-sm">
                <p className="text-sm italic text-ink/80">&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-3 text-xs font-semibold">
                  {t.name}
                  {t.role && <span className="font-normal text-ink/50"> &middot; {t.role}</span>}
                </p>
              </div>
            ))}
          </div>
        </section>
      );

    case "contact":
      return (
        <section className="px-5 py-12">
          {section.heading && <h2 className="font-display text-2xl font-bold">{section.heading}</h2>}
          {section.body && <p className="mt-2 text-sm text-ink/70">{section.body}</p>}
          <CTARow ctas={section.ctas} accent={accent} />
        </section>
      );

    case "cta":
      return (
        <section className="px-5 py-12 text-center" style={{ backgroundColor: accent }}>
          {section.heading && <h2 className="font-display text-2xl font-bold text-white">{section.heading}</h2>}
          <CTARow ctas={section.ctas} accent={accent} inverted />
        </section>
      );

    default:
      return (
        <section className="px-5 py-12">
          {section.heading && <h2 className="font-display text-2xl font-bold">{section.heading}</h2>}
          {section.subheading && <p className="mt-2 text-sm text-ink/60">{section.subheading}</p>}
          {section.body && <p className="mt-3 text-sm leading-relaxed text-ink/70">{section.body}</p>}
        </section>
      );
  }
}

function CTARow({
  ctas,
  accent,
  inverted,
}: {
  ctas?: Section["ctas"];
  accent: string;
  inverted?: boolean;
}) {
  if (!ctas?.length) return null;
  return (
    <div className="mt-6 flex flex-wrap justify-center gap-3">
      {ctas.map((cta) => (
        <span
          key={cta.label}
          className="inline-block rounded-full px-5 py-2.5 text-xs font-semibold"
          style={
            inverted
              ? { backgroundColor: "white", color: accent }
              : { backgroundColor: accent, color: "white" }
          }
        >
          {cta.label}
        </span>
      ))}
    </div>
  );
}
