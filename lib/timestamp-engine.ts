/**
 * Timestamp Engine — guarantees the formatting rules from the spec:
 *   - HH:MM:SS:MMM, no dots, milliseconds always 3 digits
 *   - continuous timestamps (next segment starts exactly where previous ends)
 *   - no accidental overlaps
 *   - "End of recording --> HH:MM:SS:MMM" on the final segment
 */

export type Segment = {
  id: string;
  speaker: string;
  startMs: number;
  endMs: number;
  text: string;
};

/** ms -> "HH:MM:SS:MMM" (no dots, 3-digit ms) */
export function formatTimestamp(ms: number): string {
  const totalMs = Math.max(0, Math.round(ms));
  const hours = Math.floor(totalMs / 3_600_000);
  const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
  const seconds = Math.floor((totalMs % 60_000) / 1000);
  const millis = totalMs % 1000;
  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
    String(millis).padStart(3, "0"),
  ].join(":");
}

/** "HH:MM:SS:MMM" -> ms */
export function parseTimestamp(ts: string): number {
  const [h, m, s, ms] = ts.split(":").map(Number);
  return h * 3_600_000 + m * 60_000 + s * 1000 + ms;
}

/** SRT/VTT use HH:MM:SS,mmm / HH:MM:SS.mmm — separate formatter, spec's own format stays dot-free. */
export function formatTimestampForSubtitle(ms: number, style: "srt" | "vtt"): string {
  const totalMs = Math.max(0, Math.round(ms));
  const hours = Math.floor(totalMs / 3_600_000);
  const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
  const seconds = Math.floor((totalMs % 60_000) / 1000);
  const millis = totalMs % 1000;
  const sep = style === "srt" ? "," : ".";
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}${sep}${String(millis).padStart(3, "0")}`;
}

/** Forces each segment's start to equal the previous segment's end. */
export function enforceContinuity(segments: Segment[]): Segment[] {
  const sorted = [...segments].sort((a, b) => a.startMs - b.startMs);
  for (let i = 1; i < sorted.length; i++) {
    sorted[i].startMs = sorted[i - 1].endMs;
    if (sorted[i].endMs <= sorted[i].startMs) {
      sorted[i].endMs = sorted[i].startMs + 1000; // minimum 1s to avoid zero-length segments
    }
  }
  return sorted;
}

export function endOfRecordingLine(segments: Segment[]): string {
  if (segments.length === 0) return "End of recording --> 00:00:00:000";
  const last = segments[segments.length - 1];
  return `End of recording --> ${formatTimestamp(last.endMs)}`;
}

export function mergeSegments(segments: Segment[], idA: string, idB: string): Segment[] {
  const a = segments.find((s) => s.id === idA);
  const b = segments.find((s) => s.id === idB);
  if (!a || !b) return segments;
  const [first, second] = a.startMs <= b.startMs ? [a, b] : [b, a];
  const merged: Segment = {
    id: first.id,
    speaker: first.speaker,
    startMs: first.startMs,
    endMs: second.endMs,
    text: `${first.text} ${second.text}`.trim(),
  };
  return segments.filter((s) => s.id !== idA && s.id !== idB).concat(merged).sort((a, b) => a.startMs - b.startMs);
}

export function splitSegment(
  segments: Segment[],
  id: string,
  splitAtMs: number,
  textBefore: string,
  textAfter: string
): Segment[] {
  const target = segments.find((s) => s.id === id);
  if (!target || splitAtMs <= target.startMs || splitAtMs >= target.endMs) return segments;

  const first: Segment = { ...target, endMs: splitAtMs, text: textBefore };
  const second: Segment = {
    ...target,
    id: `${target.id}-b`,
    startMs: splitAtMs,
    text: textAfter,
  };
  return segments
    .filter((s) => s.id !== id)
    .concat([first, second])
    .sort((a, b) => a.startMs - b.startMs);
}

export function deleteSegment(segments: Segment[], id: string): Segment[] {
  return segments.filter((s) => s.id !== id);
}

export function renameSpeaker(segments: Segment[], from: string, to: string): Segment[] {
  return segments.map((s) => (s.speaker === from ? { ...s, speaker: to } : s));
}

// ---------------------------------------------------------------
// EXPORT FORMATS
// ---------------------------------------------------------------

export function exportToTxt(segments: Segment[], template: "A" | "B" | "C" = "A"): string {
  const lines: string[] = [];
  for (const s of segments) {
    if (template === "A") {
      lines.push(s.speaker, `${formatTimestamp(s.startMs)} --> ${formatTimestamp(s.endMs)}`, s.text, "");
    } else if (template === "B") {
      lines.push(`${s.speaker} [${formatTimestamp(s.startMs)} --> ${formatTimestamp(s.endMs)}]`, s.text, "");
    } else {
      lines.push(
        `${s.speaker}:`,
        `[${formatTimestampForSubtitle(s.startMs, "vtt")} --> ${formatTimestampForSubtitle(s.endMs, "vtt")}]`,
        s.text,
        ""
      );
    }
  }
  lines.push(endOfRecordingLine(segments));
  return lines.join("\n");
}

export function exportToSrt(segments: Segment[]): string {
  return segments
    .map((s, i) => {
      const start = formatTimestampForSubtitle(s.startMs, "srt");
      const end = formatTimestampForSubtitle(s.endMs, "srt");
      return `${i + 1}\n${start} --> ${end}\n${s.speaker}: ${s.text}\n`;
    })
    .join("\n");
}

export function exportToVtt(segments: Segment[]): string {
  const body = segments
    .map((s) => {
      const start = formatTimestampForSubtitle(s.startMs, "vtt");
      const end = formatTimestampForSubtitle(s.endMs, "vtt");
      return `${start} --> ${end}\n${s.speaker}: ${s.text}\n`;
    })
    .join("\n");
  return `WEBVTT\n\n${body}`;
}

export function exportToCsv(segments: Segment[]): string {
  const rows = [["speaker", "start", "end", "text"]];
  for (const s of segments) {
    rows.push([s.speaker, formatTimestamp(s.startMs), formatTimestamp(s.endMs), s.text.replace(/"/g, '""')]);
  }
  return rows.map((r) => r.map((cell) => `"${cell}"`).join(",")).join("\n");
}

export function exportToJson(segments: Segment[]): string {
  return JSON.stringify(
    { segments, endOfRecording: endOfRecordingLine(segments) },
    null,
    2
  );
}
