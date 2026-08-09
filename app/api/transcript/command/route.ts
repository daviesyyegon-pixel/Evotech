import { NextRequest, NextResponse } from "next/server";
import { runTranscriptAgent } from "@/lib/ai/transcript-agent";
import type { Segment } from "@/lib/timestamp-engine";

/**
 * POST /api/transcript/command
 * Body: { command: string, segments: Segment[] }
 */
export async function POST(req: NextRequest) {
  let body: { command?: string; segments?: Segment[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Couldn't read that request." }, { status: 400 });
  }

  if (!body.command || !body.command.trim()) {
    return NextResponse.json(
      { error: "Type a command first, like \"remove filler words\"." },
      { status: 400 }
    );
  }
  if (!body.segments) {
    return NextResponse.json({ error: "No transcript to work with yet." }, { status: 400 });
  }

  try {
    const result = await runTranscriptAgent({ command: body.command, segments: body.segments });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Transcript agent error:", err);
    return NextResponse.json(
      { error: "We couldn't apply that command just now. Please try again." },
      { status: 502 }
    );
  }
}
