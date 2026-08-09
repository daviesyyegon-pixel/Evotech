"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Segment,
  formatTimestamp,
  enforceContinuity,
  endOfRecordingLine,
  mergeSegments,
  deleteSegment,
  renameSpeaker,
  exportToTxt,
  exportToSrt,
  exportToVtt,
  exportToCsv,
  exportToJson,
} from "@/lib/timestamp-engine";

const DEMO_SEGMENTS: Segment[] = [
  { id: "1", speaker: "Male_1", startMs: 0, endMs: 4200, text: "Hello, and welcome to today's discussion on small business growth in Kenya." },
  { id: "2", speaker: "Female_1", startMs: 4200, endMs: 9100, text: "Thank you for having me. I'm, uh, really excited to be here and talk about this." },
  { id: "3", speaker: "Male_1", startMs: 9100, endMs: 14800, text: "Let's start with the basics. What do you think is the biggest challenge facing entrepreneurs today?" },
  { id: "4", speaker: "Female_1", startMs: 14800, endMs: 22300, text: "I think it's, it's really access to capital. A lot of business owners, they just can't get the funding they need to grow." },
  { id: "5", speaker: "Male_1", startMs: 22300, endMs: 27650, text: "That's a great point. Can you give us an example of how that plays out in practice?" },
];

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function TranscribePage() {
  const mediaRef = useRef<HTMLVideoElement>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"audio" | "video">("video");
  const [fileName, setFileName] = useState<string>("");

  const [segments, setSegments] = useState<Segment[]>([]);
  const [history, setHistory] = useState<Segment[][]>([]);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [continuous, setContinuous] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const [command, setCommand] = useState("");
  const [commandRunning, setCommandRunning] = useState(false);
  const [commandError, setCommandError] = useState("");
  const [lastSummary, setLastSummary] = useState("");

  const bodyRef = useRef<HTMLDivElement>(null);

  // ---------------- Keyboard shortcuts ----------------
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      const isTyping = tag === "TEXTAREA" || tag === "INPUT";

      if (e.code === "Space" && !isTyping) {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowLeft" && !isTyping) {
        seekBy(-5);
      } else if (e.key === "ArrowRight" && !isTyping) {
        seekBy(5);
      } else if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        undo();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        setShowSearch(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function pushHistory() {
    setHistory((h) => [...h, segments]);
  }

  function undo() {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setSegments(prev);
      return h.slice(0, -1);
    });
  }

  function updateSegments(next: Segment[]) {
    pushHistory();
    setSegments(continuous ? enforceContinuity(next) : next);
  }

  // ---------------- File upload ----------------
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setMediaUrl(url);
    setMediaType(file.type.startsWith("audio") ? "audio" : "video");
    setFileName(file.name);
  }

  function loadDemo() {
    setSegments(DEMO_SEGMENTS);
    setFileName("demo_interview.mp3 (no real audio — for testing the editor only)");
  }

  // ---------------- Playback ----------------
  function togglePlay() {
    const m = mediaRef.current;
    if (!m) return;
    if (m.paused) m.play();
    else m.pause();
  }

  function seekBy(deltaSeconds: number) {
    const m = mediaRef.current;
    if (!m) return;
    m.currentTime = Math.max(0, m.currentTime + deltaSeconds);
  }

  function setPlaybackSpeed(s: number) {
    setSpeed(s);
    if (mediaRef.current) mediaRef.current.playbackRate = s;
  }

  function jumpToSegment(seg: Segment) {
    if (mediaRef.current) mediaRef.current.currentTime = seg.startMs / 1000;
    setActiveSegmentId(seg.id);
  }

  const handleTimeUpdate = useCallback(() => {
    const m = mediaRef.current;
    if (!m) return;
    const ms = m.currentTime * 1000;
    setCurrentTime(m.currentTime);
    const active = segments.find((s) => ms >= s.startMs && ms < s.endMs);
    if (active) {
      setActiveSegmentId(active.id);
      const el = document.getElementById(`seg-${active.id}`);
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [segments]);

  // ---------------- Segment editing ----------------
  function editText(id: string, text: string) {
    updateSegments(segments.map((s) => (s.id === id ? { ...s, text } : s)));
  }

  function editSpeaker(id: string, speaker: string) {
    updateSegments(segments.map((s) => (s.id === id ? { ...s, speaker } : s)));
  }

  function handleMerge(idA: string, idB: string) {
    updateSegments(mergeSegments(segments, idA, idB));
  }

  function handleDelete(id: string) {
    updateSegments(deleteSegment(segments, id));
  }

  function handleAddAfter(id: string) {
    const idx = segments.findIndex((s) => s.id === id);
    const ref = segments[idx];
    const newSeg: Segment = {
      id: `${Date.now()}`,
      speaker: ref?.speaker || "Speaker_1",
      startMs: ref ? ref.endMs : 0,
      endMs: ref ? ref.endMs + 3000 : 3000,
      text: "",
    };
    const next = [...segments];
    next.splice(idx + 1, 0, newSeg);
    updateSegments(next);
  }

  // ---------------- AI command ----------------
  async function runCommand() {
    if (!command.trim() || segments.length === 0) return;
    setCommandRunning(true);
    setCommandError("");
    setLastSummary("");
    try {
      const res = await fetch("/api/transcript/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command, segments }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Command failed.");
      pushHistory();
      setSegments(data.segments);
      setLastSummary(data.summary || "Done.");
      setCommand("");
    } catch (err: any) {
      setCommandError(err.message || "We couldn't apply that command just now.");
    } finally {
      setCommandRunning(false);
    }
  }

  // ---------------- Export ----------------
  function download(content: string, filename: string, mime: string) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyTranscript() {
    navigator.clipboard.writeText(exportToTxt(segments, "A"));
  }

  const filteredSegments = searchQuery
    ? segments.filter(
        (s) =>
          s.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.speaker.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : segments;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="mark">T</div>
          <span>EvoTech Transcribe — Workspace</span>
        </div>
        {segments.length > 0 && <div className="quality-pill">{segments.length} segments</div>}
      </header>

      <div className="workspace">
        {/* PLAYER COLUMN */}
        <div className="player-col">
          {!mediaUrl ? (
            <label className="upload-zone">
              <input type="file" accept="audio/*,video/*" onChange={handleFileSelect} />
              Drag and drop, or tap to upload
              <br />
              MP3, WAV, M4A, MP4, MOV, WEBM…
            </label>
          ) : (
            <div className="file-meta">
              <strong>{fileName}</strong>
            </div>
          )}

          {mediaUrl && (
            <video
              ref={mediaRef}
              src={mediaUrl}
              onTimeUpdate={handleTimeUpdate}
              controls={false}
            />
          )}

          {mediaUrl && (
            <>
              <div className="transport">
                <button onClick={() => seekBy(-5)}>« 5s</button>
                <button onClick={togglePlay}>Play / Pause</button>
                <button onClick={() => seekBy(5)}>5s »</button>
                <span className="time mono">{formatTimestamp(currentTime * 1000)}</span>
              </div>

              <div className="field-label">Playback speed</div>
              <div className="speed-row">
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    className={speed === s ? "active" : ""}
                    onClick={() => setPlaybackSpeed(s)}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </>
          )}

          {segments.length === 0 && (
            <button className="btn-ghost" onClick={loadDemo}>
              Load demo transcript (for testing the editor)
            </button>
          )}

          <div className="field-label">Continuous timestamps</div>
          <div className="mode-row">
            <button className={continuous ? "active" : ""} onClick={() => setContinuous(true)}>
              On
            </button>
            <button className={!continuous ? "active" : ""} onClick={() => setContinuous(false)}>
              Off
            </button>
          </div>

          {segments.length > 0 && (
            <>
              <div className="field-label">Export</div>
              <div className="export-grid">
                <button onClick={() => download(exportToTxt(segments, "A"), "transcript.txt", "text/plain")}>TXT</button>
                <button onClick={() => download(exportToSrt(segments), "transcript.srt", "text/plain")}>SRT</button>
                <button onClick={() => download(exportToVtt(segments), "transcript.vtt", "text/vtt")}>VTT</button>
                <button onClick={() => download(exportToCsv(segments), "transcript.csv", "text/csv")}>CSV</button>
                <button onClick={() => download(exportToJson(segments), "transcript.json", "application/json")}>JSON</button>
                <button onClick={copyTranscript}>Copy</button>
              </div>
            </>
          )}
        </div>

        {/* TRANSCRIPT COLUMN */}
        <div className="transcript-col">
          <div className="toolbar">
            {showSearch && (
              <input
                type="text"
                autoFocus
                placeholder="Search words, speakers…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            )}
            <button onClick={() => setShowSearch((v) => !v)}>Search</button>
            <button onClick={undo} disabled={history.length === 0}>Undo</button>
          </div>

          <div className="transcript-body" ref={bodyRef}>
            {segments.length === 0 ? (
              <div className="empty-state">
                <div className="display">No transcript yet</div>
                <p>
                  Upload a recording to get started, or load the demo transcript to try the
                  editor, timestamp engine, and AI commands right now.
                </p>
              </div>
            ) : (
              <>
                {filteredSegments.map((seg, i) => (
                  <div
                    key={seg.id}
                    id={`seg-${seg.id}`}
                    className={`segment ${activeSegmentId === seg.id ? "active" : ""}`}
                    onClick={() => jumpToSegment(seg)}
                  >
                    <div className="speaker-row">
                      <input
                        className="speaker mono"
                        value={seg.speaker}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => editSpeaker(seg.id, e.target.value)}
                      />
                      <span className="ts">
                        {formatTimestamp(seg.startMs)} --&gt; {formatTimestamp(seg.endMs)}
                      </span>
                    </div>
                    <textarea
                      className="text"
                      value={seg.text}
                      rows={Math.max(1, Math.ceil(seg.text.length / 70))}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => editText(seg.id, e.target.value)}
                    />
                    <div className="seg-actions" onClick={(e) => e.stopPropagation()}>
                      {i < segments.length - 1 && (
                        <button onClick={() => handleMerge(seg.id, segments[i + 1].id)}>Merge with next</button>
                      )}
                      <button onClick={() => handleAddAfter(seg.id)}>Add segment after</button>
                      <button onClick={() => handleDelete(seg.id)}>Delete</button>
                    </div>
                  </div>
                ))}
                <div className="end-marker">{endOfRecordingLine(segments)}</div>
              </>
            )}
          </div>

          {commandError && <div className="error-box">{commandError}</div>}
          {lastSummary && !commandError && <div className="info-box">{lastSummary}</div>}

          <div className="ai-command-bar">
            <input
              type="text"
              placeholder='e.g. "Remove filler words", "Make this edited verbatim", "Expand contractions"'
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runCommand()}
              disabled={segments.length === 0}
            />
            <button onClick={runCommand} disabled={commandRunning || segments.length === 0}>
              {commandRunning ? "Working…" : "Run"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
