"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

interface Props {
  websiteId: string;
  status: string;
  device: "mobile" | "desktop";
  onDeviceChange: (d: "mobile" | "desktop") => void;
}

export default function PreviewControls({ websiteId, status, device, onDeviceChange }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);

  async function togglePublish() {
    setBusy(true);
    const action = currentStatus === "PUBLISHED" ? "unpublish" : "publish";
    const res = await fetch(`/api/websites/${websiteId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      const data = await res.json();
      setCurrentStatus(data.website.status);
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex rounded-full border border-ink/10 p-0.5">
        <button
          onClick={() => onDeviceChange("mobile")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
            device === "mobile" ? "bg-indigo text-paper" : "text-ink/60"
          }`}
        >
          Mobile
        </button>
        <button
          onClick={() => onDeviceChange("desktop")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
            device === "desktop" ? "bg-indigo text-paper" : "text-ink/60"
          }`}
        >
          Desktop
        </button>
      </div>

      <Button variant="secondary" onClick={togglePublish} disabled={busy}>
        {currentStatus === "PUBLISHED" ? "Unpublish" : "Publish"}
      </Button>

      <Button variant="ghost" onClick={() => router.push("/dashboard")}>
        Back to dashboard
      </Button>

      <span className="ml-auto rounded-full bg-ink/5 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-ink/60">
        {currentStatus}
      </span>
    </div>
  );
}
