#!/usr/bin/env python3
"""
Audiobook Chapter Stitcher & Packager for 'معجزه‌گر خاموش'
- Automatically groups page audio files into complete, standalone Chapter MP3s
- Inserts a natural, subtle 0.6s breathing pause between pages
- Encodes pristine 128kbps MP3 with full ID3 metadata (Title, Artist, Album, Track, Genre)
- Exports to assets/audio/chapters/ and maintains assets/audio/chapters/chapters_manifest.json
- Perfect for album releases, standalone listening, podcasts, or digital product sales
"""

import os
import sys
import json
import time
import argparse
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
PAGES_AUDIO_DIR = os.path.join(ROOT_DIR, "assets", "audio", "pages")
CHAPTERS_AUDIO_DIR = os.path.join(ROOT_DIR, "assets", "audio", "chapters")
PAGES_MANIFEST_PATH = os.path.join(PAGES_AUDIO_DIR, "manifest.json")
CHAPTERS_MANIFEST_PATH = os.path.join(CHAPTERS_AUDIO_DIR, "chapters_manifest.json")
SILENCE_FILE = os.path.join(ROOT_DIR, "assets", "audio", "silence_06s.mp3")

# Definition of the canonical 12 audiobook tracks/chapters
CHAPTER_DEFINITIONS = [
    {
        "track": 1,
        "id": "preface_and_intro",
        "title": "بخش آغازین و پیشگفتار",
        "filename": "00_preface_and_intro.mp3",
        "start_page": 1,
        "end_page": 7,
        "description": "شناسنامه، فهرست کتاب، پیشگفتار مؤلف و طلیعه نیایش"
    },
    {
        "track": 2,
        "id": "chapter_01_parvaz",
        "title": "فصل اول: پرواز",
        "filename": "01_chapter_01_parvaz.mp3",
        "start_page": 8,
        "end_page": 13,
        "description": "پرواز با سرعت اندیشه و آغاز دگرگونی درونی"
    },
    {
        "track": 3,
        "id": "chapter_02_afsaneh_shakhsi",
        "title": "فصل دوم: افسانه شخصی",
        "filename": "02_chapter_02_afsaneh_shakhsi.mp3",
        "start_page": 14,
        "end_page": 20,
        "description": "تحقق بخشیدن به افسانه شخصی و کشف رسالت روح"
    },
    {
        "track": 4,
        "id": "chapter_03_afarinesh_zendegi",
        "title": "فصل سوم: آفرینش زندگی",
        "filename": "03_chapter_03_afarinesh_zendegi.mp3",
        "start_page": 21,
        "end_page": 34,
        "description": "معجزات با انتخاب آفریده می‌شوند و همسویی با کائنات"
    },
    {
        "track": 5,
        "id": "chapter_04_ghodrat_ghalb",
        "title": "فصل چهارم: قدرت قلب",
        "filename": "04_chapter_04_ghodrat_ghalb.mp3",
        "start_page": 35,
        "end_page": 42,
        "description": "پیوند با هوش کیهانی و هدایت باطنی قلب"
    },
    {
        "track": 6,
        "id": "chapter_05_shohood_va_mokashefeh",
        "title": "فصل پنجم: شهود و مکاشفه",
        "filename": "05_chapter_05_shohood_va_mokashefeh.mp3",
        "start_page": 43,
        "end_page": 91,
        "description": "شنیدن ندای شهود، مکاشفه باطنی و عبور از خاطرات رنج"
    },
    {
        "track": 7,
        "id": "chapter_06_ghalamro_sokoot",
        "title": "فصل ششم: قلمرو سکوت و مراقبه",
        "filename": "06_chapter_06_ghalamro_sokoot.mp3",
        "start_page": 92,
        "end_page": 100,
        "description": "ورود به معبد سکوت و آرامش ناب مراقبه"
    },
    {
        "track": 8,
        "id": "chapter_07_zistan_dar_atash_aknoon",
        "title": "فصل هفتم: زیستن در آتش اکنون",
        "filename": "07_chapter_07_zistan_dar_atash_aknoon.mp3",
        "start_page": 101,
        "end_page": 118,
        "description": "رهایی از بند گذشته و آینده و حضور کامل در لحظه اکنون"
    },
    {
        "track": 9,
        "id": "chapter_08_jedal_nafs_va_eshgh",
        "title": "فصل هشتم: جدال بین نفس و عشق در روابط",
        "filename": "08_chapter_08_jedal_nafs_va_eshgh.mp3",
        "start_page": 119,
        "end_page": 152,
        "description": "روابط حقیقی، شفای پیوندها و عبور از دام‌های نفس"
    },
    {
        "track": 10,
        "id": "chapter_09_talab_konid",
        "title": "فصل نهم: طلب کنید، داده خواهد شد",
        "filename": "09_chapter_09_talab_konid.mp3",
        "start_page": 153,
        "end_page": 176,
        "description": "قانون جذب، طلب خالصانه و دریافت موهبت‌های الهی"
    },
    {
        "track": 11,
        "id": "chapter_10_rahayi_va_paziresh",
        "title": "فصل دهم: رهایی و پذیرش خویشتن",
        "filename": "10_chapter_10_rahayi_va_paziresh.mp3",
        "start_page": 177,
        "end_page": 208,
        "description": "پذیرش عمیق خود، شفای کودک درون و صلح با هستی"
    },
    {
        "track": 12,
        "id": "chapter_11_mojezeye_khamoosh",
        "title": "فصل یازدهم: معجزه‌گر خاموش و حقیقت حضور",
        "filename": "11_chapter_11_mojezeye_khamoosh.mp3",
        "start_page": 209,
        "end_page": 241,
        "description": "تجلی معجزه‌گر خاموش در زندگی و وصال با حقیقت وجود"
    }
]


def ensure_silence_file():
    """Generates a 0.6-second lightweight silence file if not present."""
    if not os.path.exists(SILENCE_FILE):
        os.makedirs(os.path.dirname(SILENCE_FILE), exist_ok=True)
        cmd = [
            "ffmpeg", "-y", "-f", "lavfi",
            "-i", "anullsrc=r=24000:cl=mono",
            "-t", "0.6",
            "-c:a", "libmp3lame", "-b:a", "128k",
            SILENCE_FILE
        ]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    return SILENCE_FILE


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


def format_duration(seconds):
    """Formats seconds into friendly Persian duration string."""
    m = int(seconds // 60)
    s = int(seconds % 60)
    if m >= 60:
        h = m // 60
        rem_m = m % 60
        return f"{h} ساعت و {rem_m} دقیقه"
    elif m > 0:
        return f"{m}:{s:02d} دقیقه"
    else:
        return f"{s} ثانیه"


def stitch_chapter(ch_def, available_pages, force=False, allow_partial=True):
    """
    Stitches page audio files for a single chapter definition.
    Returns dictionary with chapter summary if stitched, or None.
    """
    ch_id = ch_def["id"]
    title = ch_def["title"]
    start_p = ch_def["start_page"]
    end_p = ch_def["end_page"]
    expected_count = end_p - start_p + 1

    # Find which pages of this chapter are actually present
    present_pages = [p for p in range(start_p, end_p + 1) if p in available_pages]
    if not present_pages:
        return None

    is_complete = (len(present_pages) == expected_count)
    if not is_complete and not allow_partial:
        return None

    # Determine filename (mark partial if not complete)
    out_filename = ch_def["filename"]
    if not is_complete:
        base, ext = os.path.splitext(out_filename)
        out_filename = f"{base}_partial_p{min(present_pages):03d}-{max(present_pages):03d}{ext}"

    out_path = os.path.join(CHAPTERS_AUDIO_DIR, out_filename)

    if os.path.exists(out_path) and not force:
        # Check if already up to date
        dur = get_audio_duration_seconds(out_path)
        size_mb = round(os.path.getsize(out_path) / (1024 * 1024), 2)
        return {
            "track": ch_def["track"],
            "id": ch_id,
            "title": title + (" (بخش تکمیل‌شده)" if not is_complete else ""),
            "filename": out_filename,
            "path": f"assets/audio/chapters/{out_filename}",
            "start_page": min(present_pages),
            "end_page": max(present_pages),
            "pages_count": len(present_pages),
            "total_pages": expected_count,
            "is_complete": is_complete,
            "duration": dur,
            "duration_formatted": format_duration(dur),
            "size_mb": size_mb,
            "status": "cached"
        }

    ensure_silence_file()
    os.makedirs(CHAPTERS_AUDIO_DIR, exist_ok=True)

    # Build ffmpeg concat list with silence pad between pages
    concat_list_path = os.path.join(CHAPTERS_AUDIO_DIR, f"temp_concat_{ch_id}.txt")
    with open(concat_list_path, "w", encoding="utf-8") as f:
        for idx, p in enumerate(present_pages):
            page_file = os.path.join(PAGES_AUDIO_DIR, f"page-{p:03d}.mp3")
            f.write(f"file '{page_file}'\n")
            # Insert 0.6s silence between pages (except after the last page)
            if idx < len(present_pages) - 1:
                f.write(f"file '{SILENCE_FILE}'\n")

    # Encode stitched chapter with metadata
    track_str = f"{ch_def['track']}/12"
    ch_title = title if is_complete else f"{title} (صفحات {min(present_pages)} تا {max(present_pages)})"

    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0",
        "-i", concat_list_path,
        "-c:a", "libmp3lame",
        "-b:a", "64k",
        "-ar", "24000",
        "-ac", "1",
        "-metadata", f"title={ch_title}",
        "-metadata", "artist=سید رضا حیات‌الغیب",
        "-metadata", "album=کتاب صوتی معجزه‌گر خاموش",
        "-metadata", f"track={track_str}",
        "-metadata", "genre=Audiobook",
        "-metadata", "date=2026",
        "-metadata", f"comment={ch_def.get('description', '')}",
        out_path
    ]

    print(f"Stitching {ch_title} ({len(present_pages)} pages)...", end="", flush=True)
    subprocess.run(ffmpeg_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    print(" ✓")

    if os.path.exists(concat_list_path):
        os.remove(concat_list_path)

    # Clean up superseded partial files for this chapter
    for old_f in os.listdir(CHAPTERS_AUDIO_DIR):
        if old_f.startswith(f"{ch_def['track']:02d}_") and old_f.endswith(".mp3") and old_f != out_filename:
            old_path = os.path.join(CHAPTERS_AUDIO_DIR, old_f)
            try:
                os.remove(old_path)
            except OSError:
                pass

    dur = get_audio_duration_seconds(out_path)
    size_mb = round(os.path.getsize(out_path) / (1024 * 1024), 2)

    return {
        "track": ch_def["track"],
        "id": ch_id,
        "title": ch_title,
        "filename": out_filename,
        "path": f"assets/audio/chapters/{out_filename}",
        "start_page": min(present_pages),
        "end_page": max(present_pages),
        "pages_count": len(present_pages),
        "total_pages": expected_count,
        "is_complete": is_complete,
        "duration": dur,
        "duration_formatted": format_duration(dur),
        "size_mb": size_mb,
        "status": "stitched"
    }


def stitch_all_chapters(force=False, allow_partial=True):
    """Scans all existing page audio files and stitches all available chapters."""
    os.makedirs(CHAPTERS_AUDIO_DIR, exist_ok=True)
    
    # Detect available page audio files
    available_pages = set()
    if os.path.exists(PAGES_AUDIO_DIR):
        for f in os.listdir(PAGES_AUDIO_DIR):
            if f.startswith("page-") and f.endswith(".mp3"):
                try:
                    p = int(f.split("-")[1].split(".")[0])
                    p_path = os.path.join(PAGES_AUDIO_DIR, f)
                    if os.path.getsize(p_path) > 1024:
                        available_pages.add(p)
                except ValueError:
                    continue

    print("=" * 65)
    print("🎙 MOJEZEGAR KHAMOOSH — CHAPTER AUDIOBOOK STITCHER")
    print("=" * 65)
    print(f"Detected Available Pages : {len(available_pages)} pages (1 to {max(available_pages) if available_pages else 0})")
    print(f"Output Directory         : {CHAPTERS_AUDIO_DIR}")
    print("-" * 65)

    chapters_manifest = {}
    stitched_count = 0
    total_audio_sec = 0

    for ch_def in CHAPTER_DEFINITIONS:
        res = stitch_chapter(ch_def, available_pages, force=force, allow_partial=allow_partial)
        if res:
            chapters_manifest[res["id"]] = res
            stitched_count += 1
            total_audio_sec += res["duration"]
            badge = "🟢 کامل (Complete)" if res["is_complete"] else "🟡 در حال تکمیل (Partial)"
            print(f"[{res['track']:02d}] {res['title']:<38} : {badge} | {res['duration_formatted']} ({res['size_mb']} MB)")

    # Save chapters manifest
    with open(CHAPTERS_MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(chapters_manifest, f, indent=2, ensure_ascii=False)

    print("=" * 65)
    print(f"✓ Chapters Manifest saved at: {CHAPTERS_MANIFEST_PATH}")
    print(f"Total Stitched Tracks : {stitched_count} files")
    print(f"Total Audio Duration  : {format_duration(total_audio_sec)}")
    print("=" * 65 + "\n")

    return chapters_manifest


def main():
    parser = argparse.ArgumentParser(description="Stitch page audio files into complete chapter audio tracks")
    parser.add_argument("--force", action="store_true", help="Force re-stitching of existing chapter files")
    parser.add_argument("--no-partial", action="store_true", help="Only stitch 100% complete chapters")
    args = parser.parse_args()

    stitch_all_chapters(force=args.force, allow_partial=not args.no_partial)


if __name__ == "__main__":
    main()
