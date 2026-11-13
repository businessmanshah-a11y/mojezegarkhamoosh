import React, { useState, useEffect } from 'react';
import { BookOpen, Headphones, Sparkles, ArrowUpRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-4 transition-all duration-300">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={`liquid-glass max-w-5xl mx-auto px-5 md:px-6 py-3 rounded-full flex items-center justify-between transition-all duration-500 ${
          scrolled ? 'bg-black/85 backdrop-blur-xl shadow-2xl shadow-black/90' : 'bg-black/40 backdrop-blur-md'
        }`}
      >
        {/* Right: Brand Title */}
        <a href="#hero" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-105">
            <Sparkles className="w-4 h-4 text-gold-400" />
          </div>
          <span className="text-white font-semibold text-base tracking-tight">
            معجزه‌گر خاموش
          </span>
        </a>

        {/* Center: Desktop Navigation Links (Clean Persian, No clutter) */}
        <div className="hidden md:flex items-center gap-7">
          <a
            href="#audiobook"
            className="text-white/75 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Headphones className="w-3.5 h-3.5 text-gold-400" />
            <span>کتاب صوتی ۱۲ فصل</span>
          </a>
          <a
            href="#about"
            className="text-white/75 hover:text-white text-xs font-medium transition-colors"
          >
            درباره کتاب
          </a>
          <a
            href="#philosophy"
            className="text-white/75 hover:text-white text-xs font-medium transition-colors"
          >
            حکمت اثر
          </a>
        </div>

        {/* Left: Direct Reader Link */}
        <div className="flex items-center gap-3">
          <a
            href="reader.html"
            className="liquid-glass liquid-glass-interactive rounded-full px-4 md:px-5 py-2 text-white text-xs font-medium flex items-center gap-1.5 group"
          >
            <BookOpen className="w-3.5 h-3.5 text-gold-400" />
            <span>کتابخوان آنلاین</span>
            <ArrowUpRight className="w-3 h-3 text-white/50 group-hover:text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
            aria-label="منو"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mt-3 max-w-5xl mx-auto liquid-glass rounded-2xl p-4 flex flex-col gap-3 text-right bg-black/95 backdrop-blur-2xl border border-white/10"
          >
            <a
              href="#audiobook"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white/90 hover:text-white py-2.5 text-sm flex items-center justify-between border-b border-white/5"
            >
              <span>کتاب صوتی ۱۲ فصل (کامل)</span>
              <Headphones className="w-4 h-4 text-gold-400" />
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white/90 hover:text-white py-2.5 text-sm border-b border-white/5"
            >
              درباره کتاب معجزه‌گر خاموش
            </a>
            <a
              href="#philosophy"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white/90 hover:text-white py-2.5 text-sm border-b border-white/5"
            >
              حکمت اثر
            </a>
            <a
              href="reader.html"
              className="liquid-glass rounded-xl py-3 px-4 text-center text-white text-sm font-medium flex items-center justify-center gap-2 mt-1"
            >
              <BookOpen className="w-4 h-4 text-gold-400" />
              <span>ورود به کتابخوان آنلاین (۲۴۱ صفحه)</span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
