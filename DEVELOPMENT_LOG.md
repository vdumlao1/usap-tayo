# Development Log — Usap Tayo

> **About this log:** Written by Claude Code (the AI agent that built the app) at the owner's request, as the assignment allows. It records what was planned, what was built, and what changed, based on the actual development sessions. Personal reflections are the owner's and live in the portfolio card, not here.

**Project:** Usap Tayo ("Let's Talk"), a personal web app for learning practical Tagalog to talk with family.
**Course:** TCSS490, Artifact 2.
**Built with:** Claude Code. The owner directed the work, tested the app, and gave feedback; the agent wrote the code and content.

---

## The plan (2026-10-15)

The owner asked for a small, polished app they'd keep using after the assignment, with:

- a phrase library (30–50 family-focused phrases with translations, pronunciation guides, examples and usage notes), flashcards, quizzes, family conversations, pronunciation support, and progress saved in `localStorage`
- warm cream / deep green / Filipino-flag red design, mobile-friendly and accessible
- **no** backend, accounts, paid services or API keys
- honest Tagalog content: uncertain items flagged, pronunciation treated as approximate

Ground rules: the owner handles all Git/GitHub work, and (at first) writes their own log.

## Decisions

| Decision | Why |
| --- | --- |
| React + Vite, Vitest for tests | Common beginner-friendly stack; fast dev server |
| Only 2 runtime dependencies (`react`, `react-dom`) | Kept the code easy to understand |
| A hand-written hash router (`useHashRoute.js`) instead of a router library | Refreshing keeps you on the page, and no server config is needed |
| All content in plain data files (`src/data/`) | The owner can fix phrases without touching UI code |
| Logic as pure functions in `src/lib/` | Easy to unit test |

## Day 1: building the app (2026-10-15)

**Built:** Home dashboard (daily goal ring, streak, stats, phrase of the day), Phrase Library (56 phrases, 9 categories, search and filters), Flashcards (decks, reveal, rate, keyboard shortcuts), Quiz (Mixed, Tagalog→English, English→Tagalog, Matching; missed phrases go to Review), 8 family conversations with line-by-line translation reveal, a Review page, and a Guide page.

**Content:** 56 phrases and 8 dialogues, written from the agent's knowledge, not checked by a native speaker. Uncertain stress placements are flagged "Check with family."

**Testing found and fixed:**
- Search for "eat" matched "gr**eat**" and "rep**eat**" → changed to match word starts.
- On phones, the bottom tab bar appeared at the top of the screen. Cause: the header's `backdrop-filter` changes how `position: fixed` works for anything inside it.
- Keyboard focus rings were invisible on many cards and buttons, because their own `box-shadow` overrode the focus style → switched to `outline`.
- One text colour failed contrast (4.38:1 vs the required 4.5:1) → darkened.
- Smaller fixes: the stats row wrapped awkwardly, a double period in quiz feedback, no `<h1>` on the "not found" page, and an error boundary added so a crash shows a message instead of a blank screen.

**Audio, first attempt:** the Mac has no Filipino text-to-speech voice, so the app fell back to an Indonesian voice.

## Owner feedback: "the audio doesn't sound right"

The owner pointed out that the written guide was right (e.g. "mah-BOO-tee nah-MAHN") but the audio sounded completely wrong. The Indonesian voice was reading Tagalog spelling with Indonesian sounds.

**Changes:**
- The stand-in computer voice became **off by default** (opt-in on the Guide page).
- Added **family recordings**: record a relative saying any phrase or line, stored in the browser (IndexedDB), with Record / Play / Re-record / Delete. Tested with a simulated microphone, because the test browser blocks real ones.

## Day 2: a real Tagalog voice (2026-10-16)

The owner asked whether their dad's voice could be cloned for all the audio. The agent explained that cloning copies how a voice sounds, not its pronunciation, and that the free cloning tools don't support Tagalog, then suggested two alternatives. The owner chose **option 2**: Meta's free MMS Tagalog model, generating audio files once on the laptop.

1. Generated 8 samples first; the owner listened and approved them.
2. Generated all 104 clips (56 phrases and 48 conversation lines) and added them to the app. A test now fails if any audio is missing or out of date.

**Owner feedback: some clips sound wrong** ("Nanay/Tatay", "Ate/Kuya", "Ingat", "Ako si"). Investigating found:
- In the model's alphabet, the letter **"a" has the same internal id as the "blank" marker** placed between letters, so word-initial "a" disappeared ("ako si ana" was heard as "Kosiana").
- The model garbles very short, single-word inputs, and its output varies a lot between random seeds.

**Fix:**
- Used OpenAI's free **Whisper** speech recognizer as an automatic judge: each sentence is generated in up to 12 versions (6 seeds × 2 spellings, one of which doubles a word-initial "a"), and the version Whisper hears most accurately is kept.
- Short entries now speak a short phrase instead ("Si Nanay at si Tatay."), shown in the app as "Audio says: …".
- Silence was added at the start and end of each clip, so speakers don't cut off the first sound.
- Clips that are still unclear are marked low quality and **not played**.
- First result: 80 of 104 clips passed.

**Other requests:**
- The Phrase Library's topic buttons looked messy → replaced with a dropdown.
- Added a **profile**: an optional name (asked on first visit) and "who are you learning for?". These personalize greetings and give a personal "Ako po si ___" line. Saved locally only; no account.

## Getting ready to submit (2026-10-16)

- The project had been built in a temporary folder and was moved to `~/Usap Tayo`. The first folder chosen had a hidden trailing space in its name that the tools couldn't handle; the owner renamed it.
- Fixed a bug in the audio generator: it split lines at commas, creating one-word pieces ("Ma,", "Eto,") that the model garbled. It now splits only at sentence ends and merges one-word sentences. **100 of 104 clips now pass.** Still left out: "Oo / Opo", "Mano po, Lola.", and two of Lolo's slow-speech lines.
- Final checks: 112 unit tests pass and the production build works.

## Process notes

- **The repository was created at the end, not the start.** The assignment asks for a repository from the beginning with commits along the way. This project was built in a temporary folder without Git, and the first commit was made on 2026-10-16 when the project was finished. Committing from the start would have allowed rolling back during the audio experiments.
- **Listening by a person caught what automated checks missed.** The early audio passed every automated test but sounded wrong to the owner, twice. Both times the owner's report led to finding the real cause.

## Known limitations (current)

- The content hasn't been reviewed by a native speaker.
- The generated audio is still a computer voice: questions don't rise in pitch, and some stress may be off. Whisper is only a rough judge.
- Progress, profile and recordings are stored per browser and aren't synced or backed up.
- See the README's "Known limitations" section for the full list.

---

# Artifact 3: a model inside the app

## The plan (2026-10-23)

Artifact 3 requires a model doing real work every time it runs, with a small, clear model part. The owner chose to extend Usap Tayo. Options considered:
- **A Claude API chat partner in the app:** rejected, because API calls bill separately and aren't covered by the class's Claude Code access.
- **A Claude Code skill:** viable, but the line between model and code is blurrier.
- **A headless `claude -p` pipeline:** chosen. It runs on the existing access, and the model's job is a single input → output step.

**Feature:** `npm run add-phrase -- "English phrase" --context "…"`. Claude drafts a full phrase entry; code checks it; the owner approves; code saves it, generates audio, and runs the tests.

## Setup

- Claude Code's command-line tool wasn't installed (the owner had been using the desktop app). The owner installed it with the official installer, added `~/.local/bin` to their PATH, and signed in.
- Signing in failed twice when `claude` was run from the chat's command box, which can't take keyboard input. It worked in a real terminal tab.

## Built

- `src/lib/phraseDraft.js` (pure functions, unit-tested): the JSON schema sent to the model, the prompt, `validateDraft()`, id generation, and safe insertion into `phrases.js`.
- `scripts/add-phrase.mjs`: runs `claude -p` with tools disabled and `--json-schema`, outside the repo so the project's CLAUDE.md isn't loaded as context. Saves the raw reply for debugging, then asks for approval, writes the file, generates audio, runs the tests, and restores `phrases.js` if any test fails.
- The README and CLAUDE.md now document exactly what the model does vs. what the code checks.

## What testing showed

1. **A probe call** asking for "thank you" returned `"Salamat (more polite/formal: Salamat po…)"` in a single field. This led to the "one phrase only" check.
2. **The first dry run was rejected by the checks:** the usage note was 449 characters (limit 400). The draft itself was good; the model had simply never been told the limit. Fix: `maxLength` added to the JSON schema, and the limit stated in the prompt.
3. **Second dry run:** passed. Notably, the model gave a different stress for *galing* than in the first run (GAH-leeng vs gah-LEENG), and noted it was unsure. Mechanical checks can't catch this kind of error, so every model-drafted phrase is flagged "Check with family".
4. **A full run in a throwaway copy of the project** first failed the tests, because the unit tests used the real phrase list and "Saan ka galing?" was now a duplicate. The safety net worked: `phrases.js` was restored automatically. The tests now use a fixed sample library. The rerun passed: the phrase was added, its audio was generated (Whisper heard "Sankagaling", score 0.96), and all 126 tests passed.
5. **Answering "no" at the approval step** left `phrases.js` unchanged.
6. The owner's real `phrases.js` was not modified during testing, so the first real phrase is the owner's to add.

**State:** 125 tests pass (8 files); the build works.

## First real use (2026-10-23)

The owner ran `npm run add-phrase` and approved Claude's draft: **"Magkano po ito?"** ("How much does this cost?"). It was added to Questions & Answers, flagged "Check with family". Claude's uncertainty note says "ito" is often shortened to "'to". Its audio was generated automatically (Whisper heard "Magkano po hito?", score 0.96), and the tests passed. The owner committed it separately from the pipeline code.
