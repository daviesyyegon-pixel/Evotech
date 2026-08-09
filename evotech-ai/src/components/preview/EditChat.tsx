"use client";

import { useState } from "react";
import { SiteData } from "@/lib/ai/schema";
import Button from "@/components/ui/Button";

interface Props {
  websiteId: string;
  onUpdated: (site: SiteData) => void;
}

const SUGGESTIONS = [
  "Make the homepage more professional",
  "Add a WhatsApp button",
  "Add a section explaining our prices",
  "Change the business description",
];

export default function EditChat({ websiteId, onUpdated }: Props) {
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastChange, setLastChange] = useState<string | null>(null);

  async function submitInstruction(text: string) {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ websiteId, instruction: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't apply that edit.");
        return;
      }
      onUpdated(data.website.siteData);
      setLastChange(data.summaryOfChanges);
      setInstruction("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl2 border border-ink/10 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Edit by typing</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitInstruction(instruction);
        }}
        className="mt-2 flex gap-2"
      >
        <input
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder='e.g. "Make the homepage more professional"'
          className="flex-1 rounded-lg border border-ink/15 px-3 py-2 text-sm focus:border-indigo focus:outline-none"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Applying…" : "Apply"}
        </Button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={loading}
            onClick={() => submitInstruction(s)}
            className="rounded-full border border-ink/10 px-3 py-1 text-[11px] text-ink/60 hover:border-indigo hover:text-indigo"
          >
            {s}
          </button>
        ))}
      </div>

      {lastChange && <p className="mt-3 text-xs text-emerald-dark">&#10003; {lastChange}</p>}
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
    </div>
  );
}
