"use client";

import { useState } from "react";
import { SiteData } from "@/lib/ai/schema";
import SiteRenderer from "@/components/site-renderer/SiteRenderer";
import PreviewControls from "@/components/preview/PreviewControls";
import EditChat from "@/components/preview/EditChat";

export default function PreviewClient({
  websiteId,
  initialSite,
  status,
  showBranding,
}: {
  websiteId: string;
  initialSite: SiteData;
  status: string;
  showBranding: boolean;
}) {
  const [site, setSite] = useState(initialSite);
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-ink">Website Preview</h1>
        </div>

        <PreviewControls websiteId={websiteId} status={status} device={device} onDeviceChange={setDevice} />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="flex justify-center">
            <div
              className={`overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-xl transition-all ${
                device === "mobile" ? "w-full max-w-[390px]" : "w-full"
              }`}
            >
              <div className="max-h-[80vh] overflow-y-auto">
                <SiteRenderer site={site} showBranding={showBranding} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <EditChat websiteId={websiteId} onUpdated={setSite} />
            <div className="rounded-xl2 border border-ink/10 bg-white p-4 text-xs text-ink/60">
              <p className="font-semibold text-ink/80">Template</p>
              <p className="mt-1 capitalize">{site.template.replace("-", " ")}</p>
              <p className="mt-3 font-semibold text-ink/80">Style</p>
              <p className="mt-1 capitalize">{site.theme.style}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
