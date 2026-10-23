#!/usr/bin/env node
/*
  npm run add-phrase -- "What you want to say, in English"
                        [--context "who you'd say it to / when"] [--dry-run] [--yes]

  Pipeline (see "Adding phrases with Claude" in the README):
    1. MODEL  — runs Claude Code headless (`claude -p`) ONCE to draft a phrase entry.
                Tools are disabled, so the model can only answer; it can't touch files.
                --json-schema forces the answer into the exact shape we expect.
    2. CODE   — validateDraft() checks the draft (src/lib/phraseDraft.js).
                Rejected drafts stop here, with the reasons printed.
    3. YOU    — see the draft and approve it (skipped with --yes; nothing is written with --dry-run).
    4. CODE   — adds it to src/data/phrases.js, generates its audio (if the Python
                audio environment is set up), and runs the tests. If the tests fail,
                phrases.js is restored.

  The raw model reply is saved to scripts/.add-phrase-last.json, so when something goes
  wrong you can tell whether it was the model's answer or this code.
*/

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';
import { PHRASES } from '../src/data/phrases.js';
import { DRAFT_SCHEMA, SYSTEM_PROMPT, buildPrompt, insertIntoPhrasesFile, toSource, validateDraft } from '../src/lib/phraseDraft.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PHRASES_FILE = path.join(ROOT, 'src/data/phrases.js');
const LAST_REPLY = path.join(ROOT, 'scripts/.add-phrase-last.json');
const PYTHON = path.join(ROOT, '.venv-tts/bin/python');

function parseArgs(argv) {
  const args = { request: '', context: '', dryRun: false, yes: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--context') args.context = argv[++i] ?? '';
    else if (argv[i] === '--dry-run') args.dryRun = true;
    else if (argv[i] === '--yes') args.yes = true;
    else args.request = `${args.request} ${argv[i]}`.trim();
  }
  return args;
}

function fail(message) {
  console.error(`\n✖ ${message}`);
  process.exit(1);
}

/** Find the claude command (the installer puts it in ~/.local/bin, which may not be on PATH). */
function claudeCommand() {
  const local = path.join(os.homedir(), '.local/bin/claude');
  return spawnSync('claude', ['--version']).status === 0 ? 'claude' : existsSync(local) ? local : null;
}

/** Step 1: the model's only job. Returns the structured draft, or exits with a clear message. */
function askModel(request, context) {
  const claude = claudeCommand();
  if (!claude) fail('Claude Code (`claude`) is not installed. See the README section "Adding phrases with Claude".');

  const prompt = buildPrompt(request, PHRASES, context);
  console.log('Asking Claude for a draft… (this takes ~10–30 seconds)');
  const run = spawnSync(
    claude,
    [
      '-p',
      prompt,
      '--system-prompt', SYSTEM_PROMPT,
      '--json-schema', JSON.stringify(DRAFT_SCHEMA),
      '--output-format', 'json',
      '--tools', '', // no tools: the model only writes an answer
      '--no-session-persistence',
    ],
    // Run outside the project so Claude Code doesn't load this repo's CLAUDE.md as context.
    { cwd: os.tmpdir(), encoding: 'utf8', timeout: 180_000, maxBuffer: 10 * 1024 * 1024 },
  );

  if (run.error) fail(`Couldn't run Claude Code: ${run.error.message}`);
  writeFileSync(LAST_REPLY, run.stdout || run.stderr || '');
  let reply;
  try {
    reply = JSON.parse(run.stdout);
  } catch {
    fail(`Claude Code didn't return JSON (exit code ${run.status}). Are you signed in? Run \`claude\` once to check.\n${(run.stderr || run.stdout || '').slice(0, 500)}`);
  }
  if (reply.is_error || reply.subtype !== 'success') fail(`Claude Code reported an error: ${reply.result ?? reply.subtype}`);
  if (!reply.structured_output) fail('The model answered without a structured draft (see scripts/.add-phrase-last.json).');
  return reply.structured_output;
}

function show(phrase, warnings) {
  console.log('\n──────── Draft ────────');
  console.log(toSource(phrase));
  for (const w of warnings) console.log(`⚠ ${w}`);
  console.log('───────────────────────');
}

function run(cmd, args) {
  return spawnSync(cmd, args, { cwd: ROOT, stdio: 'inherit' }).status === 0;
}

async function main() {
  const { request, context, dryRun, yes } = parseArgs(process.argv.slice(2));
  if (!request) {
    fail('Tell me what you want to say, e.g.\n  npm run add-phrase -- "Where have you been?" --context "Lola asks when I get home"');
  }

  const draft = askModel(request, context);

  // Step 2: code checks.
  const { phrase, errors, warnings } = validateDraft(draft, PHRASES);
  if (errors.length) {
    fail(`The model's draft was rejected by the checks:\n  - ${errors.join('\n  - ')}\nNothing was changed. Try again, or rephrase your request.`);
  }
  show(phrase, warnings);

  if (dryRun) {
    console.log('\n--dry-run: nothing was written.');
    return;
  }

  // Step 3: your approval.
  if (!yes) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = (await rl.question('\nAdd this phrase to Usap Tayo? (y/N) ')).trim().toLowerCase();
    rl.close();
    if (answer !== 'y' && answer !== 'yes') {
      console.log('Okay, nothing was changed.');
      return;
    }
  }

  // Step 4: write, generate audio, test (and undo if the tests fail).
  const original = readFileSync(PHRASES_FILE, 'utf8');
  writeFileSync(PHRASES_FILE, insertIntoPhrasesFile(original, toSource(phrase)));
  console.log(`\n✔ Added "${phrase.tagalog}" (id: ${phrase.id}) to src/data/phrases.js`);

  run('node', ['scripts/export-tts-text.mjs']);
  if (existsSync(PYTHON)) {
    console.log('Generating audio for the new phrase…');
    if (!run(PYTHON, ['scripts/generate_tts.py', '--only', `phrase:${phrase.id}`])) {
      console.log('⚠ Audio generation failed; the phrase will show without a Listen button.');
    }
  } else {
    console.log('⚠ The audio environment (.venv-tts) isn\'t set up, so no audio was generated.');
    console.log('  Skipping the audio test for now; see "Regenerating the Tagalog audio" in the README.');
  }

  console.log('Running the tests…');
  const testArgs = existsSync(PYTHON) ? ['vitest', 'run'] : ['vitest', 'run', '--exclude', 'src/data/audio.test.js'];
  if (!run('npx', testArgs)) {
    writeFileSync(PHRASES_FILE, original);
    run('node', ['scripts/export-tts-text.mjs']);
    fail('Tests failed, so phrases.js was restored. Nothing was added.');
  }
  console.log(`\n🎉 Done! "${phrase.tagalog}" is in the app (flagged "Check with family").`);
  console.log('Next: ask a family member to check it, then commit:  git add -A && git commit -m "Add phrase: ' + phrase.tagalog + '"');
}

main();
