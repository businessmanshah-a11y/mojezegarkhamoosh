import React from 'react';
import { Sparkles, BookOpen, Headphones } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-white/10 py-12 px-4 md:px-6 text-white overflow-hidden" dir="rtl">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-right">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          </div>
          <div>
            <span className="font-bold text-sm text-white block">معجزه‌گر خاموش</span>
            <span className="text-[11px] text-white/50">اثر سید رضا حیات‌الغیب • انتشارات سخنوران</span>
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center gap-5 text-xs text-white/60">
          <a href="#audiobook" className="hover:text-white transition-colors flex items-center gap-1">
            <Headphones className="w-3.5 h-3.5 text-gold-400" />
            <span>کتاب صوتی ۱۲ فصل</span>
          </a>
          <a href="reader.html" className="hover:text-white transition-colors flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-gold-400" />
            <span>کتابخوان آنلاین (۲۴۱ صفحه)</span>
          </a>
        </div>

        {/* Copyright */}
        <div className="text-[11px] text-white/40">
          <span>© ۲۰۲۶ معجزه‌گر خاموش</span>
        </div>
      </div>
    </footer>
  );
};
