"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";

interface Props {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-ink/10 text-ink/60",
  GENERATING: "bg-gold/20 text-gold-dark",
  READY: "bg-indigo/10 text-indigo",
  PUBLISHED: "bg-emerald/10 text-emerald-dark",
  FAILED: "bg-red-100 text-red-700",
};

export default function WebsiteCard({ id, name, status, createdAt }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/websites/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    setDeleting(false);
  }

  return (
    <div className="rounded-xl2 border border-ink/10 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-sm font-bold text-ink">{name}</p>
          <p className="mt-1 text-xs text-ink/50">
            Created {new Date(createdAt).toLocaleDateString()}
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${STATUS_STYLES[status] || ""}`}>
          {status}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link href={`/preview/${id}`}>
          <Button variant="secondary" className="!px-3.5 !py-1.5 !text-xs">
            Edit / Preview
          </Button>
        </Link>
        <Button variant="danger" className="!px-3.5 !py-1.5 !text-xs" onClick={handleDelete} disabled={deleting}>
          {deleting ? "Deleting…" : "Delete"}
        </Button>
      </div>
    </div>
  );
}
