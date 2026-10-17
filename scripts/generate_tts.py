"""
Generate Tagalog audio files with Meta's free, open-source MMS-TTS model
(facebook/mms-tts-tgl), and use OpenAI's free Whisper speech recognizer to
pick the clearest take. Runs entirely on your computer, no API key needed.

Why the extra steps? Two quirks of this model, found by testing:
  1. In its alphabet the letter "a" has the same id (0) as the "blank" marker
     inserted between letters, so a word-initial "a" tends to vanish
     ("ako" came out as "ko"). Writing it doubled ("aako") brings it back.
  2. Output varies a lot between random seeds, and very short inputs often
     come out garbled.
So each sentence is generated several ways (seeds x spelling variants), Whisper
transcribes every take, and the take closest to the real text wins. If no take
is clear enough, the clip is marked "low" quality and the app won't play it.

This is still a computer voice: it can't see punctuation (questions don't rise),
and Whisper is only a rough judge. Family recordings always take priority.

Licenses: MMS-TTS is CC-BY-NC 4.0 (non-commercial). Whisper is MIT.

Usage (from the project folder):
    node scripts/export-tts-text.mjs                 # refresh the text list
    .venv-tts/bin/python scripts/generate_tts.py     # generate everything (~15-30 min)
    .venv-tts/bin/python scripts/generate_tts.py --only phrase:salamat,phrase:ingat
"""

import argparse
import difflib
import json
import os
import re
import subprocess
import tempfile
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
os.environ.setdefault("HF_HOME", str(ROOT / ".venv-tts" / "hf-cache"))

import numpy as np  # noqa: E402
import torch  # noqa: E402
from transformers import AutoTokenizer, VitsModel, pipeline  # noqa: E402

TTS_MODEL = "facebook/mms-tts-tgl"
ASR_MODEL = "openai/whisper-small"
SEEDS = [7, 1, 2, 3, 4, 5]
GOOD_ENOUGH = 0.92  # stop trying more takes once a take scores this well
MIN_QUALITY = 0.70  # below this, the clip is marked "low" and not played in the app
PAUSE_SECONDS = 0.35  # silence between sentences
EDGE_SECONDS = 0.25  # silence at the start/end so speakers don't swallow the first sound


def file_name(key: str) -> str:
    """'line:greeting-lola:2' -> 'line--greeting-lola--2.m4a' (colons aren't safe in file names)."""
    return key.replace(":", "--") + ".m4a"


def sentences(text: str) -> list[str]:
    """
    Split into sentences (at . ? ! only), keeping only characters the model knows.
    Commas and ellipses don't split: a lone word like "Ma," or "Eto." comes out
    garbled, so one-word sentences are also merged into their neighbour.
    """
    text = text.replace("’", "'").replace("‘", "'").replace("…", " ").replace("—", " ")
    cleaned = []
    for part in re.split(r"[.?!]+", text):
        part = re.sub(r"[^a-zA-ZñÑ' \-]", " ", part).lower()
        part = re.sub(r"\s+", " ", part).strip(" -'")
        if part:
            cleaned.append(part)
    merged = []
    for part in cleaned:
        if merged and len(merged[-1].split()) < 2:
            merged[-1] = f"{merged[-1]} {part}"  # previous sentence was a single word
        else:
            merged.append(part)
    if len(merged) > 1 and len(merged[-1].split()) < 2:
        last = merged.pop()  # last sentence was a single word
        merged[-1] = f"{merged[-1]} {last}"
    return merged


def spelling_variants(sentence: str) -> list[str]:
    """The sentence as written, plus a version that doubles a word-initial "a" (see quirk 1)."""
    variants = [sentence]
    doubled = re.sub(r"(^| )a", r"\1aa", sentence)
    if doubled != sentence:
        variants.append(doubled)
    return variants


def letters(text: str) -> str:
    """Lowercase letters only, so 'Si Nanay at si Tatay.' and 'sinanayat si tatay' compare fairly."""
    return re.sub(r"[^a-zñ]", "", text.lower())


def similarity(heard: str, target: str) -> float:
    return difflib.SequenceMatcher(None, letters(heard), letters(target)).ratio()


class Generator:
    def __init__(self):
        print(f"Loading {TTS_MODEL} and {ASR_MODEL}…")
        self.tts = VitsModel.from_pretrained(TTS_MODEL)
        self.tok = AutoTokenizer.from_pretrained(TTS_MODEL)
        self.rate = self.tts.config.sampling_rate
        self.asr = pipeline("automatic-speech-recognition", model=ASR_MODEL)

    def synth(self, text: str, seed: int) -> np.ndarray:
        torch.manual_seed(seed)  # the model is random; a fixed seed makes each take repeatable
        with torch.no_grad():
            return self.tts(**self.tok(text, return_tensors="pt")).waveform[0].numpy()

    def hear(self, audio: np.ndarray) -> str:
        pad = np.zeros(int(self.rate * 0.3), dtype=np.float32)
        x = np.concatenate([pad, normalize(audio), pad])
        result = self.asr(
            {"raw": x, "sampling_rate": self.rate},
            generate_kwargs={"language": "tagalog", "task": "transcribe"},
        )
        return result["text"].strip()

    def best_take(self, sentence: str):
        """Try seeds x spellings; return (audio, score, what Whisper heard, settings)."""
        best = None
        for seed in SEEDS:
            for variant in spelling_variants(sentence):
                audio = self.synth(variant, seed)
                heard = self.hear(audio)
                score = similarity(heard, sentence)
                if best is None or score > best[1]:
                    best = (audio, score, heard, {"seed": seed, "text": variant})
            if best[1] >= GOOD_ENOUGH:
                break
        return best

    def item(self, text: str):
        pause = np.zeros(int(self.rate * PAUSE_SECONDS), dtype=np.float32)
        edge = np.zeros(int(self.rate * EDGE_SECONDS), dtype=np.float32)
        chunks, scores, heard_all = [edge], [], []
        for sentence in sentences(text):
            audio, score, heard, _ = self.best_take(sentence)
            chunks += [normalize(audio), pause]
            scores.append(score)
            heard_all.append(heard)
        chunks[-1] = edge  # replace the final pause with edge silence
        return np.concatenate(chunks), (min(scores) if scores else 0.0), " | ".join(heard_all)


def normalize(audio: np.ndarray) -> np.ndarray:
    peak = np.max(np.abs(audio)) or 1.0
    return (audio / peak * 0.9).astype(np.float32)


def write_m4a(audio: np.ndarray, rate: int, out_path: Path) -> None:
    """Save as WAV, then use macOS's built-in afconvert to make a small AAC (.m4a) file."""
    pcm = (np.clip(audio, -1, 1) * 32767).astype(np.int16)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        wav_path = tmp.name
    try:
        with wave.open(wav_path, "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(rate)
            w.writeframes(pcm.tobytes())
        subprocess.run(
            ["afconvert", "-f", "m4af", "-d", "aac", "-b", "48000", wav_path, str(out_path)],
            check=True,
        )
    finally:
        os.remove(wav_path)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--only", help="comma-separated keys to (re)generate; others in the manifest are kept")
    parser.add_argument("--out", default=str(ROOT / "public" / "audio" / "tts"), help="output folder")
    args = parser.parse_args()

    items = json.loads((ROOT / "scripts" / "tts-text.json").read_text())
    if args.only:
        wanted = set(args.only.split(","))
        items = [i for i in items if i["key"] in wanted]
        missing = wanted - {i["key"] for i in items}
        if missing:
            raise SystemExit(f"Unknown keys: {', '.join(sorted(missing))}")

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    manifest_path = out / "manifest.json"
    manifest = json.loads(manifest_path.read_text()) if (args.only and manifest_path.exists()) else {}

    gen = Generator()
    for n, item in enumerate(items, 1):
        audio, score, heard = gen.item(item["text"])
        name = file_name(item["key"])
        write_m4a(audio, gen.rate, out / name)
        quality = "ok" if score >= MIN_QUALITY else "low"
        # `text` lets a test spot stale audio; `score`/`heard` show how clear Whisper found it.
        manifest[item["key"]] = {"file": name, "text": item["text"], "score": round(score, 2), "quality": quality, "heard": heard}
        flag = "" if quality == "ok" else "   <-- LOW, won't be played"
        print(f"[{n}/{len(items)}] {score:.2f} {item['key']}: {item['text']!r} heard {heard!r}{flag}", flush=True)
        manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")  # save as we go

    low = [k for k, v in manifest.items() if v["quality"] == "low"]
    print(f"Done. {len(manifest) - len(low)} clips ok, {len(low)} low quality: {', '.join(low) or 'none'}")


if __name__ == "__main__":
    main()
