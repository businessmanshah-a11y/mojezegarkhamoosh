import React, { useState } from 'react';
import { ArrowLeft, Headphones, BookOpen, Check, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { AmbientVideo } from './AmbientVideo';

export const HeroSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
    setEmail('');
  };

  // Staggered container for elegant micro-load animation (ریز ریز لود شدن)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section id="hero" className="min-h-screen overflow-hidden relative flex flex-col justify-between bg-black pt-28 md:pt-36 pb-12">
      {/* Background Ambient Video with Guaranteed Infinite Loop & High Visibility */}
      <AmbientVideo
        className="absolute inset-0 w-full h-full object-cover object-bottom pointer-events-none opacity-85 md:opacity-90"
        poster="assets/images/hero-poster.jpg"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4"
      />

      {/* Atmospheric Soft Vignette (Preserves the Golden Statue and Celestial Light) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/15 to-transparent pointer-events-none z-0" />
      <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none z-0" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gold-500/[0.06] blur-[140px] pointer-events-none rounded-full" />

      {/* Hero Content (Staggered Load Animation) */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 md:px-6 text-center max-w-4xl mx-auto my-auto"
      >
        {/* Subtle pill tag */}
        <motion.div variants={itemVariants} className="liquid-glass rounded-full px-4 py-1.5 mb-6 inline-flex items-center gap-2 shadow-lg shadow-black/40">
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          <span className="text-white/90 text-xs tracking-wide">
            کتاب صوتی کامل ۱۲ فصل • ۹ ساعت و ۳۶ دقیقه
          </span>
        </motion.div>

        {/* Master Headline (Persian Minimalist Power) */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-extrabold tracking-tight mb-4 leading-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.85)]"
        >
          معجزه‌گر خاموش
        </motion.h1>

        {/* Short Punchy Sub-headline */}
        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl md:text-2xl text-gold-400 font-semibold mb-5 drop-shadow-[0_2px_15px_rgba(0,0,0,0.85)]"
        >
          پاراگراف‌های زندگی‌ساز اثر سید رضا حیات‌الغیب
        </motion.p>

        {/* Minimal Single-Sentence Quote (80% less text) */}
        <motion.p
          variants={itemVariants}
          className="text-white/90 text-xs sm:text-sm max-w-md mx-auto mb-8 font-normal leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]"
        >
          «در خاموشی، معجزه رخ می‌دهد.» اثری ماندگار برای بیداری معنوی و کشف آرامش ناب درون.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto mb-8"
        >
          <a
            href="#audiobook"
            className="w-full sm:w-auto liquid-glass liquid-glass-interactive rounded-full px-7 py-3 text-white text-sm font-semibold flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Headphones className="w-4 h-4 text-gold-400 group-hover:scale-110 transition-transform" />
            <span>شنیدن کتاب صوتی ۱۲ فصل</span>
          </a>

          <a
            href="reader.html"
            className="w-full sm:w-auto rounded-full px-7 py-3 bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/10 hover:scale-105"
          >
            <BookOpen className="w-4 h-4 text-black" />
            <span>مطالعه کتابخوان آنلاین</span>
          </a>
        </motion.div>

        {/* Compact Email Pill (Clean & Mobile Optimized) */}
        <motion.form
          variants={itemVariants}
          onSubmit={handleSubscribe}
          className="w-full max-w-md mx-auto"
        >
          <div className="liquid-glass rounded-full pr-4 pl-1.5 py-1.5 flex items-center justify-between gap-2 bg-black/50 backdrop-blur-md border border-white/10">
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="شماره یا ایمیل برای دریافت فصل اول رایگان..."
              className="bg-transparent flex-1 text-white placeholder:text-white/40 text-xs sm:text-sm outline-none px-2 text-right"
              dir="rtl"
            />
            <button
              type="submit"
              className="w-9 h-9 bg-white rounded-full text-black hover:bg-white/90 hover:scale-105 active:scale-95 transition-all flex items-center justify-center shrink-0 cursor-pointer"
              aria-label="ارسال"
            >
              {submitted ? <Check className="w-4 h-4 text-emerald-600" /> : <ArrowLeft className="w-4 h-4" />}
            </button>
          </div>
          {submitted && (
            <p className="text-emerald-400 text-xs mt-2 text-center">
              درخواست شما ثبت شد؛ لینک فصل اول ارسال می‌گردد.
            </p>
          )}
        </motion.form>
      </motion.div>

      {/* Footer Metrics Indicator */}
      <div className="relative z-10 flex items-center justify-center gap-6 text-[11px] text-white/40 font-medium px-4">
        <span>۲۴۱ صفحه چاپی</span>
        <span>•</span>
        <span>۱۲ فصل صوتی</span>
        <span>•</span>
        <span>انتشارات سخنوران</span>
      </div>
    </section>
  );
};
