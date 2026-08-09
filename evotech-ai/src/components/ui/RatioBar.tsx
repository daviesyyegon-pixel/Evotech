interface RatioBarProps {
  humanPercent: number;
  aiPercent: number;
  humanLabel?: string;
  aiLabel?: string;
}

/**
 * EvoTech AI's signature visual motif: the "you vs. AI" effort split.
 * Reused on the marketing homepage and as the dashboard usage indicator.
 */
export default function RatioBar({
  humanPercent,
  aiPercent,
  humanLabel = "You describe",
  aiLabel = "AI builds",
}: RatioBarProps) {
  return (
    <div className="max-w-sm">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-gold" style={{ width: `${humanPercent}%` }} />
        <div className="h-full bg-emerald" style={{ width: `${aiPercent}%` }} />
      </div>
      <div className="mt-2 flex justify-between font-mono text-[11px] text-slate">
        <span>
          {humanPercent}% &middot; {humanLabel}
        </span>
        <span>
          {aiPercent}% &middot; {aiLabel}
        </span>
      </div>
    </div>
  );
}
