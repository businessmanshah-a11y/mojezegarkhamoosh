export interface ChapterItem {
  track: number;
  id: string;
  title: string;
  filename: string;
  path: string;
  start_page: number;
  end_page: number;
  pages_count: number;
  duration: number;
  duration_formatted: string;
  size_mb: number;
  description: string;
}

export const AUDIOBOOK_CHAPTERS: ChapterItem[] = [
  {
    track: 1,
    id: "preface_and_intro",
    title: "بخش آغازین و پیشگفتار",
    filename: "00_preface_and_intro.mp3",
    path: "assets/audio/chapters/00_preface_and_intro.mp3",
    start_page: 1,
    end_page: 7,
    pages_count: 7,
    duration: 464.6,
    duration_formatted: "7:44 دقیقه",
    size_mb: 3.55,
    description: "شناسنامه، فهرست کتاب، پیشگفتار مؤلف و طلیعه نیایش و بیداری درونی"
  },
  {
    track: 2,
    id: "chapter_01_parvaz",
    title: "فصل اول: پرواز",
    filename: "01_chapter_01_parvaz.mp3",
    path: "assets/audio/chapters/01_chapter_01_parvaz.mp3",
    start_page: 8,
    end_page: 13,
    pages_count: 6,
    duration: 568.6,
    duration_formatted: "9:28 دقیقه",
    size_mb: 4.34,
    description: "پرواز با سرعت اندیشه، شکستن محدودیت‌های ادراکی و آغاز دگرگونی"
  },
  {
    track: 3,
    id: "chapter_02_afsaneh_shakhsi",
    title: "فصل دوم: افسانه شخصی",
    filename: "02_chapter_02_afsaneh_shakhsi.mp3",
    path: "assets/audio/chapters/02_chapter_02_afsaneh_shakhsi.mp3",
    start_page: 14,
    end_page: 20,
    pages_count: 7,
    duration: 706.3,
    duration_formatted: "11:46 دقیقه",
    size_mb: 5.39,
    description: "تحقق بخشیدن به رسالت روح، اشتیاق سوزان و کشف مأموریت فردی در جهان"
  },
  {
    track: 4,
    id: "chapter_03_afarinesh_zendegi",
    title: "فصل سوم: آفرینش زندگی",
    filename: "03_chapter_03_afarinesh_zendegi.mp3",
    path: "assets/audio/chapters/03_chapter_03_afarinesh_zendegi.mp3",
    start_page: 21,
    end_page: 34,
    pages_count: 14,
    duration: 1771.8,
    duration_formatted: "29:31 دقیقه",
    size_mb: 13.52,
    description: "معجزات با انتخاب خلق می‌شوند؛ قوانین نانوشته کائنات و ارتعاش وجودی"
  },
  {
    track: 5,
    id: "chapter_04_ghodrat_ghalb",
    title: "فصل چهارم: قدرت قلب",
    filename: "04_chapter_04_ghodrat_ghalb.mp3",
    path: "assets/audio/chapters/04_chapter_04_ghodrat_ghalb.mp3",
    start_page: 35,
    end_page: 42,
    pages_count: 8,
    duration: 965.0,
    duration_formatted: "16:05 دقیقه",
    size_mb: 7.36,
    description: "پیوند با هوش کیهانی و هدایت باطنی؛ چرا همیشه حق با قلب شماست؟"
  },
  {
    track: 6,
    id: "chapter_05_shohood_va_mokashefeh",
    title: "فصل پنجم: شهود و مکاشفه",
    filename: "05_chapter_05_shohood_va_mokashefeh.mp3",
    path: "assets/audio/chapters/05_chapter_05_shohood_va_mokashefeh.mp3",
    start_page: 43,
    end_page: 91,
    pages_count: 49,
    duration: 7723.9,
    duration_formatted: "2 ساعت و 8 دقیقه",
    size_mb: 58.93,
    description: "شنیدن ندای شهود، مکاشفه باطنی، عبور از خاطرات رنج و اتصال به ابدیت"
  },
  {
    track: 7,
    id: "chapter_06_ghalamro_sokoot",
    title: "فصل ششم: قلمرو سکوت و مراقبه",
    filename: "06_chapter_06_ghalamro_sokoot.mp3",
    path: "assets/audio/chapters/06_chapter_06_ghalamro_sokoot.mp3",
    start_page: 92,
    end_page: 100,
    pages_count: 9,
    duration: 1358.5,
    duration_formatted: "22:38 دقیقه",
    size_mb: 10.37,
    description: "ورود به معبد سکوت، آرامش ژرف مراقبه و خاموش‌سازی قضاوت‌های ذهن"
  },
  {
    track: 8,
    id: "chapter_07_zistan_dar_atash_aknoon",
    title: "فصل هفتم: زیستن در آتش اکنون",
    filename: "07_chapter_07_zistan_dar_atash_aknoon.mp3",
    path: "assets/audio/chapters/07_chapter_07_zistan_dar_atash_aknoon.mp3",
    start_page: 101,
    end_page: 118,
    pages_count: 18,
    duration: 2537.6,
    duration_formatted: "42:17 دقیقه",
    size_mb: 19.36,
    description: "رهایی از بار گران گذشته و اضطراب فردا؛ تجربه حضور تمام‌عیار در لحظه حال"
  },
  {
    track: 9,
    id: "chapter_08_jedal_nafs_va_eshgh",
    title: "فصل هشتم: جدال بین نفس و عشق در روابط",
    filename: "08_chapter_08_jedal_nafs_va_eshgh.mp3",
    path: "assets/audio/chapters/08_chapter_08_jedal_nafs_va_eshgh.mp3",
    start_page: 119,
    end_page: 152,
    pages_count: 34,
    duration: 5249.0,
    duration_formatted: "1 ساعت و 27 دقیقه",
    size_mb: 40.05,
    description: "روابط حقیقی در برابر تملک‌جویی ایگو؛ شفای پیوندها و هنر عشق ورزیدن بدون وابستگی"
  },
  {
    track: 10,
    id: "chapter_09_talab_konid",
    title: "فصل نهم: طلب کنید، داده خواهد شد",
    filename: "09_chapter_09_talab_konid.mp3",
    path: "assets/audio/chapters/09_chapter_09_talab_konid.mp3",
    start_page: 153,
    end_page: 176,
    pages_count: 24,
    duration: 3661.8,
    duration_formatted: "1 ساعت و 1 دقیقه",
    size_mb: 27.94,
    description: "قانون جذب، طلب خالصانه از مبدأ هستی و دریافت بی‌دریغ موهبت‌های کائنات"
  },
  {
    track: 11,
    id: "chapter_10_rahayi_va_paziresh",
    title: "فصل دهم: رهایی و پذیرش خویشتن",
    filename: "10_chapter_10_rahayi_va_paziresh.mp3",
    path: "assets/audio/chapters/10_chapter_10_rahayi_va_paziresh.mp3",
    start_page: 177,
    end_page: 208,
    pages_count: 32,
    duration: 5257.7,
    duration_formatted: "1 ساعت و 27 دقیقه",
    size_mb: 40.11,
    description: "پذیرش عمیق خود بدون ماسک، شفای کودک درون، رهایی از قضاوت و صلح با کل هستی"
  },
  {
    track: 12,
    id: "chapter_11_mojezeye_khamoosh",
    title: "فصل یازدهم: معجزه‌گر خاموش و حقیقت حضور",
    filename: "11_chapter_11_mojezeye_khamoosh.mp3",
    path: "assets/audio/chapters/11_chapter_11_mojezeye_khamoosh.mp3",
    start_page: 209,
    end_page: 241,
    pages_count: 33,
    duration: 4317.2,
    duration_formatted: "1 ساعت و 11 دقیقه",
    size_mb: 32.94,
    description: "فرجام کتاب؛ تجلی معجزه‌گر خاموش در زندگی روزمره و وصال با حقیقت ناب درون"
  }
];

export const AUDIOBOOK_SUMMARY = {
  totalDuration: "۹ ساعت و ۳۶ دقیقه",
  totalChapters: 12,
  totalPages: 241,
  bitrate: "128 kbps",
  voice: "Bodi (Gemini Ultra-Fidelity)",
  fidelity: "وفاداری ۱۰۰٪ کلمه‌به‌کلمه به نسخه چاپی",
  author: "سید رضا حیات‌الغیب",
  publisher: "انتشارات سخنوران"
};
