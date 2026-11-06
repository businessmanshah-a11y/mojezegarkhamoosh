#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
پایپ‌لاین جامع استخراج، تبدیل و ساختاربندی کتاب «معجزه‌گر خاموش»
از تصاویر اسکن‌شده ۲۴۱ صفحه‌ای به متن استاندارد فارسی و ساختار داده وب‌ریدر
"""

import argparse
import base64
import json
import os
import re
import sys
from pathlib import Path

# مسیرهای پیش‌فرض پروژه
BASE_DIR = Path(__file__).resolve().parent.parent
CACHE_FILE = BASE_DIR / "data" / "transcription_cache.json"
PAGES_DIR = BASE_DIR / "assets" / "pages"
JS_OUTPUT_FILE = BASE_DIR / "assets" / "js" / "book-pages-data.js"
OUTPUT_DIR = BASE_DIR / "output"
MD_OUTPUT_FILE = OUTPUT_DIR / "mojezeye_khamoosh_full.md"
TXT_OUTPUT_FILE = OUTPUT_DIR / "mojezeye_khamoosh_full.txt"

TOTAL_BOOK_PAGES = 241


def load_cache() -> list:
    """بارگذاری حافظه پنهان (کش) صفحات استخراج شده"""
    if CACHE_FILE.exists():
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
                return data if isinstance(data, list) else []
            except Exception as e:
                print(f"[!] خطا در خواندن فایل کش: {e}")
                return []
    return []


def save_cache(pages: list):
    """ذخیره صفحات در فایل کش"""
    CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)
    # مرتب‌سازی بر اساس pageIndex
    sorted_pages = sorted(pages, key=lambda p: p.get("pageIndex", 0))
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(sorted_pages, f, ensure_ascii=False, indent=2)
    print(f"[✓] {len(sorted_pages)} صفحه در کش ذخیره شد: {CACHE_FILE}")


def export_all_formats(pages: list):
    """تولید خروجی‌های JS، Markdown و Text بر اساس داده‌های کش"""
    if not pages:
        print("[!] هیچ صفحه‌ای برای خروجی وجود ندارد.")
        return

    sorted_pages = sorted(pages, key=lambda p: p.get("pageIndex", 0))
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # ۱. تولید assets/js/book-pages-data.js
    js_header = f"""/**
 * پایگاه داده دیجیتال کتاب معجزه‌گر خاموش (پاراگراف‌های زندگی‌ساز)
 * استخراج دقیق متن، حروف‌چینی دیجیتال و ساختار صفحات چاپی (شامل {len(sorted_pages)} صفحه)
 * اثر: سید رضا حیات‌الغیب | ناشر: انتشارات سخنوران
 */

const BOOK_PAGES_DATA = """
    js_footer = """;

if (typeof window !== 'undefined') {
  window.BOOK_PAGES_DATA = BOOK_PAGES_DATA;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BOOK_PAGES_DATA;
}
"""
    with open(JS_OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(js_header + json.dumps(sorted_pages, ensure_ascii=False, indent=2) + js_footer)
    print(f"[✓] خروجی جاوااسکریپت بروزرسانی شد: {JS_OUTPUT_FILE} ({len(sorted_pages)} صفحه)")

    # ۲. تولید خروجی Markdown یکپارچه
    md_lines = [
        "# کتاب معجزه‌گر خاموش",
        "## پاراگراف‌های زندگی‌ساز",
        "**اثر:** سید رضا حیات‌الغیب  \n**ناشر:** انتشارات سخنوران  \n\n---\n"
    ]

    current_chapter = ""
    for page in sorted_pages:
        p_idx = page.get("pageIndex")
        book_pnum = page.get("bookPageNum", "")
        p_type = page.get("type", "content")
        chapter = page.get("chapter", "")

        if chapter and chapter != current_chapter:
            current_chapter = chapter
            md_lines.append(f"\n# {chapter}\n")

        badge = page.get("sectionBadge", "")
        title = page.get("title", "")
        margin_quote = page.get("marginQuote", "")
        callout = page.get("callout", "")

        p_header = f"\n### صفحه {p_idx}" + (f" (صفحه چاپی {book_pnum})" if book_pnum else "")
        md_lines.append(p_header)

        if badge:
            md_lines.append(f"\n> **موضوع:** {badge}")
        if title:
            md_lines.append(f"\n#### {title}")
        if margin_quote:
            md_lines.append(f"\n*نقل‌قول حاشیه:* «{margin_quote}»\n")

        for para in page.get("paragraphs", []):
            clean_para = re.sub(r'</?strong>', '**', para)
            md_lines.append(f"\n{clean_para}\n")

        if callout:
            clean_callout = re.sub(r'</?strong>', '**', callout)
            md_lines.append(f"\n> 💡 **نکته کلیدی:** {clean_callout}\n")

        md_lines.append("\n---\n")

    with open(MD_OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(md_lines))
    print(f"[✓] کتاب مارک‌داون کامل ایجاد شد: {MD_OUTPUT_FILE}")

    # ۳. تولید متن ساده خام (TXT)
    txt_lines = ["کتاب معجزه‌گر خاموش — اثر سید رضا حیات‌الغیب\n" + "=" * 50 + "\n"]
    for page in sorted_pages:
        p_idx = page.get("pageIndex")
        txt_lines.append(f"\n--- صفحه {p_idx} ---\n")
        badge = page.get("sectionBadge", "")
        if badge:
            txt_lines.append(f"[{badge}]\n")
        title = page.get("title", "")
        if title:
            txt_lines.append(f"عنوان: {title}\n")
        for para in page.get("paragraphs", []):
            plain_para = re.sub(r'<[^>]+>', '', para)
            txt_lines.append(plain_para + "\n")
        callout = page.get("callout", "")
        if callout:
            plain_callout = re.sub(r'<[^>]+>', '', callout)
            txt_lines.append(f"نکته: {plain_callout}\n")

    with open(TXT_OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(txt_lines))
    print(f"[✓] متن خام استاندارد ایجاد شد: {TXT_OUTPUT_FILE}")


def show_status():
    """نمایش وضعیت فعلی صفحات استخراج شده"""
    pages = load_cache()
    cached_indices = {p.get("pageIndex") for p in pages}
    existing_images = list(PAGES_DIR.glob("page-*.jpg"))

    print("=" * 60)
    print("📊 گزارش وضعیت دیجیتالی‌سازی کتاب معجزه‌گر خاموش")
    print("=" * 60)
    print(f"تعداد کل صفحات کتاب:        {TOTAL_BOOK_PAGES}")
    print(f"تعداد تصاویر استخراج شده:  {len(existing_images)} صفحه (از {TOTAL_BOOK_PAGES})")
    print(f"تعداد صفحات استخراج شده:   {len(cached_indices)} صفحه (درصد پیشرفت: {len(cached_indices)/TOTAL_BOOK_PAGES*100:.1f}%)")
    missing_pages = sorted(set(range(1, TOTAL_BOOK_PAGES + 1)) - cached_indices)
    if missing_pages:
        print(f"صفحات باقیمانده:           {len(missing_pages)} صفحه (از صفحه {missing_pages[0]} تا {missing_pages[-1]})")
    else:
        print("🎉 تمامی ۲۴۱ صفحه کتاب با موفقیت استخراج و دیجیتالی شده‌اند!")
    print("=" * 60)


def add_pages_to_cache(new_pages: list):
    """افزودن صفحات جدید به کش و بروزرسانی خودکار تمامی خروجی‌ها"""
    pages = load_cache()
    page_dict = {p.get("pageIndex"): p for p in pages}
    for np in new_pages:
        page_dict[np.get("pageIndex")] = np
    updated = list(page_dict.values())
    save_cache(updated)
    export_all_formats(updated)


def main():
    parser = argparse.ArgumentParser(description="خط لوله دیجیتالی‌سازی کتاب معجزه‌گر خاموش")
    parser.add_argument("--status", action="store_true", help="نمایش وضعیت دیجیتالی‌سازی")
    parser.add_argument("--export", action="store_true", help="تولید مجدد تمامی فایل‌های خروجی از کش")
    args = parser.parse_args()

    if args.status:
        show_status()
    elif args.export:
        pages = load_cache()
        export_all_formats(pages)
    else:
        show_status()


if __name__ == "__main__":
    main()
