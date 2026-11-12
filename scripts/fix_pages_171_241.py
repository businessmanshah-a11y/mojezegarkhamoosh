#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
اصلاح جامع ساختار صفحات ۱۷۱ تا ۲۴۱ کتاب «معجزه‌گر خاموش»
تبدیل فیلد content به آرایه ساختاریافته paragraphs برای وب‌ریدر، خروجی‌های کتاب و ماژول صوتی
"""

import json
import re
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from scripts.transcribe_book import CACHE_FILE, export_all_formats, load_cache, save_cache


def fix_pages():
    pages = load_cache()
    if not pages:
        print("[!] خطای بارگذاری کش.")
        return

    print(f"[*] بررسی و به‌روزرسانی ۲۴۱ صفحه کش...")
    updated_count = 0

    for idx, item in enumerate(pages):
        pi = item.get("pageIndex")
        if not (171 <= pi <= 241):
            continue

        c = item.get("content", "")

        # صفحه ۱۷۷: آغازگر فصل دهم (اقیانوس درون)
        if pi == 177:
            item["chapter"] = "فصل دهم: اقیانوس درون"
            item["type"] = "chapter-cover"
            item["marginRibbon"] = "فصل دهم"
            item["sectionBadge"] = "فصل دهم"
            item["title"] = "فصل دهم: اقیانوس درون"
            item["subtitle"] = "تا وقتی ناخودآگاه را خودآگاه نکنید، زندگی شما را هدایت خواهد کرد و شما نام آن را سرنوشت خواهید گذاشت."
            item["paragraphs"] = [
                "<strong>اقیانوس درون</strong>",
                "تا وقتی ناخودآگاه را خودآگاه نکنید، زندگی شما را هدایت خواهد کرد و شما نام آن را سرنوشت خواهید گذاشت."
            ]
            item["callout"] = "«تا وقتی ناخودآگاه را خودآگاه نکنید، زندگی شما را هدایت خواهد کرد و شما نام آن را سرنوشت خواهید گذاشت.»"

        # صفحه ۲۰۹: آغازگر فصل یازدهم (آگاهی، آزادی، عشق)
        elif pi == 209:
            item["chapter"] = "فصل یازدهم: آگاهی، آزادی، عشق"
            item["type"] = "chapter-cover"
            item["marginRibbon"] = "فصل یازدهم"
            item["sectionBadge"] = "فصل یازدهم"
            item["title"] = "فصل یازدهم: آگاهی، آزادی، عشق"
            item["subtitle"] = "وقتی بر اساس متعالی ترین اصول زندگی می کنی؛ نتیجه بازی مهم نیست. هرچه باشد، درست است."
            item["paragraphs"] = [
                "<strong>آگاهی، آزادی، عشق</strong>",
                "وقتی بر اساس متعالی ترین اصول زندگی می کنی؛ نتیجه بازی مهم نیست. هرچه باشد، درست است."
            ]
            item["callout"] = "«وقتی بر اساس متعالی ترین اصول زندگی می کنی؛ نتیجه بازی مهم نیست. هرچه باشد، درست است.»"

        # صفحه ۲۴۱: فرجام کتاب
        elif pi == 241:
            item["chapter"] = "فرجام: به امید دیدار در بیکرانگی"
            item["type"] = "epilogue"
            item["marginRibbon"] = "فرجام کتاب"
            item["sectionBadge"] = "فرجام کتاب"
            item["title"] = "فرجام: به امید دیدار در بیکرانگی"
            item["subtitle"] = "سفری بی انتها به سوی ناشناخته‌ها"
            item["paragraphs"] = [
                "و این کتاب همچنان سفری بی انتهاست<br>به سوی ناشناخته هایی که ما را به شناخت خویش وا می دارد...<br>آنجا که همه چیز و هیچ چیز است...<br>آنجا که فراتر از هر پروازی به سوی اوست...<br>به امید دیدار دوباره ی من و تو در آنجا..."
            ]
            item["callout"] = ""

        # صفحات عمومی محتوایی ۱۷۱ تا ۲۴۰
        else:
            if 171 <= pi <= 176:
                item["chapter"] = "فصل نهم: طلب کنید، داده خواهد شد"
                item["type"] = "content"
                item["marginRibbon"] = "فصل نهم | پاراگراف‌های زندگی‌ساز"
            elif 178 <= pi <= 208:
                item["chapter"] = "فصل دهم: اقیانوس درون"
                item["type"] = "content"
                item["marginRibbon"] = "اقیانوس درون | پاراگراف‌های زندگی‌ساز"
            elif 210 <= pi <= 240:
                item["chapter"] = "فصل یازدهم: آگاهی، آزادی، عشق"
                item["type"] = "content"
                item["marginRibbon"] = "آگاهی، آزادی، عشق | پاراگراف‌های زندگی‌ساز"

            raw_blocks = [b.strip() for b in re.split(r"\n\s*\n", c) if b.strip()]
            paras = []
            for b in raw_blocks:
                lines = [re.sub(r"[ \t]+", " ", line).strip() for line in b.splitlines() if line.strip()]
                paras.append("<br>".join(lines))
            item["paragraphs"] = paras

        updated_count += 1

    print(f"[✓] {updated_count} صفحه (از ۱۷۱ تا ۲۴۱) با ساختار استاندارد پاراگراف‌ها بازسازی شدند.")
    save_cache(pages)
    export_all_formats(pages)
    print("[✓] تمام خروجی‌ها (JS، MD، TXT) بروزرسانی شدند.")


if __name__ == "__main__":
    fix_pages()
