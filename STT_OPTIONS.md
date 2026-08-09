# Speech-to-Text: which provider to wire in

The editor, timestamp engine, and AI commands in this prototype all work today
with the demo transcript. The one missing piece is real transcription —
turning an uploaded file into segments automatically. Here's the tradeoff.

## Option A — Client-side Whisper (transformers.js, like Caption Studio)

**Pros**
- Free, no per-minute cost
- Works offline once the model is downloaded
- Audio never leaves the user's device — strong privacy story for legal/medical transcripts

**Cons**
- No built-in speaker diarization — Whisper transcribes words, not "who said what."
  You'd need a second model (e.g. pyannote) or a hand-rolled heuristic, which is
  a real engineering project on its own, and speaker labeling is central to this spec.
- Runs on the user's phone/laptop — slow on a mid-range Android device, and long
  recordings (1hr+) may time out or drain battery.
- Accuracy is solid for clear English but weaker on accents, mixed-language
  speech, and noisy audio compared to hosted models.

## Option B — Hosted API (AssemblyAI or Deepgram)

**Pros**
- Real speaker diarization out of the box — this is the single biggest reason
  to lean this way, since Male_1/Female_1/speaker-renaming is a core feature here.
- Handles long recordings, accents, and background noise much better.
- Fast (processes in a fraction of the recording's length), no burden on the
  user's phone.

**Cons**
- Costs money per minute transcribed (roughly $0.006–$0.015/min depending on
  provider and tier at time of writing — confirm current pricing before committing).
- Requires uploading audio to a third party — a privacy tradeoff worth being
  upfront about, especially for legal/medical use cases the spec mentions.
- Needs a real backend to hold the API key and handle the upload → poll →
  retrieve-transcript flow (can't be called safely from the browser alone).

## Recommendation

Given the spec leans hard on accurate speaker labeling as a differentiator,
Option B is the more honest starting point — diarization is genuinely hard to
DIY well. A reasonable middle path: offer Option A as a free tier (matches your
existing Caption Studio work, zero incremental cost) and Option B as a paid
tier for users who need reliable multi-speaker transcripts. That also maps
cleanly onto the FREE/PRO/BUSINESS pricing tiers already in the spec.

## Where this plugs in

Both options produce the same output shape the editor already expects:

```ts
type Segment = { id: string; speaker: string; startMs: number; endMs: number; text: string };
```

Wire either provider into a new function (e.g. `lib/transcription/transcribe.ts`)
that takes an uploaded file and returns `Segment[]`, then call it from a new
`/api/transcript/generate` route instead of the "Load demo transcript" button.
Nothing else in the app needs to change.
