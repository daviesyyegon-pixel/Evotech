import Link from "next/link";
import OnboardingForm from "@/components/create/OnboardingForm";

export default function CreatePage() {
  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link href="/" className="text-sm text-slate hover:text-ink">
          &larr; Back
        </Link>
        <h1 className="mt-4 font-display text-3xl font-bold text-ink">Create your website</h1>
        <p className="mt-2 text-sm text-ink/60">
          Describe your business in your own words. Skip anything you're not sure about — AI will fill in
          sensible details, and you can change anything afterward just by typing.
        </p>
        <div className="mt-8">
          <OnboardingForm />
        </div>
      </div>
    </main>
  );
}
