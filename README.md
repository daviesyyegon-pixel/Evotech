# EvoTech Transcribe — working prototype

The timestamp engine, editor, and AI commands are fully functional. Real
speech-to-text is not wired in yet — see `STT_OPTIONS.md` for the provider
decision that unblocks it.

## What works right now

- **Timestamp engine**: `HH:MM:SS:MMM` format (no dots, 3-digit ms), continuous
  timestamps enforced automatically, "End of recording --> ..." marker
- **Editor**: editable text and speaker labels, merge/add/delete segments,
  search, undo (Ctrl/Cmd+Z)
- **Media sync**: upload your own audio/video file, click a segment to jump to
  that point, active segment highlights and auto-scrolls during playback,
  playback speed control (0.5x–2x), keyboard shortcuts (Space, arrows)
- **AI commands**: type instructions like "remove filler words," "make this
  edited verbatim," "expand contractions," "change Speaker_1 to Male_1" — runs
  server-side so your API key stays safe
- **Export**: TXT (professional format with speaker/timestamp/End of recording),
  SRT, VTT, CSV, JSON, and copy-to-clipboard

## What's not built yet

- Real transcription (upload → auto-generated segments) — needs an STT
  provider decision, see `STT_OPTIONS.md`
- Speaker diarization (auto-detecting Male_1/Female_1) — comes from whichever
  STT provider you pick
- Accounts, cloud storage, billing, admin dashboard, version history — this
  prototype is single-session, nothing persists on refresh yet
- DOCX/PDF export (TXT/SRT/VTT/CSV/JSON are done; those two need the docx/pdf
  generation libraries wired in)
- Grammar/spellcheck as-you-type (the AI command bar can run cleanup on
  demand, but there's no live inline checker yet)

## Run it locally

```bash
npm install
cp .env.example .env.local
# add your real ANTHROPIC_API_KEY to .env.local
npm run dev
```

Open http://localhost:3000, click "Load demo transcript" to try the editor
immediately, or upload your own audio/video file to test playback sync (the
transcript won't auto-generate from it yet — add segments manually or wait on
the STT integration).

## Suggested next steps

1. Decide on Option A vs B in `STT_OPTIONS.md`, wire up real transcription
2. Add a database (matches the pattern from your website builder project —
   Prisma + Postgres) so transcripts persist and tie to a user account
3. Reuse the auth pattern from EvoTech AI (NextAuth) once accounts matter
