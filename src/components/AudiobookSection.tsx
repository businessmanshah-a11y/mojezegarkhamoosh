import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Headphones, Play, Pause, RotateCcw, BookOpen, Volume2, CheckCircle2 } from 'lucide-react';
import { AUDIOBOOK_CHAPTERS, ChapterItem } from '../data/audiobookData';

export const AudiobookSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  const [activeChapter, setActiveChapter] = useState<ChapterItem>(AUDIOBOOK_CHAPTERS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || activeChapter.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      const nextIndex = AUDIOBOOK_CHAPTERS.findIndex(c => c.id === activeChapter.id) + 1;
      if (nextIndex < AUDIOBOOK_CHAPTERS.length) {
        selectChapter(AUDIOBOOK_CHAPTERS[nextIndex], true);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [activeChapter]);

  const selectChapter = (chapter: ChapterItem, autoPlay = false) => {
    setActiveChapter(chapter);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.src = chapter.path;
      audioRef.current.currentTime = 0;
      audioRef.current.playbackRate = playbackRate;
      if (autoPlay || isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatSec = (sec: number) => {
    if (isNaN(sec) || sec <= 0) return '۰:۰۰';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '۰' : ''}${s}`;
  };

  return (
    <section
      id="audiobook"
      ref={sectionRef}
      className="bg-black py-20 md:py-28 px-4 md:px-6 overflow-hidden relative"
      dir="rtl"
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gold-500/[0.03] blur-[140px] pointer-events-none rounded-full" />

      {/* Hidden audio element */}
      <audio ref={audioRef} src={activeChapter.path} preload="none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header (Minimalist & Powerful) */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-3 bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-bold"
          >
            <span>مدت کل اثر: ۹ ساعت و ۳۶ دقیقه (کلمه‌به‌کلمه و پیوسته)</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-5xl text-white font-extrabold tracking-tight mb-3"
          >
            کتاب صوتی کامل در ۱۲ فصل
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-white/70 text-xs sm:text-sm max-w-xl mx-auto font-light leading-relaxed"
          >
            تمامی ۲۴۱ صفحه کتاب چاپی با کیفیت استودیویی و وفاداری ۱۰۰٪ به متن کتاب ضبط شده است.
          </motion.p>
        </div>

        {/* Master Mini-Player */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="liquid-glass rounded-3xl p-5 md:p-8 mb-10 bg-black/60 backdrop-blur-xl border border-white/10"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            {/* Active Track Title */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-gold-400 font-bold text-base md:text-lg">
                {activeChapter.track}
              </div>
              <div className="text-right">
                <span className="text-[11px] text-gold-400 font-medium block">
                  در حال پخش • ترک {activeChapter.track} از ۱۲
                </span>
                <h3 className="text-lg md:text-xl text-white font-bold">
                  {activeChapter.title}
                </h3>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={cyclePlaybackRate}
                className="liquid-glass rounded-full px-3 py-1 text-xs text-white/80 hover:text-white font-semibold"
                title="تغییر سرعت"
              >
                {playbackRate}x
              </button>

              <button
                onClick={togglePlay}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl cursor-pointer"
                aria-label={isPlaying ? 'توقف' : 'پخش'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-0.5" />}
              </button>

              <button
                onClick={() => {
                  if (audioRef.current) audioRef.current.currentTime = 0;
                }}
                className="liquid-glass rounded-full p-2.5 text-white/70 hover:text-white transition-colors"
                title="پخش از ابتدا"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrubber */}
          <div className="mt-5 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between text-[11px] text-white/40 mb-1.5 font-mono">
              <span>{formatSec(currentTime)}</span>
              <span>{activeChapter.duration_formatted}</span>
            </div>
            <input
              type="range"
              min="0"
              max={duration || activeChapter.duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>
        </motion.div>

        {/* 12 Chapters Clean Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
          {AUDIOBOOK_CHAPTERS.map((chapter) => {
            const isCurrent = activeChapter.id === chapter.id;
            return (
              <div
                key={chapter.id}
                onClick={() => selectChapter(chapter, true)}
                className={`rounded-2xl p-4 flex items-center justify-between gap-3 cursor-pointer transition-all duration-200 border ${
                  isCurrent
                    ? 'bg-zinc-900/95 border-gold-500/60 shadow-lg shadow-gold-500/10'
                    : 'bg-zinc-950/80 border-white/10 hover:border-white/25 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0 text-xs font-bold text-white">
                    {chapter.track}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-white text-xs sm:text-sm font-semibold truncate">
                      {chapter.title}
                    </span>
                    <span className="text-[11px] text-white/40 truncate">
                      صفحات {chapter.start_page} تا {chapter.end_page} • {chapter.duration_formatted}
                    </span>
                  </div>
                </div>

                <button
                  className={`p-2 rounded-full shrink-0 transition-all ${
                    isCurrent && isPlaying
                      ? 'bg-gold-500 text-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  aria-label="پخش"
                >
                  {isCurrent && isPlaying ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Direct Link to Reader */}
        <div className="liquid-glass rounded-2xl p-6 text-center bg-black/40">
          <p className="text-white text-sm font-medium mb-3">
            مطالعه همگام متن صفحه به صفحه با صوت در کتابخوان آنلاین
          </p>
          <a
            href="reader.html"
            className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 bg-white text-black text-xs font-bold hover:bg-white/90 transition-all hover:scale-105"
          >
            <BookOpen className="w-4 h-4" />
            <span>ورود به کتابخوان آنلاین (۲۴۱ صفحه)</span>
          </a>
        </div>
      </div>
    </section>
  );
};
