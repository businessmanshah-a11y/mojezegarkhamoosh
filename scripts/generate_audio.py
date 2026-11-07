#!/usr/bin/env python3
"""
Audiobook Generator for 'معجزه‌گر خاموش' using Gemini 3.8 Flash TTS
Generates pristine page-by-page spoken audio with speaker 'Bodi' and encodes to lightweight 128kbps MP3.
"""

import os
import sys
import json
import re
import base64
import struct
import argparse
import time
import subprocess
import urllib.request
import urllib.error

# Resolve script directory and root directory
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
OUTPUT_DIR = os.path.join(ROOT_DIR, "assets", "audio", "pages")
MANIFEST_PATH = os.path.join(OUTPUT_DIR, "manifest.json")
ENV_FILE = os.path.join(ROOT_DIR, ".env")
PAGES_JSON = os.path.join(ROOT_DIR, "data", "transcription_cache.json")


def load_env():
    """Load environment variables from .env file if present."""
    if os.path.exists(ENV_FILE):
        with open(ENV_FILE, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    if key and not os.environ.get(key):
                        os.environ[key] = val


def get_api_key():
    """Retrieve Gemini API key from environment or fallback."""
    load_env()
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        print("ERROR: GEMINI_API_KEY not found in environment or .env file.")
        sys.exit(1)
    return key


def load_book_pages():
    """Loads all 241 pages from transcription cache or js data."""
    if os.path.exists(PAGES_JSON):
        with open(PAGES_JSON, "r", encoding="utf-8") as f:
            return json.load(f)
    
    js_file = os.path.join(ROOT_DIR, "assets", "js", "book-pages-data.js")
    if os.path.exists(js_file):
        with open(js_file, "r", encoding="utf-8") as f:
            content = f.read()
        start = content.find("[")
        end = content.rfind("]") + 1
        return json.loads(content[start:end])
    
    print("ERROR: Could not locate book pages data file.")
    sys.exit(1)


def clean_html(text):
    """Strip HTML tags and convert formatting to natural speech pauses."""
    if not text:
        return ""
    # Replace line breaks and paragraph separators with comma or period
    text = re.sub(r'<br\s*/?>', '، ', text, flags=re.IGNORECASE)
    text = re.sub(r'</?(?:strong|b|em|span|div|p)[^>]*>', ' ', text, flags=re.IGNORECASE)
    # Strip any remaining tags
    text = re.sub(r'<[^>]+>', ' ', text)
    # Normalize multiple punctuation / whitespace
    text = re.sub(r'[\s\t\n]+', ' ', text)
    text = re.sub(r'([.!?؟؛])\s*[،,]', r'\1 ', text)
    text = re.sub(r'[،,]\s*([.!?؟؛])', r'\1 ', text)
    text = text.replace('؛', '؛ ')
    text = text.replace(':', ': ')
    text = re.sub(r'\s+([،.؛])', r'\1', text)
    return text.strip()


def prepare_speech_text(page_data):
    """
    Constructs a dignified, fluent, natural monologue suitable for a spiritual contemplative book.
    """
    p_num = page_data.get("pageIndex", 1)
    p_type = page_data.get("type", "normal")
    title = clean_html(page_data.get("title", ""))
    subtitle = clean_html(page_data.get("subtitle", ""))
    paragraphs = [clean_html(p) for p in page_data.get("paragraphs", []) if p.strip()]
    callout = clean_html(page_data.get("callout", ""))
    chapter = clean_html(page_data.get("chapter", ""))

    # Page 1: Cover and Intro Identification
    if p_num == 1 or p_type == "cover":
        return "کتاب معجزه‌گر خاموش. پاراگراف‌های زندگی‌ساز. اثر سید رضا حیات‌الغیب."

    # Page 2: Table of Contents Overview
    if p_num == 2 or p_type == "toc":
        lines = []
        lines.append("فهرست سرفصل‌های کتاب معجزه‌گر خاموش.")
        for p in paragraphs:
            clean_item = re.sub(r'\.{2,}\s*\d+', '', p).strip()
            if clean_item:
                lines.append(clean_item + "؛")
        return " ".join(lines)

    # Page 3: Preface Title Divider
    if p_num == 3 or (p_type == "section_start" and chapter == "پیشگفتار" and not paragraphs):
        return "پیشگفتار کتاب معجزه‌گر خاموش. چرا این اثر به نگارش درآمد؟"

    # General Pages
    speech_parts = []

    # If new title or chapter beginning
    if title and title != "معجزه‌گر خاموش" and title != chapter:
        speech_parts.append(f"{title}.")

    if subtitle:
        speech_parts.append(f"{subtitle}.")

    for p in paragraphs:
        if p:
            # Ensure sentence ends with punctuation
            if not p.endswith((".", "!", "؟", "؛")):
                p += "."
            speech_parts.append(p)

    if callout:
        if not callout.endswith((".", "!", "؟", "؛")):
            callout += "."
        speech_parts.append(f"نکته کلیدی: {callout}")

    # Fallback if speech_parts is empty
    if not speech_parts:
        ch_title = title or chapter or "معجزه‌گر خاموش"
        speech_parts.append(f"{ch_title}.")

    final_text = " ".join(speech_parts).strip()
    return final_text


def convert_raw_pcm_to_wav(audio_data: bytes, rate=24000, bits_per_sample=16, num_channels=1) -> bytes:
    """Generates standard RIFF WAV header for raw PCM stream."""
    data_size = len(audio_data)
    bytes_per_sample = bits_per_sample // 8
    block_align = num_channels * bytes_per_sample
    byte_rate = rate * block_align
    chunk_size = 36 + data_size

    header = struct.pack(
        "<4sI4s4sIHHIIHH4sI",
        b"RIFF",
        chunk_size,
        b"WAVE",
        b"fmt ",
        16,
        1,
        num_channels,
        rate,
        byte_rate,
        block_align,
        bits_per_sample,
        b"data",
        data_size
    )
    return header + audio_data


AVAILABLE_TTS_MODELS = [
    "gemini-3.8-flash-tts",
    "gemini-3.8-flash-lite-tts"
]


def call_gemini_tts(text, api_key, voice_name="Bodi", preferred_model=None, max_retries=2):
    """Calls Gemini TTS API with intelligent model fallback on quota limits."""
    models_to_try = [preferred_model] if preferred_model else list(AVAILABLE_TTS_MODELS)
    # deduplicate while keeping order
    seen = set()
    models_to_try = [m for m in models_to_try if m and not (m in seen or seen.add(m))]

    last_error = None
    for model in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        headers = {
            "Content-Type": "application/json",
            "X-goog-api-key": api_key
        }
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": text
                        }
                    ]
                }
            ],
            "generationConfig": {
                "responseModalities": ["AUDIO"],
                "speechConfig": {
                    "voiceConfig": {
                        "prebuiltVoiceConfig": {
                            "voiceName": voice_name
                        }
                    }
                }
            }
        }

        req_data = json.dumps(payload).encode("utf-8")

        for attempt in range(1, max_retries + 1):
            try:
                req = urllib.request.Request(url, data=req_data, headers=headers, method="POST")
                with urllib.request.urlopen(req, timeout=90) as response:
                    resp_json = json.loads(response.read().decode("utf-8"))

                candidates = resp_json.get("candidates", [])
                if not candidates:
                    raise ValueError(f"No candidates in {model} response: " + json.dumps(resp_json))

                parts = candidates[0].get("content", {}).get("parts", [])
                for p in parts:
                    if "inlineData" in p:
                        b64_data = p["inlineData"].get("data", "")
                        mime_type = p["inlineData"].get("mimeType", "audio/wav")
                        raw_audio = base64.b64decode(b64_data)
                        return raw_audio, mime_type, model

                raise ValueError(f"Audio inlineData not found in {model} response")

            except urllib.error.HTTPError as e:
                err_body = e.read().decode("utf-8", errors="ignore")
                last_error = f"{model}: HTTP {e.code} - {err_body[:200]}"
                if e.code == 429:
                    if "RESOURCE_EXHAUSTED" in err_body and ("per day" in err_body.lower() or "requests per day" in err_body.lower()):
                        print(f"  [{model}] Daily limit reached. Trying next available model...")
                        break
                    else:
                        wait_sec = 15 * attempt
                        print(f"  [{model}] Rate limit pause: waiting {wait_sec}s...")
                        time.sleep(wait_sec)
                else:
                    print(f"  [{model} attempt {attempt}] HTTP Error {e.code}")
                    if attempt < max_retries:
                        time.sleep(2 * attempt)
            except Exception as e:
                last_error = str(e)
                if attempt < max_retries:
                    time.sleep(2 * attempt)

    raise RuntimeError(f"All TTS models failed to generate audio. Last error: {last_error}")


def get_audio_duration_seconds(file_path):
    """Extract audio duration using ffprobe."""
    try:
        cmd = [
            "ffprobe", "-v", "error", "-show_entries",
            "format=duration", "-of", "default=noprint_wrappers=1:nokey=1",
            file_path
        ]
        out = subprocess.check_output(cmd, text=True).strip()
        return round(float(out), 1)
    except Exception:
        return 0.0


def generate_page_audio(page_data, api_key, voice_name="Bodi", force=False):
    """Generates and encodes MP3 audio for a specific book page."""
    p_num = page_data.get("pageIndex")
    mp3_filename = f"page-{p_num:03d}.mp3"
    mp3_path = os.path.join(OUTPUT_DIR, mp3_filename)

    if os.path.exists(mp3_path) and not force:
        print(f"Page {p_num:03d}: Already exists ({mp3_filename}). Skipping (use --force to overwrite).")
        return mp3_path

    speech_text = prepare_speech_text(page_data)
    if not speech_text:
        print(f"Page {p_num:03d}: No speech text found. Skipping.")
        return None

    print(f"\n--- Generating Page {p_num:03d} (Voice: {voice_name}) ---")
    print(f"Text snippet: {speech_text[:90]}...")

    raw_audio, mime_type, used_model = call_gemini_tts(speech_text, api_key, voice_name=voice_name)
    print(f"  [Model: {used_model}] Audio generated ({len(raw_audio)} bytes)")

    # Save to temporary WAV
    temp_wav_path = os.path.join(OUTPUT_DIR, f"temp_{p_num:03d}.wav")
    if raw_audio.startswith(b"RIFF"):
        wav_bytes = raw_audio
    else:
        wav_bytes = convert_raw_pcm_to_wav(raw_audio)

    with open(temp_wav_path, "wb") as f:
        f.write(wav_bytes)

    # Convert to high-quality lightweight MP3 via ffmpeg
    # 128k bitrate, 24kHz sampling rate, mono voice
    ffmpeg_cmd = [
        "ffmpeg", "-y", "-i", temp_wav_path,
        "-c:a", "libmp3lame",
        "-b:a", "128k",
        "-ar", "24000",
        "-ac", "1",
        mp3_path
    ]
    subprocess.run(ffmpeg_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

    # Clean up temp WAV
    if os.path.exists(temp_wav_path):
        os.remove(temp_wav_path)

    file_size_kb = round(os.path.getsize(mp3_path) / 1024, 1)
    duration_sec = get_audio_duration_seconds(mp3_path)
    print(f"✓ Saved: {mp3_filename} ({file_size_kb} KB, {duration_sec}s)")

    # Update manifest record
    update_manifest(p_num, mp3_filename, duration_sec, file_size_kb, voice_name)
    return mp3_path


def load_manifest():
    if os.path.exists(MANIFEST_PATH):
        try:
            with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


def update_manifest(page_num, filename, duration, size_kb, voice):
    manifest = load_manifest()
    manifest[str(page_num)] = {
        "page": page_num,
        "filename": filename,
        "path": f"assets/audio/pages/{filename}",
        "duration": duration,
        "size_kb": size_kb,
        "voice": voice,
        "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ")
    }
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)


def sync_manifest_to_html():
    """Syncs the latest manifest data into reader.html embedded AUDIO_MANIFEST."""
    html_path = os.path.join(ROOT_DIR, "reader.html")
    if not os.path.exists(html_path):
        return
    manifest = load_manifest()
    manifest_entries = []
    for p_str in sorted(manifest.keys(), key=lambda x: int(x)):
        item = manifest[p_str]
        p = item["page"]
        dur = round(item.get("duration", 0), 1)
        m = int(dur // 60)
        s = int(dur % 60)
        lbl = f"{m}:{s:02d} دقیقه" if m > 0 else f"{s} ثانیه"
        manifest_entries.append(f'        {p}: {{ page: {p}, duration: {dur}, label: "{lbl}" }}')
    
    new_manifest_js = "      const AUDIO_MANIFEST = {\n" + ",\n".join(manifest_entries) + "\n      };"
    
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()
    
    pattern = r"const AUDIO_MANIFEST = \{.*?\};"
    if re.search(pattern, html, flags=re.DOTALL):
        html = re.sub(pattern, new_manifest_js.strip(), html, count=1, flags=re.DOTALL)
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html)
        print("✓ Synchronized manifest with reader.html")


def main():
    parser = argparse.ArgumentParser(description="Generate audiobook pages with Gemini 3.8 Flash TTS")
    parser.add_argument("--page", type=int, help="Specific page number to generate (e.g. 1)")
    parser.add_argument("--range", type=int, nargs=2, metavar=("START", "END"), help="Page range to generate (e.g. 1 5)")
    parser.add_argument("--all", action="store_true", help="Generate audio for all 241 pages")
    parser.add_argument("--voice", type=str, default="Bodi", help="Prebuilt voice name (default: Bodi)")
    parser.add_argument("--force", action="store_true", help="Overwrite existing audio files")
    parser.add_argument("--dry-run", action="store_true", help="Print texts without invoking API")

    args = parser.parse_args()

    pages = load_book_pages()
    api_key = get_api_key() if not args.dry_run else None

    # Determine pages to process
    target_pages = []
    if args.page:
        target_pages = [p for p in pages if p.get("pageIndex") == args.page]
    elif args.range:
        start_p, end_p = args.range
        target_pages = [p for p in pages if start_p <= p.get("pageIndex") <= end_p]
    elif args.all:
        target_pages = pages
    else:
        # Default: Page 1 for initial test proof-of-concept
        print("No target specified. Defaulting to Page 1 for test.")
        target_pages = [pages[0]]

    if not target_pages:
        print("No matching pages found.")
        sys.exit(1)

    print(f"Selected {len(target_pages)} page(s) for processing.")

    if args.dry_run:
        for p in target_pages:
            p_num = p.get("pageIndex")
            txt = prepare_speech_text(p)
            print(f"\n[DRY RUN] Page {p_num:03d} (Words: {len(txt.split())}):\n{txt}\n")
        return

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    for idx, p in enumerate(target_pages):
        generate_page_audio(p, api_key, voice_name=args.voice, force=args.force)
        if idx < len(target_pages) - 1:
            time.sleep(3.5) # gentle pacing between calls to respect RPM limit

    sync_manifest_to_html()
    print(f"\n✓ Completed processing {len(target_pages)} page(s). Manifest updated at: {MANIFEST_PATH}")


if __name__ == "__main__":
    main()
