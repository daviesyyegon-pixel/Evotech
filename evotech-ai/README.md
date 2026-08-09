# EvoTech AI — Website Builder (MVP)

Describe your business in plain language. AI generates a complete, mobile-friendly website —
structure, copy, layout — and you edit it afterward just by typing instructions, never code.

Built for Zentari / Hosanna Group as the first EvoTech AI product. Architected so GOLD/DIAMOND/TITANIUM
tier products (IT Helpdesk, WhatsApp Assistant, IoT Monitoring, etc.) can be added later without
reworking this codebase — they'd each become a new module reusing the same AI provider abstraction,
auth, and usage-tracking layers.

---

## 1. Project structure

```
evotech-ai/
├── prisma/
│   └── schema.prisma          # User, Website, Subscription, Generation, UsageEvent
├── src/
│   ├── app/
│   │   ├── page.tsx                     # Marketing homepage
│   │   ├── create/page.tsx              # Onboarding form → generates a website
│   │   ├── preview/[id]/page.tsx        # Live preview + natural-language editing
│   │   ├── dashboard/page.tsx           # My Websites, usage, plan
│   │   ├── login/page.tsx, register/page.tsx
│   │   └── api/
│   │       ├── generate/route.ts        # POST — AI generates a new website
│   │       ├── edit/route.ts            # POST — AI applies a natural-language edit
│   │       ├── websites/route.ts        # GET  — list current user's websites
│   │       ├── websites/[id]/route.ts   # GET/PATCH(publish)/DELETE
│   │       ├── register/route.ts        # POST — create account
│   │       └── auth/[...nextauth]/route.ts
│   ├── components/
│   │   ├── ui/                          # Button, Input, Textarea, RatioBar (signature element)
│   │   ├── create/OnboardingForm.tsx
│   │   ├── preview/                     # PreviewClient, EditChat, PreviewControls
│   │   ├── dashboard/WebsiteCard.tsx
│   │   ├── site-renderer/SiteRenderer.tsx   # Turns AI JSON into real markup
│   │   └── providers/SessionProvider.tsx
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── provider.ts              # ★ AI provider abstraction (Anthropic/OpenAI)
│   │   │   ├── schema.ts                # Zod schemas — structured AI output contract
│   │   │   ├── prompts.ts               # Centralized prompt templates
│   │   │   ├── website-generator.ts     # generateWebsite(intake)
│   │   │   └── website-editor.ts        # editWebsite(siteData, instruction)
│   │   ├── config/
│   │   │   ├── pricing.ts               # ★ configurable plans, not hard-coded
│   │   │   └── templates.ts             # 10 starting templates
│   │   ├── auth.ts                      # NextAuth config + requireUser()
│   │   ├── db.ts                        # Prisma client singleton
│   │   ├── rate-limit.ts                # Per-user rate limiting
│   │   ├── usage.ts                     # Plan-limit enforcement + usage recording
│   │   └── validation.ts                # Zod request schemas, slugify()
│   └── middleware.ts                    # Protects /dashboard and /preview
├── .env.example
└── package.json
```

**Modularity for future tiers:** every future product (AI IT Helpdesk, WhatsApp Assistant, etc.)
would live in its own `src/lib/<product>/` folder, reuse `getAIProvider()`, `requireUser()`,
`checkRateLimit()`, and add its own Prisma models — the same pattern as the website builder.

---

## 2. Complete code

All code is in this project folder. Key architectural decisions worth knowing:

- **AI never returns raw HTML.** It returns structured JSON validated against a Zod schema
  (`src/lib/ai/schema.ts`). `SiteRenderer.tsx` turns that JSON into React markup, which is
  auto-escaped — this is what "safe AI output handling" means here, and it's why edits can be
  applied surgically instead of regenerating a wall of HTML each time.
- **AI provider abstraction** (`src/lib/ai/provider.ts`): nothing else in the app calls Anthropic
  or OpenAI directly. Switch providers with one env var. Add a third provider by implementing the
  `AIProvider` interface.
- **Pricing is data, not hard-coded UI.** `src/lib/config/pricing.ts` is the single source of
  truth for both plans — change numbers there and the pricing page, dashboard limits, and API
  enforcement all follow.

**Scope note on the live-preview toolbar:** the brief listed Edit / Regenerate / Change style /
Add section / Remove section / Preview mobile / Preview desktop / Publish / Export as separate
buttons. In this MVP, mobile/desktop preview and publish are dedicated buttons; regenerate,
change style, add section, and remove section are handled through the natural-language edit box
("change the style to something bolder", "remove the testimonials section") since that's the same
underlying `/api/edit` call and keeps the UI uncluttered — the suggestion chips demonstrate this.
Export is scaffolded (Gold-only in pricing config) but the actual code-export endpoint isn't wired
yet; see Roadmap below.

---

## 3. Environment variables required

Copy `.env.example` to `.env.local` and fill in:

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | `http://localhost:3000` locally |
| `AI_PROVIDER` | Yes | `"anthropic"` or `"openai"` |
| `ANTHROPIC_API_KEY` | If using Anthropic | From console.anthropic.com |
| `ANTHROPIC_MODEL` | No | Defaults to `claude-sonnet-4-6` |
| `OPENAI_API_KEY` | If using OpenAI | From platform.openai.com |
| `OPENAI_MODEL` | No | Defaults to `gpt-4o-mini` |
| `INTASEND_PUBLISHABLE_KEY` / `INTASEND_SECRET_KEY` | For payments (Section 8) | From IntaSend dashboard |

**Nothing is faked.** If `AI_PROVIDER=anthropic` and `ANTHROPIC_API_KEY` is empty, `/api/generate`
and `/api/edit` return a clear 502 error naming the missing key — they do not return placeholder
content pretending to be AI output.

---

## 4. Database setup

1. Get a PostgreSQL database — easiest free options: [Supabase](https://supabase.com),
   [Neon](https://neon.tech), or [Railway](https://railway.app). Copy its connection string into
   `DATABASE_URL`.
2. Push the schema:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
3. (Optional) Inspect data visually:
   ```bash
   npx prisma studio
   ```

---

## 5. How to run locally

```bash
npm install
cp .env.example .env.local   # then fill in the values from Section 3
npx prisma db push
npm run dev
```

Open `http://localhost:3000`. Register an account at `/register`, then go to `/create`.

---

## 6. How to deploy

**Recommended: Vercel (frontend/API) + Supabase or Neon (database)**

1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com/new).
3. In Vercel's project settings → Environment Variables, add everything from `.env.example`
   with real values (`NEXTAUTH_URL` becomes your production URL, e.g.
   `https://evotech.ai`).
4. Deploy. Vercel runs `npm run build` automatically.
5. Run `npx prisma db push` once against your production `DATABASE_URL` (from your machine, or a
   one-off Vercel deploy hook) to create tables.

The app is a standard Next.js 14 App Router project, so it also works on any Node host
(Render, Fly.io, a VPS) with `npm run build && npm run start`.

---

## 7. How to connect the AI API

1. Get an API key:
   - Anthropic (recommended, matches this build): console.anthropic.com → API Keys
   - or OpenAI: platform.openai.com → API Keys
2. Set `AI_PROVIDER` and the matching key in `.env.local` / your host's env settings.
3. That's it — `src/lib/ai/provider.ts` picks it up automatically. No other code changes needed.
4. To add a third provider (e.g. a local/open-source model), implement the `AIProvider` interface
   in `provider.ts` and add a branch in `getAIProvider()`.

---

## 8. How to add payments later (M-Pesa via IntaSend)

The `.env.example` already reserves `INTASEND_PUBLISHABLE_KEY` / `INTASEND_SECRET_KEY`, and the
`Subscription` model in `prisma/schema.prisma` has an `intasendCustomerId` field ready to use.
IntaSend is not wired up yet — here's the shape of the work when you're ready:

1. `npm install intasend-node`
2. Create `src/lib/payments/intasend.ts` exporting `createCheckout(userId, plan)` that calls
   IntaSend's STK Push / checkout API and returns a payment URL.
3. Add `src/app/api/payments/checkout/route.ts` — authenticated POST that calls
   `createCheckout` and returns the URL to redirect the user to.
4. Add `src/app/api/payments/webhook/route.ts` — receives IntaSend's payment-confirmed webhook,
   verifies its signature, and on success: `db.user.update({ plan: "GOLD" })` +
   `db.subscription.upsert(...)`.
5. Add an "Upgrade to Gold" button on `/dashboard` and the pricing section that calls the checkout
   route instead of just linking to `/create`.

Because `getPlan()` in `src/lib/config/pricing.ts` already drives every limit in the app, flipping
a user's `plan` field is the only state change payments need to trigger — generation limits,
website limits, and branding removal all update automatically.

---

## Roadmap (explicitly out of scope for this MVP, per the brief)

- Export (download site as static HTML/Next.js project) — Gold-only, scaffolded in pricing config
- Actual publish → live public URL hosting/CDN (currently `PUBLISHED` just flips a status flag)
- IntaSend/M-Pesa payment flow (interface reserved, see Section 8)
- GOLD/DIAMOND/TITANIUM future products (IT Helpdesk, Cybersecurity Scanner, WhatsApp Assistant,
  etc.) — architecture supports adding them as new `src/lib/<product>/` modules
