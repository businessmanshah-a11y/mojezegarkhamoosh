import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      id="about"
      ref={ref}
      className="bg-black py-20 md:py-28 px-4 md:px-6 overflow-hidden relative"
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Label */}
        <motion.span
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.6 }}
          className="text-gold-400 text-xs font-semibold tracking-wider block mb-3"
        >
          درباره شاهکار معجزه‌گر خاموش
        </motion.span>

        {/* Master Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-2xl sm:text-4xl md:text-5xl text-white font-bold tracking-tight mb-6 leading-tight"
        >
          طنین واژه‌هایی برای بیداری و آرامش درون
        </motion.h2>

        {/* Concise Description (80% text reduction) */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-white/70 text-sm md:text-base leading-relaxed font-normal max-w-2xl mx-auto mb-10"
        >
          گزیده‌ای از دگرگون‌کننده‌ترین پاراگراف‌های معرفتی؛ دعوتی صمیمانه به خاموش کردن نشخوارهای ذهنی، رهایی از قضاوت‌ها و بازیابی اقتدار حقیقی روح.
        </motion.p>

        {/* 4 Feature Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto"
        >
          <div className="liquid-glass rounded-2xl p-4 text-center">
            <span className="text-xl md:text-2xl font-bold text-white block mb-0.5">۲۴۱</span>
            <span className="text-xs text-white/50">صفحه متن پیوسته</span>
          </div>
          <div className="liquid-glass rounded-2xl p-4 text-center">
            <span className="text-xl md:text-2xl font-bold text-white block mb-0.5">۱۲</span>
            <span className="text-xs text-white/50">فصل صوتی مستقل</span>
          </div>
          <div className="liquid-glass rounded-2xl p-4 text-center">
            <span className="text-xl md:text-2xl font-bold text-gold-400 block mb-0.5">۱۰۰٪</span>
            <span className="text-xs text-white/50">وفاداری کلمه‌به‌کلمه</span>
          </div>
          <div className="liquid-glass rounded-2xl p-4 text-center">
            <span className="text-xl md:text-2xl font-bold text-white block mb-0.5">۹ ساعت</span>
            <span className="text-xs text-white/50">و ۳۶ دقیقه صوت کامل</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
