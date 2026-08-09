"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const STYLES = ["modern", "bold", "elegant", "minimal", "warm", "corporate"] as const;

export default function OnboardingForm() {
  const router = useRouter();
  const [showOptional, setShowOptional] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    description: "",
    businessName: "",
    businessType: "",
    location: "",
    services: "",
    phone: "",
    whatsapp: "",
    preferredStyle: "" as (typeof STYLES)[number] | "",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.description.trim().length < 10) {
      setError("Tell us a bit more about your business (at least a sentence or two).");
      return;
    }

    setLoading(true);
    try {
      const intake = {
        description: form.description,
        businessName: form.businessName || undefined,
        businessType: form.businessType || undefined,
        location: form.location || undefined,
        services: form.services || undefined,
        phone: form.phone || undefined,
        whatsapp: form.whatsapp || undefined,
        preferredStyle: form.preferredStyle || undefined,
      };

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ intake }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      router.push(`/preview/${data.website.id}`);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Textarea
        label="Tell us about your business"
        placeholder='e.g. "I own a barber shop in Nakuru called Fresh Cut Barber Shop. We offer haircuts, beard grooming and hair styling."'
        rows={5}
        value={form.description}
        onChange={(e) => update("description", e.target.value)}
        required
      />

      <button
        type="button"
        onClick={() => setShowOptional((s) => !s)}
        className="text-sm font-medium text-indigo hover:underline"
      >
        {showOptional ? "Hide optional details" : "Add optional details (recommended)"}
      </button>

      {showOptional && (
        <div className="grid gap-4 rounded-xl2 border border-ink/10 bg-white p-5 sm:grid-cols-2">
          <Input label="Business name" value={form.businessName} onChange={(e) => update("businessName", e.target.value)} placeholder="Fresh Cut Barber Shop" />
          <Input label="Business type" value={form.businessType} onChange={(e) => update("businessType", e.target.value)} placeholder="Barber shop" />
          <Input label="Location" value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="Nakuru, Kenya" />
          <Input label="Services / products" value={form.services} onChange={(e) => update("services", e.target.value)} placeholder="Haircuts, beard grooming, styling" />
          <Input label="Phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="07XX XXX XXX" />
          <Input label="WhatsApp number" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} placeholder="07XX XXX XXX" />
          <div className="sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-ink/80">Preferred style</span>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => update("preferredStyle", form.preferredStyle === s ? "" : s)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
                    form.preferredStyle === s
                      ? "border-indigo bg-indigo text-paper"
                      : "border-ink/15 text-ink/70 hover:border-indigo"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? "Building your website…" : "Generate My Website"}
      </Button>
    </form>
  );
}
