# Usap Tayo 🇵🇭

**Usap Tayo** ("Let's Talk") is a personal web app for learning practical, everyday Tagalog, the kind you use with family at the dinner table, on the phone with Lola, or when a Tita asks you something and you want to answer.

## Motivation

I'm Filipino, but I don't understand Tagalog well, and that makes it hard to talk with my family. Most language apps teach textbook Tagalog for travelers. I wanted something focused on **real family conversations**: greetings, asking whether someone has eaten, saying "I don't understand" or "please slow down," showing respect with *po* and *opo*, and the slang and Taglish people actually use.

Usap Tayo helps build a foundation. It won't make anyone fluent on its own; the real practice happens in conversation with family.

## Features

| Area | What it does |
| --- | --- |
| **Add phrases with Claude** | `npm run add-phrase -- "…"` drafts a new phrase with Claude Code, checks it in code, and adds it after you approve. See [Adding phrases with Claude](#adding-phrases-with-claude). |
| **Profile** | Optional name and "who are you learning for?" (asked once on first visit, editable anytime). Used for greetings like *Magandang hapon, Ana!*, a personalized *Ako po si Ana.* on the introduce-yourself phrase, and occasional motivation messages. The page also has a learning summary, daily goal, and reset (which keeps your profile). Saved only in this browser; no account. |
| **Home dashboard** | Time-of-day greeting in Tagalog (with your name), rotating motivational message, daily practice goal (progress ring), day streak, phrases known/practiced, review count, quiz average, phrase of the day, and quick links to every section. |
| **Phrase library** | 56 phrases across 9 categories (greetings, family, everyday, questions, food, feelings, household, slang, Taglish). Each has the Tagalog, English meaning, literal meaning where it helps, a pronunciation guide, an example sentence, usage notes, and a register label (Respectful / Neutral / Casual / Slang / Taglish). Search works in Tagalog or English. Filter by category or by progress status (new / review / known). |
| **Flashcards** | See the Tagalog → try to recall → reveal the meaning, pronunciation, and example → rate "Still learning" or "I know this." Decks: all, needs review, not yet marked, or any category. Shuffle, previous/skip, an end-of-deck summary, and an option to replay only the tricky cards. Keyboard shortcuts: `Space` reveal, `←`/`→` move, `1`/`2` rate. |
| **Quizzes** | Four modes: Mixed, Tagalog → English, English → Tagalog, and Matching. Instant feedback shows the correct answer and its pronunciation. Results screen with score and a list of missed questions. Missed phrases are **automatically added to Review**. Recent results are shown on the quiz page. |
| **Family conversations** | 8 realistic dialogues (greeting Lola, dinner table, asking Lolo to slow down, Taglish weekend plans with a cousin, thanking Mom, and more). English is hidden by default: reveal it line by line, "Reveal next," or all at once. Pronunciation can be toggled. Each dialogue ends with a cultural tip and links to its key phrases. |
| **Pronunciation** | Every phrase and dialogue line has a written guide with the stressed syllable in **CAPS** (highlighted in red). **Family recordings:** tap 🎤 *Record* on any phrase or conversation line, have a family member say it, and the ♥ *Family* button plays their voice back from then on. Recordings are stored only in your browser (IndexedDB). When there's no recording, *Listen* plays pre-generated audio from **Meta's MMS Tagalog model**, a free, open-source voice trained on Tagalog. Each clip is generated several times and **Whisper** (a free speech recognizer) picks the clearest take; clips that stay unclear are left out. The Guide page explains vowels, the *ng* sound, glottal stops, and *po/opo*. |
| **Review** | Everything marked "Review" (or missed in a quiz) in one place, with shortcuts to study it as flashcards or take a quiz on it. Known phrases are listed in a collapsible section. |
| **Progress saving** | Saved automatically in the browser's `localStorage`, so it survives refreshes and restarts. No account, no server. Reset is available on the Profile page (with confirmation). |
| **Design & accessibility** | Warm cream / deep green / Filipino-flag red and gold palette, responsive layout (top nav on desktop, bottom tab bar on mobile), visible keyboard focus, skip link, labelled controls, `lang="tl"` on Tagalog text, `aria-live` feedback, and `prefers-reduced-motion` support. Text colours meet WCAG AA contrast. |

## Tech stack

- **[React 19](https://react.dev)**: UI components
- **[Vite](https://vite.dev)**: dev server and build tool
- **[Vitest](https://vitest.dev)**: unit tests
- Plain CSS with CSS variables (no UI framework)
- Browser APIs: `localStorage` (progress), IndexedDB + `MediaRecorder` (family recordings), and the Web Speech API (`speechSynthesis`, last-resort fallback)
- **[MMS-TTS Tagalog](https://huggingface.co/facebook/mms-tts-tgl)** (Meta AI, CC-BY-NC 4.0), used offline by a Python script to pre-generate the audio in `public/audio/tts/`, with **[Whisper](https://huggingface.co/openai/whisper-small)** (OpenAI, MIT license) scoring each take. The app itself doesn't need Python; the audio files are shipped with it.

There are only **two runtime dependencies** (`react`, `react-dom`). Routing is a tiny hash-based router (`src/hooks/useHashRoute.js`), icons are inline SVG, and fonts load from Google Fonts with a system-font fallback when offline. There's no backend, no API keys, and no paid services.

## Getting started

**Requirements:** [Node.js](https://nodejs.org) 20 or newer (developed with Node 24) and npm.

```bash
npm install
```

```bash
npm run dev
```

Then open the URL Vite prints (usually <http://localhost:5173>).

Other commands:

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server with hot reload |
| `npm test` | Run all unit tests once |
| `npm run test:watch` | Re-run tests as you edit |
| `npm run build` | Create an optimized production build in `dist/` |
| `npm run preview` | Serve the production build locally to check it |

## Project structure

```
src/
  data/            ← all learning content (edit these to add/fix phrases)
    phrases.js         56 phrases, with a header explaining every field
    conversations.js   8 family dialogues
    categories.js      category list + register labels
  lib/             ← plain JavaScript logic (no React), unit-tested
    progress.js        progress model, localStorage load/save, streak & stats
    quiz.js            quiz generation (distractors, matching rounds)
    search.js          library search & filters
    speech.js          text-to-speech helpers and voice selection
    recordings.js      IndexedDB storage for family voice recordings
public/audio/tts/  ← generated Tagalog audio (.m4a) + manifest.json
scripts/
  export-tts-text.mjs  writes the text of every phrase/line to tts-text.json
  generate_tts.py      turns that text into audio (MMS), keeping the take Whisper understands best
  context/         ← shared state for all pages
    ProgressContext.jsx  saved progress + actions (mark known, record quiz…)
    SpeechContext.jsx    available voices + speak()
    RecordingsContext.jsx  record / play / delete family recordings
  hooks/useHashRoute.js  tiny router (#/phrases, #/talk/greeting-lola…)
  components/      ← reusable UI (PhraseCard, SpeakButton, quiz widgets…)
  pages/           ← one file per screen
  App.jsx          ← layout, navigation, picks the page for the URL
  styles.css       ← all styles; colours are variables at the top
```

### Editing the content

All phrases live in `src/data/phrases.js` and all dialogues in `src/data/conversations.js`. The comment at the top of each file explains every field. After editing, run `npm test`: the data tests catch missing fields, duplicate ids, unknown categories, and conversation key-phrases that point to phrases that don't exist.

> ⚠️ Don't rename a phrase's `id` after you've started using the app. Saved progress is keyed by id, so the old progress would be orphaned.

To flag something you're unsure about, add a `verify: '…'` note to a phrase or dialogue line. It shows up in the app as **"Check with family."**

### Regenerating the Tagalog audio

If you add or edit phrases, `npm test` will report missing or out-of-date audio. To regenerate (macOS, Python 3.10+, about 1 GB of downloads the first time):

```bash
python3 -m venv .venv-tts && .venv-tts/bin/pip install torch transformers numpy
```

```bash
node scripts/export-tts-text.mjs && .venv-tts/bin/python scripts/generate_tts.py
```

The full run takes roughly 20–30 minutes; `--only phrase:salamat,phrase:ingat` redoes specific clips. The script uses macOS's built-in `afconvert` to make small `.m4a` files; on other systems, swap that step for `ffmpeg`.

**How it picks a take.** Testing found two quirks in the MMS Tagalog model:
1. The letter **"a" shares its internal id with the blank marker** placed between letters, so a word-initial "a" tends to vanish ("ako" came out as "ko"). The script also tries the sentence with that "a" doubled, which brings it back.
2. **Output varies a lot by random seed, and single isolated words are often garbled.** The script tries up to 6 seeds × 2 spellings per sentence. Lines are split only at `.`, `?` and `!`, and one-word sentences ("Eto.", "Sige!") are merged into their neighbour, because a lone word comes out garbled. Very short entries (Nanay/Tatay, Ingat…) use a short carrier phrase via the phrase's `spoken` field, shown in the app as "Audio says: …".

Whisper transcribes every take and the closest match to the real text wins. `manifest.json` records each clip's `score`, what Whisper `heard`, and a `quality` of `ok` or `low`. **Low clips (score < 0.70) aren't played in the app.** Whisper is only a rough judge, so if a clip still sounds wrong to you, record a family member for that phrase.

## Adding phrases with Claude

When you hear something at home that you want to learn, a script asks Claude to draft a full phrase entry, checks it, and adds it once you approve:

```bash
npm run add-phrase -- "Where have you been?" --context "what Lola asks when I get home late"
```

Options: `--context "…"` (who you'd say it to, or when), `--dry-run` (show the draft without changing anything), `--yes` (skip the approval question).

### What the model does, and what the code checks

The model's part is deliberately small: **one** headless Claude Code call (`claude -p`) per phrase. Its tools are disabled (`--tools ""`), so it can only write an answer and can't touch your files.

| Step | Who | What |
| --- | --- | --- |
| 1. Draft | **Model** (Claude, via `claude -p`) | Writes the Tagalog, English meaning, literal meaning, pronunciation guide, example, usage note, register, and category, plus anything it's unsure about. `--json-schema` forces the answer into this exact shape. |
| 2. Check | **Code** (`validateDraft` in `src/lib/phraseDraft.js`) | Required fields present; lengths within limits; the Tagalog is one phrase (no `( ) / ;` alternatives or digits); the pronunciation uses the app's format with a CAPS stressed syllable; the category and register are real ones; not a duplicate of an existing phrase; a unique id is generated. **Every draft is flagged "Check with family"**, with the model's own uncertainty note included. |
| 3. Approve | **You** | The draft is shown in full. Nothing is written unless you answer `y`. |
| 4. Save | **Code** (`scripts/add-phrase.mjs`) | Inserts the entry into `src/data/phrases.js`, generates its audio (if `.venv-tts` is set up), and runs all the tests. **If any test fails, `phrases.js` is restored.** |

**When something goes wrong, you can tell whose fault it was:**
- **A rejected draft** ("The model's draft was rejected by the checks: …") means the model's answer broke a rule, and the reason is printed.
- **A crash or stack trace** means a bug in the code.
- **Wrong Tagalog that passes the checks** means the model was wrong in a way code can't detect. That's why every entry is flagged for a native speaker to check.

The raw reply from the last run is saved to `scripts/.add-phrase-last.json` (ignored by Git) for debugging.

**Real examples from testing:**
- The model once returned `"Salamat (more polite/formal: Salamat po…)"` in the Tagalog field; the "one phrase" rule rejects that.
- A first draft's usage note was 449 characters and was rejected (limit 400). After that, the limits were added to the JSON schema so the model knows them up front.
- Two runs of the same request gave different stress for *galing* ("gah-LEENG" vs "GAH-leeng"). The checks can't catch that, which is why every entry is flagged.

### Setup and cost

- Needs **Claude Code** installed and signed in with your Claude account (`claude --version` should work). The script also finds it in `~/.local/bin` if that folder isn't on your PATH.
- It runs on your Claude Code access, so there's no API key and no separate API bill. Each phrase is one short request.

## Testing

### Automated

```bash
npm test
```

There are 110 unit tests in 7 files:

- `src/lib/progress.test.js`: saving/loading (including corrupted data, full storage, and storage being unavailable), practice counts, status changes, quiz history, streaks (including month boundaries), and stats
- `src/lib/quiz.test.js`: every phrase gets 4 unique options containing the answer, look-alike meanings (e.g. the two "How are you?" phrases) never compete, no repeated questions, tiny review pools, and valid matching rounds
- `src/lib/search.test.js`: accent/punctuation-insensitive search, word-start matching, and category/status filters
- `src/lib/speech.test.js`: Tagalog voice detection and fallback-voice priority
- `src/lib/recordings.test.js`: recording keys and microphone error messages
- `src/lib/phraseDraft.test.js`: checking model drafts (rejecting bad shapes, alternatives, duplicates, bad pronunciation format), id generation, and safely inserting into `phrases.js`
- `src/data/data.test.js`: content integrity for every phrase and conversation
- `src/data/audio.test.js`: every phrase and line has generated audio, the audio matches the current text, and the files exist

`npm run build` also acts as a compile check.

### Manual checklist

These were checked by driving the app in a browser during development. Re-check them after big changes:

1. **Library:** search "eat" (should find *Kumain ka na?* and *Kain tayo!* but not words like "repeat"), filter by a category, open "Example & when to use it," and toggle Review/Known.
2. **Flashcards:** reveal with the button and with `Space`, rate with buttons and with `1`/`2`, switch decks, finish a deck, and open the Review deck when it's empty.
3. **Quiz:** run each of the four modes, answer something wrong on purpose, check the results screen, and confirm missed phrases appear on the Review page.
4. **Conversations:** use "Reveal next," reveal single lines, toggle Pronunciation, and click "I practiced this."
5. **Persistence:** mark a few phrases, refresh, then close and reopen the browser. Progress, streak, and quiz history should remain.
6. **Recordings:** on a phrase, tap 🎤 Record, allow the microphone, say the phrase, and tap stop. ♥ Family should play it back, and it should still be there after a refresh. Try Re-record and the 🗑 delete button. The Guide page shows the recording count.
7. **Mobile:** use your browser's device toolbar (~375px wide). The bottom tab bar should be visible, with no sideways scrolling.
8. **Keyboard only:** Tab through each page. Every control should show a green focus ring.
9. **Profile:** in a fresh browser (or after clearing site data), the Home page should ask for your name. Save one, check the greeting and header, edit it on the Profile page, refresh, and confirm it's kept.
10. **Reset:** Profile → Reset all progress → confirm. The dashboard should return to zero, while your name stays.

## Known limitations

- **Content has not been reviewed by a native speaker.** The phrases aim to be natural, everyday Tagalog, but they were written without a native-speaker review. Items where stress placement was uncertain are flagged "Check with family" (4 phrases and 2 dialogue lines). Regional and family variation is real: when relatives say it differently, follow them.
- **Pronunciation guides are approximations.** English spelling can't capture Tagalog sounds exactly. In particular, glottal stops (e.g. the end of *hindî*) are mentioned in notes but not marked consistently.
- **The Tagalog audio is still a computer voice.** It can't see punctuation, so questions don't rise in pitch, and stress may be off. After user testing found clipped words ("Ako si", "Ate / Kuya", "Ingat"), every clip was regenerated with Whisper picking the clearest take, but Whisper is an imperfect judge of Tagalog, so some clips may still sound off. **Family recordings remain the most accurate option.**
- **The MMS model license is non-commercial (CC-BY-NC 4.0).** That's fine for this personal/class project, but the generated audio couldn't be used in a commercial app.
- **Device voices are a last resort.** macOS has no Filipino voice, and a non-Filipino voice reads Tagalog with the wrong sounds, so the "stand-in voice" stays off unless you enable it in the Guide. It's only used for text without generated audio.
- **Recordings stay on one browser.** They're stored in IndexedDB, aren't synced or backed up, and clearing site data deletes them. Each recording is capped at 15 seconds.
- **Microphone recording was tested with a simulated mic.** The development browser blocks real microphones, so record → save → reload → play → delete was verified with a generated tone. Recording a real voice should be checked by hand (manual checklist step 6).
- **Progress is per-browser.** `localStorage` is not synced between devices or browsers, and clearing site data erases it. Private/incognito windows may not keep it; the app shows a warning if saving fails.
- **Spaced repetition is simple.** Phrases are just "known," "review," or unmarked. There's no scheduling algorithm (like Anki's) yet.
- **No speech recognition.** The app can't listen to you and grade your pronunciation.
- **Fonts** load from Google Fonts. Offline, the app falls back to system fonts and still works.

## Ideas for the future

- Native-speaker review pass of the written content
- Export/import family recordings so they can move between devices
- Spaced-repetition scheduling for flashcards
- "Add your own phrase" form for words learned from family
- Export/import progress as a file (to move between devices)
- More conversations: phone calls, celebrations, church, visiting the Philippines

---

*Salamat sa paggamit!* (Thanks for using it!)
