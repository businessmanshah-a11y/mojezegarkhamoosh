#!/usr/bin/env python3
"""
Automated Daily Audiobook Batch Runner for 'معجزه‌گر خاموش'
- Reads current progress from manifest.json
- Detects the next batch of ungenerated pages (default: 20 pages)
- Generates speech audio using Gemini TTS (Flash -> Flash-Lite fallback)
- Converts to 128kbps lightweight MP3
- Synchronizes manifest.json and reader.html
- Optionally commits and pushes progress to GitHub
"""

import os
import sys
import json
import time
import argparse
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
OUTPUT_DIR = os.path.join(ROOT_DIR, "assets", "audio", "pages")
MANIFEST_PATH = os.path.join(OUTPUT_DIR, "manifest.json")

# Import generator functions
sys.path.insert(0, SCRIPT_DIR)
from generate_audio import (
    load_book_pages,
    get_api_key,
    generate_page_audio,
    sync_manifest_to_html,
    load_manifest
)


def get_completed_pages():
    """Return set of integer page numbers already present and valid in manifest."""
    manifest = load_manifest()
    completed = set()
    for p_str, item in manifest.items():
        try:
            p_num = int(p_str)
            # Check if file actually exists
            filename = item.get("filename", f"page-{p_num:03d}.mp3")
            filepath = os.path.join(OUTPUT_DIR, filename)
            if os.path.exists(filepath) and os.path.getsize(filepath) > 1024:
                completed.add(p_num)
        except (ValueError, TypeError):
            continue
    return completed


def git_commit_and_push(start_p, end_p, count):
    """Automatically stage audio files and reader.html, commit and push to remote."""
    try:
        print("\n--- Synchronizing Git Repository ---")
        status_out = subprocess.check_output(["git", "status", "--porcelain"], cwd=ROOT_DIR, text=True)
        if not status_out.strip():
            print("No changes to commit in git.")
            return True

        # Stage only assets/audio/pages and reader.html
        subprocess.run(["git", "add", "assets/audio/pages/", "reader.html"], cwd=ROOT_DIR, check=True)
        
        commit_msg = f"feat(audiobook): batch generate audio pages {start_p:03d}-{end_p:03d} ({count} pages) [automated]"
        subprocess.run(["git", "commit", "-m", commit_msg], cwd=ROOT_DIR, check=True)
        print(f"✓ Committed: {commit_msg}")

        # Push to remote origin main
        push_res = subprocess.run(["git", "push", "origin", "main"], cwd=ROOT_DIR, capture_output=True, text=True)
        if push_res.returncode == 0:
            print("✓ Pushed changes successfully to GitHub origin/main")
            return True
        else:
            print(f"⚠ Git push failed (may need manual push or network check): {push_res.stderr.strip()}")
            return False
    except Exception as e:
        print(f"⚠ Git commit/push error: {e}")
        return False


def run_batch(batch_size=20, max_page=241, push=True, voice="Bodi"):
    pages = load_book_pages()
    completed = get_completed_pages()
    total_pages = len(pages)
    
    print("=" * 65)
    print("🎧 MOJEZEGAR KHAMOOSH — DAILY AUDIOBOOK AUTOMATION BATCH")
    print("=" * 65)
    print(f"Total Book Pages   : {total_pages}")
    print(f"Completed So Far   : {len(completed)} pages ({len(completed) / total_pages * 100:.1f}%)")

    # Find the next continuous sequence of ungenerated pages
    target_pages = []
    for p in pages:
        p_num = p.get("pageIndex")
        if p_num and p_num not in completed and p_num <= max_page:
            target_pages.append(p)
            if len(target_pages) >= batch_size:
                break

    if not target_pages:
        print("\n🎉 ALL TARGET PAGES COMPLETED! Nothing to generate today.")
        return 0

    first_page = target_pages[0].get("pageIndex")
    last_page = target_pages[-1].get("pageIndex")
    print(f"Target Batch Today : Pages {first_page:03d} to {last_page:03d} ({len(target_pages)} pages)")
    print("=" * 65)

    api_key = get_api_key()
    generated_pages = []
    stopped_due_to_quota = False

    for idx, page_data in enumerate(target_pages):
        p_num = page_data.get("pageIndex")
        try:
            res = generate_page_audio(page_data, api_key, voice_name=voice)
            if res:
                generated_pages.append(p_num)
        except Exception as e:
            err_msg = str(e)
            print(f"\n⚠ Generation stopped at Page {p_num:03d}: {err_msg}")
            if "limit" in err_msg.lower() or "429" in err_msg or "exhausted" in err_msg.lower() or "quota" in err_msg.lower():
                print("Daily quota ceiling reached for today. Safely saving progress...")
                stopped_due_to_quota = True
                break
            else:
                print(f"Unexpected error: {err_msg}")
                break

        # Gentle throttle between calls to maintain well under 15 RPM
        if idx < len(target_pages) - 1:
            time.sleep(3.5)

    # Sync reader.html with all generated pages
    sync_manifest_to_html()

    new_total_completed = len(get_completed_pages())
    remaining = total_pages - new_total_completed
    est_days = (remaining + batch_size - 1) // batch_size if remaining > 0 else 0

    print("\n" + "=" * 65)
    print("📊 BATCH RUN SUMMARY")
    print("=" * 65)
    print(f"Pages Generated in this run : {len(generated_pages)} pages ({first_page:03d} to {generated_pages[-1] if generated_pages else first_page:03d})")
    print(f"Total Completed Pages       : {new_total_completed} / {total_pages} ({new_total_completed / total_pages * 100:.1f}%)")
    print(f"Pages Remaining             : {remaining} pages")
    print(f"Estimated Days Left         : ~{est_days} days (at {batch_size} pages/day)")

    if stopped_due_to_quota:
        print("\nℹ Daily quota ceiling was reached. Quota will reset tonight at 00:00 UTC (03:30 AM Iran).")

    # If new pages were generated and push is requested, commit and push to git
    if generated_pages and push:
        git_commit_and_push(generated_pages[0], generated_pages[-1], len(generated_pages))

    return len(generated_pages)


def main():
    parser = argparse.ArgumentParser(description="Run daily audio batch generation")
    parser.add_argument("--batch-size", type=int, default=20, help="Number of pages per batch (default: 20)")
    parser.add_argument("--voice", type=str, default="Bodi", help="Prebuilt voice name (default: Bodi)")
    parser.add_argument("--no-push", action="store_true", help="Do not commit or push to git")
    args = parser.parse_args()

    run_batch(batch_size=args.batch_size, push=not args.no_push, voice=args.voice)


if __name__ == "__main__":
    main()
