# Usap Tayo: notes for Claude Code

Personal Tagalog-learning web app (React 19 + Vite, plain CSS). No backend; progress lives in `localStorage`.

## Commands
- `npm run dev`: dev server (http://localhost:5173)
- `npm test`: Vitest unit tests (must pass)
- `npm run build`: production build (also a compile check)

## Architecture
- `src/data/`: ALL learning content. `phrases.js` and `conversations.js` have header comments documenting each field. Content changes should only touch these files.
- `src/lib/`: pure JS logic with tests next to it (`*.test.js`). Keep React out of here.
  - `progress.js`: immutable updates. Every function returns a new progress object. Storage key `usapTayo.progress.v1`.
  - `quiz.js`: `baseMeaning()` prevents look-alike answers (e.g. "How are you? (casual)" vs "(respectful)") from appearing together.
- `src/context/`: `ProgressContext` (progress + actions, auto-saves), `SpeechContext` (voices, `speak()`, `canSpeak`), `RecordingsContext` (family recordings in IndexedDB via `src/lib/recordings.js`).
- Audio: use `components/AudioControls.jsx` everywhere. Priority: family recording → pre-generated MMS Tagalog audio (`public/audio/tts/manifest.json`, keyed like `phrase:<id>` / `line:<convo>:<i>`) → Filipino device TTS → opt-in stand-in voice (`progress.standInVoice`, off by default).
- After editing phrase/line text, regenerate audio: `node scripts/export-tts-text.mjs && .venv-tts/bin/python scripts/generate_tts.py`. `src/data/audio.test.js` fails if audio is missing or stale.
- `src/hooks/useHashRoute.js`: hash router. Routes: `#/`, `#/phrases`, `#/cards?deck=`, `#/quiz?topic=`, `#/talk`, `#/talk/:id`, `#/review`, `#/guide`, `#/profile`.
- Profile lives in `progress.profile` (`name`, `learningFor`, `welcomed`) and is updated via `updateProfile()`. Reset keeps profile and settings. No accounts: profile is local only.
- `src/styles.css`: one stylesheet. Colour tokens at the top. Mobile nav becomes a fixed bottom bar at ≤860px.

## Model inside the app (Artifact 3)
- `npm run add-phrase -- "…"` (`scripts/add-phrase.mjs`) calls `claude -p` once with tools disabled and `--json-schema` (`DRAFT_SCHEMA`). The model only drafts; `validateDraft()` in `src/lib/phraseDraft.js` checks everything mechanical, and every draft gets a `verify` flag. Keep this split: new checks go in `validateDraft` (with tests), not in the prompt alone.

## Rules
- The owner handles ALL git/GitHub operations. Do not run git commands, commit, push, or deploy.
- `DEVELOPMENT_LOG.md` is kept by Claude Code at the owner's request: add dated, factual entries for notable changes. Never invent history or write the owner's personal reflections.
- Keep code beginner-readable: short comments explaining *why*, no unnecessary dependencies.
- Language content: never present uncertain Tagalog as fact. Add a `verify` note instead. Pronunciation guides use CAPS for the stressed syllable.
- Phrase/conversation `id`s are persisted in users' progress. Don't rename them.
- Don't put `backdrop-filter` on an ancestor of the mobile nav (it breaks `position: fixed`).
- Focus styles use `outline`, not `box-shadow` (component shadows would override them).
