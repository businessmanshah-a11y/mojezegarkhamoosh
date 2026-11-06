/**
 * معجزه‌گر خاموش (The Silent Miracle)
 * Core Interactive Engine: Audio Synthesizer, 3D Tilt, Oracle, Reader, Quiz, Studio
 */

// --- 1. Soundscapes & Web Audio API Synthesizer ---
class ZenAudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.ambientSource = null;
    this.ambientGain = null;
    this.isPlaying = false;
    this.currentSoundType = 'bowl';
    this.isMuted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Tibetan Singing Bowl Harmonic Chime
  playTibetanBowl(freq = 288, duration = 4.5) {
    this.init();
    const now = this.ctx.currentTime;
    
    // Partial harmonics (Singing bowl resonance)
    const partials = [
      { ratio: 1.0, gain: 0.6 },
      { ratio: 2.76, gain: 0.25 },
      { ratio: 5.4, gain: 0.12 },
      { ratio: 8.9, gain: 0.05 }
    ];

    partials.forEach(p => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * p.ratio, now);

      gain.gain.setValueAtTime(p.gain * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    });
  }

  // Ambient Loop Generator (432Hz Drone / Rain / Ocean)
  startAmbient(type = 'meditation') {
    this.init();
    this.stopAmbient();
    this.currentSoundType = type;

    const now = this.ctx.currentTime;
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.01, now);
    this.ambientGain.gain.linearRampToValueAtTime(0.2, now + 2);
    this.ambientGain.connect(this.ctx.destination);

    if (type === 'meditation') {
      // 432 Hz Sacred Frequency Drone with binaural beat
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(432, now);
      osc2.frequency.setValueAtTime(436, now); // 4Hz Theta beat

      osc1.connect(this.ambientGain);
      osc2.connect(this.ambientGain);
      osc1.start(now);
      osc2.start(now);
      this.ambientSource = [osc1, osc2];
    } else if (type === 'rain') {
      // Pink noise filtered for soothing gentle rain
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);

      whiteNoise.connect(filter);
      filter.connect(this.ambientGain);
      whiteNoise.start(now);
      this.ambientSource = [whiteNoise];
    } else if (type === 'ocean') {
      // Periodic filtered wave swell
      const bufferSize = this.ctx.sampleRate * 3;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.15;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(1.5, now);

      // LFO for wave swelling
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, now); // Wave every 8s
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(500, now);
      filter.frequency.setValueAtTime(600, now);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      noise.connect(filter);
      filter.connect(this.ambientGain);
      noise.start(now);
      lfo.start(now);
      this.ambientSource = [noise, lfo];
    } else {
      // Singing bowl pulse
      this.playTibetanBowl(216, 6);
      this.ambientSource = [];
    }

    this.isPlaying = true;
    updateAudioToggleButton(true);
  }

  stopAmbient() {
    if (this.ambientGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.ambientGain.gain.linearRampToValueAtTime(0.0001, now + 1);
      setTimeout(() => {
        if (this.ambientSource) {
          this.ambientSource.forEach(s => {
            try { s.stop(); s.disconnect(); } catch (e) {}
          });
          this.ambientSource = null;
        }
      }, 1000);
    }
    this.isPlaying = false;
    updateAudioToggleButton(false);
  }

  toggleAmbient(type = 'meditation') {
    if (this.isPlaying && this.currentSoundType === type) {
      this.stopAmbient();
    } else {
      this.startAmbient(type);
    }
  }
}

const zenAudio = new ZenAudioSynthesizer();

function updateAudioToggleButton(playing) {
  const btn = document.getElementById('globalAmbientBtn');
  if (!btn) return;
  if (playing) {
    btn.classList.add('playing');
    btn.setAttribute('title', 'توقف نوای آرامش');
  } else {
    btn.classList.remove('playing');
    btn.setAttribute('title', 'پخش نوای سکوت و مراقبه');
  }
}

// --- 2. 3D Tilt Effect on Book ---
function init3DTilt() {
  const card = document.getElementById('book3DCard');
  if (!card) return;

  const handleMove = (e) => {
    const rect = card.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -14;
    const rotateY = ((x - centerX) / centerX) * 14;

    card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
  };

  const handleLeave = () => {
    card.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  card.addEventListener('mousemove', handleMove);
  card.addEventListener('mouseleave', handleLeave);
  card.addEventListener('touchmove', handleMove, { passive: true });
  card.addEventListener('touchend', handleLeave);
}

// --- 3. Quotes Library (پاراگراف‌های زندگی‌ساز) ---
// Loaded dynamically from window.ORACLE_QUOTES (60+ master quotes from chapters 1-11)
const BOOK_QUOTES = (typeof window !== 'undefined' && window.ORACLE_QUOTES && window.ORACLE_QUOTES.length > 0)
  ? window.ORACLE_QUOTES
  : [
      {
        id: 1,
        page: 8,
        chapter: "فصل اول: پرواز",
        title: "پرواز و رهایی",
        quote: "می‌توانیم به فراسوی جهالت گام بگذاریم. می‌توانیم خود را موجوداتی هوشمند با مهارت و برتر ببینیم. می‌توانیم پرواز (آزادی) را بیاموزیم. از میان میلیون‌ها انسان، خیلی انگشت‌شماری پیدا می‌شوند که راه پرواز را بجویند.",
        category: "freedom",
        theme: "پرواز و رهایی"
      }
    ];

// --- 4. Oracle Interaction Controller ---
let currentQuote = BOOK_QUOTES[0];

function initOracle() {
  const quoteText = document.getElementById('oracleQuoteText');
  const metaText = document.getElementById('oracleMetaText');
  const rollBtn = document.getElementById('rollOracleBtn');
  const copyBtn = document.getElementById('copyOracleBtn');
  const shareBtn = document.getElementById('shareOracleBtn');
  const readInReaderBtn = document.getElementById('readInReaderBtn');
  const readInReaderBtnText = document.getElementById('readInReaderBtnText');
  const filterChips = document.querySelectorAll('.filter-chip');

  let activeCategory = 'all';

  function displayRandomQuote(category = activeCategory) {
    const poolData = (typeof window !== 'undefined' && window.ORACLE_QUOTES && window.ORACLE_QUOTES.length > 0)
      ? window.ORACLE_QUOTES
      : BOOK_QUOTES;

    let pool = poolData;
    if (category !== 'all') {
      pool = poolData.filter(q => q.category === category);
    }
    if (pool.length === 0) pool = poolData;

    const randomIndex = Math.floor(Math.random() * pool.length);
    currentQuote = pool[randomIndex];

    zenAudio.playTibetanBowl(432, 2.5);

    if (quoteText) {
      quoteText.style.opacity = 0;
      setTimeout(() => {
        quoteText.textContent = `«${currentQuote.quote}»`;
        if (metaText) {
          metaText.innerHTML = `<span>📖 ${currentQuote.chapter} • ${currentQuote.title || ''}</span> • <span style="color: var(--text-gold); font-weight: 700;">صفحه ${currentQuote.page}</span> • <span>✨ ${currentQuote.categoryLabel || currentQuote.theme}</span>`;
        }
        if (readInReaderBtn) {
          readInReaderBtn.href = `reader.html?page=${currentQuote.page}`;
        }
        if (readInReaderBtnText) {
          readInReaderBtnText.textContent = `مطالعه کامل این بخش در کتابخوان (صفحه ${currentQuote.page})`;
        }
        quoteText.style.opacity = 1;
      }, 200);
    }
  }

  if (rollBtn) {
    rollBtn.addEventListener('click', () => displayRandomQuote(activeCategory));
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const pageTag = currentQuote.page ? `، صفحه ${currentQuote.page}` : '';
      const textToCopy = `«${currentQuote.quote}»\n\n— برگرفته از کتاب معجزه‌گر خاموش (${currentQuote.chapter}${pageTag})`;
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('پاراگراف معجزه‌گر در حافظه کپی شد ✨');
      });
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const pageParam = currentQuote.page ? `?page=${currentQuote.page}` : '';
      const shareText = encodeURIComponent(`«${currentQuote.quote}»\n\nاز کتاب معجزه‌گر خاموش (${currentQuote.chapter}):\nhttps://github.com/businessmanshah-a11y/mojezegarkhamoosh/reader.html${pageParam}`);
      window.open(`https://t.me/share/url?url=${shareText}`, '_blank');
    });
  }

  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategory = chip.dataset.category || 'all';
      displayRandomQuote(activeCategory);
    });
  });

  // Initial draw
  displayRandomQuote('all');
}

// --- 5. Interactive Chapters Dataset & Filter ---
const CHAPTERS_DATA = [
  {
    num: "فصل اول",
    title: "پرواز (پرواز به سوی آگاهی و کمال)",
    startPage: 8,
    pages: "صفحه ۸ تا ۱۳",
    category: "freedom",
    desc: "چگونه باورهای محدودکننده جامعه و تربیت‌های ناکارآمد را رها کنیم و شجاعت اوج گرفتن در آسمان آگاهی ناب را بیابیم.",
    quote: "از میان میلیون‌ها انسان، خیلی انگشت‌شماری پیدا می‌شوند که راه پرواز را بجویند."
  },
  {
    num: "فصل دوم",
    title: "افسانه شخصی (کشف مأموریت روحی)",
    startPage: 14,
    pages: "صفحه ۱۴ تا ۲۰",
    category: "destiny",
    desc: "شناخت دلیل اصیل تولد شما در این جهان و چگونگی هم‌راستا شدن با ندای رسالت روحی که هیچ تردیدی در آن نیست.",
    quote: "وقتی تصمیمی می‌گیرید، به درون جریان نیرومندی پرتاب می‌شوید که فراتر از رویاهای شماست."
  },
  {
    num: "فصل سوم",
    title: "آفرینش زندگی (معماری سرنوشت)",
    startPage: 21,
    pages: "صفحه ۲۱ تا ۳۴",
    category: "wealth",
    desc: "اسرار ارتعاشات ذهنی و فرکانس‌های نامرئی؛ چگونه جهان پیرامون به باورهای عمیق ناخودآگاه شما شکل فیزیکی می‌دهد.",
    quote: "جهان پیرامون، آینه‌ای بی‌نقص از ارتعاشات حقیقی درون شماست."
  },
  {
    num: "فصل چهارم",
    title: "قدرت قلب (قطب‌نمای درون)",
    startPage: 35,
    pages: "صفحه ۳۵ تا ۴۲",
    category: "heart",
    desc: "عبور از بازی‌های فرساینده ذهن شکاک و اتصال به میدان الکترومغناطیسی قدرتمند قلب برای دریافت مستقیم پاسخ‌ها.",
    quote: "صدای هیاهوی عقل را کم کنید؛ قلب همواره مسیر نور را می‌شناسد."
  },
  {
    num: "فصل پنجم",
    title: "شهود و مکاشفه (ارتباط با خرد کل)",
    startPage: 43,
    pages: "صفحه ۴۳ تا ۹۱",
    category: "heart",
    desc: "راهنمای گام‌به‌گام دریافت نشانه‌ها، الهامات غیبی و هم‌زمانی‌های معنادار کیهانی در کارهای روزمره.",
    quote: "شهود زبانی است که خداوند در لحظات سکوت با بندگانش سخن می‌گوید."
  },
  {
    num: "فصل ششم",
    title: "قلمرو سکوت و مراقبه (سرچشمه معجزات)",
    startPage: 92,
    pages: "صفحه ۹۲ تا ۱۰۰",
    category: "peace",
    desc: "ورود به خلاء شفا‌بخش بین دو اندیشه؛ جایی که تمامی خلق‌ها، درمان‌ها و مکاشفات عظیم در خاموشی شکل می‌گیرند.",
    quote: "سکوت تنها صدای خداست. برای زندگی بخشیدن باید به سکوت بین افکار راه یابیم."
  },
  {
    num: "فصل هفتم",
    title: "زیستن در آتش اکنون (رهایی از بار زمان)",
    startPage: 101,
    pages: "صفحه ۱۰۱ تا ۱۱۸",
    category: "presence",
    desc: "پایان دادن به شکنجه ذهنی حسرت گذشته و اضطراب آینده با غرق شدن تمام‌عیار در معجزه ابدی لحظه اکنون.",
    quote: "اگر دیگر نمی‌خواهی رنج تولید کنی، بیش از این در ذهنت زمان نیافرین."
  },
  {
    num: "فصل هشتم",
    title: "جدال بین نفس و عشق در روابط",
    startPage: 119,
    pages: "صفحه ۱۱۹ تا ۱۵۲",
    category: "love",
    desc: "شناسایی بازی‌های مخرب ایگو و برتری‌طلبی در روابط و جایگزینی آن با هم‌دلی، پذیرش عمیق و عشق بی‌قیدوشرط.",
    quote: "عشق ادعایی ندارد و مالکیت نمی‌شناسد؛ عشق جاری شدن در آرامش است."
  },
  {
    num: "فصل نهم",
    title: "طلب کنید، داده خواهد شد (هنر تجلی)",
    startPage: 153,
    pages: "صفحه ۱۵۳ تا ۱۷۶",
    category: "wealth",
    desc: "اصول علمی و معنوی درخواست از کائنات؛ عبور از فرکانس نیاز و فقر به ارتعاش شکرگزاری و دریافت بی‌نهایت.",
    quote: "وقتی با حس اطمینان و شکرگزاری طلب کنید، درهای رزق آسمانی گشوده می‌شود."
  },
  {
    num: "فصل دهم",
    title: "اقیانوس درون (غواصی در بی‌نهایت)",
    startPage: 177,
    pages: "صفحه ۱۷۷ تا ۲۰۸",
    category: "wisdom",
    desc: "کشف منابع لایزال انرژی، نبوغ و شفا در ژرفای وجود انسانی که ماورای تصور حواس پنج‌گانه است.",
    quote: "تو تمام اقیانوسی که در قالب یک قطره متجلی شده است؛ مرزها در ذهن توست."
  },
  {
    num: "فصل پایانی",
    title: "آگاهی، آزادی، عشق (پرواز نهایی)",
    startPage: 209,
    pages: "صفحه ۲۰۹ تا ۲۴۱",
    category: "wisdom",
    desc: "فصل جمع‌بندی و عروج روحی؛ رهایی از تمام قیدها چون رودخانه‌ای سبک‌بال که سرانجام به آغوش دریا می‌پیوندد.",
    quote: "چنان رها باش که وجودت از حرکت بازنماند؛ همچون رودخانه باش..."
  }
];

function initChapters() {
  const container = document.getElementById('chaptersGrid');
  const tabs = document.querySelectorAll('.chapter-tab');
  const searchInput = document.getElementById('chapterSearchInput');

  function render(filter = 'all', query = '') {
    if (!container) return;
    container.innerHTML = '';

    const filtered = CHAPTERS_DATA.filter(item => {
      const matchCat = (filter === 'all') || (item.category === filter);
      const matchQuery = !query || item.title.includes(query) || item.desc.includes(query);
      return matchCat && matchQuery;
    });

    if (filtered.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">فصلی با این مشخصات یافت نشد.</div>`;
      return;
    }

    filtered.forEach((ch, idx) => {
      const card = document.createElement('div');
      card.className = 'chapter-card';
      card.innerHTML = `
        <div class="chapter-header">
          <span class="chapter-num">${ch.num}</span>
          <span class="chapter-pages">${ch.pages}</span>
        </div>
        <h3 class="chapter-title">${ch.title}</h3>
        <p class="chapter-desc">${ch.desc}</p>
        <div class="chapter-quote-preview">«${ch.quote}»</div>
        <div class="chapter-footer">
          <a class="chapter-read-btn" href="reader.html?page=${ch.startPage}">
            <span>ورق زدن در کتابخوان</span>
            <span>←</span>
          </a>
        </div>
      `;
      container.appendChild(card);
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      render(tab.dataset.tab, searchInput ? searchInput.value.trim() : '');
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const currentTab = document.querySelector('.chapter-tab.active')?.dataset.tab || 'all';
      render(currentTab, e.target.value.trim());
    });
  }

  render('all', '');
}

// --- 6. Online Book Reader Engine ---
const READER_PAGES = (typeof window !== 'undefined' && window.BOOK_PAGES_DATA && window.BOOK_PAGES_DATA.length > 0)
  ? window.BOOK_PAGES_DATA.map(p => ({
      title: p.chapter || 'معجزه‌گر خاموش',
      subtitle: p.sectionBadge || p.title || 'پاراگراف‌های زندگی‌ساز',
      pageNumber: `صفحه ${p.pageIndex} (ص چاپی: ${p.bookPageNum || p.pageIndex})`,
      content: (p.paragraphs || []).map(t => `<p>${t}</p>`).join('') + (p.callout ? `<div style="background: rgba(229, 184, 90, 0.1); border-right: 3px solid var(--text-gold); padding: 12px 16px; margin: 14px 0; border-radius: 4px; font-weight: 600; color: var(--text-gold);">${p.callout}</div>` : '')
    }))
  : [
      {
        title: "پیش‌گفتار کتاب",
        subtitle: "پاراگراف‌های زندگی‌ساز",
        pageNumber: "صفحه ۴ و ۵",
        content: `<p>در طول به تحریر درآمدن این کتاب بارها و بارها گفتگو کردیم و با خود اندیشیدیم...</p>`
      }
    ];

let currentReaderIndex = 0;

function openReader(index = 0) {
  currentReaderIndex = Math.max(0, Math.min(index, READER_PAGES.length - 1));
  const modal = document.getElementById('readerModalOverlay');
  if (!modal) return;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  updateReaderView();
  zenAudio.playTibetanBowl(324, 2);
}

function closeReader() {
  const modal = document.getElementById('readerModalOverlay');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function updateReaderView() {
  const page = READER_PAGES[currentReaderIndex];
  const titleEl = document.getElementById('readerPageTitle');
  const subtitleEl = document.getElementById('readerPageSubtitle');
  const bodyEl = document.getElementById('readerBody');
  const indicatorEl = document.getElementById('readerPageIndicator');
  const prevBtn = document.getElementById('readerPrevBtn');
  const nextBtn = document.getElementById('readerNextBtn');

  if (titleEl) titleEl.textContent = page.title;
  if (subtitleEl) subtitleEl.textContent = `${page.subtitle} (${page.pageNumber})`;
  if (bodyEl) {
    bodyEl.innerHTML = page.content;
    bodyEl.scrollTop = 0;
  }
  if (indicatorEl) {
    indicatorEl.textContent = `صفحه ${currentReaderIndex + 1} از ${READER_PAGES.length}`;
  }

  if (prevBtn) prevBtn.disabled = currentReaderIndex === 0;
  if (nextBtn) nextBtn.disabled = currentReaderIndex === READER_PAGES.length - 1;
}

function initReaderControls() {
  const prevBtn = document.getElementById('readerPrevBtn');
  const nextBtn = document.getElementById('readerNextBtn');
  const closeBtn = document.getElementById('readerCloseBtn');
  const fontSm = document.getElementById('fontSmBtn');
  const fontMd = document.getElementById('fontMdBtn');
  const fontLg = document.getElementById('fontLgBtn');
  const themeToggle = document.getElementById('readerThemeToggle');
  const bodyEl = document.getElementById('readerBody');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentReaderIndex > 0) {
        currentReaderIndex--;
        updateReaderView();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentReaderIndex < READER_PAGES.length - 1) {
        currentReaderIndex++;
        updateReaderView();
      }
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', closeReader);

  if (fontSm) fontSm.addEventListener('click', () => setReaderFont('font-sm'));
  if (fontMd) fontMd.addEventListener('click', () => setReaderFont('font-md'));
  if (fontLg) fontLg.addEventListener('click', () => setReaderFont('font-lg'));

  function setReaderFont(cls) {
    if (!bodyEl) return;
    bodyEl.classList.remove('font-sm', 'font-md', 'font-lg');
    bodyEl.classList.add(cls);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      bodyEl?.classList.toggle('theme-sepia');
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('readerModalOverlay');
    if (!modal || !modal.classList.contains('active')) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      if (currentReaderIndex < READER_PAGES.length - 1) {
        currentReaderIndex++;
        updateReaderView();
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      if (currentReaderIndex > 0) {
        currentReaderIndex--;
        updateReaderView();
      }
    } else if (e.key === 'Escape') {
      closeReader();
    }
  });
}

// --- 7. Self-Discovery Quiz Engine ---
const QUIZ_QUESTIONS = [
  {
    question: "در این مقطع از زندگی‌تان، کدام چالش بیشترین انرژی فکری شما را مصرف می‌کند؟",
    options: [
      { text: "سردرگمی درباره هدف واقعی زندگی و احساس درجا زدن در روزمرگی", tag: "destiny" },
      { text: "نشخوار فکری بی‌پایان، اضطراب آینده و حسرت رویدادهای گذشته", tag: "peace" },
      { text: "محدودیت‌های مالی و احساس عدم توانایی در خلق اهداف بزرگ", tag: "wealth" },
      { text: "اصطکاک در روابط عاطفی و احساس عدم درک متقابل", tag: "love" }
    ]
  },
  {
    question: "رابطه شما با صدای درون ذهنتان در خلوت چگونه است؟",
    options: [
      { text: "ذهنم مدام در حال قضاوت و تجزیه‌وتحلیل ترس‌هاست؛ آرامش ندارم", tag: "peace" },
      { text: "اشتیاق عجیبی برای تحول دارم ولی نمی‌دانم از کدام مسیر باید پرواز کنم", tag: "freedom" },
      { text: "به دنبال کشف توانایی‌های پنهانم و رسالت الهی خودم هستم", tag: "destiny" },
      { text: "زودرنج شده‌ام و رفتارهای دیگران عمیقاً روحم را آزار می‌دهد", tag: "love" }
    ]
  },
  {
    question: "وقتی کلمه «معجزه» را می‌شنوید، اولین چیزی که در قلبتان طلب می‌کنید چیست؟",
    options: [
      { text: "رسیدن به ثروت فراوان و تجلی رویایی که مدت‌هاست در سر دارم", tag: "wealth" },
      { text: "سکوت مطلق درونی و رهایی از تمام ترس‌ها و تلاطم‌ها", tag: "peace" },
      { text: "عشق ناب و صمیمیتی عاری از خودخواهی و نقاب", tag: "love" },
      { text: "آزادی حقیقی و پرواز به ورای تمام قید و بندها", tag: "freedom" }
    ]
  },
  {
    question: "اگر قرار باشد همین امروز یک هدیه بزرگ به روحتان بدهید، کدام را انتخاب می‌کنید؟",
    options: [
      { text: "یک ساعت سکوت و خلوت عمیق کنار آب بدون گوشی و دغدغه", tag: "peace" },
      { text: "شفافیت کامل در اینکه دقیقاً در ۱۰ سال آینده باید چه کار کنم", tag: "destiny" },
      { text: "گشایش مالی شگفت‌انگیز که تمام قفل‌ها را باز کند", tag: "wealth" },
      { text: "احساس یکی شدن با خالق هستی و آرامش جاودان", tag: "freedom" }
    ]
  }
];

const QUIZ_RESULTS = {
  peace: {
    title: "روح در تمنای آرامش و سکوت مطلق",
    chapter: "فصل ششم: قلمرو سکوت و مراقبه (ص ۹۵) و فصل هفتم: زیستن در آتش کنون (ص ۱۱۰)",
    desc: "ذهن شما در این مقطع نیاز به رها کردن ترمزها و آتش‌بس با گذشته دارد. کتاب معجزه‌گر خاموش با آموزش شکاف بین افکار، شما را به سرچشمه آرامش دریاگون هدایت خواهد کرد.",
    advice: "همین امروز ۵ دقیقه تمرین تنفس سکوت را در استودیو زیر انجام دهید و فصل ششم را آغاز کنید."
  },
  destiny: {
    title: "قهرمان در آستانه کشف افسانه شخصی",
    chapter: "فصل دوم: افسانه شخصی (ص ۱۷) و فصل چهارم: قدرت قلب (ص ۳۸)",
    desc: "شما نشانه‌های تغییر بزرگ را در روح خود دریافت کرده‌اید. زمان بیدار شدن از خواب روزمرگی فرا رسیده است تا رسالتی که برای آن خلق شده‌اید را با اطمینان دنبال کنید.",
    advice: "فصل دوم را با دقت و خط به خط بخوانید و به هیچ وجه تسلیم ترس‌های اطرافیان نشوید."
  },
  wealth: {
    title: "آفریننده بیدار در پی فراوانی و تجلی",
    chapter: "فصل سوم: آفرینش زندگی (ص ۲۴) و فصل نهم: طلب کنید، داده خواهد شد (ص ۱۵۶)",
    desc: "پتانسیل مالی و تجلی شما سال‌ها در قفل باورهای کمبود خاک خورده است. با یادگیری ارتعاش درخواست و هماهنگی ناخودآگاه با جریان نعمت جهان، شگفتی‌ها آغاز خواهند شد.",
    advice: "اصول طلب کردن در فصل نهم را تمرین کنید و قبل از خواب شکرگزاری دارایی‌های نامرئی را به جا آورید."
  },
  love: {
    title: "طالب یگانگی و رهایی از زخم‌های ایگو",
    chapter: "فصل هشتم: جدال بین نفس و عشق در روابط (ص ۱۲۲)",
    desc: "قلب شما خواهان مهر بی‌قیدوشرط است اما نقاب‌های نفسانی در روابط مانع جریان یافتن آن شده‌اند. با درک تفاوت ایگو و عشق، التیام عمیقی در ارتباطاتتان شکل خواهد گرفت.",
    advice: "به جای تلاش برای اثبات حقانیت خود در روابط، به بخشش و درک عمیق در فصل هشتم متصل شوید."
  },
  freedom: {
    title: "پرنده بلندپرواز در اشتیاق آسمان حقیقت",
    chapter: "فصل اول: پرواز (ص ۱۱) و فصل پایانی: آگاهی، آزادی، عشق (ص ۲۱۲)",
    desc: "چارچوب‌های معمولی جامعه برای روح شما تنگ شده‌اند. شما آمده‌اید تا مرزها را درنوردید و همچون رودخانه‌ای آزاد، به دریای خرد بیکران ملحق گردید.",
    advice: "فصل اول کتاب را همین الان در کتابخوان آنلاین مطالعه کنید تا شوق پرواز در وجودتان شعله‌ور شود."
  }
};

let currentQuizStep = 0;
let quizScores = { peace: 0, destiny: 0, wealth: 0, love: 0, freedom: 0 };

function initQuiz() {
  const container = document.getElementById('quizStepContainer');
  const resultCard = document.getElementById('quizResultCard');
  const progressBar = document.getElementById('quizProgressFill');
  const restartBtn = document.getElementById('quizRestartBtn');

  function renderStep() {
    if (!container) return;
    if (currentQuizStep >= QUIZ_QUESTIONS.length) {
      showResult();
      return;
    }

    const q = QUIZ_QUESTIONS[currentQuizStep];
    const progress = ((currentQuizStep + 1) / QUIZ_QUESTIONS.length) * 100;
    if (progressBar) progressBar.style.width = `${progress}%`;

    container.style.display = 'block';
    if (resultCard) resultCard.style.display = 'none';

    container.innerHTML = `
      <div style="font-size: 0.875rem; color: var(--text-gold); margin-bottom: 10px; font-weight: 600;">پرسش ${currentQuizStep + 1} از ${QUIZ_QUESTIONS.length}</div>
      <h3 class="quiz-question-title">${q.question}</h3>
      <div class="quiz-options">
        ${q.options.map((opt, i) => `
          <div class="quiz-option" data-tag="${opt.tag}">
            <span>${opt.text}</span>
            <span style="font-size: 1.2rem; color: var(--gold-400)">←</span>
          </div>
        `).join('')}
      </div>
    `;

    container.querySelectorAll('.quiz-option').forEach(el => {
      el.addEventListener('click', () => {
        const tag = el.dataset.tag;
        if (tag && quizScores[tag] !== undefined) {
          quizScores[tag]++;
        }
        zenAudio.playTibetanBowl(380 + currentQuizStep * 40, 1.2);
        currentQuizStep++;
        renderStep();
      });
    });
  }

  function showResult() {
    if (!resultCard || !container) return;
    container.style.display = 'none';
    resultCard.style.display = 'block';

    let dominantTag = 'peace';
    let maxScore = -1;
    for (const [tag, score] of Object.entries(quizScores)) {
      if (score > maxScore) {
        maxScore = score;
        dominantTag = tag;
      }
    }

    const res = QUIZ_RESULTS[dominantTag] || QUIZ_RESULTS.peace;
    document.getElementById('resultBadgeText').textContent = res.title;
    document.getElementById('resultChapterText').textContent = res.chapter;
    document.getElementById('resultDescText').textContent = res.desc;
    document.getElementById('resultAdviceText').textContent = res.advice;

    zenAudio.playTibetanBowl(288, 4);
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      currentQuizStep = 0;
      quizScores = { peace: 0, destiny: 0, wealth: 0, love: 0, freedom: 0 };
      renderStep();
    });
  }

  renderStep();
}

// --- 8. Zen Breathing Studio ---
function initBreathingStudio() {
  const orb = document.getElementById('breathingOrb');
  const label = document.getElementById('breathingInstruction');
  const playSoundBtn = document.getElementById('zenChimeBtn');
  const soundBtns = document.querySelectorAll('.soundscape-btn');

  let phase = 0; // 0: inhale, 1: hold, 2: exhale
  const phases = [
    { text: "دم عمیق (آگاهی)...", cls: "inhale", duration: 4000, freq: 288 },
    { text: "حبس در آرامش...", cls: "hold", duration: 4000, freq: 324 },
    { text: "بازدم آرام (تسلیم)...", cls: "exhale", duration: 4000, freq: 216 }
  ];

  function step() {
    if (!orb || !label) return;
    const current = phases[phase];
    orb.className = `breathing-orb ${current.cls}`;
    orb.textContent = current.cls === 'inhale' ? 'دم' : current.cls === 'hold' ? 'حبس' : 'بازدم';
    label.textContent = current.text;

    phase = (phase + 1) % phases.length;
    setTimeout(step, current.duration);
  }

  setTimeout(step, 1000);

  if (playSoundBtn) {
    playSoundBtn.addEventListener('click', () => {
      zenAudio.playTibetanBowl(216, 5);
      showToast('نوای کاسه تبتی نواخته شد 🔔');
    });
  }

  soundBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.sound;
      soundBtns.forEach(b => b.classList.remove('active'));
      if (zenAudio.isPlaying && zenAudio.currentSoundType === type) {
        zenAudio.stopAmbient();
      } else {
        btn.classList.add('active');
        zenAudio.startAmbient(type);
      }
    });
  });
}

// --- 9. Audio Teaser Player & Waveform Visualizer ---
function initAudioShowcase() {
  const canvas = document.getElementById('waveformCanvas');
  const playBtn = document.getElementById('audioPlayBtn');
  const progressBar = document.getElementById('audioProgress');
  const timeCurrent = document.getElementById('audioTimeCurrent');
  const timeTotal = document.getElementById('audioTimeTotal');
  const lines = document.querySelectorAll('.transcript-line');

  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let animationId = null;
  let isPlaying = false;
  let progress = 0;
  const totalDuration = 145; // 2:25

  function drawWaveform() {
    canvas.width = canvas.parentElement.clientWidth || 600;
    canvas.height = 80;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bars = Math.floor(canvas.width / 6);
    const step = canvas.width / bars;

    for (let i = 0; i < bars; i++) {
      const percent = i / bars;
      const isPast = percent <= (progress / totalDuration);
      ctx.fillStyle = isPast ? 'rgba(229, 184, 90, 0.9)' : 'rgba(255, 255, 255, 0.15)';

      let height = 20 + Math.sin(i * 0.2 + Date.now() * 0.005) * 18;
      if (!isPlaying) height = 15 + Math.sin(i * 0.3) * 12;

      const y = (canvas.height - height) / 2;
      ctx.fillRect(i * step, y, 3, height);
    }

    if (isPlaying) {
      progress += 0.05;
      if (progress >= totalDuration) {
        progress = 0;
        isPlaying = false;
        if (playBtn) playBtn.innerHTML = '▶ پخش نمونه صوتی';
      }
      updateTimeDisplay();
      updateTranscript();
      animationId = requestAnimationFrame(drawWaveform);
    }
  }

  function updateTimeDisplay() {
    const mins = Math.floor(progress / 60);
    const secs = Math.floor(progress % 60);
    if (timeCurrent) timeCurrent.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    if (progressBar) progressBar.style.width = `${(progress / totalDuration) * 100}%`;
  }

  function updateTranscript() {
    const activeIndex = Math.min(Math.floor(progress / 28), lines.length - 1);
    lines.forEach((l, i) => {
      if (i === activeIndex) {
        l.classList.add('active');
      } else {
        l.classList.remove('active');
      }
    });
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      if (isPlaying) {
        playBtn.innerHTML = '⏸ توقف موقت';
        zenAudio.startAmbient('meditation');
        drawWaveform();
      } else {
        playBtn.innerHTML = '▶ ادامه پخش';
        zenAudio.stopAmbient();
        cancelAnimationFrame(animationId);
      }
    });
  }

  drawWaveform();
}

// --- 10. Reviews & Realtime Submission System ---
const DEFAULT_REVIEWS = [
  {
    name: "دکتر مریم شریفی",
    role: "روان‌درمانگر و استاد دانشگاه",
    stars: 5,
    text: "به عنوان فردی که سال‌ها در حوزه روانشناسی و بالینی کار کرده‌ام، کتاب معجزه‌گر خاموش یکی از خالص‌ترین و اثرگذارترین کتاب‌هایی بود که خواندم. پاراگراف‌های کوتاه اما مانند ضربه چکش بر دیوارهای کاذب ذهن عمل می‌کنند.",
    date: "۲ روز پیش"
  },
  {
    name: "امیرحسین رضایی",
    role: "کارآفرین و مدیر استارتاپ",
    stars: 5,
    text: "فصل دوم کتاب (افسانه شخصی) زندگی کاری‌ام را نجات داد. دقیقاً در لحظه‌ای که می‌خواستم تسلیم شوم، این کتاب به من یادآوری کرد که جریان اتفاقات بزرگ‌تر از محاسبات خشک عقل من است.",
    date: "هفته گذشته"
  },
  {
    name: "سارا کاظمی",
    role: "مربی یوگا و ذهن‌آگاهی",
    stars: 5,
    text: "فصل ششم و هفتم این کتاب یعنی سکوت و لحظه اکنون، هر روز صبح همراه من است. هر صفحه‌اش را باز می‌کنید دقیقاً پاسخ دغدغه همان روزتان را می‌دهد. فوق‌العاده است.",
    date: "۳ روز پیش"
  }
];

function initReviews() {
  const container = document.getElementById('reviewsGrid');
  const openModalBtn = document.getElementById('openReviewModalBtn');
  const modal = document.getElementById('reviewModalOverlay');
  const closeBtn = document.getElementById('closeReviewModalBtn');
  const form = document.getElementById('reviewSubmitForm');

  // Load from LocalStorage
  let stored = JSON.parse(localStorage.getItem('mojeze_reviews') || 'null');
  if (!stored) {
    stored = DEFAULT_REVIEWS;
    localStorage.setItem('mojeze_reviews', JSON.stringify(stored));
  }

  function renderReviews() {
    if (!container) return;
    container.innerHTML = '';
    stored.forEach(r => {
      const card = document.createElement('div');
      card.className = 'review-card';
      card.innerHTML = `
        <div>
          <div class="review-stars">${'★'.repeat(r.stars || 5)}</div>
          <p class="review-text">«${r.text}»</p>
        </div>
        <div class="review-author">
          <div class="author-avatar">${r.name.charAt(0)}</div>
          <div class="author-info">
            <span class="author-name">${r.name}</span>
            <span class="author-role">${r.role} • ${r.date}</span>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  renderReviews();

  if (openModalBtn) {
    openModalBtn.addEventListener('click', () => {
      if (modal) modal.classList.add('active');
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (modal) modal.classList.remove('active');
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('reviewerName').value.trim();
      const role = document.getElementById('reviewerRole').value.trim() || 'خواننده گرامی';
      const text = document.getElementById('reviewerText').value.trim();

      if (!name || !text) {
        showToast('لطفاً نام و متن نظر خود را وارد کنید.');
        return;
      }

      const newReview = {
        name,
        role,
        stars: 5,
        text,
        date: "امروز"
      };

      stored.unshift(newReview);
      localStorage.setItem('mojeze_reviews', JSON.stringify(stored));
      renderReviews();
      form.reset();
      if (modal) modal.classList.remove('active');
      showToast('دیدگاه ارزشمند شما با موفقیت ثبت شد 🙏');
      zenAudio.playTibetanBowl(432, 2);
    });
  }
}

// --- 11. Countdown Timer ---
function initCountdown() {
  const hoursEl = document.getElementById('timerHours');
  const minutesEl = document.getElementById('timerMinutes');
  const secondsEl = document.getElementById('timerSeconds');

  let remaining = 24 * 3600 - (Date.now() % (24 * 3600 * 1000) / 1000);

  function tick() {
    remaining--;
    if (remaining <= 0) remaining = 24 * 3600;

    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = Math.floor(remaining % 60);

    if (hoursEl) hoursEl.textContent = String(h).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(m).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(s).padStart(2, '0');
  }

  setInterval(tick, 1000);
  tick();
}

// --- 12. FAQ Accordion ---
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (question && answer) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(i => {
          i.classList.remove('active');
          const a = i.querySelector('.faq-answer');
          if (a) a.style.maxHeight = null;
        });
        if (!isActive) {
          item.classList.add('active');
          answer.style.maxHeight = answer.scrollHeight + 30 + 'px';
        }
      });
    }
  });
}

// --- 13. Theme Switching ---
function initTheme() {
  const currentTheme = localStorage.getItem('site_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);

  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const active = document.documentElement.getAttribute('data-theme') || 'dark';
      let next = 'dark';
      if (active === 'dark') next = 'light';
      else if (active === 'light') next = 'sepia';
      else next = 'dark';

      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('site_theme', next);
      showToast(`پوسته تغییر کرد: ${next === 'dark' ? 'حالت شب کیهانی' : next === 'light' ? 'حالت روز شنی' : 'حالت سپیا کهن'}`);
    });
  }
}

// --- 14. Toast Notification Utility ---
function showToast(message, duration = 3500) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>✨</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// --- 15. Header Scroll & Mobile Nav ---
function initNavigation() {
  const header = document.querySelector('.site-header');
  const toggleBtn = document.getElementById('menuToggleBtn');
  const mainNav = document.getElementById('mainNav');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  if (toggleBtn && mainNav) {
    toggleBtn.addEventListener('click', () => {
      mainNav.classList.toggle('open');
    });
    mainNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => mainNav.classList.remove('open'));
    });
  }
}

// --- 16. Download Modal Triggers ---
function openDownloadModal() {
  const modal = document.getElementById('downloadModalOverlay');
  if (modal) {
    modal.classList.add('active');
    zenAudio.playTibetanBowl(360, 2);
  }
}

function closeDownloadModal() {
  const modal = document.getElementById('downloadModalOverlay');
  if (modal) modal.classList.remove('active');
}

// --- Initialize Everything On DOM Ready ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  init3DTilt();
  initOracle();
  initChapters();
  initReaderControls();
  initQuiz();
  initBreathingStudio();
  initAudioShowcase();
  initReviews();
  initCountdown();
  initFAQ();

  const globalAmbientBtn = document.getElementById('globalAmbientBtn');
  if (globalAmbientBtn) {
    globalAmbientBtn.addEventListener('click', () => {
      zenAudio.toggleAmbient('meditation');
    });
  }
});
